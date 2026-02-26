/**
 * Session Cookie Management (Server-Side)
 *
 * Implements secure session storage using encrypted httpOnly cookies.
 * All token storage happens server-side - tokens never exposed to client JS.
 *
 * Security features:
 * - AES-GCM encryption for session data
 * - httpOnly cookies (no JS access)
 * - Secure flag in production (HTTPS only)
 * - SameSite=Lax for CSRF protection
 *
 * @module lib/auth/session
 */

import "server-only";

import { cookies } from "next/headers";

import { getServerConfig } from "@/config/server";

import { refreshAccessToken as refreshGoogleToken } from "./providers/google";

import type { OAuthTempState, SessionData, SessionResponse } from "./types";

/**
 * Cookie names used by the auth system.
 */
const SESSION_COOKIE_NAME = "atlas_session";
const OAUTH_TEMP_COOKIE_NAME = "atlas_oauth_tmp";

/**
 * Refresh window in seconds.
 * If token expires within this window, refresh proactively.
 */
const REFRESH_WINDOW_SECONDS = 120; // 2 minutes

/**
 * Get the session secret, with validation.
 *
 * @throws Error if AUTH_SESSION_SECRET is not configured
 */
function getSessionSecret(): string {
  const config = getServerConfig();
  const secret = config.auth.sessionSecret;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SESSION_SECRET must be configured and at least 32 characters for session encryption"
    );
  }
  return secret;
}

/**
 * Encrypt session data using AES-GCM.
 *
 * Uses Web Crypto API for encryption. The secret is derived from
 * AUTH_SESSION_SECRET using PBKDF2.
 *
 * @param data - Session data to encrypt
 * @returns Base64-encoded encrypted data with IV
 */
async function encryptSession(data: SessionData): Promise<string> {
  const encoder = new TextEncoder();
  const secretKey = await deriveKey(getSessionSecret());

  // Generate random IV for each encryption
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    secretKey,
    encoder.encode(JSON.stringify(data))
  );

  // Combine IV + encrypted data for storage
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);

  return base64Encode(combined);
}

/**
 * Decrypt session data from encrypted cookie value.
 *
 * @param encrypted - Base64-encoded encrypted data with IV
 * @returns Decrypted session data or null if decryption fails
 */
async function decryptSession(encrypted: string): Promise<SessionData | null> {
  try {
    const decoder = new TextDecoder();
    const secretKey = await deriveKey(getSessionSecret());

    const combined = base64Decode(encrypted);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, secretKey, data);

    return JSON.parse(decoder.decode(decryptedData)) as SessionData;
  } catch {
    // Decryption failed - cookie may be tampered or using old secret
    return null;
  }
}

/**
 * Derive an AES-256 key from the session secret.
 *
 * Uses PBKDF2 with a static salt (the salt doesn't need to be secret
 * since the secret itself is high-entropy).
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("atlas-session-v1"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Base64 encode Uint8Array.
 */
function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Base64 decode to Uint8Array.
 */
function base64Decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Check if running in production environment.
 */
function isProduction(): boolean {
  const config = getServerConfig();
  return config.app.env === "production";
}

/**
 * Create and set the session cookie.
 *
 * Encrypts session data and stores in an httpOnly cookie.
 *
 * @param sessionData - Session data to store
 *
 * @example
 * ```typescript
 * await createSessionCookie({
 *   user: oauthUser,
 *   accessToken: tokens.accessToken,
 *   refreshToken: tokens.refreshToken,
 *   accessTokenExpiresAt: tokens.expiresAt,
 *   createdAt: now,
 *   expiresAt: now + ttl,
 * });
 * ```
 */
export async function createSessionCookie(sessionData: SessionData): Promise<void> {
  const encrypted = await encryptSession(sessionData);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: sessionData.expiresAt - Math.floor(Date.now() / 1000),
  });
}

/**
 * Read and decrypt the session from cookies.
 *
 * Returns null if no session exists or if decryption fails.
 *
 * @returns Session data or null
 *
 * @example
 * ```typescript
 * const session = await readSession();
 * if (session) {
 *   console.log('User:', session.user.email);
 * }
 * ```
 */
export async function readSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await decryptSession(sessionCookie.value);

  if (!session) {
    return null;
  }

  // Check if session has expired
  const now = Math.floor(Date.now() / 1000);
  if (session.expiresAt < now) {
    // Session expired - clean up cookie
    await destroySessionCookie();
    return null;
  }

  return session;
}

/**
 * Destroy the session cookie.
 *
 * Clears the session by setting an expired cookie.
 *
 * @example
 * ```typescript
 * await destroySessionCookie();
 * // User is now logged out
 * ```
 */
export async function destroySessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Check if the access token needs to be refreshed.
 *
 * Returns true if token expires within the refresh window.
 *
 * @param session - Current session data
 * @returns true if refresh is needed
 */
export function needsRefresh(session: SessionData): boolean {
  const now = Math.floor(Date.now() / 1000);
  return session.accessTokenExpiresAt - now < REFRESH_WINDOW_SECONDS;
}

/**
 * Refresh the access token and update the session.
 *
 * Uses the refresh token to obtain a new access token.
 * Updates the session cookie with new token data.
 *
 * @param session - Current session data (must have refreshToken)
 * @returns Updated session data
 * @throws Error if refresh fails or no refresh token available
 */
export async function refreshSession(session: SessionData): Promise<SessionData> {
  if (!session.refreshToken) {
    throw new Error("No refresh token available");
  }

  // Currently only Google is supported
  if (session.user.provider !== "google") {
    throw new Error(`Refresh not implemented for provider: ${session.user.provider}`);
  }

  const config = getServerConfig();

  // Validate OAuth is configured
  if (!config.auth.googleClientId || !config.auth.googleClientSecret) {
    throw new Error("Google OAuth is not configured");
  }

  const tokens = await refreshGoogleToken(
    session.refreshToken,
    config.auth.googleClientId,
    config.auth.googleClientSecret
  );

  const updatedSession: SessionData = {
    ...session,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken || session.refreshToken,
    accessTokenExpiresAt: tokens.expiresAt,
  };

  await createSessionCookie(updatedSession);

  return updatedSession;
}

/**
 * Read session with automatic refresh if needed.
 *
 * Combines readSession + needsRefresh + refreshSession into one call.
 * Ideal for API routes and server components that need up-to-date tokens.
 *
 * @returns Session data (possibly refreshed) or null
 */
export async function readSessionWithRefresh(): Promise<SessionData | null> {
  const session = await readSession();

  if (!session) {
    return null;
  }

  // Refresh if token is expiring soon
  if (needsRefresh(session) && session.refreshToken) {
    try {
      return await refreshSession(session);
    } catch {
      // Refresh failed - session may still be valid for a bit
      // Let caller decide based on remaining time
      return session;
    }
  }

  return session;
}

/**
 * Get session response for /api/auth/me endpoint.
 *
 * Returns only safe user information - no tokens.
 *
 * @returns Session response for client
 */
export async function getSessionResponse(): Promise<SessionResponse> {
  const session = await readSessionWithRefresh();

  if (!session) {
    return { authenticated: false };
  }

  return {
    authenticated: true,
    user: {
      email: session.user.email,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
    },
    provider: session.user.provider,
  };
}

// ============================================================================
// Temporary OAuth State Cookie
// ============================================================================

/**
 * Store temporary OAuth state in a cookie.
 *
 * This cookie is short-lived and used only during the OAuth flow.
 * It stores the PKCE verifier, state, and optional returnTo URL.
 *
 * @param state - OAuth temporary state to store
 */
export async function setOAuthTempCookie(state: OAuthTempState): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_TEMP_COOKIE_NAME, JSON.stringify(state), {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    // Short TTL - OAuth flow should complete quickly
    maxAge: 300, // 5 minutes
  });
}

/**
 * Read and clear the temporary OAuth state cookie.
 *
 * Returns the state and clears the cookie in one operation.
 *
 * @returns OAuth temporary state or null
 */
export async function consumeOAuthTempCookie(): Promise<OAuthTempState | null> {
  const cookieStore = await cookies();
  const tempCookie = cookieStore.get(OAUTH_TEMP_COOKIE_NAME);

  if (!tempCookie?.value) {
    return null;
  }

  // Clear the cookie immediately
  cookieStore.set(OAUTH_TEMP_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  try {
    return JSON.parse(tempCookie.value) as OAuthTempState;
  } catch {
    return null;
  }
}

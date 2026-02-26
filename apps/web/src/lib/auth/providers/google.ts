/**
 * Google OAuth Provider
 *
 * Implements Google OAuth 2.0 with PKCE for secure authentication.
 * Uses OpenID Connect (OIDC) for user information.
 *
 * @see https://developers.google.com/identity/protocols/oauth2
 * @see https://developers.google.com/identity/openid-connect/openid-connect
 * @module lib/auth/providers/google
 */

import "server-only";

import type { OAuthTokens, OAuthUser } from "../types";

/**
 * Google OAuth configuration constants.
 */
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

/**
 * Default OAuth scopes for Google.
 * - openid: Required for OIDC
 * - email: User's email address
 * - profile: User's name and picture
 */
const DEFAULT_SCOPES = ["openid", "email", "profile"];

/**
 * Parameters for building the Google authorization URL.
 */
export interface GoogleAuthParams {
  /**
   * Google OAuth Client ID.
   */
  clientId: string;

  /**
   * OAuth callback URL.
   */
  redirectUri: string;

  /**
   * PKCE code challenge (S256 hashed verifier).
   */
  codeChallenge: string;

  /**
   * CSRF state parameter.
   */
  state: string;

  /**
   * OAuth scopes to request.
   * @default ["openid", "email", "profile"]
   */
  scopes?: string[];

  /**
   * Whether to force consent prompt.
   * Set to true to always get a refresh token.
   * @default false
   */
  forceConsent?: boolean;
}

/**
 * Build the Google OAuth authorization URL.
 *
 * Constructs a URL that redirects users to Google's consent page.
 * Uses Authorization Code flow with PKCE (S256 challenge method).
 *
 * @param params - Configuration for the authorization URL
 * @returns Complete authorization URL to redirect users to
 *
 * @example
 * ```typescript
 * const authUrl = buildGoogleAuthUrl({
 *   clientId: env.GOOGLE_CLIENT_ID,
 *   redirectUri: `${env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
 *   codeChallenge: challenge,
 *   state: state,
 * });
 * // Redirect user to authUrl
 * ```
 */
export function buildGoogleAuthUrl(params: GoogleAuthParams): string {
  const {
    clientId,
    redirectUri,
    codeChallenge,
    state,
    scopes = DEFAULT_SCOPES,
    forceConsent = false,
  } = params;

  const url = new URL(GOOGLE_AUTH_URL);

  // Required OAuth 2.0 parameters
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes.join(" "));

  // PKCE parameters (S256 method)
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  // CSRF protection
  url.searchParams.set("state", state);

  // Request offline access for refresh token
  url.searchParams.set("access_type", "offline");

  // Prompt behavior
  // - consent: Always show consent screen (needed for refresh token on re-auth)
  // - select_account: Allow user to choose account
  // Only force consent when explicitly requested (e.g., for re-linking)
  if (forceConsent) {
    url.searchParams.set("prompt", "consent");
  } else {
    // Allow account selection without forcing full consent
    url.searchParams.set("prompt", "select_account");
  }

  return url.toString();
}

/**
 * Parameters for token exchange.
 */
export interface GoogleTokenParams {
  /**
   * Authorization code from callback.
   */
  code: string;

  /**
   * PKCE code verifier (original, unhashed).
   */
  codeVerifier: string;

  /**
   * OAuth callback URL (must match authorization request).
   */
  redirectUri: string;

  /**
   * Google OAuth Client ID.
   */
  clientId: string;

  /**
   * Google OAuth Client Secret.
   */
  clientSecret: string;
}

/**
 * Exchange authorization code for tokens.
 *
 * Completes the OAuth flow by exchanging the authorization code
 * for access, refresh, and ID tokens.
 *
 * @param params - Token exchange parameters
 * @returns OAuth tokens including access, refresh, and ID tokens
 * @throws Error if token exchange fails
 *
 * @example
 * ```typescript
 * const tokens = await exchangeCodeForTokens({
 *   code: callbackCode,
 *   codeVerifier: storedVerifier,
 *   redirectUri: redirectUri,
 *   clientId: env.GOOGLE_CLIENT_ID,
 *   clientSecret: env.GOOGLE_CLIENT_SECRET,
 * });
 * ```
 */
export async function exchangeCodeForTokens(params: GoogleTokenParams): Promise<OAuthTokens> {
  const { code, codeVerifier, redirectUri, clientId, clientSecret } = params;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const data = await response.json();

  // Calculate expiration timestamp
  const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    idToken: data.id_token || null,
    expiresAt,
    tokenType: data.token_type || "Bearer",
  };
}

/**
 * Refresh an access token using a refresh token.
 *
 * @param refreshToken - The refresh token
 * @param clientId - Google OAuth Client ID
 * @param clientSecret - Google OAuth Client Secret
 * @returns New OAuth tokens (refresh token may be rotated)
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<OAuthTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token refresh failed: ${error}`);
  }

  const data = await response.json();

  const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

  return {
    accessToken: data.access_token,
    // Google may rotate refresh tokens; use new one if provided
    refreshToken: data.refresh_token || refreshToken,
    idToken: data.id_token || null,
    expiresAt,
    tokenType: data.token_type || "Bearer",
  };
}

/**
 * Google UserInfo response shape.
 */
interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Fetch user information from Google using the access token.
 *
 * Uses the UserInfo endpoint to get user details.
 * Alternative: decode the id_token JWT (but this requires JWT validation).
 *
 * @param accessToken - Valid access token from token exchange
 * @returns Normalized user information
 * @throws Error if fetching user info fails
 *
 * @example
 * ```typescript
 * const user = await fetchGoogleUserInfo(tokens.accessToken);
 * // { provider: "google", email: "user@example.com", ... }
 * ```
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<OAuthUser> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Google user info: ${error}`);
  }

  const data: GoogleUserInfo = await response.json();

  // Normalize to OAuthUser shape
  return {
    provider: "google",
    providerAccountId: data.sub,
    email: data.email,
    name: data.name || null,
    avatarUrl: data.picture || null,
  };
}

/**
 * OAuth Types and Interfaces
 *
 * Common types for OAuth providers and session management.
 * These types provide a consistent interface across different providers.
 *
 * @module lib/auth/types
 */

/**
 * Supported OAuth providers.
 *
 * Add new providers here as they are implemented.
 */
export type OAuthProvider = "google";

/**
 * Normalized user information from OAuth providers.
 *
 * All providers should normalize their user data to this shape.
 * This ensures consistent handling regardless of provider.
 */
export interface OAuthUser {
  /**
   * The OAuth provider that authenticated this user.
   */
  provider: OAuthProvider;

  /**
   * The user's unique ID from the provider.
   * This is provider-specific and may not be numeric.
   *
   * @example "123456789" (Google sub claim)
   */
  providerAccountId: string;

  /**
   * The user's email address.
   * Most providers require email scope to provide this.
   */
  email: string;

  /**
   * The user's display name.
   * May be full name or username depending on provider.
   */
  name: string | null;

  /**
   * URL to the user's avatar/profile picture.
   * May be null if not provided or if scope not requested.
   */
  avatarUrl: string | null;
}

/**
 * OAuth tokens returned from token exchange.
 *
 * These should NEVER be exposed to client-side code.
 */
export interface OAuthTokens {
  /**
   * Access token for making API requests.
   * Short-lived (typically 1 hour for Google).
   */
  accessToken: string;

  /**
   * Refresh token for obtaining new access tokens.
   * May be absent on subsequent logins if not using prompt=consent.
   *
   * @security Never expose to client
   */
  refreshToken: string | null;

  /**
   * ID token containing user claims (OIDC).
   * Can be decoded to get user information.
   */
  idToken: string | null;

  /**
   * When the access token expires (Unix timestamp in seconds).
   */
  expiresAt: number;

  /**
   * Token type (usually "Bearer").
   */
  tokenType: string;
}

/**
 * Session data stored in the encrypted cookie.
 *
 * Contains user info and token metadata.
 * The actual tokens are stored securely and never exposed to clients.
 */
export interface SessionData {
  /**
   * User information from OAuth provider.
   */
  user: OAuthUser;

  /**
   * Access token for server-side API calls.
   * @security Never expose to client
   */
  accessToken: string;

  /**
   * Refresh token for obtaining new access tokens.
   * @security Never expose to client
   */
  refreshToken: string | null;

  /**
   * When the access token expires (Unix timestamp in seconds).
   */
  accessTokenExpiresAt: number;

  /**
   * When the session was created (Unix timestamp in seconds).
   */
  createdAt: number;

  /**
   * When the session expires (Unix timestamp in seconds).
   */
  expiresAt: number;
}

/**
 * Temporary OAuth state stored in cookie during flow.
 *
 * Cleared after callback is processed.
 */
export interface OAuthTempState {
  /**
   * PKCE code verifier.
   */
  verifier: string;

  /**
   * CSRF state parameter.
   */
  state: string;

  /**
   * Where to redirect after successful login.
   * Must be same-origin.
   */
  returnTo?: string;
}

/**
 * Public session response for /api/auth/me endpoint.
 *
 * Does NOT include tokens - only safe user information.
 */
export interface SessionResponse {
  /**
   * Whether the user is authenticated.
   */
  authenticated: boolean;

  /**
   * User information (only present if authenticated).
   */
  user?: {
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };

  /**
   * OAuth provider used (only present if authenticated).
   */
  provider?: OAuthProvider;
}

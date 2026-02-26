/**
 * OAuth State Parameter Utilities
 *
 * Implements secure state generation and validation for OAuth 2.0 flows.
 * The state parameter prevents CSRF attacks by ensuring the callback
 * request originated from the same session that initiated the flow.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-10.12
 * @module lib/auth/state
 */

/**
 * Generate a cryptographically secure state parameter.
 *
 * The state is a random string that must be:
 * 1. Stored before redirecting to the authorization server
 * 2. Validated when the callback is received
 *
 * @returns A 32-character URL-safe random string
 *
 * @example
 * ```typescript
 * const state = generateState();
 * // Store in httpOnly cookie before redirect
 * // Validate in callback handler
 * ```
 */
export function generateState(): string {
  // 16 bytes = 128 bits of entropy, sufficient for CSRF protection
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  return base64UrlEncode(randomBytes);
}

/**
 * Verify that the received state matches the expected state.
 *
 * Uses constant-time comparison to prevent timing attacks.
 * Both values are normalized and compared byte-by-byte.
 *
 * @param received - The state parameter received in the callback
 * @param expected - The state parameter stored before the redirect
 * @returns true if states match, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = verifyState(callbackState, storedState);
 * if (!isValid) {
 *   throw new Error('Invalid state - possible CSRF attack');
 * }
 * ```
 */
export function verifyState(received: string, expected: string): boolean {
  // First check lengths match (this leaks length but not content)
  if (received.length !== expected.length) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const receivedBytes = new TextEncoder().encode(received);
  const expectedBytes = new TextEncoder().encode(expected);

  let result = 0;
  for (let i = 0; i < receivedBytes.length; i++) {
    // Safe indexing since we already checked lengths match
    result |= (receivedBytes[i] ?? 0) ^ (expectedBytes[i] ?? 0);
  }

  return result === 0;
}

/**
 * Encode bytes to URL-safe base64 (RFC 4648 Section 5).
 *
 * @param bytes - Uint8Array to encode
 * @returns URL-safe base64 string without padding
 */
function base64UrlEncode(bytes: Uint8Array): string {
  let base64 = "";
  for (const byte of bytes) {
    base64 += String.fromCharCode(byte);
  }
  const encoded = btoa(base64);

  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

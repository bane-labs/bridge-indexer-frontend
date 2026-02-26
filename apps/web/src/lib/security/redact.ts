/**
 * PII and Secret Redaction Utilities
 *
 * Provides deep redaction of sensitive data from log objects to prevent
 * accidental exposure of PII, credentials, tokens, etc.
 *
 * @module lib/security/redact
 */

/**
 * Sensitive key patterns (case-insensitive)
 * These keys will be completely removed from log output
 */
const SENSITIVE_KEYS = new Set([
  // Authentication & Authorization
  "password",
  "pass",
  "pwd",
  "passwd",
  "secret",
  "token",
  "accesstoken",
  "access_token",
  "refreshtoken",
  "refresh_token",
  "idtoken",
  "id_token",
  "sessiontoken",
  "session_token",
  "authorization",
  "auth",
  "bearer",
  "apikey",
  "api_key",
  "clientsecret",
  "client_secret",
  "privatekey",
  "private_key",
  "publickey",
  "public_key",
  "encryptionkey",
  "encryption_key",

  // Cookies & Session
  "cookie",
  "cookies",
  "setcookie",
  "set-cookie",
  "session",
  "sessionid",
  "session_id",
  "csrf",
  "csrftoken",
  "csrf_token",

  // Payment & Financial
  "creditcard",
  "credit_card",
  "cardnumber",
  "card_number",
  "cvv",
  "cvc",
  "pan",
  "accountnumber",
  "account_number",
  "routingnumber",
  "routing_number",
  "iban",
  "swift",
  "bic",

  // Personal Identifiable Information
  "ssn",
  "socialsecurity",
  "social_security",
  "taxid",
  "tax_id",
  "passport",
  "passportnumber",
  "passport_number",
  "driverlicense",
  "driver_license",
  "aadhar",
  "nric",
  "nin",

  // Database & Infrastructure
  "databaseurl",
  "database_url",
  "connectionstring",
  "connection_string",
  "dsn",
  "redisurl",
  "redis_url",
  "mongourl",
  "mongo_url",
  "postgresurl",
  "postgres_url",
]);

/**
 * Value patterns to redact (regardless of key name)
 * These patterns catch tokens/secrets that might be under generic keys
 */
const SENSITIVE_VALUE_PATTERNS = [
  // Bearer tokens
  /^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/i, // JWT
  /^Bearer\s+[A-Za-z0-9_-]{20,}/i, // Generic bearer token

  // API keys (common formats)
  /^[A-Za-z0-9]{32,}$/, // Long alphanumeric strings (likely API keys)
  /^sk_live_[A-Za-z0-9]{24,}$/, // Stripe live keys
  /^sk_test_[A-Za-z0-9]{24,}$/, // Stripe test keys
  /^rk_live_[A-Za-z0-9]{24,}$/, // Stripe restricted keys
  /^pk_live_[A-Za-z0-9]{24,}$/, // Stripe publishable keys
  /^ghp_[A-Za-z0-9]{36}$/, // GitHub personal access token
  /^gho_[A-Za-z0-9]{36}$/, // GitHub OAuth token
  /^github_pat_[A-Za-z0-9_]{82}$/, // GitHub fine-grained token

  // JWTs (three base64url segments separated by dots)
  /^[\w-]+\.[\w-]+\.[\w-]+$/,
];

/**
 * Maximum depth for recursive redaction
 * Prevents infinite loops and excessive processing
 */
const MAX_DEPTH = 10;

/**
 * Maximum object size for redaction (approximate)
 * Prevents processing extremely large objects
 */
const MAX_SIZE = 10000;

/**
 * Check if a key should be redacted (case-insensitive)
 *
 * @param key - Object key to check
 * @returns True if key is sensitive
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEYS.has(key.toLowerCase());
}

/**
 * Check if a value matches sensitive patterns
 *
 * @param value - Value to check
 * @returns True if value matches sensitive pattern
 */
function isSensitiveValue(value: unknown): boolean {
  if (typeof value !== "string") return false;

  // Skip very short strings (unlikely to be secrets)
  if (value.length < 8) return false;

  return SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

/**
 * Deep clone and redact sensitive data from an object
 *
 * Removes sensitive keys and redacts values matching sensitive patterns.
 * Handles nested objects, arrays, and circular references.
 *
 * @param obj - Object to redact
 * @param depth - Current recursion depth (internal)
 * @param seen - Set of visited objects (internal, for circular reference detection)
 * @returns Redacted deep clone of the object
 *
 * @example
 * ```typescript
 * const data = {
 *   userId: '123',
 *   email: 'user@example.com',
 *   password: 'secret123',
 *   token: 'eyJ...jwt-token-here...',
 * };
 *
 * const redacted = redact(data);
 * // { userId: '123', email: 'user@example.com' }
 * // password and token are removed
 * ```
 */
export function redact(obj: unknown, depth = 0, seen = new WeakSet()): unknown {
  // Handle primitives
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") {
    // Redact sensitive string values
    if (isSensitiveValue(obj)) {
      return undefined; // Remove entirely
    }
    return obj;
  }

  // Prevent infinite recursion
  if (depth > MAX_DEPTH) {
    return "[DEPTH_LIMIT]";
  }

  // Prevent circular references
  if (seen.has(obj as object)) {
    return "[CIRCULAR]";
  }
  seen.add(obj as object);

  // Handle arrays
  if (Array.isArray(obj)) {
    // Limit array size
    if (obj.length > MAX_SIZE) {
      return `[ARRAY_TOO_LARGE: ${obj.length} items]`;
    }

    return obj.map((item) => redact(item, depth + 1, seen));
  }

  // Handle objects
  const result: Record<string, unknown> = {};
  let itemCount = 0;

  for (const [key, value] of Object.entries(obj)) {
    // Limit object size
    if (itemCount++ > MAX_SIZE) {
      result["__truncated__"] = true;
      break;
    }

    // Remove sensitive keys entirely
    if (isSensitiveKey(key)) {
      continue; // Skip this key
    }

    // Recursively redact nested values
    const redactedValue = redact(value, depth + 1, seen);

    // Only include if not undefined (some values get redacted to undefined)
    if (redactedValue !== undefined) {
      result[key] = redactedValue;
    }
  }

  return result;
}

/**
 * Redact specific fields from a string (for message/query redaction)
 *
 * Useful for redacting sensitive data from log messages, SQL queries, etc.
 *
 * @param str - String to redact
 * @returns Redacted string
 */
export function redactString(str: string): string {
  let result = str;

  // Redact Authorization headers (everything after "Authorization:")
  // Match Authorization: followed by non-whitespace token(s) on the same line
  result = result.replace(/Authorization:\s*[^\n]+/gi, "Authorization: [REDACTED]");

  // Redact Bearer tokens (standalone, not part of Authorization header)
  result = result.replace(/\bBearer\s+[\w-]+\.[\w-]+\.[\w-]+/g, "Bearer [REDACTED]");
  result = result.replace(/\bBearer\s+[A-Za-z0-9_-]{20,}/g, "Bearer [REDACTED]");

  // Redact common secret patterns in URLs/queries
  result = result.replace(
    /([?&])(password|token|secret|apiKey|api_key)=[^&\s]*/gi,
    "$1$2=[REDACTED]"
  );

  // Redact Cookie headers
  result = result.replace(/Cookie:\s*[^\n]+/gi, "Cookie: [REDACTED]");

  return result;
}

/**
 * Check if an object contains any sensitive data
 *
 * Useful for validation/testing
 *
 * @param obj - Object to check
 * @returns True if object contains sensitive keys
 */
export function containsSensitiveData(obj: unknown): boolean {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some((item) => containsSensitiveData(item));
  }

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) return true;
    if (isSensitiveValue(value)) return true;
    if (typeof value === "object" && containsSensitiveData(value)) return true;
  }

  return false;
}

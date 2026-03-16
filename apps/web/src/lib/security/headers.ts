/**
 * Security Headers Configuration
 *
 * Provides baseline security headers for all routes with escape hatches
 * for specific paths that need different policies.
 *
 * @module lib/security/headers
 */

export interface SecurityHeadersConfig {
  /**
   * Enable HSTS (Strict-Transport-Security) header
   * Only enable this in production when HTTPS is guaranteed
   */
  enableHSTS: boolean;

  /**
   * Path patterns that should have relaxed headers
   * Useful for embed routes, webhooks, etc.
   */
  pathOverrides?: {
    pattern: string;
    headers: Record<string, string>;
  }[];
}

/**
 * Get baseline security headers
 *
 * Provides sane defaults for all routes:
 * - X-Content-Type-Options: Prevent MIME sniffing
 * - Referrer-Policy: Limit referrer information leakage
 * - Permissions-Policy: Restrict dangerous browser APIs
 * - X-Frame-Options: Prevent clickjacking
 * - HSTS: Enforce HTTPS (production only)
 * - COOP/CORP: Isolate document context
 *
 * @param config - Configuration options
 * @returns Headers object suitable for Next.js config
 */
export function getSecurityHeaders(config: SecurityHeadersConfig): Record<string, string> {
  const headers: Record<string, string> = {
    // Prevent browsers from MIME-sniffing responses
    "X-Content-Type-Options": "nosniff",

    // Control referrer information sent with requests
    // strict-origin-when-cross-origin: send full URL for same-origin, origin only for cross-origin HTTPS, nothing for HTTP
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Restrict access to sensitive browser APIs
    // Use interest-cohort=() to opt out of Google FLoC
    "Permissions-Policy": [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),

    // Prevent page from being embedded in iframes
    "X-Frame-Options": "DENY",

    // Cross-Origin-Opener-Policy: Isolate browsing context
    // same-origin: Prevents other origins from gaining reference to your window
    // IMPACT: Breaks window.opener across origins (intentional for security)
    "Cross-Origin-Opener-Policy": "same-origin",

    // Cross-Origin-Resource-Policy: Prevent cross-origin resource access
    // same-site: Only same-site contexts can load this resource
    // IMPACT: Prevents CDN/third-party embedding unless configured
    "Cross-Origin-Resource-Policy": "same-site",
  };

  // Only enable HSTS in production with guaranteed HTTPS
  if (config.enableHSTS) {
    // Enforce HTTPS for 1 year, including subdomains
    // preload: Consider adding to HSTS preload list (requires manual submission)
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  return headers;
}

/**
 * Check if a path matches any override pattern
 *
 * @param path - Request path
 * @param patterns - Override patterns
 * @returns Matching override or undefined
 */
export function getHeaderOverride(
  path: string,
  patterns?: SecurityHeadersConfig["pathOverrides"]
): Record<string, string> | undefined {
  if (!patterns) return undefined;

  for (const override of patterns) {
    // Simple glob matching (* at start/end)
    const pattern = override.pattern;

    if (pattern === path) {
      return override.headers;
    }

    if (pattern.endsWith("*") && path.startsWith(pattern.slice(0, -1))) {
      return override.headers;
    }

    if (pattern.startsWith("*") && path.endsWith(pattern.slice(1))) {
      return override.headers;
    }

    if (pattern.includes("*")) {
      // eslint-disable-next-line security/detect-non-literal-regexp -- Pattern is from config, not user input
      const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`);
      if (regex.test(path)) {
        return override.headers;
      }
    }
  }

  return undefined;
}

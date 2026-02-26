/**
 * Content Security Policy (CSP) Builder
 *
 * Generates CSP headers with per-request nonces and environment-specific policies.
 * Supports both report-only and enforcement modes.
 *
 * @module lib/security/csp
 */

export type CSPMode = "off" | "report-only" | "enforce";

export interface CSPConfig {
  /**
   * CSP mode: off, report-only, or enforce
   * - off: No CSP header
   * - report-only: CSP violations are reported but not blocked (dev/staging)
   * - enforce: CSP violations are blocked (production)
   */
  mode: CSPMode;

  /**
   * Per-request nonce for script/style inline execution
   */
  nonce: string;

  /**
   * Current environment (for conditional directives)
   */
  env: "development" | "staging" | "production";

  /**
   * Additional allowed hosts for specific directives
   * Used for analytics, CDNs, embeds, etc.
   */
  allowlist?: {
    /** Additional script sources (e.g., analytics domains) */
    scriptSrc?: string[];
    /** Additional style sources (e.g., font CDNs) */
    styleSrc?: string[];
    /** Additional connect sources (e.g., API endpoints, analytics) */
    connectSrc?: string[];
    /** Additional image sources (e.g., CDN, external images) */
    imgSrc?: string[];
    /** Additional font sources (e.g., Google Fonts) */
    fontSrc?: string[];
    /** Additional frame sources (e.g., embedded content) */
    frameSrc?: string[];
    /** Frame ancestors (if embedding is allowed) */
    frameAncestors?: string[];
  };

  /**
   * Report-URI endpoint for CSP violations
   */
  reportUri?: string;
}

/**
 * Build Content Security Policy header value
 *
 * Generates a strict CSP with the following baseline:
 * - default-src 'self': Only load resources from same origin by default
 * - script-src: Only scripts with nonce or from same origin
 * - style-src: Only styles with nonce or from same origin (+ 'unsafe-inline' for Tailwind)
 * - img-src: Allow images from same origin, data URIs, and HTTPS
 * - connect-src: Allow fetch/XHR to same origin + allowlisted endpoints
 * - font-src: Allow fonts from same origin, data URIs, and HTTPS
 * - frame-ancestors: Prevent embedding (or allow specific origins)
 * - base-uri: Restrict <base> tag to same origin
 * - form-action: Restrict form submissions to same origin
 * - object-src: Block plugins (Flash, Java, etc.)
 *
 * @param config - CSP configuration
 * @returns CSP header value
 *
 * @example
 * ```typescript
 * const csp = buildCSP({
 *   mode: 'enforce',
 *   nonce: 'abc123',
 *   env: 'production',
 *   allowlist: {
 *     scriptSrc: ['https://www.googletagmanager.com'],
 *     connectSrc: ['https://api.example.com'],
 *   },
 * });
 * ```
 */
export function buildCSP(config: CSPConfig): string {
  // Build script-src with development-specific allowances
  const scriptSrc = ["'self'", `'nonce-${config.nonce}'`, ...(config.allowlist?.scriptSrc ?? [])];

  // In development, Next.js Fast Refresh requires unsafe-eval
  // This is safe in dev because it's only for HMR/developer tools
  if (config.env === "development") {
    scriptSrc.push("'unsafe-eval'");
  }

  const directives: Record<string, string[]> = {
    // Default: only load from same origin
    "default-src": ["'self'"],

    // Scripts: self + nonce-based inline scripts
    // NOTE: Avoid 'unsafe-inline' and 'unsafe-eval' in production - use nonce instead
    "script-src": scriptSrc,

    // Styles: self + unsafe-inline (no nonce)
    // We don't use nonces for styles because:
    // 1. Modern UI libraries (Radix, Headless UI, etc.) dynamically set inline styles
    // 2. 'unsafe-inline' is needed for these dynamic styles to work
    // 3. CSS injection is less dangerous than script injection
    // 4. We still restrict to 'self' for external stylesheets
    // This is a pragmatic security/functionality tradeoff commonly used in production apps
    "style-src": ["'self'", "'unsafe-inline'", ...(config.allowlist?.styleSrc ?? [])],

    // Images: self + data URIs + HTTPS (for external images/CDNs)
    "img-src": ["'self'", "data:", "https:", ...(config.allowlist?.imgSrc ?? [])],

    // Fetch/XHR: self + allowlisted endpoints
    "connect-src": ["'self'", ...(config.allowlist?.connectSrc ?? [])],

    // Fonts: self + data URIs + HTTPS (for web fonts)
    "font-src": ["'self'", "data:", "https:", ...(config.allowlist?.fontSrc ?? [])],

    // Frames/iframes: only if explicitly allowed
    "frame-src": ["'self'", ...(config.allowlist?.frameSrc ?? [])],

    // Prevent embedding by default (clickjacking protection)
    "frame-ancestors": config.allowlist?.frameAncestors ?? ["'none'"],

    // Restrict <base> tag to same origin
    "base-uri": ["'self'"],

    // Restrict form submissions to same origin
    "form-action": ["'self'"],

    // Block plugins (Flash, Java, etc.)
    "object-src": ["'none'"],
  };

  // Add upgrade-insecure-requests in production (requires HTTPS)
  if (config.env === "production") {
    directives["upgrade-insecure-requests"] = [];
  }

  // Build CSP string
  const cspParts: string[] = [];

  for (const [directive, sources] of Object.entries(directives)) {
    if (sources.length === 0) {
      // Directive with no sources (e.g., upgrade-insecure-requests)
      cspParts.push(directive);
    } else {
      cspParts.push(`${directive} ${sources.join(" ")}`);
    }
  }

  // Add report-uri if configured
  if (config.reportUri) {
    cspParts.push(`report-uri ${config.reportUri}`);
  }

  return cspParts.join("; ");
}

/**
 * Get CSP header name based on mode
 *
 * @param mode - CSP mode
 * @returns Header name or undefined if mode is off
 */
export function getCSPHeaderName(mode: CSPMode): string | undefined {
  switch (mode) {
    case "enforce":
      return "Content-Security-Policy";
    case "report-only":
      return "Content-Security-Policy-Report-Only";
    case "off":
      return undefined;
    default:
      return undefined;
  }
}

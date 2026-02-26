const { withSentryConfig } = require("@sentry/nextjs");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@atlas/ui"],
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // Externalize pino to avoid bundling test dependencies
  serverExternalPackages: ["pino", "pino-pretty"],
  // Empty turbopack config to acknowledge Turbopack while using webpack plugins
  turbopack: {},
  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ["@atlas/ui", "lucide-react"],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  // Security headers baseline
  async headers() {
    // Determine if HSTS should be enabled (production only with HTTPS)
    const enableHSTS = process.env.ENABLE_HSTS === "true" && process.env.NODE_ENV === "production";

    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-site",
      },
    ];

    // Add HSTS if enabled
    if (enableHSTS) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }

    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

// Apply bundle analyzer first
let config = withBundleAnalyzer(nextConfig);

// Determine if sourcemap upload is enabled (requires auth token + org + project)
const enableSourcemapUpload =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT;

// Always apply withSentryConfig so the SDK is properly initialized on the client.
// Sourcemap upload is conditionally enabled based on env vars.
config = withSentryConfig(config, {
  org: process.env.SENTRY_ORG || "",
  project: process.env.SENTRY_PROJECT || "",

  silent: !process.env.CI,

  authToken: enableSourcemapUpload ? process.env.SENTRY_AUTH_TOKEN : undefined,
  sourcemaps: {
    disable: !enableSourcemapUpload,
  },

  widenClientFileUpload: true,
  hideSourceMaps: true,

  // Route browser requests through /monitoring to avoid ad-blockers and CORS.
  // The SDK injects _sentryRewritesTunnelPath into instrumentation-client.ts
  // so that all envelope POSTs go to this same-origin rewrite path.
  tunnelRoute: "/monitoring",

  // Tree-shake Sentry debug logging from production bundles
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },

  // Annotate React component names in breadcrumbs and session replay
  webpack: {
    reactComponentAnnotation: { enabled: true },
  },
});

module.exports = config;

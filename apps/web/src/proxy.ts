import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

import { serverEnv } from "@/env";
import { buildCSP, getCSPHeaderName } from "@/lib/security/csp";

import type { CSPMode } from "@/lib/security/csp";
import type { NextRequest } from "next/server";

/**
 * Proxy (formerly middleware) to ensure every request has a correlation ID (x-request-id)
 * and applies Content Security Policy (CSP) headers.
 *
 * - Preserves incoming x-request-id if provided
 * - Generates a new UUID if not provided
 * - Adds x-request-id to response headers
 * - Sets Sentry context with correlationId
 * - Generates per-request nonce for CSP
 * - Applies CSP header based on environment configuration
 * - Excludes static assets
 */
export function proxy(request: NextRequest) {
  // Skip static assets
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Get or generate request ID
  const existingRequestId = request.headers.get("x-request-id");
  const requestId = existingRequestId ?? crypto.randomUUID();

  // Generate CSP nonce (per-request)
  const nonce = crypto.randomUUID().replace(/-/g, "");

  // Set Sentry context for this request
  Sentry.setTag("correlationId", requestId);
  Sentry.setTag("route", pathname);
  Sentry.setTag("runtime", "edge");

  // Create new headers with x-request-id and x-nonce
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);
  requestHeaders.set("x-nonce", nonce); // Pass nonce to server components

  // Create response with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add x-request-id to response headers
  response.headers.set("x-request-id", requestId);

  // Add CSP header based on configuration
  const cspMode = getCspMode();
  const cspHeaderName = getCSPHeaderName(cspMode);

  if (cspHeaderName) {
    // Build CSP allowlists from environment
    const connectSrc = parseCSPList(serverEnv.CSP_CONNECT_SRC) ?? [];

    // Note: Sentry is routed through /monitoring tunnel (see next.config.js)
    // so we don't need to add *.ingest.sentry.io to CSP

    const cspValue = buildCSP({
      mode: cspMode,
      nonce,
      env: getAppEnv(),
      allowlist: {
        scriptSrc: parseCSPList(serverEnv.CSP_SCRIPT_SRC),
        connectSrc: connectSrc.length > 0 ? connectSrc : undefined,
        imgSrc: parseCSPList(serverEnv.CSP_IMG_SRC),
        fontSrc: parseCSPList(serverEnv.CSP_FONT_SRC),
        styleSrc: parseCSPList(serverEnv.CSP_STYLE_SRC),
        frameSrc: parseCSPList(serverEnv.CSP_FRAME_SRC),
        frameAncestors: parseCSPList(serverEnv.CSP_FRAME_ANCESTORS),
      },
      reportUri: serverEnv.CSP_REPORT_URI,
    });

    response.headers.set(cspHeaderName, cspValue);
  }

  return response;
}

/**
 * Get CSP mode from environment with smart defaults
 * - off: CSP disabled
 * - report-only: CSP violations reported but not blocked (dev/staging)
 * - enforce: CSP violations blocked (production)
 */
function getCspMode(): CSPMode {
  const mode = serverEnv.CSP_MODE;
  if (mode === "off" || mode === "report-only" || mode === "enforce") {
    return mode;
  }

  // Smart defaults based on environment
  const env = getAppEnv();
  if (env === "production") {
    return "enforce";
  }

  // Dev/staging: use report-only to avoid breaking local DX
  return "report-only";
}

/**
 * Get app environment from NODE_ENV
 */
function getAppEnv(): "development" | "staging" | "production" {
  const nodeEnv = serverEnv.NODE_ENV;

  if (nodeEnv === "production") return "production";
  if (nodeEnv === "test") return "development";

  return "development";
}

/**
 * Parse comma-separated CSP allowlist
 */
function parseCSPList(value: string | undefined): string[] | undefined {
  if (!value) return undefined;

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Configure which routes this proxy runs on
 * We want it on all routes except static assets (handled above)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - monitoring (Sentry tunnel route — must not be intercepted by middleware)
     */
    "/((?!_next/static|_next/image|favicon.ico|monitoring).*)",
  ],
};

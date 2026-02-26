/**
 * Sentry Tunnel API Route
 *
 * Proxies Sentry envelope requests from the browser to the Sentry ingest
 * endpoint. This avoids CORS issues and ad-blocker interference.
 *
 * The @sentry/nextjs SDK's `tunnelRoute` option creates Next.js rewrites,
 * but these don't work reliably with Turbopack's dev server. This explicit
 * API route handles the same traffic pattern.
 *
 * The SDK sends envelopes to: /monitoring?o=<orgId>&p=<projectId>&r=<region>
 *
 * @module app/monitoring/route
 */

import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orgId = searchParams.get("o");
  const projectId = searchParams.get("p");
  const region = searchParams.get("r");

  if (!orgId || !projectId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  // Build the Sentry ingest URL
  const host = region ? `o${orgId}.ingest.${region}.sentry.io` : `o${orgId}.ingest.sentry.io`;
  const upstreamUrl = `https://${host}/api/${projectId}/envelope/?hsts=0`;

  const body = await request.text();

  const response = await fetch(upstreamUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-sentry-envelope",
    },
    body,
  });

  return new NextResponse(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "text/plain",
    },
  });
}

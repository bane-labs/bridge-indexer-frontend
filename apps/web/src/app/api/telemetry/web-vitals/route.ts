/**
 * Web Vitals Telemetry API Route
 *
 * Receives and processes Web Vitals metrics from the client.
 * Validates payload, applies rate limiting, and stores/forwards metrics.
 *
 * @route POST /api/telemetry/web-vitals
 */

import { NextResponse } from "next/server";

import { type WebVitalsBatchDTO, WebVitalsBatchSchema } from "@/lib/telemetry/validation";

import type { NextRequest } from "next/server";

/**
 * Maximum request body size (100KB)
 */
const MAX_BODY_SIZE = 100 * 1024;

/**
 * Rate limiting: track requests per IP
 * In production, use Redis or a proper rate limiting service
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute per IP

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Store or forward Web Vitals metrics
 *
 * Currently logs to stdout in structured format.
 * TODO: Implement database persistence or forward to analytics service.
 */
function processMetrics(batch: WebVitalsBatchDTO): void {
  // Log structured data for collection by log aggregators (e.g., Loki, CloudWatch)
  console.log(
    JSON.stringify({
      type: "web-vitals",
      timestamp: new Date().toISOString(),
      sessionId: batch.sessionId,
      userAgent: batch.userAgent,
      metrics: batch.metrics.map((m) => ({
        name: m.name,
        value: m.value,
        rating: m.rating,
        route: m.route,
        environment: m.environment,
        appName: m.appName,
        buildId: m.buildId,
        timestamp: m.timestamp,
      })),
    })
  );

  // TODO: Persist to database
  // Example with Prisma:
  // await prisma.webVital.createMany({
  //   data: batch.metrics.map(metric => ({
  //     name: metric.name,
  //     value: metric.value,
  //     rating: metric.rating,
  //     route: metric.route,
  //     environment: metric.environment,
  //     sessionId: batch.sessionId,
  //     timestamp: new Date(metric.timestamp),
  //   }))
  // });

  // TODO: Forward to analytics service
  // Example with OpenTelemetry:
  // for (const metric of batch.metrics) {
  //   meter.createHistogram(metric.name).record(metric.value, {
  //     route: metric.route,
  //     rating: metric.rating,
  //   });
  // }
}

/**
 * POST /api/telemetry/web-vitals
 *
 * Accepts batched Web Vitals metrics from the client.
 */
export async function POST(request: NextRequest) {
  try {
    // Check content length
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // Parse and validate request body
    const body = (await request.json()) as unknown;
    const validationResult = WebVitalsBatchSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid payload",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    // Process metrics
    processMetrics(validationResult.data);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[Web Vitals API] Error processing metrics:", error);

    // Don't leak error details to client
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/telemetry/web-vitals
 *
 * Health check endpoint
 */
export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "web-vitals-telemetry",
      version: "1.0.0",
    },
    { status: 200 }
  );
}

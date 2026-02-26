/**
 * Web Vitals Validation Schema
 *
 * Zod schemas for validating incoming Web Vitals telemetry data.
 */

import { z } from "zod";

/**
 * Metric name enum
 */
export const MetricNameSchema = z.enum(["CLS", "FCP", "FID", "INP", "LCP", "TTFB"]);

/**
 * Metric rating enum
 */
export const MetricRatingSchema = z.enum(["good", "needs-improvement", "poor"]);

/**
 * Single Web Vital metric schema
 */
export const WebVitalMetricSchema = z.object({
  /** Metric name */
  name: MetricNameSchema,
  /** Metric value (milliseconds or score) */
  value: z.number().nonnegative().finite(),
  /** Performance rating */
  rating: MetricRatingSchema.optional(),
  /** Delta from previous value */
  delta: z.number().finite().optional(),
  /** Unique metric ID */
  id: z.string().min(1).max(100),
  /** Sanitized route (pathname only) */
  route: z.string().min(1).max(500),
  /** Timestamp (Unix milliseconds) */
  timestamp: z.number().int().positive(),
  /** Environment */
  environment: z.string().min(1).max(50),
  /** Application name */
  appName: z.string().min(1).max(50),
  /** Build ID/SHA */
  buildId: z.string().max(100).optional(),
  /** Navigation type */
  navigationType: z.string().max(50).optional(),
});

/**
 * Batched metrics payload schema
 */
export const WebVitalsBatchSchema = z.object({
  /** Array of metrics */
  metrics: z.array(WebVitalMetricSchema).min(1).max(50),
  /** Session ID */
  sessionId: z.string().min(1).max(100),
  /** User agent hint */
  userAgent: z.string().max(50).optional(),
});

/**
 * Type exports
 */
export type WebVitalMetricDTO = z.infer<typeof WebVitalMetricSchema>;
export type WebVitalsBatchDTO = z.infer<typeof WebVitalsBatchSchema>;

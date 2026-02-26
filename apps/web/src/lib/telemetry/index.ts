/**
 * Web Vitals Telemetry Module
 *
 * Re-exports all Web Vitals telemetry functionality.
 */

export type { WebVitalsConfig } from "./config";
export { getWebVitalsConfig, shouldReportVitals } from "./config";
export { flushMetrics, sendMetric } from "./transport";
export type { MetricName, MetricRating, WebVitalMetric, WebVitalsBatch } from "./types";
export type { WebVitalsOptions } from "./webVitals";
export { initWebVitalsReporting, isReportingActive } from "./webVitals";

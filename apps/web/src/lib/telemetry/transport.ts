/**
 * Web Vitals Transport Layer
 *
 * Handles batching, throttling, and transmission of Web Vitals metrics
 * with sendBeacon-first strategy and fetch keepalive fallback.
 */

import { getSessionId, getUserAgentHint } from "./types";

import type { WebVitalMetric, WebVitalsBatch } from "./types";

/**
 * Transport configuration
 */
interface TransportConfig {
  endpoint: string;
  batchSize: number;
  flushInterval: number; // milliseconds
  debug: boolean;
}

/**
 * Metric queue for batching
 */
class MetricQueue {
  private queue: WebVitalMetric[] = [];
  private config: TransportConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor(config: TransportConfig) {
    this.config = config;
    this.setupFlushOnUnload();
  }

  /**
   * Add metric to queue and potentially flush
   */
  enqueue(metric: WebVitalMetric): void {
    this.queue.push(metric);

    if (this.config.debug) {
      console.log("[Web Vitals] Metric queued:", metric);
    }

    // Flush if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      void this.flush();
    } else {
      // Schedule flush
      this.scheduleFlush();
    }
  }

  /**
   * Schedule a flush after interval
   */
  private scheduleFlush(): void {
    if (this.flushTimer) return;

    this.flushTimer = setTimeout(() => {
      void this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Flush queued metrics immediately
   */
  async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0 || this.isFlushing) return;

    const metrics = [...this.queue];
    this.queue = [];
    this.isFlushing = true;

    try {
      await this.send(metrics);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Send metrics batch to backend
   */
  private async send(metrics: WebVitalMetric[]): Promise<void> {
    const batch: WebVitalsBatch = {
      metrics,
      sessionId: getSessionId(),
      userAgent: getUserAgentHint(),
    };

    const payload = JSON.stringify(batch);

    if (this.config.debug) {
      console.log("[Web Vitals] Sending batch:", batch);
    }

    // Try sendBeacon first (non-blocking, reliable for page unload)
    if (this.trySendBeacon(payload)) {
      if (this.config.debug) {
        console.log("[Web Vitals] Sent via sendBeacon");
      }
      return;
    }

    // Fallback to fetch with keepalive
    try {
      await this.sendViaFetch(payload);
      if (this.config.debug) {
        console.log("[Web Vitals] Sent via fetch");
      }
    } catch (error) {
      if (this.config.debug) {
        console.error("[Web Vitals] Failed to send:", error);
      }
      // Silently fail - we don't want to impact user experience
    }
  }

  /**
   * Attempt to send via sendBeacon
   */
  private trySendBeacon(payload: string): boolean {
    if (typeof navigator === "undefined" || !navigator.sendBeacon) {
      return false;
    }

    try {
      const blob = new Blob([payload], { type: "application/json" });
      return navigator.sendBeacon(this.config.endpoint, blob);
    } catch {
      return false;
    }
  }

  /**
   * Send via fetch with keepalive
   */
  private async sendViaFetch(payload: string): Promise<void> {
    const response = await fetch(this.config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  }

  /**
   * Setup listeners to flush on page unload
   */
  private setupFlushOnUnload(): void {
    if (typeof window === "undefined") return;

    // Flush when page becomes hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void this.flush();
      }
    };

    // Flush on page hide (covers more cases than unload)
    const handlePageHide = () => {
      void this.flush();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);
  }
}

/**
 * Transport instance (singleton per config)
 */
let transportInstance: MetricQueue | null = null;

/**
 * Initialize transport layer
 */
export function initTransport(config: Partial<TransportConfig> = {}): void {
  const fullConfig: TransportConfig = {
    endpoint: config.endpoint ?? "/api/telemetry/web-vitals",
    batchSize: config.batchSize ?? 5,
    flushInterval: config.flushInterval ?? 10000, // 10 seconds
    debug: config.debug ?? false,
  };

  transportInstance = new MetricQueue(fullConfig);
}

/**
 * Send a single metric (will be batched)
 */
export function sendMetric(metric: WebVitalMetric): void {
  if (!transportInstance) {
    console.warn("[Web Vitals] Transport not initialized");
    return;
  }

  transportInstance.enqueue(metric);
}

/**
 * Manually flush queued metrics
 */
export async function flushMetrics(): Promise<void> {
  if (transportInstance) {
    await transportInstance.flush();
  }
}

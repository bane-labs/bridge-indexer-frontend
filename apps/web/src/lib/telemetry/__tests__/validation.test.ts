/**
 * Web Vitals Validation Tests
 */

import { describe, it, expect } from "@jest/globals";

import { WebVitalMetricSchema, WebVitalsBatchSchema } from "../validation";

describe("Web Vitals Validation", () => {
  describe("WebVitalMetricSchema", () => {
    it("should validate a valid metric", () => {
      const validMetric = {
        name: "LCP",
        value: 2500,
        rating: "good",
        delta: 100,
        id: "v1-1234567890",
        route: "/dashboard",
        timestamp: Date.now(),
        environment: "production",
        appName: "atlas-web",
        buildId: "abc123",
        navigationType: "navigate",
      };

      const result = WebVitalMetricSchema.safeParse(validMetric);
      expect(result.success).toBe(true);
    });

    it("should reject invalid metric name", () => {
      const invalidMetric = {
        name: "INVALID",
        value: 100,
        id: "v1-123",
        route: "/",
        timestamp: Date.now(),
        environment: "production",
        appName: "atlas-web",
      };

      const result = WebVitalMetricSchema.safeParse(invalidMetric);
      expect(result.success).toBe(false);
    });

    it("should reject negative values", () => {
      const invalidMetric = {
        name: "LCP",
        value: -100,
        id: "v1-123",
        route: "/",
        timestamp: Date.now(),
        environment: "production",
        appName: "atlas-web",
      };

      const result = WebVitalMetricSchema.safeParse(invalidMetric);
      expect(result.success).toBe(false);
    });

    it("should reject missing required fields", () => {
      const invalidMetric = {
        name: "LCP",
        value: 100,
        // Missing id, route, timestamp, etc.
      };

      const result = WebVitalMetricSchema.safeParse(invalidMetric);
      expect(result.success).toBe(false);
    });

    it("should accept optional fields as undefined", () => {
      const validMetric = {
        name: "LCP",
        value: 2500,
        id: "v1-1234567890",
        route: "/dashboard",
        timestamp: Date.now(),
        environment: "production",
        appName: "atlas-web",
        // rating, delta, buildId, navigationType are optional
      };

      const result = WebVitalMetricSchema.safeParse(validMetric);
      expect(result.success).toBe(true);
    });

    it("should enforce string length limits", () => {
      const invalidMetric = {
        name: "LCP",
        value: 100,
        id: "x".repeat(101), // Too long
        route: "/",
        timestamp: Date.now(),
        environment: "production",
        appName: "atlas-web",
      };

      const result = WebVitalMetricSchema.safeParse(invalidMetric);
      expect(result.success).toBe(false);
    });
  });

  describe("WebVitalsBatchSchema", () => {
    it("should validate a valid batch", () => {
      const validBatch = {
        metrics: [
          {
            name: "LCP",
            value: 2500,
            rating: "good",
            id: "v1-123",
            route: "/",
            timestamp: Date.now(),
            environment: "production",
            appName: "atlas-web",
          },
          {
            name: "CLS",
            value: 0.05,
            rating: "good",
            id: "v1-456",
            route: "/",
            timestamp: Date.now(),
            environment: "production",
            appName: "atlas-web",
          },
        ],
        sessionId: "session-123",
        userAgent: "chrome",
      };

      const result = WebVitalsBatchSchema.safeParse(validBatch);
      expect(result.success).toBe(true);
    });

    it("should reject empty metrics array", () => {
      const invalidBatch = {
        metrics: [],
        sessionId: "session-123",
      };

      const result = WebVitalsBatchSchema.safeParse(invalidBatch);
      expect(result.success).toBe(false);
    });

    it("should reject batch with too many metrics", () => {
      const invalidBatch = {
        metrics: Array(51).fill({
          name: "LCP",
          value: 100,
          id: "v1-123",
          route: "/",
          timestamp: Date.now(),
          environment: "production",
          appName: "atlas-web",
        }),
        sessionId: "session-123",
      };

      const result = WebVitalsBatchSchema.safeParse(invalidBatch);
      expect(result.success).toBe(false);
    });

    it("should require sessionId", () => {
      const invalidBatch = {
        metrics: [
          {
            name: "LCP",
            value: 100,
            id: "v1-123",
            route: "/",
            timestamp: Date.now(),
            environment: "production",
            appName: "atlas-web",
          },
        ],
        // Missing sessionId
      };

      const result = WebVitalsBatchSchema.safeParse(invalidBatch);
      expect(result.success).toBe(false);
    });

    it("should accept optional userAgent", () => {
      const validBatch = {
        metrics: [
          {
            name: "LCP",
            value: 100,
            id: "v1-123",
            route: "/",
            timestamp: Date.now(),
            environment: "production",
            appName: "atlas-web",
          },
        ],
        sessionId: "session-123",
        // userAgent is optional
      };

      const result = WebVitalsBatchSchema.safeParse(validBatch);
      expect(result.success).toBe(true);
    });
  });
});

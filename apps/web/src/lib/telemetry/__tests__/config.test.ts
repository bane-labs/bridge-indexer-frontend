/**
 * Web Vitals Configuration Tests
 *
 * NOTE: These tests verify the simplified fallback config behavior.
 * For full configuration, components should use the config facade via useConfig().
 */

import { describe, it, expect, beforeEach } from "@jest/globals";

import { getWebVitalsConfig, shouldReportVitals } from "../config";

describe("Web Vitals Configuration", () => {
  beforeEach(() => {
    // Clear sessionStorage mock if needed
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }
  });

  describe("getWebVitalsConfig", () => {
    it("should return default config with expected values", () => {
      const config = getWebVitalsConfig();

      expect(config.appName).toBe("atlas-web");
      expect(config.endpoint).toBe("/api/telemetry/web-vitals");
      // Jest environment mocks window.location.hostname as localhost
      expect(config.environment).toBe("development");
      expect(config.debug).toBe(false);
    });

    it("should return valid sample rate between 0 and 1", () => {
      const config = getWebVitalsConfig();

      expect(config.sampleRate).toBeGreaterThanOrEqual(0);
      expect(config.sampleRate).toBeLessThanOrEqual(1);
    });

    it("should have consistent configuration values", () => {
      const config1 = getWebVitalsConfig();
      const config2 = getWebVitalsConfig();

      expect(config1.appName).toBe(config2.appName);
      expect(config1.endpoint).toBe(config2.endpoint);
      expect(config1.environment).toBe(config2.environment);
    });
  });

  describe("shouldReportVitals", () => {
    it("should return false for 0 sample rate", () => {
      expect(shouldReportVitals(0)).toBe(false);
    });

    it("should return true for 1 sample rate", () => {
      expect(shouldReportVitals(1)).toBe(true);
    });

    it("should return consistent result for same session", () => {
      const rate = 0.5;
      const first = shouldReportVitals(rate);
      const second = shouldReportVitals(rate);

      expect(first).toBe(second);
    });
  });
});

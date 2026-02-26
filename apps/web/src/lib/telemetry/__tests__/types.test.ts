/**
 * Web Vitals Types Tests
 */

import { describe, it, expect } from "@jest/globals";

import { sanitizeRoute, getSessionId } from "../types";

describe("Web Vitals Types", () => {
  describe("sanitizeRoute", () => {
    it("should extract pathname from full URL", () => {
      const url = "https://example.com/path/to/page?foo=bar#hash";
      const result = sanitizeRoute(url);

      expect(result).toBe("/path/to/page");
    });

    it("should handle pathname only", () => {
      const url = "/path/to/page";
      const result = sanitizeRoute(url);

      expect(result).toBe("/path/to/page");
    });

    it("should remove query parameters", () => {
      const url = "/page?email=user@example.com&token=secret";
      const result = sanitizeRoute(url);

      expect(result).toBe("/page");
    });

    it("should remove hash fragments", () => {
      const url = "/page#section";
      const result = sanitizeRoute(url);

      expect(result).toBe("/page");
    });

    it("should handle root path", () => {
      const url = "/";
      const result = sanitizeRoute(url);

      expect(result).toBe("/");
    });

    it("should handle invalid URLs gracefully", () => {
      const url = "not-a-valid-url";
      const result = sanitizeRoute(url);

      // Relative URLs get parsed relative to window.location.origin
      // In test environment this becomes / after parsing
      expect(result).toBe("/");
    });

    it("should preserve nested paths", () => {
      const url = "/dashboard/users/123/edit?debug=true";
      const result = sanitizeRoute(url);

      expect(result).toBe("/dashboard/users/123/edit");
    });
  });

  describe("getSessionId", () => {
    beforeEach(() => {
      // Clear sessionStorage before each test
      sessionStorage.clear();
    });

    it("should generate a session ID", () => {
      const sessionId = getSessionId();

      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it("should return consistent ID within same session", () => {
      const id1 = getSessionId();
      const id2 = getSessionId();

      // Should be the same within the same test run (session)
      expect(id1).toBe(id2);
    });

    it("should include timestamp and random component", () => {
      const sessionId = getSessionId();

      // Format: {timestamp}-{random}
      expect(sessionId).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });
});

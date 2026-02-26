/**
 * Tests for PII redaction utilities
 *
 * @jest-environment node
 */

import { containsSensitiveData, redact, redactString } from "../redact";

describe("redact", () => {
  it("should remove sensitive keys", () => {
    const input = {
      userId: "123",
      email: "user@example.com",
      password: "secret123",
      token: "abc123",
    };

    const result = redact(input);

    expect(result).toEqual({
      userId: "123",
      email: "user@example.com",
      // password and token should be removed
    });
  });

  it("should handle nested objects", () => {
    const input = {
      user: {
        id: "123",
        credentials: {
          password: "secret",
          apiKey: "key123",
        },
      },
    };

    const result = redact(input);

    expect(result).toEqual({
      user: {
        id: "123",
        credentials: {},
      },
    });
  });

  it("should handle arrays", () => {
    const input = {
      users: [
        { id: "1", password: "secret1" },
        { id: "2", password: "secret2" },
      ],
    };

    const result = redact(input);

    expect(result).toEqual({
      users: [{ id: "1" }, { id: "2" }],
    });
  });

  it("should redact JWT-like tokens by value", () => {
    const input = {
      authHeader: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
    };

    const result = redact(input);

    // Should be removed because it matches JWT pattern
    expect(result).toEqual({});
  });

  it("should preserve safe values", () => {
    const input = {
      userId: "123",
      username: "john_doe",
      email: "user@example.com",
      isActive: true,
      createdAt: "2025-01-01",
    };

    const result = redact(input);

    expect(result).toEqual(input);
  });

  it("should handle circular references", () => {
    const input: any = {
      id: "123",
      parent: null,
    };
    input.parent = input;

    const result = redact(input);

    expect(result).toHaveProperty("id", "123");
    expect(result).toHaveProperty("parent", "[CIRCULAR]");
  });

  it("should respect depth limits", () => {
    const createDeepObject = (depth: number): any => {
      if (depth === 0) return { value: "deep" };
      return { nested: createDeepObject(depth - 1) };
    };

    const input = createDeepObject(20);
    const result = redact(input);

    // Should limit depth
    expect(JSON.stringify(result)).toContain("[DEPTH_LIMIT]");
  });

  it("should be case-insensitive for key names", () => {
    const input = {
      Password: "secret1",
      PASSWORD: "secret2",
      PaSsWoRd: "secret3",
    };

    const result = redact(input);

    expect(result).toEqual({});
  });
});

describe("redactString", () => {
  it("should redact Bearer tokens", () => {
    const input = "Authorization: Bearer abc123xyz456";
    const result = redactString(input);

    expect(result).toContain("[REDACTED]");
    expect(result).not.toContain("abc123xyz456");
  });

  it("should redact URL query parameters", () => {
    const input = "https://api.example.com/auth?password=secret123&username=john";
    const result = redactString(input);

    expect(result).toContain("password=[REDACTED]");
    expect(result).toContain("username=john");
  });

  it("should redact Authorization headers", () => {
    const input = "Headers: Authorization: Basic abc123, Content-Type: application/json";
    const result = redactString(input);

    expect(result).toContain("Authorization: [REDACTED]");
  });

  it("should redact Cookie headers", () => {
    const input = "Cookie: session=abc123; user_id=456";
    const result = redactString(input);

    expect(result).toContain("Cookie: [REDACTED]");
  });
});

describe("containsSensitiveData", () => {
  it("should detect sensitive keys", () => {
    const input = {
      userId: "123",
      password: "secret",
    };

    expect(containsSensitiveData(input)).toBe(true);
  });

  it("should detect sensitive values", () => {
    const input = {
      authHeader: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature",
    };

    expect(containsSensitiveData(input)).toBe(true);
  });

  it("should return false for safe data", () => {
    const input = {
      userId: "123",
      username: "john_doe",
    };

    expect(containsSensitiveData(input)).toBe(false);
  });

  it("should handle nested objects", () => {
    const input = {
      user: {
        profile: {
          apiKey: "secret",
        },
      },
    };

    expect(containsSensitiveData(input)).toBe(true);
  });

  it("should handle arrays", () => {
    const input = {
      users: [{ id: "1" }, { id: "2", token: "secret" }],
    };

    expect(containsSensitiveData(input)).toBe(true);
  });
});

/**
 * Mock implementation of env module for Jest tests
 *
 * This mock allows tests to run without needing to load the actual
 * @t3-oss/env-nextjs module, which is ESM-only and causes issues in Jest.
 *
 * Uses getters to make the mock reactive to process.env changes during tests.
 */

// Mock clientEnv with reactive getters
export const clientEnv = {
  get NEXT_PUBLIC_API_URL() {
    return process.env.NEXT_PUBLIC_API_URL || "/api";
  },
  get NEXT_PUBLIC_APP_URL() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  },
  get NEXT_PUBLIC_APP_ENV() {
    return process.env.NEXT_PUBLIC_APP_ENV as "development" | "staging" | "production" | undefined;
  },
  get NEXT_PUBLIC_BUILD_ID() {
    return process.env.NEXT_PUBLIC_BUILD_ID;
  },
  get NEXT_PUBLIC_WEB_VITALS_ENABLED() {
    return process.env.NEXT_PUBLIC_WEB_VITALS_ENABLED === "true" ? true : undefined;
  },
  get NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE() {
    return process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE
      ? parseFloat(process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE)
      : undefined;
  },
  get NEXT_PUBLIC_WEB_VITALS_ENDPOINT() {
    return process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT;
  },
  get NEXT_PUBLIC_WEB_VITALS_DEBUG() {
    return process.env.NEXT_PUBLIC_WEB_VITALS_DEBUG === "true" ? true : undefined;
  },
  get NEXT_PUBLIC_SENTRY_DSN() {
    return process.env.NEXT_PUBLIC_SENTRY_DSN;
  },
  get NEXT_PUBLIC_SENTRY_ENVIRONMENT() {
    return process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;
  },
  get NEXT_PUBLIC_SENTRY_RELEASE() {
    return process.env.NEXT_PUBLIC_SENTRY_RELEASE;
  },
  get NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV() {
    return process.env.NEXT_PUBLIC_SENTRY_ENABLE_IN_DEV;
  },
};

// Mock serverEnv with reactive getters
export const serverEnv = {
  get NODE_ENV() {
    return (process.env.NODE_ENV || "test") as "development" | "test" | "production";
  },
  get LOG_LEVEL() {
    return (process.env.LOG_LEVEL || "info") as "debug" | "info" | "warn" | "error";
  },
  get API_BASE_URL() {
    return process.env.API_BASE_URL;
  },
  get DATABASE_URL() {
    return process.env.DATABASE_URL;
  },
  get SENTRY_DSN() {
    return process.env.SENTRY_DSN;
  },
  get SENTRY_ENVIRONMENT() {
    return process.env.SENTRY_ENVIRONMENT;
  },
  get SENTRY_RELEASE() {
    return process.env.SENTRY_RELEASE;
  },
  get SENTRY_AUTH_TOKEN() {
    return process.env.SENTRY_AUTH_TOKEN;
  },
  get SENTRY_ORG() {
    return process.env.SENTRY_ORG;
  },
  get SENTRY_PROJECT() {
    return process.env.SENTRY_PROJECT;
  },
  get SENTRY_ENABLE_IN_DEV() {
    return process.env.SENTRY_ENABLE_IN_DEV;
  },
  // OAuth / Authentication
  get GOOGLE_CLIENT_ID() {
    return process.env.GOOGLE_CLIENT_ID;
  },
  get GOOGLE_CLIENT_SECRET() {
    return process.env.GOOGLE_CLIENT_SECRET;
  },
  get AUTH_SESSION_SECRET() {
    return process.env.AUTH_SESSION_SECRET || "test-session-secret-32-chars-min";
  },
  get AUTH_SESSION_TTL_SECONDS() {
    return process.env.AUTH_SESSION_TTL_SECONDS
      ? parseInt(process.env.AUTH_SESSION_TTL_SECONDS, 10)
      : 604800;
  },
};

// Unified env export
export const env = {
  ...clientEnv,
  ...serverEnv,
};

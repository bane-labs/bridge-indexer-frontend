/**
 * Test Environment Setup
 *
 * Sets up environment variables and global mocks for the test environment.
 */

/**
 * Default test environment variables.
 * These values override the production defaults during tests.
 */
export const testEnv = {
  // App configuration
  NEXT_PUBLIC_APP_NAME: "atlas-web",
  NEXT_PUBLIC_APP_ENV: "development",
  NEXT_PUBLIC_BUILD_ID: "test-build",

  // API configuration
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:3000/api",
  NEXT_PUBLIC_API_TIMEOUT: "5000",

  // Web Vitals
  NEXT_PUBLIC_WEB_VITALS_ENABLED: "true",
  NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE: "1",
  NEXT_PUBLIC_WEB_VITALS_ENDPOINT: "/api/telemetry/web-vitals",

  // Feature flags (add as needed)
  // NEXT_PUBLIC_FEATURE_XYZ: "true",
} as const;

/**
 * Apply test environment variables.
 * Call this at the top of your global test setup file.
 */
export function setupTestEnv() {
  Object.entries(testEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

/**
 * Reset environment to test defaults.
 * Useful if individual tests modify env vars.
 */
export function resetTestEnv() {
  setupTestEnv();
}

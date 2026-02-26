/**
 * Root Jest configuration for monorepo
 * This enables VSCode Jest extension to discover tests in all packages
 */
module.exports = {
  projects: ["<rootDir>/apps/web", "<rootDir>/packages/ui"],
  collectCoverageFrom: [
    "apps/*/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.stories.tsx",
    "!**/index.ts",
    "!**/node_modules/**",
  ],
};

module.exports = {
  displayName: "web",
  preset: "ts-jest",
  testEnvironment: "jsdom",
  rootDir: ".",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Force all packages to use workspace React (React 19 compatibility)
    // This prevents version conflicts between RTL's bundled React and workspace React
    "^react$": require.resolve("react"),
    "^react-dom$": require.resolve("react-dom"),
    "^react-dom/client$": require.resolve("react-dom/client"),
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
        useESM: false,
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: "commonjs",
        },
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(web-vitals|@faker-js|@t3-oss)/)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/**/index.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/page.tsx",
    "!src/test/**/*",
    // Exclude env module wiring (thin wrappers around @t3-oss/env-nextjs)
    "!src/env.ts",
    "!src/env/public-env.ts",
    "!src/env/server-env.ts",
    // Exclude env schemas (pure Zod schemas, validated via integration tests)
    "!src/schemas/env/**/*",
  ],
};

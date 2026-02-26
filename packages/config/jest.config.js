module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
        tsconfig: {
          jsx: "react-jsx",
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.tsx",
    "!src/**/index.ts",
    // Exclude example files (documentation/reference code)
    "!src/**/*.example.tsx",
    "!src/**/*.example.ts",
    // Exclude Shadcn UI components (third-party, pre-tested)
    "!src/components/ui/**",
    // Exclude form infrastructure (thin wrappers around react-hook-form + Zod)
    "!src/components/forms/**",
    "!src/hooks/use-zod-form.ts",
    "!src/lib/forms/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 65,
      lines: 70,
      statements: 70,
    },
    // Only enforce coverage on custom utilities and business logic
    "./src/lib/*.{ts,tsx}": {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};

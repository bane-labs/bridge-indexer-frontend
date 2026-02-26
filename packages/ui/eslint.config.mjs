import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import tseslint from "typescript-eslint";

import baseConfig from "@atlas/config/eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...baseConfig,
  {
    // Override parser options to specify this package's tsconfig
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
      },
    },
  },
  {
    // Test files: disable type-checked rules, use basic TS support only
    files: ["**/*.test.ts", "**/*.test.tsx", "**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // Disable all type-checked rules for test files
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "no-console": "off",
    },
  },
  {
    files: ["**/*.stories.tsx", "**/*.stories.ts", "**/*.stories.jsx", "**/*.stories.js"],
    rules: {
      // Storybook stories can use console for examples
      "no-console": "off",
    },
  },
  {
    files: ["jest.config.js", "jest.setup.js"],
    languageOptions: {
      globals: {
        process: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
    plugins: {}, // Explicitly clear plugins to avoid TS rules
    rules: {
      "no-undef": "off",
      "no-console": "off",
    },
  },
  {
    files: [".storybook/**/*.ts", ".storybook/**/*.js"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        process: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

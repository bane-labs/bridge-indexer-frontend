import js from "@eslint/js";
import globals from "globals";

/**
 * Atlas Monorepo Root ESLint Configuration
 * 
 * Minimal config for root-level files only (scripts, tooling).
 * Individual packages (apps/*, packages/*) have their own configs
 * that extend from @atlas/config/eslint with full TypeScript rules.
 */

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  
  {
    files: ["*.{js,mjs,cjs}", "scripts/**/*.{js,mjs}", "tools/**/*.{js,mjs}"],
    
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    
    rules: {
      "no-console": "off", // Root scripts can use console
      "no-debugger": "error",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "prefer-const": "error",
    },
  },
  
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/storybook-static/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "apps/**", // Apps use their own config
      "packages/**", // Packages use their own config
      "pnpm-lock.yaml",
    ],
  },
];

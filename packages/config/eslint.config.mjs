import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import promisePlugin from "eslint-plugin-promise";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import securityPlugin from "eslint-plugin-security";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Atlas Enterprise ESLint Configuration
 * 
 * Modern, TypeScript-first, enterprise-ready linting setup.
 * - Uses ESLint Flat Config
 * - TypeScript type-checked rules
 * - Next.js App Router compatible
 * - Deterministic import sorting via simple-import-sort
 * - Low noise, high signal
 * - NO Airbnb config
 */

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base recommended rules
  js.configs.recommended,
  
  // TypeScript recommended (non-type-checked) for TS files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  
  // Stylistic rules for TS files
  ...tseslint.configs.stylistic.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx"],
  })),
  
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      promise: promisePlugin,
      security: securityPlugin,
    },
    
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: true,
      },
    },
    
    rules: {
      // ========================================
      // React Rules
      // ========================================
      
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/display-name": "warn",
      "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
      
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // ========================================
      // Accessibility (jsx-a11y) - Atlas Baseline
      // ========================================
      
      ...jsxA11y.configs.recommended.rules,
      
      // Relax rules that conflict with Radix UI and modern component patterns
      "jsx-a11y/no-autofocus": "warn", // Sometimes needed in modals/dialogs
      "jsx-a11y/click-events-have-key-events": "error", // Enforce keyboard support
      "jsx-a11y/no-static-element-interactions": "error", // Use proper semantic elements
      
      // Enforce critical accessibility patterns
      "jsx-a11y/alt-text": "error", // Images must have alt text
      "jsx-a11y/aria-props": "error", // Valid ARIA attributes only
      "jsx-a11y/aria-proptypes": "error", // Valid ARIA values
      "jsx-a11y/aria-unsupported-elements": "error", // No ARIA on unsupported elements
      "jsx-a11y/role-has-required-aria-props": "error", // Complete ARIA roles
      "jsx-a11y/role-supports-aria-props": "error", // Valid ARIA props for role
      "jsx-a11y/label-has-associated-control": "error", // Forms must have labels
      
      // ========================================
      // Import Rules (Deterministic Sorting)
      // ========================================
      
      // Simple import sort provides deterministic, autofixable import ordering
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports (e.g. CSS, polyfills) come first
            ["^\\u0000"],
            // Node.js built-ins (use node: prefix)
            ["^node:"],
            // External packages (react, next, etc.)
            ["^@?\\w"],
            // Internal packages (@atlas/*)
            ["^@atlas(/.*|$)"],
            // Absolute imports using path aliases (@/, ~/)
            ["^@/", "^~/"],
            // Parent imports (..)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Same-folder imports (./)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Type imports (keep separate)
            ["^.+\\u0000$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      
      // Enforce no duplicate imports
      "import/no-duplicates": "error",
      
      // Ensure imports come first
      "import/first": "error",
      
      // Newline after imports
      "import/newline-after-import": "error",
      
      // ========================================
      // Unused Imports (Auto-fixable)
      // ========================================
      
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      
      // ========================================
      // Promise Rules (Async Safety)
      // ========================================
      
      "promise/always-return": "off",
      "promise/catch-or-return": "warn",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",
      "promise/valid-params": "error",
      
      // ========================================
      // Security Rules (Low Noise)
      // ========================================
      
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "warn",
      
      // ========================================
      // General Best Practices
      // ========================================
      
      "no-console": "error",
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "no-nested-ternary": "warn",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "no-implicit-coercion": "warn",
    },
  },
  
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [
      "**/scripts/**/*.ts",
      "**/*.config.{ts,mts,cts}",
      "**/*.setup.{ts,mts}",
      "**/.storybook/**",
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ],
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
      "unused-imports": unusedImports,
      promise: promisePlugin,
      security: securityPlugin,
    },
    
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    
    rules: {
      // ========================================
      // TypeScript Rules (Non-Type-Checked)
      // ========================================
      
      // Enforce type safety (non-type-checked versions)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Unused variables with underscore prefix support
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      
      // Enforce consistent type imports
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
        },
      ],
      
      // Enforce consistent type exports
      "@typescript-eslint/consistent-type-exports": [
        "error",
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      
      // Enforce naming conventions
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      
      // ========================================
      // React Rules
      // ========================================
      
      ...react.configs.recommended.rules,
      ...react.configs["jsx-runtime"].rules,
      ...reactHooks.configs.recommended.rules,
      
      "react/prop-types": "off", // TypeScript handles this
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/display-name": "warn",
      "react/jsx-no-target-blank": ["error", { allowReferrer: true }],
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
      
      // React Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // ========================================
      // Accessibility (jsx-a11y) - Atlas Baseline
      // ========================================
      
      ...jsxA11y.configs.recommended.rules,
      
      // Next.js Link component handling
      "jsx-a11y/anchor-is-valid": [
        "error",
        {
          components: ["Link"],
          specialLink: ["hrefLeft", "hrefRight"],
          aspects: ["invalidHref", "preferButton"],
        },
      ],
      
      // Relax rules that conflict with Radix UI and modern component patterns
      "jsx-a11y/no-autofocus": "warn", // Sometimes needed in modals/dialogs
      "jsx-a11y/click-events-have-key-events": "error", // Enforce keyboard support
      "jsx-a11y/no-static-element-interactions": "error", // Use proper semantic elements
      
      // Enforce critical accessibility patterns
      "jsx-a11y/alt-text": "error", // Images must have alt text
      "jsx-a11y/aria-props": "error", // Valid ARIA attributes only
      "jsx-a11y/aria-proptypes": "error", // Valid ARIA values
      "jsx-a11y/aria-unsupported-elements": "error", // No ARIA on unsupported elements
      "jsx-a11y/role-has-required-aria-props": "error", // Complete ARIA roles
      "jsx-a11y/role-supports-aria-props": "error", // Valid ARIA props for role
      "jsx-a11y/label-has-associated-control": "error", // Forms must have labels
      
      // ========================================
      // Import Rules (Deterministic Sorting)
      // ========================================
      
      // Simple import sort provides deterministic, autofixable import ordering
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side effect imports (e.g. CSS, polyfills) come first
            ["^\\u0000"],
            // Node.js built-ins (use node: prefix)
            ["^node:"],
            // External packages (react, next, etc.)
            ["^@?\\w"],
            // Internal packages (@atlas/*)
            ["^@atlas(/.*|$)"],
            // Absolute imports using path aliases (@/, ~/)
            ["^@/", "^~/"],
            // Parent imports (..)
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            // Same-folder imports (./)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Type imports (keep separate)
            ["^.+\\u0000$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
      
      // Enforce no duplicate imports
      "import/no-duplicates": "error",
      
      // Ensure imports come first
      "import/first": "error",
      
      // Newline after imports
      "import/newline-after-import": "error",
      
      // ========================================
      // Unused Imports (Auto-fixable)
      // ========================================
      
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      
      // ========================================
      // Promise Rules (Async Safety)
      // ========================================
      
      "promise/always-return": "off", // Too strict for modern async/await
      "promise/catch-or-return": "warn",
      "promise/no-return-wrap": "error",
      "promise/param-names": "error",
      "promise/no-nesting": "warn",
      "promise/no-promise-in-callback": "warn",
      "promise/valid-params": "error",
      
      // ========================================
      // Security Rules (Low Noise)
      // ========================================
      
      "security/detect-object-injection": "off", // Too many false positives
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "warn",
      
      // ========================================
      // General Best Practices
      // ========================================
      
      "no-console": "error", // Use structured logging
      "no-debugger": "error",
      "no-alert": "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "no-nested-ternary": "warn",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "no-implicit-coercion": "warn",
    },
  },
  
  // ========================================
  // Test Files Overrides
  // ========================================
  {
    files: [
      "**/__tests__/**/*.{ts,tsx}",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "**/jest.setup.ts",
      "**/jest.config.ts",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "no-console": "off",
    },
  },
  
  {
    files: [
      "**/__tests__/**/*.{js,jsx}",
      "**/*.test.{js,jsx}",
      "**/*.spec.{js,jsx}",
      "**/jest.setup.js",
      "**/jest.config.js",
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  
  // ========================================
  // Config Files Overrides
  // ========================================
  {
    files: [
      "**/*.config.{js,mjs,cjs}",
      "**/*.setup.{js,mjs}",
    ],
    rules: {
      "no-console": "off",
      "import/no-default-export": "off",
    },
  },
  
  // ========================================
  // Ignore Patterns
  // ========================================
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
      "**/.storybook/public/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/*.min.js",
      "**/generated/**",
      "**/.contentlayer/**",
      "**/jest.config.js",
      "**/jest.setup.js",
    ],
  },
  
  // Prettier must be last to override conflicting rules
  prettier,
];

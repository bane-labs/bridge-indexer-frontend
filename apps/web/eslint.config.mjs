import baseConfig from "@atlas/config/eslint";
import tseslint from "typescript-eslint";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  ...baseConfig,
  {
    // Override parser options to specify this package's tsconfig
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: false,
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
      },
    },
  },
  {
    ignores: ["eslint.config.mjs"], // Don't lint the config file itself
  },
  {
    // Ban direct process.env usage - use config facade instead
    // This prevents config sprawl and ensures all config goes through typed facade
    files: [
      "src/**/*.{ts,tsx}",
    ],
    ignores: [
      // Allowed: env module and its schemas
      "src/env.ts",
      "src/env/**",
      "src/schemas/env/**",
      // Allowed: config module (converts env to config)
      "src/config/**",
      // Allowed: runtime-config endpoint (server-side config assembly)
      "src/app/api/runtime-config/route.ts",
      // Allowed: analytics adapters and provider (check env vars at runtime)
      "src/lib/analytics/adapters/**",
      "src/providers/analytics-provider.tsx",
      // Allowed: test setup
      "src/test/**",
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct access to process.env is not allowed. Use the config facade instead:\n" +
            "  - Server-side: import { getServerConfig } from '@/config'\n" +
            "  - Client-side: import { useConfig } from '@/config'\n" +
            "This ensures type safety, validation, and consistent config access patterns.",
        },
      ],
    },
  },
  {
    // Ban direct env module usage - use config facade instead
    // Enforce config facade pattern throughout the app
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/lib/**/*.{ts,tsx}",
    ],
    ignores: [
      // Config module itself needs to import env
      "src/config/**",
      // Runtime config needs env for legacy support
      "src/lib/runtime-config/**",
      // API routes can use env if needed (but prefer config)
      "src/app/api/**/route.ts",
      // Tests
      "src/test/**",
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/env", "@/env/*"],
              message:
                "Direct env imports are discouraged. Use the config facade instead:\n" +
                "  - Server-side: import { getServerConfig } from '@/config'\n" +
                "  - Client-side: import { useConfig } from '@/config'\n" +
                "This provides a stable, typed config interface and separates concerns.",
            },
          ],
        },
      ],
    },
  },
  {
    // Ban console.* usage - use structured logging instead
    rules: {
      "no-console": "error",
    },
  },
  {
    // Ban direct analytics vendor SDK imports outside the analytics adapter layer
    // Application code should use @/lib/analytics, never posthog-js or gtag directly
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "posthog-js",
              message:
                "Direct PostHog imports are not allowed. Use the analytics adapter instead:\n" +
                "  import { analytics } from '@/lib/analytics';\n" +
                "This ensures consistent event tracking and consent management.",
            },
            {
              name: "posthog-js/react",
              message:
                "Direct PostHog imports are not allowed. Use the analytics adapter instead:\n" +
                "  import { analytics } from '@/lib/analytics';\n" +
                "This ensures consistent event tracking and consent management.",
            },
          ],
        },
      ],
    },
  },
  {
    // Ban direct process.env usage - use env module instead
    // This prevents env var sprawl and ensures validation
    files: [
      "src/**/*.{ts,tsx}",
    ],
    ignores: [
      "src/env.ts",
      "src/env/**",
      "src/schemas/env/**",
      "src/app/api/**/route.ts", // API routes may need direct env access for runtime config
      "src/lib/analytics/adapters/**", // Analytics adapters check for env vars at runtime
      "src/providers/analytics-provider.tsx", // Analytics provider checks for env vars
      "src/test/**",
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct access to process.env is not allowed. Import environment variables from '@/env' instead. This ensures type safety and validation. For server-only vars use 'serverEnv', for client vars use 'clientEnv'.",
        },
      ],
    },
  },
  {
    // Ban build-time NEXT_PUBLIC env usage in client code
    // Enforce runtime config pattern for client-side runtime-varying values
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
    ],
    ignores: [
      "src/env/**",
      "src/schemas/env/**",
      "src/providers/env-provider.tsx", // Legacy provider, OK to use clientEnv
      "src/app/api/**/route.ts", // API routes are server-side
      "src/test/**",
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name='clientEnv'][property.name=/^NEXT_PUBLIC_/]",
          message:
            "Direct access to build-time NEXT_PUBLIC env vars in client code is discouraged. Use runtime config instead: import { useRuntimeConfig } from '@/lib/runtime-config'; This enables 'build once, deploy many' and avoids baking environment-specific values into the client bundle.",
        },
        {
          selector: "MemberExpression[object.object.name='clientEnv'][object.property.name='NEXT_PUBLIC_API_URL']",
          message:
            "Use runtime config for API base URL in client code: const { apiBaseUrl } = useRuntimeConfig(); or use useApiClient() hook. This avoids build-time env inlining and enables true runtime env separation.",
        },
      ],
    },
  },
  {
    // Enforce "no fetch spaghetti" - all API calls go through central client
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/providers/**/*.{ts,tsx}",
    ],
    ignores: [
      "src/lib/api/**",
      "src/lib/http/**",
      "src/app/api/**/route.ts",
      "src/app/monitoring/route.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            "Direct fetch() calls are not allowed. Use the central API client from @/lib/api instead. This ensures consistent error handling, correlation ID propagation, and retry logic.",
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Direct fetch() calls are not allowed. Use the central API client from @/lib/api instead. This ensures consistent error handling, correlation ID propagation, and retry logic.",
        },
      ],
    },
  },
  {
    // Auto-generated OpenAPI schema files
    files: ["src/lib/api/contracts/schema.ts"],
    rules: {
      // Generated code doesn't follow our naming conventions
      "@typescript-eslint/naming-convention": "off",
      // Generated code uses index signatures instead of Record
      "@typescript-eslint/consistent-indexed-object-style": "off",
    },
  },
  {
    files: ["src/lib/telemetry/**/*.ts", "src/lib/telemetry/**/*.tsx", "src/app/api/telemetry/**/*.ts"],
    ignores: ["**/__tests__/**"],
    rules: {
      // These files are browser-only with proper type guards
      "no-undef": "off",
      // Telemetry uses console for browser-side debugging
      "no-console": "off",
    },
  },
  {
    files: ["next.config.js", "jest.config.js", "jest.setup.js", "postcss.config.mjs", "eslint.config.mjs", "playwright.config.ts"],
    languageOptions: {
      parserOptions: {
        projectService: false, // These files are not in tsconfig
      },
      globals: {
        process: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      // Config files require CommonJS
      "@typescript-eslint/no-require-imports": "off",
      // Disable type-checked rules for non-TS files
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "no-undef": "off",
    },
  },
  {
    files: ["scripts/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      // Scripts are allowed to use console for user feedback
      "no-console": "off",
    },
  },
  {
    files: ["jest.setup.js", "**/__tests__/**/*.ts", "**/__tests__/**/*.tsx"],
    rules: {
      // Jest test files use globals
      "no-undef": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

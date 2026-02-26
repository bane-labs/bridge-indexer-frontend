#!/usr/bin/env tsx
/**
 * Environment Variable Validation Script for CI/CD
 *
 * This script validates that all required environment variables are properly
 * defined and conform to their schemas before build/deployment. It runs in
 * CI/CD pipelines to catch configuration issues early.
 *
 * Usage:
 *   pnpm validate:env          # Validates all environment variables
 *   NODE_ENV=production pnpm validate:env  # Validates for production
 *
 * Exit codes:
 *   0 - All environment variables are valid
 *   1 - Validation failed (missing or invalid variables)
 *
 * @security This script only validates structure, not secrets
 */

import { z } from "zod";

import { ClientEnvSchema } from "../src/schemas/env/public-runtime-config";
import { ServerEnvSchema } from "../src/schemas/env/server-runtime-config";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

/**
 * Format error messages for better readability
 */
function formatZodError(error: z.ZodError, prefix = ""): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      const message = issue.message;
      return `  ${colors.red}✖${colors.reset} ${prefix}${path}: ${message}`;
    })
    .join("\n");
}

/**
 * Validate server-side environment variables
 */
function validateServerEnv(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  console.log(
    `\n${colors.bold}${colors.blue}Validating server environment variables...${colors.reset}`
  );

  try {
    const serverSchema = z.object(ServerEnvSchema);
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
    };

    serverSchema.parse(envVars);
    console.log(`${colors.green}✔${colors.reset} Server environment variables are valid`);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = formatZodError(error, "");
      errors.push(formattedError);
      console.error(
        `${colors.red}✖${colors.reset} Server environment validation failed:\n${formattedError}`
      );
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
      console.error(`${colors.red}✖${colors.reset} Unexpected error: ${errorMessage}`);
    }
    return { success: false, errors };
  }
}

/**
 * Validate client-side environment variables
 */
function validateClientEnv(): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  console.log(
    `\n${colors.bold}${colors.blue}Validating client environment variables...${colors.reset}`
  );

  try {
    const clientSchema = z.object(ClientEnvSchema);
    const envVars = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    };

    clientSchema.parse(envVars);
    console.log(`${colors.green}✔${colors.reset} Client environment variables are valid`);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedError = formatZodError(error, "NEXT_PUBLIC_");
      errors.push(formattedError);
      console.error(
        `${colors.red}✖${colors.reset} Client environment validation failed:\n${formattedError}`
      );
    } else {
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push(errorMessage);
      console.error(`${colors.red}✖${colors.reset} Unexpected error: ${errorMessage}`);
    }
    return { success: false, errors };
  }
}

/**
 * Display helpful information about missing environment variables
 */
function displayHelp() {
  console.log(
    `\n${colors.bold}${colors.yellow}Missing or invalid environment variables detected.${colors.reset}`
  );
  console.log(`\n${colors.cyan}To fix this:${colors.reset}`);
  console.log(`  1. Create a .env file in apps/web/ (copy from .env.example)`);
  console.log(`  2. Set all required environment variables`);
  console.log(`  3. Run this validation script again\n`);

  if (process.env.CI) {
    console.log(`${colors.cyan}For CI/CD:${colors.reset}`);
    console.log(`  - Add environment variables as GitHub Secrets`);
    console.log(`  - Reference them in your workflow file\n`);
  }
}

/**
 * Main validation function
 */
async function main() {
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );
  console.log(`${colors.bold}${colors.cyan}  Environment Variable Validation${colors.reset}`);
  console.log(
    `${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );

  const nodeEnv = process.env.NODE_ENV || "development";
  console.log(`\nEnvironment: ${colors.bold}${nodeEnv}${colors.reset}`);

  // Skip validation if explicitly disabled
  if (process.env.SKIP_ENV_VALIDATION === "true") {
    console.log(
      `\n${colors.yellow}⚠${colors.reset} Environment validation skipped (SKIP_ENV_VALIDATION=true)`
    );
    process.exit(0);
  }

  // Run validations
  const serverResult = validateServerEnv();
  const clientResult = validateClientEnv();

  // Display results
  console.log(
    `\n${colors.bold}${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`
  );

  if (serverResult.success && clientResult.success) {
    console.log(
      `\n${colors.green}${colors.bold}✔ All environment variables are valid!${colors.reset}\n`
    );
    process.exit(0);
  } else {
    displayHelp();
    console.log(`${colors.red}${colors.bold}✖ Environment validation failed${colors.reset}\n`);
    process.exit(1);
  }
}

// Execute
main().catch((error: unknown) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});

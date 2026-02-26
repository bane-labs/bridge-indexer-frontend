#!/usr/bin/env node

/**
 * Package Manager Enforcement Guard
 *
 * Ensures pnpm is the only package manager used in this repository.
 * This prevents toolchain drift, lockfile conflicts, and dependency inconsistencies.
 *
 * @see docs/TOOLCHAIN_POLICY.md
 */

const { execSync } = require("child_process");

// ANSI color codes for better terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

/**
 * Detect which package manager invoked this script
 */
function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent || "";

  if (userAgent.includes("pnpm")) {
    return "pnpm";
  } else if (userAgent.includes("yarn")) {
    return "yarn";
  } else if (userAgent.includes("npm")) {
    return "npm";
  } else if (userAgent.includes("bun")) {
    return "bun";
  }

  return "unknown";
}

/**
 * Print error message and exit
 */
function exitWithError(detectedManager) {
  console.error(`
${colors.red}${colors.bold}╔═════════════════════════════════════════════════════════════════════╗
║                   PACKAGE MANAGER VIOLATION                         ║
╚═════════════════════════════════════════════════════════════════════╝${colors.reset}

${colors.red}✗ Detected package manager: ${colors.bold}${detectedManager}${colors.reset}
${colors.cyan}✓ Required package manager: ${colors.bold}pnpm${colors.reset}

${colors.yellow}WHY THIS MATTERS:${colors.reset}
Atlas enforces pnpm to ensure consistent dependency resolution,
reproducible builds, and efficient disk usage across all environments.
Using multiple package managers causes lockfile conflicts and drift.

${colors.yellow}HOW TO FIX:${colors.reset}
1. Enable Corepack (Node.js ≥20 built-in tool):
   ${colors.cyan}corepack enable${colors.reset}

2. Install dependencies using pnpm:
   ${colors.cyan}pnpm install${colors.reset}

${colors.yellow}FIRST TIME SETUP:${colors.reset}
If you don't have pnpm installed, Corepack will automatically
download the correct version specified in package.json.

Run:
   ${colors.cyan}corepack enable${colors.reset}
   ${colors.cyan}pnpm install${colors.reset}

${colors.yellow}MORE INFO:${colors.reset}
See docs/TOOLCHAIN_POLICY.md for the full toolchain policy.

${colors.red}${colors.bold}Installation aborted.${colors.reset}
`);

  process.exit(1);
}

/**
 * Main execution
 */
function main() {
  const detectedManager = detectPackageManager();

  // Allow pnpm and unknown (for safety during edge cases)
  if (detectedManager === "pnpm") {
    // Success - pnpm is being used
    process.exit(0);
  }

  // If we detected npm, yarn, bun, or other package managers - fail
  if (detectedManager !== "unknown") {
    exitWithError(detectedManager);
  }

  // If unknown, we're in an edge case - allow it but warn
  // This prevents breaking legitimate workflows while still catching the common cases
  console.warn(
    `${colors.yellow}⚠ Warning: Could not detect package manager. Proceeding with caution.${colors.reset}`
  );
  process.exit(0);
}

main();

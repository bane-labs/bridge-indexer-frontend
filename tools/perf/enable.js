#!/usr/bin/env node
/**
 * Performance Budgets Module - Enable Script
 *
 * This script enables the performance budgets module by copying
 * workflow templates to .github/workflows/
 */

const fs = require("fs");
const path = require("path");

const WORKFLOWS_DIR = path.join(__dirname, "..", "..", ".github", "workflows");
const TEMPLATES_DIR = path.join(__dirname, "templates");

const WORKFLOWS = ["perf-lighthouse.yml", "perf-bundle.yml"];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

function copyWorkflow(filename) {
  const src = path.join(TEMPLATES_DIR, filename);
  const dest = path.join(WORKFLOWS_DIR, filename);

  if (!fs.existsSync(src)) {
    console.error(`✗ Template not found: ${src}`);
    return false;
  }

  if (fs.existsSync(dest)) {
    console.log(`⚠ Workflow already exists: ${filename} (skipping)`);
    return true;
  }

  fs.copyFileSync(src, dest);
  console.log(`✓ Enabled workflow: ${filename}`);
  return true;
}

function main() {
  console.log("🚀 Enabling Performance Budgets Module\n");

  ensureDir(WORKFLOWS_DIR);

  let success = true;
  for (const workflow of WORKFLOWS) {
    if (!copyWorkflow(workflow)) {
      success = false;
    }
  }

  if (success) {
    console.log("\n✅ Performance budgets module enabled successfully!\n");
    console.log("Next steps:");
    console.log("1. Install dependencies: pnpm install");
    console.log("2. Run Lighthouse locally: pnpm build && pnpm perf:lhci");
    console.log("3. Analyze bundles: pnpm perf:analyze");
    console.log("4. Commit the new workflows to enable in CI\n");
    console.log("📖 See docs/performance-budgets.md for more information");
  } else {
    console.error("\n❌ Failed to enable performance budgets module");
    process.exit(1);
  }
}

main();

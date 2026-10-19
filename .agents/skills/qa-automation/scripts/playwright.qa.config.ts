import { defineConfig, devices } from "@playwright/test";

/**
 * QA automation against staging. Copy to the repo root as playwright.qa.config.ts.
 * Login once with `node tests/qa-staging/login-manual.mjs <role>`; tests reuse the saved session.
 * Run: npx playwright test -c playwright.qa.config.ts --project=edge
 */

// One id per run, shared by every worker (a restarted worker re-reads the same env value).
process.env.QA_SESSION ??= String(Date.now()).slice(-7);

const ROLE = process.env.QA_ROLE || "owner";

export default defineConfig({
  testDir: "./tests/qa-staging",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  outputDir: "./qa-report/artifacts",
  reporter: [
    ["list"],
    ["json", { outputFile: "qa-report/results.json" }],
    ["html", { outputFolder: "qa-report/html", open: "never" }],
  ],
  use: {
    baseURL: process.env.QA_BASE_URL,
    storageState: `tests/qa-staging/.auth/${ROLE}.json`,
    viewport: { width: 1600, height: 900 },
    screenshot: "on",
    trace: "retain-on-failure",
    navigationTimeout: 60_000,
    locale: process.env.QA_LOCALE || "en-US",
    timezoneId: process.env.QA_TIMEZONE || "UTC",
  },
  projects: [
    // Default: headless Edge in the background. Never run tests headed.
    { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge", headless: true, viewport: { width: 1600, height: 900 } } },
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome", headless: true, viewport: { width: 1600, height: 900 } } },
  ],
});

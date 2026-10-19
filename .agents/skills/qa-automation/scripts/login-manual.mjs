// Opens a visible Edge window on the staging login page. The user logs in by hand;
// once the URL leaves /login, the session is saved to .auth/<role>.json.
// The agent never sees or types the password.
// Usage: QA_BASE_URL=https://staging.example.com node tests/qa-staging/login-manual.mjs owner
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const role = process.argv[2] || "owner";
const base = process.env.QA_BASE_URL;
const loginPath = process.env.QA_LOGIN_PATH || "/login";
if (!base) {
  console.error("Set QA_BASE_URL first.");
  process.exit(1);
}

const authDir = fileURLToPath(new URL("./.auth/", import.meta.url));
mkdirSync(authDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: false, args: ["--start-maximized"] });
const ctx = await browser.newContext({ viewport: null });
const page = await ctx.newPage();
await page.goto(`${base}${loginPath}`);
console.log(`Waiting for you to log in as "${role}" in the Edge window...`);
await page.waitForURL((u) => !u.pathname.startsWith(loginPath), { timeout: 15 * 60_000 });
await page.waitForLoadState("networkidle").catch(() => {});
await ctx.storageState({ path: `${authDir}${role}.json` });
console.log(`Session for "${role}" saved. Landed on ${page.url()}`);
await browser.close();

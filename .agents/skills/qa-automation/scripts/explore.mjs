// Headless look at one screen using the saved session: dumps visible buttons, inputs and
// labels, and saves a screenshot. Use it before writing selectors.
// Usage: QA_BASE_URL=https://staging.example.com node tests/qa-staging/explore.mjs /path/on/app out-dir [menu label to click]
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const [route = "/", out = "qa-report/explore", menu] = process.argv.slice(2);
const role = process.env.QA_ROLE || "owner";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ storageState: `tests/qa-staging/.auth/${role}.json`, viewport: { width: 1600, height: 900 } });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("PAGE ERROR", e.message));
try {
  await page.goto(`${process.env.QA_BASE_URL}${route}`);
  await page.waitForLoadState("networkidle").catch(() => {});
  if (menu) {
    await page.getByRole("button", { name: new RegExp(menu) }).or(page.getByRole("link", { name: new RegExp(menu) })).first().click();
    await page.waitForTimeout(2000);
  }
  const clean = (s) => (s || "").trim().replace(/\s+/g, " ").slice(0, 80);
  const buttons = await page.locator("button:visible, [role=menuitem]:visible").evaluateAll((els) => els.map((b) => b.getAttribute("aria-label") || b.getAttribute("title") || b.textContent));
  const inputs = await page.locator("input:visible, textarea:visible, [role=combobox]:visible").evaluateAll((els) =>
    els.map((x) => [x.id, x.getAttribute("aria-label"), x.getAttribute("placeholder"), x.getAttribute("type")].filter(Boolean).join(" | ")),
  );
  const labels = await page.locator("label:visible").allInnerTexts();
  console.log("BUTTONS", [...new Set(buttons.map(clean))].filter(Boolean));
  console.log("INPUTS", inputs);
  console.log("LABELS", labels.map(clean));
  await page.screenshot({ path: `${out}/screen.png`, fullPage: true });
  console.log(`Screenshot: ${out}/screen.png`);
} catch (e) {
  console.log("ERROR", e.message.split("\n")[0]);
  await page.screenshot({ path: `${out}/error.png` });
}
await browser.close();

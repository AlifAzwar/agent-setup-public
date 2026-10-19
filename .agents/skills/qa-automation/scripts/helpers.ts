import fs from "node:fs";
import path from "node:path";
import { expect, type Locator, type Page, type TestInfo } from "@playwright/test";

/**
 * Shared helpers for staging QA tests. Copy to tests/qa-staging/helpers.ts and adjust
 * LOGGED_IN (something only a logged-in user sees) and TAG for the project.
 */

const AUTH_DIR = path.join(__dirname, ".auth");
const STATE_FILE = path.join(AUTH_DIR, "run-state.json");
const SHOT_DIR = path.join(__dirname, "..", "..", "qa-report", "shots");
const ROLE = process.env.QA_ROLE || "owner";

/** Text or button name proving the session is alive, e.g. the logout button. */
export const LOGGED_IN = new RegExp(process.env.QA_LOGGED_IN || "Logout|Log out|Keluar", "i");

/** Marks every record the tests create so it is easy to find and clean up. */
export const TAG = process.env.QA_TAG || "(QA)";

export type RunState = Record<string, string | number | boolean | undefined>;

/** State shared between tests and waves (created SKUs, order and quotation numbers). */
export function loadState(): RunState {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function saveState(patch: RunState): RunState {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  const next = { ...loadState(), ...patch };
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2));
  return next;
}

/** Same value in every worker of one run (set in the config). */
export const RUN = (process.env.QA_SESSION ??= String(Date.now()).slice(-7));

/** Build unique names for this run. Never reuse names, SKUs, or phone numbers between runs. */
export const uniq = (label: string) => `${label} ${TAG} ${RUN}`;

/** Screenshot named after the scenario code (first word of the test title), attached to the HTML report. */
export async function shot(page: Page, info: TestInfo, label: string, opts: { fullPage?: boolean } = {}) {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const code = info.title.split(" ")[0];
  const file = path.join(SHOT_DIR, `${code}__${label.replace(/[^a-z0-9-]+/gi, "-")}.png`);
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? false });
  await info.attach(label, { path: file, contentType: "image/png" });
}

/** Non-fatal observation (renamed label, known bug seen mid-chain). Shows up in summary.json. */
export function note(info: TestInfo, text: string) {
  info.annotations.push({ type: "finding", description: text });
}

/** Extra context for the report (numbers, ids). */
export function info(testInfo: TestInfo, text: string) {
  testInfo.annotations.push({ type: "info", description: text });
}

export async function openApp(page: Page, start = process.env.QA_START_PATH || "/") {
  await page.goto(start);
  await expect(page.getByRole("button", { name: LOGGED_IN }).or(page.getByRole("link", { name: LOGGED_IN })).first()).toBeVisible({
    timeout: 30_000,
  });
}

/** Navigate by sidebar label. Closes leftover dialogs first so their overlay does not block clicks. */
export async function goMenu(page: Page, menu: RegExp | string) {
  if (page.url() === "about:blank") await openApp(page);
  for (let i = 0; i < 4 && (await page.locator("[role=dialog], [data-slot=dialog-overlay]").count()); i++) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  }
  const target = page.getByRole("button", { name: menu }).or(page.getByRole("link", { name: menu })).first();
  await target.click();
  await page.waitForLoadState("networkidle").catch(() => {});
}

/** Success or error text, whether shown as a toast, an alert, or an inline banner. */
export function message(page: Page, text: RegExp | string): Locator {
  return page.locator("[data-sonner-toast], [role='alert'], [role='status'], main").getByText(text).first();
}

/** Pick an option in a searchable combobox (trigger → popover with a search box and option buttons). */
export async function pickCombobox(page: Page, trigger: Locator, search: string, option?: RegExp | string) {
  await trigger.click();
  const pop = page.locator("[data-slot='popover-content'], [role='listbox']").last();
  await pop.waitFor();
  const input = pop.locator("input");
  if (await input.count()) await input.first().fill(search);
  await pop.getByRole("button", { name: option ?? new RegExp(search, "i") }).or(pop.getByRole("option", { name: option ?? new RegExp(search, "i") })).first().click();
}

/** Re-save the session after each test: many apps rotate refresh tokens. */
export async function persistSession(page: Page) {
  const alive = await page.getByRole("button", { name: LOGGED_IN }).first().isVisible().catch(() => false);
  if (alive) await page.context().storageState({ path: path.join(AUTH_DIR, `${ROLE}.json`) });
}

export const rupiah = (s: string) => Number(s.replace(/[^0-9]/g, ""));

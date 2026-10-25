---
name: qa-automation
description: "Run end-to-end QA against a staging web app with Playwright in a headless background browser, mapping each test to a scenario code from a QA guide (e.g. CO-1, OL-5, QN-3), verifying every failure with screenshots and source code, and delivering a Word (.docx) report with table of contents, findings, and screenshots. Also covers re-testing after developer fixes (commit → finding checklist). Use when the user asks for QA automation, test scenarios from a QA/PRD document, a test report with screenshots, or a re-check of fixes on staging."
version: 1.0.0
---

# QA Automation → Screenshot → Report

Turn a scenario guide into automated Playwright tests that run against staging in a headless browser, judge every result yourself, and hand the user a finished Word report.

You are the tester. Decide what is a bug from the PRD, the guide, and the code. Do not hand open questions back to the user unless the documents and code are genuinely silent, and even then give a recommendation.

Read `references/lessons.md` before writing the first test. It lists the traps that cost the most time last time.

## Inputs to collect (ask once, up front)

- Staging URL and which test accounts/roles exist.
- The scenario guide (PRD, QA guide `.docx`/`.md`) and any findings document.
- Whether test data may be left on staging, and the tag to put on it (default `(Uji-<name>)` or `(QA-<name>)`).
- Report format and language. Default: `.docx`, the language of the scenario guide, Times New Roman, headings 14 pt, body 12 pt, 1.5 line spacing, table of contents.

Do not ask for passwords. See step 2.

## Workflow

### 1. Sync and read

1. `git fetch --all --prune` and `git pull --ff-only` in every repo involved. Record commit hash and date for the report.
2. Extract the scenario guide to text (a `.docx` is a ZIP; read `word/document.xml`). List every scenario code with role, steps, and expected result.
3. Triage existing E2E tests: keep the good ones, mark shallow ones (visibility-only checks, `if (await x.isVisible())` guards that silently skip, localhost/seed credentials), list scenarios with no test.

### 2. Login without handling the password

Never type a password into a non-local site. Instead:

1. Run `scripts/login-manual.mjs <role>`. It opens a **visible** Edge window on the login page, waits until the user has logged in, and saves the session to `tests/qa-staging/.auth/<role>.json`.
2. Tell the user in one line that a window is waiting for them.
3. Tokens often rotate on every refresh. The helper `persistSession()` re-saves the session after each test so the next run is still logged in. If the app suddenly shows an empty or "guest" dashboard, the session died: ask the user to log in once more.

This is the only time a visible browser window is allowed.

### 3. Explore before writing tests

The staging build may differ from the code on your disk. For each screen:

- Run a short headless exploration script (see `scripts/explore.mjs`) that dumps visible buttons, inputs, placeholders, and messages, and takes a screenshot.
- Grep the source for the exact labels, toasts, and `aria-label`/`title` attributes.
- If staging shows text that is not in your local code, pull again; the deploy is newer.

### 4. Write the tests

Copy `scripts/playwright.qa.config.ts` and `scripts/helpers.ts` into the target repo (e.g. `tests/qa-staging/`). Then:

- **One test per scenario code, titled with the code first**: `test("CO-11 Generate Quotation from order", …)`. Reports and screenshots are keyed on that first word.
- Add `QA-n` tests for cross-cutting checks the guide does not number (e.g. "toggle X actually filters list Y").
- Use unique data per run from `testData()` (tag + run id). Never reuse names or phone numbers between runs.
- Flows that keep state only in browser memory (carts, wizards) share one `page` created in `beforeAll`. Keep those chain tests passing when they meet a known bug: record it with `note()` and assert the bug in a separate, self-contained `QA-n` test. A failed test restarts the worker and wipes the shared page, so a hard failure mid-chain fails every test after it.
- Label differences between the guide and the screen (button renamed, status wording) are `note()`s, not failures. Functional differences fail.
- Take screenshots with `shot(page, info, "label")` at each step a reader needs to see: the filled form, the success or error message, the resulting list row.

### 5. Run in the background

- Run headless Edge (`--project=edge`, `headless: true`). Never open visible windows for test runs, because windows opening and closing disrupt the user. Never use an in-app/IDE browser pane for the run.
- Run the suite as a background command and poll the log; a full wave takes a few minutes.
- First runs mostly fail on selectors. Fix, rerun only the affected codes with `--grep`, then do one clean full run with fresh data for the report.

### 6. Verify every failure

Before calling anything a finding:

1. Open the failure screenshot and read it.
2. Read the relevant source and find the cause (file and line).
3. Decide: real bug, test mistake, or guide outdated. Fix test mistakes and rerun.
4. Check that each assertion would actually fail when the bug is present (text that also appears on a button, a regex that matches the wrong element).
5. Settle the expected behavior from the PRD and guide yourself. State the verdict and the evidence.

Severity: **Critical** (wrong money or irreversible data loss), **High** (core flow blocked or data not saved), **Medium** (wrong but has a workaround, unclear errors), **Low** (wording, cosmetic), **Not a bug** (guide must be updated).

### 7. Build the report

Follow **Reporting rules** below for the writing style. Then:

1. `node scripts/summarize.cjs` turns `qa-report/results.json` into `summary.json` (status, notes, errors per test).
2. Compress screenshots: `ffmpeg -i x.png -vf "scale='min(1400,iw)':-2" -q:v 4 x.jpg`.
3. Fill a report spec JSON (see `references/report-structure.md`) and run `node scripts/build-report-docx.cjs spec.json out.docx`. Install `docx` in a scratch folder if it is missing.
4. Tell the user that Word asks to update fields when the file opens; answering **Yes** fills the table of contents.

Every number in the report (passed, failed, totals, money) must come from the final run. Do not mix screenshots from different runs.

### 8. Re-test after fixes

When developers push fixes:

1. Pull, then list the commits since the last test run (`git log --stat`). Read each diff and map it to finding IDs.
2. Rerun the affected wave with fresh data. Add a test for every fix that had no direct test (e.g. session expiry).
3. Look for regressions introduced by the fixes themselves.
4. Report a checklist: **Fixed / Partial / Not touched / Not a bug / New regression**, each with the test code and a screenshot.

## Reporting rules

The report is read by product managers, business people, and developers. Readability comes first. Someone who has never opened the code must understand every page except the clearly marked technical evidence. These rules apply `.agents/rules/communication.md` to QA reports.

### Default: plain language

- Write the way a careful tester explains things to a PM: what was tried, what happened, what should have happened, why it matters for the business.
- Use the menu, button, and status names exactly as they appear on screen, not component names, routes, or variable names.
- No stack traces, selectors, file paths, test-framework errors, or HTTP codes in the summary, the scenario results, or the plain part of a finding.
- One idea per sentence. Short paragraphs. Tables and checklists over long prose.
- Translate technical causes into effects: "the price is taken from the old catalog, so the total is Rp 50.000 too low", not "`useBundlePrice` reads `catalog.price` instead of `bom.total`".
- Passing scenarios stay short: one line of result plus the screenshot.

### New bugs: technical evidence is allowed, but tidy

When a finding is a **new bug** (not a known one, not a re-test of an old one), investigate it properly: inspect the page, check the API call, the request payload, and the response. Developers need this to fix it fast. Put that evidence in the report, but keep it separate and neat:

1. Write the plain part first (what happened, expected, impact, steps to reproduce, screenshot). A reader can stop there.
2. Then add a sub-block titled **Technical evidence (for developers)** with only what proves the bug:
   - A small table: endpoint (method + path, no host or query tokens), HTTP status, and the one or two fields that are wrong (sent vs. received vs. expected).
   - At most one short request payload and one short response, trimmed to the relevant fields (use `…` for the rest), pretty-printed JSON with 2-space indent, in a `code` block. Never paste whole responses or HAR dumps.
   - Likely cause in one or two sentences, with file and line if found.
3. Mask secrets and personal data: tokens, cookies, `Authorization` headers, passwords, real phone numbers, and addresses. Test data with the QA tag can stay.
4. If the evidence is long (several calls, a sequence), put it in an appendix at the end ("Appendix A: technical evidence F-03") and link to it from the finding.

Capture network evidence in the test itself with `captureApi(page, info, "label", /\/orders/, () => button.click())`. It saves method, path, status, payload, and response (secrets masked) to `qa-report/api/`, so the numbers in the report come from the final run, not from a manual session.

Known bugs, re-test results, label differences, and "Not a bug" verdicts get no technical block; one line of reason is enough.

### Finding template

```
F-03  [High]  CO-9  Draft saved without delivery date
What happened : After "Simpan Draft", the delivery date is empty when the draft is reopened.
Expected      : The date stays as entered (guide step CO-9.4).
Impact        : CS has to re-enter the date; orders can be scheduled on the wrong day.
Steps         : 1) … 2) … 3) …
Screenshot    : Figure 12
Technical evidence (for developers)
  | Endpoint            | Status | Field          | Sent         | Received |
  | PUT /orders/{id}    | 200    | delivery_date  | "2026-10-30" | null     |
  { "delivery_date": "2026-10-30", "items": […] }
  Likely cause: the update handler does not map delivery_date (OrderService.ts:142).
```

### Self-check before sending

- Can a PM read the summary and every finding title without asking what a word means?
- Is every technical detail inside a "Technical evidence" block or appendix, not mixed into the story?
- Is every JSON snippet short, indented, and free of tokens and personal data?
- Do all numbers and screenshots come from the same final run?

## Communicating with the user

- Plain language, short sentences, no jargon dumps. Lead with what passed and what broke.
- Post a one-line status before long runs ("Running wave 1 in the background, about 3 minutes").
- Give checklists and tables, not essays. Keep the user's own terms for menus and buttons.

## Files

- `scripts/playwright.qa.config.ts`: staging config, headless Edge, JSON/HTML reporters, screenshots, shared run id.
- `scripts/login-manual.mjs`: one-time manual login in a visible Edge window, saves the session.
- `scripts/helpers.ts`: run data, `shot`, `note`, `captureApi`, `goMenu`, `message`, `pickCombobox`, `persistSession`, state shared between tests.
- `scripts/explore.mjs`: headless DOM dump and screenshot of one screen using the saved session.
- `scripts/summarize.cjs`: Playwright JSON → `summary.json`.
- `scripts/build-report-docx.cjs`: report spec JSON → `.docx` with TOC, tables, figures.
- `references/report-structure.md`: report outline and the spec JSON format.
- `references/lessons.md`: traps and how to avoid them.

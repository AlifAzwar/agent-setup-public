# Lessons from real runs

Each item cost at least one wasted run. Check them before writing tests.

## Browser and session

- **Visible windows disrupt the user.** Test runs go headless. Only the one-time manual login opens a window.
- **Contexts inherit `use` options.** `browser.newContext()` inside a test picks up the config's `storageState`. To simulate a guest or an expired session, pass `storageState: { cookies: [], origins: [] }` or fake tokens explicitly.
- **Rotating refresh tokens.** After the app refreshes its token, the saved session is stale. Re-save the session after each test (`persistSession`). Symptom of a dead session: a placeholder user ("Staf", "Guest") with an almost empty sidebar.
- **Restored navigation.** Single-page apps often reopen the last menu after a reload. Do not assert the landing page greeting to prove login; assert the logout button or a sidebar item.
- **Navigation timeouts on staging.** Cold staging can take 20 s or more to load. Set `navigationTimeout: 60_000`.

## Selectors

- **Hidden inputs behind switches.** A `#id` on a switch often points to the hidden `<input>`; clicking it times out behind the dialog overlay. Locate the visible `role=switch` next to its label instead.
- **Duplicate buttons.** Sticky footers repeat primary actions. Use `.last()` or scope to a container; read the strict-mode error, it lists both candidates.
- **Status badges vs. labels.** `getByText("APPROVED")` also matches "DP Approved (Locked)". Use `{ exact: true }`.
- **Weak assertions.** "Single product" text also appears on the "+ Single product" button, so counting it proves nothing. Assert a number the bug changes, like "2 items (4 pcs)".
- **Success messages are not always toasts.** Some apps show inline banners. Search toasts, alerts, and the main area together (`message()` helper).
- **Shell-escaping regex.** Editing test files through `sed` or `node -e` strings silently drops backslashes (`\S+` becomes `S+`). Use a proper file edit tool for anything containing regex.

## Data

- **Unique data per run.** A duplicate SKU or phone number from an earlier run turns a valid test into a validation error. Use `testData()`.
- **Stable ids across worker restarts.** A module-level `Date.now()` is recomputed when a worker restarts after a failure. Generate the id once in the config (`process.env.QA_SESSION ??= …`) so every worker shares it.
- **Order numbers can change on save.** A temporary number shown before saving may differ from the stored one. Read the number from the success message.

## Flow design

- **A failure restarts the worker.** Shared in-memory state (cart, wizard) is lost, and every following chain test fails for an unrelated reason. Keep chain tests green with `note()` and assert known bugs in separate self-contained tests.
- **Soft assertions still fail the test.** `expect.soft` lets the test continue but still triggers the restart.
- **Keep money calculations deterministic.** When one feature has a pricing bug, run downstream flows (quotations, invoices) with simple single products so totals stay checkable.

## Judgment

- **Staging may be ahead of your checkout.** Labels on screen that are not in the code mean a newer deploy: pull before concluding anything.
- **Guide vs. app wording.** The guide may lag behind the app. Record renamed labels as notes in a separate table; fail only on behavior.
- **Fixes cause regressions.** A dedupe fix removed standalone items that shared a product with a bundle. Always re-run the whole wave after fixes, not only the fixed codes.
- **Decide expected behavior yourself.** Check the PRD (e.g. "package price + swap delta"), the guide, and the code, then state the verdict.

## Before merge

- **Verify a frontend-only fix without a deploy.** Run the fix branch locally (dev server pointed at the staging API) and set `QA_BASE_URL=http://localhost:<port>`. The saved session belongs to the staging origin: copy `.auth/<role>.json` to `<role>-local.json`, change the origin and cookie domain to localhost, and re-save both files after each test because tokens rotate.
- **Another project may hold the port.** If port 3000 is busy, use a different one instead of stopping someone else's dev server.

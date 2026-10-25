---
name: review-prd-sync
description: "Use whenever the user shares a new PRD, technical spec, or UI/UX review document and wants it checked against the codebase. Syncs every repo to the latest commit, reads the document section by section, verifies each requirement against real source files, classifies the gap as KEEP / MODIFY / NEW, and explains the result in plain language for product and business readers."
version: 1.0.0
---

# PRD Review → Codebase Reconciliation

Read a new PRD or spec slowly, check every requirement against the real code, and tell the user what already exists, what needs changing, and what must be built. Explain it so a product manager can act on it without reading code.

Before the first run in a project, fill in `references/project.md` (repos, branches, where each layer lives, user roles, module flow). If it is still the template, ask the user once for the missing facts and save them there.

## Workflow

### 1. Sync every repo (no assumptions)

For each repo listed in `references/project.md`:

```bash
git -C <repo> fetch --all --prune
git -C <repo> status --short
git -C <repo> pull --ff-only origin <default-branch>
git -C <repo> log -n 3 --format="%h %ad %s" --date=iso
```

- Never trust repo state from an earlier session or memory. Record the commit hash and date for the report.
- If the working tree is dirty or the pull is not a fast-forward, stop and ask. Do not stash, reset, or merge on your own.

### 2. Read the document in five parts

Read the whole document, not just the headings. Extract:

1. **Goal and users**: which operational problem it solves and who uses it.
2. **Scope**: what is in scope for this phase and what is explicitly out of scope or deferred.
3. **Business rules**: status flows, validations, money rules, permissions.
4. **Data and API**: new tables or columns, changed fields, request/response contracts.
5. **Screens and interaction**: buttons, dialogs, conditional fields, printouts, what happens after each action.

Note anything ambiguous or contradictory. Settle it from the rest of the document and the code where you can, and say how you decided.

### 3. Check the real code

Open and read the files; do not infer from file names. Use the layer map in `references/project.md`. Typically:

- **Database**: migrations or schema. Does the table or column already exist?
- **Domain and services**: models, status constants, validation and calculation logic.
- **API**: routes, handlers, OpenAPI/schema files. Does the contract match the document?
- **Frontend**: feature module, components and dialogs, hooks/state, API client.
- **Tests**: existing E2E or unit tests that already cover the flow.

For every requirement, note the file (and line, when it matters) that proves the current state.

### 4. Classify each requirement: KEEP / MODIFY / NEW

Golden rule: keep what already works. Do not propose rebuilding from scratch.

- **KEEP**: already in the code and matches the document. Leave it alone.
- **MODIFY**: exists but differs. Give a priority: `P0` (blocks the flow or breaks money/data), `P1` (needed for this phase), `P2` (polish).
- **NEW**: table, endpoint, or screen that does not exist yet.

### 5. Report in plain language

Follow `.agents/rules/communication.md` when it exists: short sentences, the user's own terms for menus and roles, no jargon dumps. Use the language the user writes in.

```markdown
### 1. Repo status
- **<repo>**: <hash> <date> <last commit title> (up to date)

### 2. Summary
- **What are we building?** One or two sentences.
- **Why?** The real operational problem it solves.
- **How does it work?** Step by step from the user's point of view, not the code's.
- **How does it connect?** Which module feeds it and which module it feeds.

### 3. Document vs. code
| Feature | Document says | Code today | Status | Note |
| :--- | :--- | :--- | :---: | :--- |
| … | … | … | KEEP / MODIFY P1 / NEW | short, plain |

### 4. Decisions on unclear points
- What was unclear, what you decided, and the evidence (document section, file).

### 5. Action plan
1. Database / migrations
2. Backend (domain, service, API)
3. Frontend (API client, screens, dialogs)
4. Verification (manual check or E2E test)
```

Keep file paths and technical detail in the "Code today" column or a short appendix, not in the summary.

## Checklist before answering

- [ ] Every repo fetched and pulled; commit hashes recorded.
- [ ] Whole document read, in-scope and out-of-scope separated.
- [ ] Every row in the table backed by a file that was actually opened.
- [ ] No claim taken from memory or an earlier session without re-checking.
- [ ] Summary answers the four questions in plain language.

## Files

- `references/project.md`: per-project facts (repos, branches, layer map, roles, module flow). Fill once per project.

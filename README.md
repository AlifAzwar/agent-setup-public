# 🤖 Azwar's Agent Setup Template

A portable, production-grade template for AI coding agents (Antigravity, Cursor, Claude Code, GitHub Copilot, and custom agent harnesses). Anyone can use it for free to equip their projects with battle-tested coding standards, strict safety guardrails, token-saving rules, and Vercel-grade performance skills.

---

## ⚡ Quick Start (1-Line Install)

Run this command inside the root of any new or existing project:

### Windows (PowerShell):
```powershell
irm https://raw.githubusercontent.com/AlifAzwar/agent-setup-public/main/install.ps1 | iex
```

### macOS / Linux / Git Bash:
```bash
curl -fsSL https://raw.githubusercontent.com/AlifAzwar/agent-setup-public/main/install.sh | bash
```

Safe to run in an existing project: files you already have are kept, and an existing `AGENTS.md` is left alone (the template is saved as `AGENTS.template.md` to merge by hand). To refresh existing skills and rules, set `AGENT_SETUP_UPDATE=1` before running (PowerShell: `$env:AGENT_SETUP_UPDATE = "1"`). Any file you changed is backed up to `.agents-backup/<date>/` before it is replaced, and filled `references/project.md` files are never touched.

---

## 📦 What's Inside?

### 1. Core Guidelines (`AGENTS.md`)
* **Questions are read-only:** The agent answers questions without mutating your code until explicitly instructed.
* **Pragmatic Engineering:** Keep solutions simple. Channel YAGNI (You Aren't Gonna Need It). No speculative refactors or unrequested wrappers.
* **Strict TypeScript:** Prohibits lazy `any` types; enforces proper inference, generics, and idiomatic TypeScript.
* **Blast Radius Control:** The agent is strictly bounded to the workspace and never touches production systems or external files silently.

### 2. Guardrails & Workflow Rules (`.agents/rules/`)
* **`permissions.md`:** Grants full speed for internal workspace CRUD, development database migrations, and Git operations while strictly gating external network calls and preventing credential/`.env` leaks.
* **`token-efficiency.md`:** Drastically reduces LLM token consumption by enforcing slice-based file inspection, diff-only code reviews, deterministic compiler offloading (`npm run check`), and session hygiene.
* **`git-workflow.md`:** Standardizes a `dev`-first branching model (`feat/*`, `fix/*`, `chore/*`) with PR targets to `dev` before production releases.
* **`coding-style.md`:** Enforces clean, maintainable, and long-term ownership code patterns.
* **`communication.md`:** Plain-language explanations for product and business readers (what, why, how, how it connects), with technical evidence kept in a separate, tidy block.

### 3. Frontend & Quality Skills (`.agents/skills/`)
* **`vercel-react-best-practices`:** 70+ performance and optimization rules from Vercel Engineering for React and Next.js (Server Components, data deduplication, streaming, image/script optimizations, client render minimizing).
* **`vercel-composition-patterns`:** Modern React 19 composition patterns, compound components, and clean state lifting.
* **`no-ai-slop`:** Eliminates robotic cadence, cheesy buzzwords, and unnecessary code comments.
* **`review`:** Read-only pre-landing review workflow with confidence scoring and risk audit.
* **`qa-automation`:** Turns a QA scenario guide into Playwright tests that run against staging in headless Edge, verifies each failure with screenshots and source code, and writes a Word report (table of contents, findings, screenshots). Reports stay readable for non-developers; new bugs get a separate block with the API call, payload, and response (secrets masked). Includes a re-test checklist for developer fixes.
* **`review-prd-sync`:** Reads a new PRD or spec, syncs every repo, checks each requirement against the real code, and classifies it as KEEP / MODIFY / NEW with a plain-language summary and action plan. Fill `references/project.md` once per project.

### 4. Automated CI Workflow (`.github/workflows/ci.yml`)
* Automated GitHub Actions pipeline that verifies `npm run check` (linter and production build) on every push and Pull Request to both `main` and `dev` branches.

---

## 🎯 Compatibility

Works seamlessly with:
* **Google Antigravity IDE & Antigravity 2.0** (automatically discovers `.agents/` and `AGENTS.md`)
* **Cursor & VS Code AI extensions**
* **Claude Code & Terminal Agent harnesses**

---

## 📄 License

MIT © [Azwar](https://github.com/AlifAzwar)

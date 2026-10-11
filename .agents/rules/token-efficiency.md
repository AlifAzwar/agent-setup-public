# Token Efficiency & Context Management Guidelines

To keep context windows clean, responses fast, and token consumption to an absolute minimum while preserving high code quality:

## 1. Focused Inspection Over Broad Crawling
- **Slice Reading Only**: Never view entire large files if only a function, component, or specific line range is needed. Always pass `StartLine` and `EndLine` to `view_file`.
- **Targeted Lookups**: Target specific files directly based on paths rather than running recursive broad searches across the codebase.

## 2. Diff-Only Review & Minimal Output
- **Audit Changes, Not Entire Repos**: When reviewing or verifying, inspect only `git diff` against the base branch. Do not scan untouched files.
- **Concise, High-Signal Explanations**: Avoid decorative pleasantries, repetitive summaries, and throat-clearing prefaces. State findings, code changes, and actions directly.

## 3. Offload Mechanical Work to Local Tools
- **Rely on Deterministic Compilers**: Use `npm run check` (or `npm run lint` / `npm run build`) to catch syntax, type, or lint errors in seconds (0 LLM tokens).
- Do not ask the model to manually proofread whole files for type errors when TypeScript can do it deterministically.
- If a build or test fails, inspect only the specific error output lines rather than dumping the entire build log into the prompt.

## 4. Session Hygiene (One Feature, One Session)
- Encourage committing and starting fresh conversation sessions for distinct features or bug fixes to avoid cumulative context bloat across unrelated tasks.

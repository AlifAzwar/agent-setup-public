---
name: review
description: "Perform a read-only pre-landing review of a branch, working-tree diff, or pull request across three explicit axes: specification fidelity, repository standards, and correctness or operational risk. Uses confidence-scored current-source evidence and reports without changing code or external review state."
version: 2.0.0
---

# Pre-Landing Review

Review the complete change against its base and report real, actionable findings. The workflow is read-only: do not edit source, apply fixes, commit, push, create or update a PR, post comments, or send external messages.

Read `checklist.md` before reviewing. Stop if the required checklist is unavailable.

## Inputs

Accept:

- the current branch and working tree;
- an explicit base branch, commit, tag, or range;
- a pull request reference available through `read`;
- a supplied diff or patch.

Use bounded repository commands and available Pi tools to establish branch, merge base, changed files, commit messages, and the full diff. Do not fetch, reset, stash, checkout, clean, or mutate repository state.

If no base is supplied, prefer the configured remote default branch, then an existing local `main` or `master`. State the selected base. Include committed, staged, unstaged, and relevant untracked changes in the requested scope. If no meaningful diff exists, report that and stop.

## Establish review sources

### Intent and specification

Determine intended behavior in this order:

1. the user's request and current conversation;
2. an approved program ticket, spec, or normal plan;
3. pull request title, body, or linked issue;
4. commit messages;
5. repository TODOs only when clearly tied to the change.

Summarize intent in one sentence. If no reliable source exists, mark Spec Fidelity as `NO SPEC AVAILABLE`; do not invent requirements.

### Repository standards

Read the instruction and standards sources that govern the changed paths:

- root and applicable nested `AGENTS.md` files;
- `CONTRIBUTING.md`, coding standards, architecture rules, and relevant ADRs;
- canonical domain vocabulary when the change touches named concepts;
- repository-specific test, documentation, migration, and safety rules.

Tool-enforced formatting and lint rules are not review findings unless the diff disables or bypasses the tool. A documented repository rule overrides a generic smell heuristic.

## Read the complete change

Read the full diff before the first finding. For a large diff, process file by file while tracking total coverage.

Map changed public symbols with available LSP definitions, references, implementations, and call hierarchy. Use the available search and directory tools for dynamic registration, routes, schemas, migrations, configuration, enum siblings, templates, tests, and unsupported languages. Read complete relevant constructs.

For a large, unfamiliar, or architecturally distributed diff, use `repository_context` only when the diff and direct LSP results do not reveal ownership or related modules. Treat indexed excerpts as candidate discovery and verify every claim against current source.

For TypeScript or JavaScript changes, use the installed `fallow_run` tool when it can provide evidence about changed-code risk, dead code, duplication, architecture boundaries, or coverage gaps. Prefer a bounded audit:

```json
{"command":"audit","args":["--base","<base-ref>","--gate","new-only"],"detail":"findings"}
```

Use the narrower command matching the question, such as `dead-code`, `dupes`, `health`, `trace`, `guard`, or `security`. Treat Fallow output as evidence to verify against current source, not as an automatic finding or fix authorization. Do not run Fallow fixes or watch mode during a read-only review. If the tool is unavailable, record that under Unverified Areas rather than substituting an unsupported command.

Read outside the diff when necessary to verify:

- callers and implementations of changed contracts;
- every consumer of new enum, status, type, field, or serialized value;
- schema and migration compatibility;
- authentication, authorization, validation, and trust boundaries;
- conditional side effects, state transitions, and concurrency;
- tests or browser scenarios claimed to prove the behavior;
- documentation and configuration that govern the changed path.

## Run three independent axes

Keep the axes separate so a strong result on one cannot hide failure on another.

For a bounded diff, run all axes inline. For a large diff where isolated context materially improves adversarial coverage, launch the Standards and Spec Fidelity reviews as two read-only reviewer tasks in one batch. Give both the fixed comparison range and exact source pointers; require concise evidence. The parent still owns complete-diff coverage, risk analysis, calibration, and final aggregation.

### Axis 1: Spec Fidelity

Audit every actionable requirement or acceptance criterion as:

- **DONE:** current evidence satisfies it;
- **PARTIAL:** some required behavior or proof is missing;
- **NOT DONE:** no credible implementation exists;
- **INTENTIONALLY DEFERRED:** the source explicitly excludes or defers it.

Report:

- missing or partial requirements;
- implementation that appears present but behaves differently from the source;
- unrequested behavior or broad refactors that create scope drift;
- acceptance criteria whose claimed proof does not exercise the observable contract.

Do not turn questions, notes, or out-of-scope statements into requirements.

### Axis 2: Repository Standards

Report every diff location that violates a documented standard, citing the source and exact rule.

Also consider these judgement-call smells when the repository does not endorse them:

- **Mysterious Name:** the name hides the domain meaning.
- **Duplicated Code:** the same behavior appears in several changed locations.
- **Feature Envy:** logic mostly manipulates another module's data.
- **Data Clump or Primitive Obsession:** a domain concept repeatedly travels as unrelated primitives.
- **Repeated Switch:** several sites branch on the same type or state.
- **Shotgun Surgery or Divergent Change:** one behavior scatters broadly or one module changes for unrelated reasons.
- **Speculative Generality:** interfaces, hooks, or configuration exist only for imagined future work.
- **Message Chain or Middle Man:** callers navigate internals or a new layer mostly delegates.

Smells are labelled heuristics, not hard violations. Explain the concrete maintenance or correctness cost in this change; omit aesthetic preference.

### Axis 3: Correctness and Operational Risk

Apply every relevant category in `checklist.md`.

Prioritize merge-blocking risk:

- SQL, migration, and data safety;
- race conditions and atomic state transitions;
- LLM and tool-output trust boundaries;
- shell or code injection and unsafe deserialization;
- authentication, authorization, secrets, and XSS;
- enum or value completeness;
- destructive, irreversible, or incompatible behavior.

Then check structural and behavioral risk:

- conditional side effects and inconsistent state updates;
- API and serialization compatibility;
- type coercion and field-name correctness;
- missing error, boundary, security, migration, and concurrency coverage;
- async or sync mixing, time-window bugs, performance regressions, and cancellation;
- stale comments or docs, dead code, accidental duplication, and release or distribution drift.

Do not flag harmless redundancy, style preferences, speculative states excluded by established constraints, or handling already proved elsewhere in the current diff.

## Verify every finding

A finding cites `path:line` and states:

- axis: Spec Fidelity, Standards, or Risk;
- the concrete problem and triggering input or state;
- user, data, security, operational, or maintenance impact;
- evidence that the issue is not already handled;
- the smallest credible correction direction.

If claiming a check exists, cite it. If claiming a test or QA scenario covers behavior, name it and state what it actually exercises. Mark conclusions not directly observed as `[INFERENCE]`.

## Calibrate

Confidence:

| Score | Meaning | Reporting |
|---|---|---|
| 9-10 | Directly verified defect, requirement miss, or exploit path | Main findings |
| 7-8 | Strong evidence and highly likely | Main findings |
| 5-6 | Plausible but needs confirmation | Main findings with caveat |
| 3-4 | Suspicious and weakly supported | Appendix only |
| 1-2 | Speculation | Omit unless potential P0 |

Severity:

- **P0:** active data loss, critical security exposure, or system-wide outage;
- **P1:** merge-blocking correctness, security, data, or fundamental spec failure;
- **P2:** important defect, meaningful requirement gap, regression risk, or missing coverage;
- **P3:** low-impact maintainability, documentation, or polish issue.

## Report

Use this structure:

```text
Pre-Landing Review: N findings (P0: X, P1: Y, P2: Z, P3: W)
Intent: <one sentence>
Base: <ref or range>
Coverage: <changed files and relevant out-of-diff reads>
Scope: CLEAN | DRIFT DETECTED | REQUIREMENTS MISSING

## Spec Fidelity
<requirement audit and findings>

## Repository Standards
<documented violations and evidence-backed smell findings>

## Correctness and Operational Risk
<severity-ordered findings>

## Unverified Areas
<missing environment or evidence>

Verdict: BLOCK | CHANGES REQUESTED | READY
```

Within each axis, order by severity then confidence. Do not merge or rerank the axes into one vague score. A change may pass standards and fail its spec, or satisfy the spec and remain unsafe.

For a main finding:

```text
[P1] (confidence: 9/10) path/to/file:42 - concise title
Problem: triggering state and concrete failure.
Impact: what breaks or becomes unsafe.
Evidence: code, requirement, test, schema, or runtime proof.
Direction: smallest credible correction; no code changed.
```

If no findings remain, say `Pre-Landing Review: No findings.` and still state scope, base, coverage, axis outcomes, and material uncertainty. `READY` applies only to the reviewed code and exercised evidence.

## Report and fix separation

This workflow reports only. If the user asks to fix findings, complete the report first, then use a separate implementation workflow. Never mutate code because a finding looks mechanical.

## Guardrails

- Never require a clean working tree or discard user changes.
- Never post comments or replies to an external review system.
- Never accept another reviewer's finding without independent verification.
- Never recommend a version-specific API without checking the project version and current primary documentation.
- Never claim ready to merge beyond the reviewed diff and verified scenarios.

## Provenance and license

Retains the GStack-derived SQL, data safety, concurrency, LLM trust-boundary, conditional-side-effect, confidence, scope, and evidence rubrics while adapting Matt Pocock's independent Spec Fidelity and Repository Standards axes. The GStack upstream MIT license remains in `LICENSE`.

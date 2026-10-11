# Pre-Landing Review Checklist

Apply only categories relevant to the diff. Cite `path:line`; report only real problems.

## Pass A: Merge-blocking risk

### SQL and data safety
- String interpolation or concatenation in SQL; require parameters/prepared statements.
- Check-then-write operations that should be one atomic conditional update.
- Direct writes that bypass validations, callbacks, constraints, tenancy, or audit behavior.
- N+1 queries in loops/views without deliberate batching or eager loading.
- Wrong ORM field/column names compared with the actual schema.
- Destructive migrations without safe sequencing, backfill, rollback, or compatibility window.
- Renames/removals that break old application versions during rolling deployment.

### Race conditions and concurrency
- Read-check-write without uniqueness constraints or duplicate-key handling.
- Find-or-create without a unique database index.
- State transitions lacking `old_state` compare-and-set semantics.
- Retries that duplicate non-idempotent side effects.
- Locks held across network calls or missing around shared mutable state.

### LLM and tool-output trust boundary
- Generated emails, URLs, names, identifiers, SQL fragments, or commands used without validation.
- Structured output accepted without schema, type, length, enum, and required-field checks.
- Generated URLs fetched without scheme/host restrictions and internal-address protection.
- Generated content persisted into retrieval/knowledge systems without prompt-injection controls.
- Tool output trusted as authorization, identity, price, permission, or database state.
- Prompt instructions listing tools or capabilities that do not match the actual wiring.

### Injection and unsafe execution
- Shell execution with interpolated or user/generated input; prefer argument arrays.
- `eval`, `exec`, dynamic code loading, or unsafe templates on untrusted input.
- Path traversal, header injection, template injection, LDAP injection, or SSRF.
- Unsafe deserialization of untrusted objects.

### Authentication, authorization, secrets, and XSS
- New endpoints missing authentication or authorization.
- Authorization defaults to allow or checks the wrong resource/tenant.
- Direct-object-reference paths exposing another user's data.
- Token validation missing expiry, audience, issuer, signature, or revocation as applicable.
- Secrets in source, logs, URLs, client bundles, fixtures, or error responses.
- Unsafe HTML escape hatches on user-controlled or generated content.
- Webhooks processed without signature and replay validation.

### Enum and value completeness
When a new enum/status/tier/type is added:
- Find every switch, case, filter, allowlist, serializer, parser, display, persistence, and analytics consumer.
- Search sibling values, not just the new value, to expose closed lists.
- Verify defaults do not silently map the new value to wrong behavior.
- Verify frontend, backend, schema, API, and tests agree.

## Pass B: Behavioral and structural risk

### Conditional side effects
- One conditional branch updates state, emits an event, sends a notification, invalidates cache, or records audit data while another equivalent branch forgets it.
- Logs claim an action occurred when the action was skipped.
- Success-path events exist but error, retry, cancellation, or idempotent paths leave inconsistent state.
- Related records are updated in one transition path but not another.
- A flag gates computation but not its irreversible side effect, or vice versa.

### API and serialization compatibility
- Request/response fields renamed, removed, or retyped without consumer migration.
- Optional versus required semantics drift across clients and servers.
- Error codes/status codes change unexpectedly.
- Numeric/string/null coercion changes hashes, IDs, signatures, or comparisons.
- New fields expose sensitive data or omit redaction.

### Async, time, and lifecycle safety
- Blocking I/O or sleep inside async/event-loop paths.
- Fire-and-forget work whose failure is unobserved.
- Resources, subscriptions, timers, locks, or transactions not released on every path.
- “Today” keys or mismatched buckets that do not cover the intended rolling time window.
- Timezone, clock, locale, or daylight-saving assumptions.

### Tests
- New error, rejection, guard, and permission paths lack negative tests.
- Boundary inputs are absent: empty, null, zero, one, maximum, Unicode, and special characters.
- State transitions or concurrent access lack invariant/race tests.
- Tests share mutable state, depend on order/time/network, or use uncontrolled randomness.
- Security enforcement exists without a test proving denial/malicious input handling.
- Changed public behavior is only indirectly or superficially asserted.

### Performance and resource impact
- New nested loops or repeated scans on hot paths.
- Database queries inside loops, unbounded reads, or missing pagination.
- Large payload, bundle, image, or dependency additions without justification.
- Cache invalidation or key changes that create stale/cross-tenant data.
- Memory, connection, file descriptor, or listener leaks.

### Maintainability and consistency
- Changed variables/imports/functions are unused.
- Comments/docstrings describe old behavior.
- Duplicated multi-line logic should share an existing helper.
- Hardcoded URLs, ports, thresholds, or duplicated literals should use established config/constants.
- Module boundaries are bypassed by reaching into private internals or querying persistence from presentation code.
- Conditional complexity obscures invariants or duplicates policy in multiple places.

### Frontend and accessibility
- Unsafe HTML, broken focus, removed outlines, unlabeled inputs, missing keyboard paths.
- Fixed layouts overflow without responsive handling.
- Loading/error/empty/disabled states missing for new async interactions.
- Client-side navigation, back/forward, hydration, and stale state regressions.

### Distribution and operations
- Build/runtime versions conflict with project requirements.
- Artifact names, paths, target OS/architecture, or publish steps are wrong.
- Release/publish steps are not safely rerunnable.
- Configuration or environment variables changed without all deployment consumers.
- Logs/metrics claim success before conditional side effects actually succeed.

## Scope and completeness

- Compare changed files with stated intent; flag unrelated functionality or missing required work.
- Audit plan/spec items as DONE, PARTIAL, NOT DONE, or INTENTIONALLY DEFERRED.
- Check whether docs that define a changed contract are now stale.
- Do not turn unrelated repository debt into findings for this change.

## Suppressions

Do not flag:
- issues already resolved elsewhere in the full diff
- harmless redundancy that improves clarity
- preferences without observable correctness, safety, performance, or maintenance impact
- edge cases prohibited by verified upstream constraints
- assertions that already defend the intended behavior
- generated, vendored, or minified code unless the change intentionally modifies it
- speculative findings lacking a plausible trigger and impact

## Finding evidence

Each finding must contain:

1. severity and confidence
2. exact path and line
3. trigger or failing state
4. impact
5. direct evidence and relevant out-of-diff reads
6. smallest credible correction direction

The checklist is diagnostic only. Do not edit code during `review`.

# Communication Guidelines

How to explain findings, reviews, and reports to the user and their team. Product managers and business people read these, not only developers. Readability comes first.

## Plain language by default

- Short sentences, one idea each. Tables and checklists over long prose.
- Use the user's own terms and the names on screen (menus, buttons, statuses, roles), not component, route, or variable names.
- Explain technical causes through their effect on the business: "the total is Rp 50.000 too low because the old catalog price is used", not the function that reads it.
- Reply in the language the user writes in.
- Lead with the answer or the result, then the detail.
- Do not over-inform. Leave out steps, logs, and caveats the reader does not need to act.

## The four questions

When explaining a feature, a PRD, or a module, answer these first:

1. **What are we building?** The concrete goal in one or two sentences.
2. **Why?** The operational problem it solves.
3. **How does it work?** Step by step from the user's point of view.
4. **How does it connect?** Which module comes before and after it.

## Technical detail: separate and tidy

Technical detail is welcome when it helps someone fix something (a new bug, a contract mismatch). Keep it out of the main story:

- Put it in a clearly titled block ("Technical evidence (for developers)") or an appendix, after the plain explanation.
- Show only what proves the point: a small table (endpoint, status, field, expected vs. actual) and short, pretty-printed snippets trimmed with `…`.
- Never paste full logs, stack traces, or whole API responses.
- Mask tokens, cookies, passwords, and personal data.

## Before sending

- Can someone who never opened the code understand everything outside the technical blocks?
- Is every number and claim backed by something you actually checked in this session?

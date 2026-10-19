# Report structure

## Outline

1. Cover: title, wave, then a table with test date, environment URL, account, browser, commit hashes, data tag.
2. Table of contents (Word field, filled when the user opens the file).
3. Summary: totals (tests, passed, failed, findings by severity). For a first report, add the four questions: what is being built, why, how it works, how modules connect.
4. Verdicts on ambiguous points: what you decided and the evidence (PRD section, guide step, code file).
5. Findings table: ID, severity, test code, title.
6. Finding details: what happened, impact, likely cause, screenshot.
7. Results per scenario code: table, then one section per code with result, short reason, screenshots.
8. Label differences between guide and screen.
9. Not tested and why.
10. Test data left on staging.
11. How to re-run.

For a re-test report, replace 5–6 with a checklist: finding, commit, status (Fixed / Partial / Not touched / Not a bug / New regression), evidence.

## Formatting defaults

- A4, margins 3 cm left, 2.5 cm others.
- Times New Roman; Heading 1 and 2 at 14 pt bold; body 12 pt; line spacing 1.5.
- Tables: grey header row, thin borders, widths in DXA summing to the text width.
- Figures: max 560 px wide, numbered captions "Figure n. CODE — description" in italics.
- Page numbers in the footer.

## Spec JSON for `build-report-docx.cjs`

```json
{
  "title": "QA AUTOMATION REPORT",
  "subtitle": "Project — Wave 1",
  "font": "Times New Roman",
  "labels": { "toc": "Table of Contents", "figure": "Figure", "result": "Result" },
  "meta": [["Test date", "19 October 2026"], ["Environment", "https://staging.example.com"]],
  "shotsDir": "qa-report/shots-jpg",
  "sections": [
    { "h1": "1. Summary", "body": [
      { "p": "Ran 21 tests: 17 passed, 4 failed." },
      { "table": { "head": ["Status", "Count"], "rows": [["Passed", "17"]], "widths": [4000, 4787] } },
      { "bullets": ["First point", "Second point"] }
    ] },
    { "h1": "2. Findings", "body": [
      { "h2": "2.1 F-01 Package price ignores catalog price" },
      { "label": ["Severity", "Critical"] },
      { "p": "What happened…" },
      { "figure": ["QA-2__package-vs-bom", "F-01 — package price"] }
    ] }
  ]
}
```

Block types: `p`, `h2`, `label` (bold label + text), `bullets`, `table` (`head`, `rows`, `widths`), `figure` (`[screenshot name without .jpg, caption]`), `pagebreak`.

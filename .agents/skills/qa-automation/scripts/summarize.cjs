// Turns qa-report/results.json (Playwright JSON reporter) into qa-report/summary.json
// and prints one block per test: status, notes, errors, screenshots.
// Usage: node summarize.cjs [results.json] [summary.json]
const fs = require("node:fs");
const path = require("node:path");

const input = process.argv[2] || "qa-report/results.json";
const output = process.argv[3] || path.join(path.dirname(input), "summary.json");
const shotsDir = path.join(path.dirname(input), "shots");
const shots = fs.existsSync(shotsDir) ? fs.readdirSync(shotsDir) : [];

const report = JSON.parse(fs.readFileSync(input, "utf8"));
const out = [];
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");

function walk(suite) {
  for (const spec of suite.specs || []) {
    for (const test of spec.tests) {
      const res = test.results[test.results.length - 1];
      const code = spec.title.split(" ")[0];
      const ann = [...test.annotations, ...(res.annotations || [])].map((a) => `${a.type}: ${a.description}`);
      out.push({
        code,
        title: spec.title,
        status: res.status,
        durationMs: res.duration,
        notes: [...new Set(ann)],
        errors: [...new Set((res.errors || []).map((e) => stripAnsi(e.message || "").split("\n")[0]))].slice(0, 4),
        shots: shots.filter((f) => f.startsWith(`${code}__`)),
      });
    }
  }
  for (const child of suite.suites || []) walk(child);
}
report.suites.forEach(walk);
fs.writeFileSync(output, JSON.stringify(out, null, 2));

const passed = out.filter((t) => t.status === "passed").length;
for (const t of out) {
  console.log(`${t.status.padEnd(8)} ${t.title}`);
  for (const n of t.notes) console.log(`         ${n}`);
  for (const e of t.errors) console.log(`         ERROR ${e}`);
}
console.log(`\n${out.length} tests, ${passed} passed, ${out.length - passed} failed → ${output}`);

/* Runs every level through the real tracer (Pyodide in Node) and the real evaluator.
 *   npm run verify
 * - every reference solution must PASS
 * - every starter recipe must FAIL
 * - known mistakes must fail with a helpful message
 */
import fs from "node:fs";
import path from "node:path";
import { loadPyodide } from "pyodide";
import { LEVELS, assembleCode, TOTAL_POINTS, CHAPTERS, levelsOf } from "../lib/levels";
import { evaluateLevel } from "../lib/evaluate";
import { buildPayload } from "../lib/runner";
import type { Level, LevelRunResult } from "../lib/types";
import { SOLUTIONS, MISTAKES, type Work } from "./solutions";

async function main() {
  const py = await loadPyodide();
  py.runPython(fs.readFileSync(path.join(__dirname, "..", "public", "tracer.py"), "utf8"));
  const runLevel = py.globals.get("run_level");
  const run = (level: Level, code: string): LevelRunResult => JSON.parse(runLevel(JSON.stringify(buildPayload(level, code))));

  let failures = 0;
  const fail = (m: string) => { failures++; console.log("  ✗ " + m); };

  if (TOTAL_POINTS !== 900) fail(`total points = ${TOTAL_POINTS}, expected 900`);
  for (const ch of CHAPTERS) {
    const pts = levelsOf(ch.id).reduce((a, l) => a + l.points, 0);
    if (pts !== 100) fail(`chapter ${ch.id} has ${pts} points`);
  }

  for (const level of LEVELS) {
    const sol = SOLUTIONS[level.id];
    if (!sol) { fail(`${level.id}: no reference solution`); continue; }
    if (level.hints.length !== 3) fail(`${level.id}: expected 3 hints`);
    const code = assembleCode(level, sol);
    const t0 = Date.now();
    const res = run(level, code);
    const out = evaluateLevel(level, res, code);
    const ms = Date.now() - t0;
    if (!out.pass) fail(`${level.id} ${level.title}: solution failed → ${out.message}`);
    const starter = assembleCode(level, {});
    const sres = run(level, starter);
    const sout = evaluateLevel(level, sres, starter);
    if (sout.pass) fail(`${level.id} ${level.title}: starter recipe already passes!`);
    const evs = res.runs.reduce((a, r) => a + r.events.length, 0);
    console.log(`${out.pass ? "✓" : "✗"} ${level.id.padEnd(4)} ${level.title.padEnd(22)} ${String(ms).padStart(4)}ms  events=${evs}  starter→ ${sout.message.slice(0, 90)}`);
  }

  console.log("\nMistakes:");
  for (const m of MISTAKES) {
    const level = LEVELS.find((l) => l.id === m.id)!;
    const code = assembleCode(level, m.work as Work);
    const out = evaluateLevel(level, run(level, code), code);
    const ok = !out.pass && out.message.includes(m.expect);
    if (!ok) fail(`${m.id}: expected message containing "${m.expect}", got "${out.message}" (pass=${out.pass})`);
    else console.log(`✓ ${m.id} → ${out.message}`);
  }

  console.log(failures ? `\n${failures} problem(s) found.` : "\nAll levels verified.");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });

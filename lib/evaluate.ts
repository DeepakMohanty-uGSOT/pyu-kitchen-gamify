import { explainError, explainStop, type Explained } from "./errors";
import type {
  Check, Customer, FuncTestResult, JsValue, Level, LevelRunResult, OutputMode, PyType, RunResult, SafeValue, VarMap,
} from "./types";

export type CustomerOutcome = {
  index: number;
  name: string;
  hidden: boolean;
  pass: boolean;
  message?: string;
  hint?: string;
  accident?: Explained;
};

export type LevelOutcome = {
  pass: boolean;
  customers: CustomerOutcome[];
  message: string;
  hint?: string;
  accident?: Explained;
  firstFailing: number | null;
  extras: { label: string; pass: boolean }[];
  fireOut: number; // leading fire stages passed
  errorLine: number | null;
};

// ---------------------------------------------------------------- value helpers

const isNum = (sv?: SafeValue) => !!sv && (sv.t === "int" || sv.t === "float") && typeof sv.v === "number";

export function valueEquals(sv: SafeValue | undefined, js: JsValue): boolean {
  if (!sv) return false;
  if (js === null) return sv.t === "NoneType";
  if (typeof js === "boolean") return sv.t === "bool" && sv.v === js;
  if (typeof js === "number") return isNum(sv) && Math.abs((sv.v as number) - js) <= 1e-6 * Math.max(1, Math.abs(js));
  if (typeof js === "string") return sv.t === "str" && sv.v === js;
  if (Array.isArray(js)) {
    if (sv.t !== "list" && sv.t !== "tuple") return false;
    const items = (sv.v || []) as SafeValue[];
    return sv.n === js.length && items.length === js.length && js.every((x, i) => valueEquals(items[i], x));
  }
  return false;
}

export function typeMatches(sv: SafeValue, t?: PyType) {
  if (!t) return true;
  if (t === "number") return sv.t === "int" || sv.t === "float";
  return sv.t === t;
}

export function showValue(sv: SafeValue): string {
  if (sv.t === "str") return JSON.stringify(sv.v ?? "");
  return sv.r;
}

export function showJs(js: JsValue): string {
  if (js === null) return "None";
  if (typeof js === "boolean") return js ? "True" : "False";
  if (typeof js === "string") return JSON.stringify(js);
  if (Array.isArray(js)) return "[" + js.map(showJs).join(", ") + "]";
  return String(js);
}

export function describe(sv: SafeValue): string {
  switch (sv.t) {
    case "int": return `the whole number ${sv.r}`;
    case "float": return `the decimal number ${sv.r}`;
    case "str": return `the text ${showValue(sv)}`;
    case "bool": return sv.r;
    case "NoneType": return "nothing (None)";
    case "list": return `the list ${sv.r}`;
    case "function": return `a recipe card`;
    default: return sv.r;
  }
}

export function typeDesc(t?: PyType) {
  switch (t) {
    case "int": return "a whole number (int)";
    case "float": return "a decimal number (float)";
    case "number": return "a number";
    case "str": return "text (str)";
    case "bool": return "True or False (bool)";
    case "list": return "a list";
    case "NoneType": return "None";
    default: return "a value";
  }
}

const clip = (s: string, n = 70) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ---------------------------------------------------------------- output comparison

function normLine(s: string, mode: OutputMode) {
  if (mode === "exact") return s.replace(/\s+$/, "");
  const n = s.trim().replace(/\s+/g, " ");
  return mode === "loose" ? n.toLowerCase() : n;
}

function tokenEq(a: string, b: string) {
  if (a === b) return true;
  const strip = (x: string) => x.replace(/[.,:;!?]+$/, "");
  const sa = strip(a), sb = strip(b);
  if (sa === sb && a.length - sa.length === b.length - sb.length) return true;
  const na = Number(sa), nb = Number(sb);
  if (sa !== "" && sb !== "" && !Number.isNaN(na) && !Number.isNaN(nb) && Math.abs(na - nb) < 0.011)
    return a.slice(sa.length) === b.slice(sb.length);
  return false;
}

export function linesEqual(got: string, exp: string, mode: OutputMode) {
  const g = normLine(got, mode), e = normLine(exp, mode);
  if (g === e) return true;
  if (mode !== "loose") return false;
  const gt = g.split(" "), et = e.split(" ");
  return gt.length === et.length && gt.every((t, i) => tokenEq(t, et[i]));
}

export function compareOutput(got: string[], exp: string[], mode: OutputMode):
  null | { index: number; expected?: string; got?: string } {
  let g = got.slice();
  if (mode === "loose") g = g.filter((l) => l.trim() !== "");
  else while (g.length && g[g.length - 1].trim() === "") g.pop();
  const e = mode === "loose" ? exp.filter((l) => l.trim() !== "") : exp;
  for (let i = 0; i < Math.max(g.length, e.length); i++) {
    if (i >= g.length) return { index: i, expected: e[i] };
    if (i >= e.length) return { index: i, got: g[i] };
    if (!linesEqual(g[i], e[i], mode)) return { index: i, expected: e[i], got: g[i] };
  }
  return null;
}

// ---------------------------------------------------------------- checks

type Ctx = {
  level: Level;
  customer: Customer;
  index: number;
  run: RunResult;
  prefix: string; // "On Day 2, " / "For Ravi, " / ""
  result: LevelRunResult;
};

const LEVEL_WIDE = new Set(["maxLines", "defines", "funcTest"]);

function fill(t: string, vars: Record<string, string>) {
  return t.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

function checkCustomer(c: Check, ctx: Ctx): string | null {
  const { run, prefix, customer } = ctx;
  const final: VarMap = run.final;
  const P = (s: string) => (prefix ? prefix + s : cap(s));
  switch (c.type) {
    case "noError":
    case "compiles":
      return null;
    case "noErrorOfType":
      return run.error?.type === c.error ? (c.fail ?? `${c.error} found.`) : null;
    case "var": {
      const sv = final[c.name];
      if (!sv) return c.fail ? fill(c.fail, { run: customer.name, got: "nothing" }) : P(`Pyu searched the shelf but there's no jar called "${c.name}".`);
      for (const w of c.whenValue || []) if (valueEquals(sv, w.value)) return w.message;
      if (c.op && c.value !== undefined) {
        const v = isNum(sv) ? (sv.v as number) : NaN;
        const ok = !Number.isNaN(v) && compareOp(v, c.op, c.value);
        if (!ok) return c.fail ? fill(c.fail, { run: customer.name, got: showValue(sv) }) : P(`the jar "${c.name}" holds ${showValue(sv)}, which isn't ${c.op} ${c.value}.`);
      }
      if (c.pyType && !typeMatches(sv, c.pyType) && c.equals === undefined)
        return P(`the jar "${c.name}" holds ${describe(sv)}, but it should hold ${typeDesc(c.pyType)}.`);
      if (c.equals !== undefined) {
        if (!valueEquals(sv, c.equals)) {
          if (c.fail) return fill(c.fail, { run: customer.name, got: showValue(sv), expected: showJs(c.equals) });
          if (c.pyType && !typeMatches(sv, c.pyType) && c.pyType !== "number")
            return P(`the jar "${c.name}" holds ${describe(sv)}, but it should hold ${typeDesc(c.pyType)}.`);
          return c.hideExpected
            ? P(`the jar "${c.name}" holds ${showValue(sv)}. That's not right.`)
            : P(`the jar "${c.name}" holds ${showValue(sv)}, but it should hold ${showJs(c.equals)}.`);
        }
        if (c.pyType && !typeMatches(sv, c.pyType))
          return P(`the jar "${c.name}" holds ${describe(sv)}, but it should hold ${typeDesc(c.pyType)}.`);
      }
      return null;
    }
    case "hasValue": {
      const found = Object.values(final).some((sv) => valueEquals(sv, c.value) && typeMatches(sv, c.pyType));
      return found ? null : (c.fail ?? P(`Pyu can't find any jar holding ${showJs(c.value)}.`));
    }
    case "output": {
      const mode = c.mode ?? ctx.level.outputMode ?? "normal";
      const raw = compareOutput(run.output, c.lines, mode);
      if (!raw) return null;
      const diff = { ...raw, got: raw.got === undefined ? undefined : clip(raw.got) };
      if (c.fail) {
        const tpl = diff.got === undefined ? c.fail.replace(/"\{got\}"/g, run.output.length ? "no more tickets" : "nothing") : c.fail;
        return fill(tpl, { run: customer.name, got: diff.got ?? "nothing", expected: diff.expected ?? "" });
      }
      if (diff.expected !== undefined && diff.got === undefined)
        return run.output.length === 0
          ? P(`Pyu expected the ticket "${diff.expected}", but nothing was printed.`)
          : P(`ticket ${diff.index + 1} should say "${diff.expected}", but there were no more tickets.`);
      if (diff.expected === undefined)
        return c.lines.length === 0
          ? P(`nothing should be printed, but Pyu printed "${diff.got}".`)
          : P(`Pyu printed an extra ticket: "${diff.got}".`);
      return P(`ticket ${diff.index + 1} should say "${diff.expected}", but Pyu printed "${diff.got}".`);
    }
    case "outputContains":
      return run.output.some((l) => l.includes(c.text)) ? null : (c.fail ?? P(`Pyu never printed "${c.text}".`));
    case "varSequence": {
      const seq: SafeValue[] = [];
      for (const ev of run.events) {
        const sv = ev.g?.[c.name];
        if (!sv) continue;
        const last = seq[seq.length - 1];
        if (!last || last.r !== sv.r || last.t !== sv.t) seq.push(sv);
      }
      const ok = seq.length === c.values.length && c.values.every((v, i) => valueEquals(seq[i], v));
      if (ok) return null;
      const got = seq.slice(0, 14).map((s) => s.r).join(" → ") + (seq.length > 14 ? " → …" : "");
      return c.fail ? fill(c.fail, { run: customer.name, got }) : P(`"${c.name}" went ${got}, which isn't what Pyu needed.`);
    }
    case "callCount": {
      const fnv = final[c.fn];
      if (!fnv || fnv.t !== "function") return `Pyu can't find a recipe card called ${c.fn}. Check the name on your def line.`;
      const n = run.events.filter((e) => e.k === "call" && e.fn === c.fn).length;
      if ((c.min !== undefined && n < c.min) || (c.max !== undefined && n > c.max)) {
        if (c.fail) return fill(c.fail, { run: customer.name, got: String(n) });
        const want = c.min === c.max ? `${c.min}` : c.max === undefined ? `at least ${c.min}` : `at most ${c.max}`;
        return `The recipe card ${c.fn} was used ${n} time${n === 1 ? "" : "s"}, but it should be used ${want} time${want === "1" ? "" : "s"}.`;
      }
      return null;
    }
    default:
      return null;
  }
}

function compareOp(a: number, op: string, b: number) {
  switch (op) {
    case "==": return Math.abs(a - b) < 1e-9;
    case "!=": return Math.abs(a - b) >= 1e-9;
    case ">": return a > b;
    case ">=": return a >= b;
    case "<": return a < b;
    case "<=": return a <= b;
  }
  return false;
}

function callText(fn: string, c: Extract<Check, { type: "funcTest" }>) {
  const args = (c.args || []).map(showJs);
  for (const [k, v] of Object.entries(c.kwargs || {})) args.push(`${k}=${showJs(v)}`);
  return `${fn}(${args.join(", ")})`;
}

function checkFunc(c: Extract<Check, { type: "funcTest" }>, r: FuncTestResult | undefined, level: Level, code: string, names: string[]): string | null {
  const call = callText(c.fn, c);
  if (!r || r.missing) return `Pyu can't find a recipe card called ${c.fn}. Check the name on your def line.`;
  if (r.stopped) return `When Pyu used ${call}, ${explainStop(r.stopped, {}).explain}`;
  if (r.error) {
    const ex = explainError(r.error, code, names);
    return c.fail ?? `When Pyu tested ${call}, there was a ${r.error.type}: ${ex.explain}`;
  }
  const outLines = r.out || [];
  if (c.noOutput && outLines.length) {
    if (r.ret && r.ret.t === "NoneType") return `${call} printed "${outLines[0]}" but didn't hand anything back. Pyu needs the answer returned, not printed.`;
    return `${call} should hand back its answer without printing anything, but it printed "${outLines[0]}".`;
  }
  if (c.expectOutput) {
    const diff = compareOutput(outLines, c.expectOutput, c.mode ?? level.outputMode ?? "normal");
    if (diff) return c.fail ?? `When Pyu used ${call}, it printed ${outLines.length ? `"${outLines.join(" / ")}"` : "nothing"} instead of "${c.expectOutput.join(" / ")}".`;
  }
  if (c.expect !== undefined) {
    const ret = r.ret;
    if (!ret || ret.t === "NoneType")
      return c.fail ?? `When Pyu used ${call}, the card didn't hand anything back (it returned None). Did you forget to return the answer?`;
    const ok = valueEquals(ret, c.expect) && (!c.pyType || typeMatches(ret, c.pyType));
    if (!ok) return c.fail ?? `When Pyu used ${call}, it handed back ${showValue(ret)}, but it should be ${showJs(c.expect)}.`;
  }
  return null;
}

// ---------------------------------------------------------------- level

export function customerPrefix(level: Level, c: Customer) {
  if (level.customers.length <= 1) return "";
  if (level.runLabel === "Day" || /^(Day|Night) /.test(c.name)) return `On ${c.name}, `;
  return `For ${c.name}, `;
}

export function evaluateLevel(level: Level, result: LevelRunResult, code: string): LevelOutcome {
  const customersBase = level.customers.map((c, i) => ({ index: i, name: c.name, hidden: !!c.hidden }));
  const names = result.ast?.names || [];
  const outcome: LevelOutcome = {
    pass: false, customers: [], message: "", firstFailing: null, extras: [], fireOut: 0, errorLine: null,
  };

  // Whole-level failures ------------------------------------------------
  if (result.timeout || result.crash) {
    const ex = explainStop("timeout", {});
    if (result.crash) { ex.title = "Something went wrong in the kitchen"; ex.explain = `The Python kitchen crashed (${result.crash}). Press Reset and try again.`; }
    outcome.customers = customersBase.map((c) => ({ ...c, pass: false, message: ex.explain, accident: ex }));
    outcome.message = ex.explain; outcome.accident = ex; outcome.firstFailing = 0;
    return outcome;
  }
  if (result.compile) {
    const ex = explainError({ type: result.compile.type, msg: result.compile.msg, line: result.compile.line }, code, names);
    outcome.customers = customersBase.map((c) => ({ ...c, pass: false, message: ex.explain, accident: ex }));
    outcome.message = ex.explain; outcome.accident = ex; outcome.firstFailing = 0; outcome.errorLine = ex.line;
    outcome.fireOut = fireStages(level, result, outcome, code);
    return outcome;
  }

  // Per customer ---------------------------------------------------------
  level.customers.forEach((customer, i) => {
    const run = result.runs[i];
    const base = customersBase[i];
    if (!run) { outcome.customers.push({ ...base, pass: false, message: "This customer was never served." }); return; }
    if (run.stopped) {
      const ex = explainStop(run.stopped, { inputs: run.inputsUsed, name: customer.name, blocked: run.blocked });
      outcome.customers.push({ ...base, pass: false, message: ex.explain, accident: ex });
      return;
    }
    if (run.error) {
      const ex = explainError(run.error, code, [...names, ...Object.keys(run.final)]);
      outcome.customers.push({ ...base, pass: false, message: ex.explain, accident: ex });
      return;
    }
    const ctx: Ctx = { level, customer, index: i, run, prefix: customerPrefix(level, customer), result };
    const checks = [...level.checks.filter((c) => !LEVEL_WIDE.has(c.type)), ...(customer.expect || [])];
    for (const c of checks) {
      const msg = checkCustomer(c, ctx);
      if (msg) { outcome.customers.push({ ...base, pass: false, message: msg, hint: customer.failHint }); return; }
    }
    outcome.customers.push({ ...base, pass: true });
  });

  const failing = outcome.customers.find((c) => !c.pass);
  if (failing) {
    outcome.firstFailing = failing.index;
    outcome.message = failing.message || "Not every customer was served correctly.";
    outcome.hint = failing.hint;
    outcome.accident = failing.accident;
    outcome.errorLine = failing.accident?.line ?? null;
  }

  // Level-wide checks -----------------------------------------------------
  let funcIdx = 0;
  let levelMsg: string | null = null;
  let testsTotal = 0, testsPassed = 0;
  for (const c of level.checks) {
    if (!LEVEL_WIDE.has(c.type)) continue;
    let msg: string | null = null;
    if (c.type === "maxLines") {
      const n = result.ast?.lines ?? 0;
      if (n > c.n) msg = c.fail ?? `Your recipe is ${n} lines long. Pyu's tired arm can only manage ${c.n} lines or fewer.`;
      outcome.extras.push({ label: `${Math.min(n, 99)} / ${c.n} lines`, pass: !msg });
    } else if (c.type === "defines") {
      if (!(result.ast?.functions || []).includes(c.fn)) msg = c.fail ?? `Pyu can't find a recipe card called ${c.fn}. Check the name on your def line.`;
    } else if (c.type === "funcTest") {
      msg = checkFunc(c, result.funcTests[funcIdx++], level, code, names);
      testsTotal++;
      if (!msg) testsPassed++;
    }
    if (msg && !levelMsg) levelMsg = msg;
  }
  if (testsTotal) outcome.extras.push({ label: `Secret taste tests ${testsPassed}/${testsTotal}`, pass: testsPassed === testsTotal });

  if (!failing && levelMsg) outcome.message = levelMsg;
  outcome.pass = !failing && !levelMsg;
  outcome.fireOut = fireStages(level, result, outcome, code);
  return outcome;
}

function fireStages(level: Level, result: LevelRunResult, outcome: LevelOutcome, code: string) {
  if (!level.fireStages) return 0;
  let n = 0;
  for (const stage of level.fireStages) {
    let ok: boolean;
    if (stage.checks.length === 0) ok = outcome.pass;
    else ok = stage.checks.every((c) => {
      if (c.type === "compiles") return !result.compile;
      if (c.type === "noErrorOfType") return !result.compile && result.runs.every((r) => r.error?.type !== c.error);
      if (c.type === "noError") return !result.compile && result.runs.every((r) => !r.error && !r.stopped);
      return true;
    });
    if (!ok) break;
    n++;
  }
  void code;
  return n;
}

export function pointsFor(level: Level, hints: number) {
  return Math.round(level.points * Math.max(0.5, 1 - 0.1 * hints));
}

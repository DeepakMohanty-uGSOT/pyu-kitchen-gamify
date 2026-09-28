import type { CondInfo, ExecEvent, JsValue, LoopInfo, PyError, RunResult, SafeValue, StackFrame, StopReason, VarMap } from "./types";

export type IoItem = { kind: "print"; text: string; line: number } | { kind: "input"; prompt: string; value: string; line: number };

export type Frame = {
  i: number;
  kind: ExecEvent["k"];
  line: number;
  g: VarMap;
  st: StackFrame[];
  loops?: LoopInfo[];
  cond?: CondInfo;
  ioCount: number;
  call?: { fn: string; args: VarMap };
  ret?: { fn: string; value?: SafeValue; raised?: boolean };
  input?: { prompt: string; value: string };
  print?: string;
  error?: PyError;
  stopped?: StopReason;
  done: boolean;
};

export type Timeline = { frames: Frame[]; io: IoItem[] };

export function buildTimeline(run: RunResult): Timeline {
  const frames: Frame[] = [];
  const io: IoItem[] = [];
  let g: VarMap = {};
  let st: StackFrame[] = [];
  let loops: LoopInfo[] | undefined;
  let line = 0;
  run.events.forEach((ev, i) => {
    if (ev.g) g = ev.g;
    if (ev.st) st = ev.st;
    if (ev.k === "line") loops = ev.loops;
    if (ev.k === "line" || ev.k === "print" || ev.k === "input" || ev.k === "call" || ev.k === "return") line = ev.l || line;
    const f: Frame = { i, kind: ev.k, line, g, st, loops: ev.k === "line" || ev.k === "print" || ev.k === "input" ? loops : undefined,
      cond: ev.cond, ioCount: io.length, done: false };
    if (ev.k === "print") { io.push({ kind: "print", text: ev.out ?? "", line: ev.l }); f.print = ev.out ?? ""; }
    if (ev.k === "input") { io.push({ kind: "input", prompt: ev.prompt ?? "", value: ev.val ?? "", line: ev.l }); f.input = { prompt: ev.prompt ?? "", value: ev.val ?? "" }; }
    if (ev.k === "call") f.call = { fn: ev.fn || "?", args: ev.args || {} };
    if (ev.k === "return") f.ret = { fn: ev.fn || "?", value: ev.ret, raised: ev.raised };
    if (ev.k === "end" || ev.k === "error") {
      f.done = true;
      f.line = ev.k === "error" ? (ev.error?.line ?? 0) : 0;
      f.error = ev.error;
      f.stopped = ev.stopped;
      f.st = [];
      f.loops = undefined;
    }
    f.ioCount = io.length;
    frames.push(f);
  });
  return { frames, io };
}

/** How long to show a frame, in ms at 1x. Long runs are compressed so they stay watchable. */
export function frameDelay(f: Frame, total: number) {
  let d = 520;
  if (f.kind === "print") d = 650;
  else if (f.kind === "input") d = 900;
  else if (f.kind === "call" || f.kind === "return") d = 620;
  else if (f.kind === "end" || f.kind === "error") d = 300;
  if (f.cond) d += 180;
  const budget = 70;
  if (total > budget) d = Math.max(28, d * (budget / total));
  return d;
}

/** Turn a level's preset JS values into snapshot values for the shelf before the first run. */
export function jsToSafe(v: JsValue): SafeValue {
  if (v === null) return { t: "NoneType", r: "None" };
  if (typeof v === "boolean") return { t: "bool", v, r: v ? "True" : "False" };
  if (typeof v === "number") return Number.isInteger(v) ? { t: "int", v, r: String(v) } : { t: "float", v, r: String(v) };
  if (typeof v === "string") return { t: "str", v, n: v.length, r: `'${v}'` };
  const items = v.map(jsToSafe);
  return { t: "list", v: items, n: v.length, r: "[" + items.slice(0, 12).map((x) => x.r).join(", ") + (v.length > 12 ? ", ..." : "") + "]" };
}

export function presetVars(globals?: Record<string, JsValue>): VarMap {
  const out: VarMap = {};
  for (const [k, v] of Object.entries(globals || {})) out[k] = jsToSafe(v);
  return out;
}

import type { Check, Level, LevelRunResult } from "./types";

export type RunPayload = {
  code: string;
  runs: { inputs: string[]; globals: Record<string, unknown> }[];
  funcTests: { fn: string; args: unknown[]; kwargs: Record<string, unknown> }[];
  allowImports: string[];
};

export function buildPayload(level: Level, code: string): RunPayload {
  return {
    code,
    runs: level.customers.map((c) => ({ inputs: c.inputs || [], globals: c.globals || {} })),
    funcTests: level.checks
      .filter((c): c is Extract<Check, { type: "funcTest" }> => c.type === "funcTest")
      .map((c) => ({ fn: c.fn, args: c.args || [], kwargs: c.kwargs || {} })),
    allowImports: level.allowImports || [],
  };
}

type Status = "idle" | "loading" | "ready" | "error";
type Listener = (s: Status, err?: string) => void;

/** Owns the Pyodide Web Worker. Restarts it if a recipe hangs. */
class PythonRunner {
  private worker: Worker | null = null;
  private status: Status = "idle";
  private error = "";
  private listeners = new Set<Listener>();
  private ready: Promise<void> | null = null;
  private seq = 0;
  private pending = new Map<number, { resolve: (r: LevelRunResult) => void; timer: ReturnType<typeof setTimeout> }>();

  getStatus() { return { status: this.status, error: this.error }; }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.status, this.error);
    return () => { this.listeners.delete(fn); };
  }

  private set(s: Status, err = "") {
    this.status = s;
    this.error = err;
    this.listeners.forEach((l) => l(s, err));
  }

  init(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve();
    if (this.ready && this.status !== "error") return this.ready;
    this.set("loading");
    const worker = new Worker("/pyodide-worker.js");
    this.worker = worker;
    this.ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data || {};
        if (msg.type === "ready") { this.set("ready"); resolve(); }
        else if (msg.type === "loadError") { this.set("error", msg.message); reject(new Error(msg.message)); }
        else if (msg.type === "result" || msg.type === "crash") {
          const p = this.pending.get(msg.id);
          if (!p) return;
          clearTimeout(p.timer);
          this.pending.delete(msg.id);
          p.resolve(msg.type === "result" ? msg.result : { compile: null, ast: null, runs: [], funcTests: [], crash: msg.message });
        }
      };
      worker.onerror = (e) => {
        this.set("error", e.message || "The Python worker failed to start.");
        reject(new Error(e.message));
      };
    });
    worker.postMessage({ type: "init" });
    this.ready.catch(() => undefined);
    return this.ready;
  }

  private restart() {
    try { this.worker?.terminate(); } catch { /* ignore */ }
    this.worker = null;
    this.ready = null;
    this.status = "idle";
    this.init().catch(() => undefined);
  }

  async run(payload: RunPayload): Promise<LevelRunResult> {
    await this.init();
    const worker = this.worker!;
    const id = ++this.seq;
    const timeoutMs = 6000 + 2500 * payload.runs.length + 1500 * payload.funcTests.length;
    return new Promise<LevelRunResult>((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        this.restart();
        resolve({ compile: null, ast: null, runs: [], funcTests: [], timeout: true });
      }, timeoutMs);
      this.pending.set(id, { resolve, timer });
      worker.postMessage({ type: "run", id, payload });
    });
  }
}

let instance: PythonRunner | null = null;
export function getRunner() {
  if (!instance) instance = new PythonRunner();
  return instance;
}

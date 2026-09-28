"use client";

import { ArrowRight, Lightbulb, RotateCcw } from "lucide-react";
import type { Explained } from "@/lib/errors";
import type { CustomerOutcome, LevelOutcome } from "@/lib/evaluate";
import type { Frame, IoItem } from "@/lib/playback";
import type { Level } from "@/lib/types";
import { Byte } from "./kitchen/Characters";

// ---------------------------------------------------------------- rich text

function inline(text: string, keyBase: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) out.push(<code key={keyBase + k++} className="inline">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**")) out.push(<strong key={keyBase + k++}>{tok.slice(2, -2)}</strong>);
    else out.push(<em key={keyBase + k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => { if (para.length) { blocks.push(<p key={blocks.length}>{inline(para.join(" "), `p${blocks.length}`)}</p>); para = []; } };
  const flushList = () => {
    if (list.length) {
      blocks.push(<ul key={blocks.length} className="ml-5 list-disc space-y-0.5">{list.map((l, j) => <li key={j}>{inline(l, `l${blocks.length}-${j}`)}</li>)}</ul>);
      list = [];
    }
  };
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      flushPara(); flushList();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      blocks.push(
        <pre key={blocks.length} className="overflow-x-auto rounded-lg border px-3 py-2 font-mono text-[13px] leading-5" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>{code.join("\n")}</pre>,
      );
      i++;
      continue;
    }
    if (/^\s*- /.test(line)) { flushPara(); list.push(line.replace(/^\s*- /, "")); }
    else if (line.trim() === "") { flushPara(); flushList(); }
    else { flushList(); para.push(line); }
    i++;
  }
  flushPara(); flushList();
  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
}

// ---------------------------------------------------------------- execution panel

export function ExecutionPanel({ frame, io, who, speaker, accident, idle, busy, step }: {
  frame: Frame | null; io: IoItem[]; who: string; speaker: string; accident: Explained | null; idle: boolean; busy: boolean; step?: { i: number; n: number };
}) {
  const stack = frame?.st || [];
  const loops = frame?.loops || [];
  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md px-2 py-0.5 font-mono text-xs font-bold text-white" style={{ background: "var(--accent)" }}>
          {busy ? "cooking…" : frame && frame.line > 0 ? `Line ${frame.line}` : frame?.done ? "Finished" : "Ready"}
        </span>
        {who && <span className="font-semibold opacity-80">{who}</span>}
        {step && <span className="ml-auto font-mono text-[11px] opacity-50">step {step.i + 1}/{step.n}</span>}
      </div>

      {stack.length > 0 && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[13px]">
          📜 Inside recipe card <b className="font-mono">{stack[stack.length - 1].fn}</b>
          {stack.length > 1 && <span className="opacity-70"> (called from {stack.slice(0, -1).map((s) => s.fn).join(" → ")})</span>}
        </div>
      )}
      {frame?.call && <div className="anim-fadeup text-[13px]">📥 Using card <b className="font-mono">{frame.call.fn}</b> with {Object.keys(frame.call.args).length ? Object.entries(frame.call.args).map(([k, v]) => `${k} = ${v.r}`).join(", ") : "no ingredients"}</div>}
      {frame?.ret && !frame.ret.raised && <div className="anim-fadeup text-[13px]">🍽️ <b className="font-mono">{frame.ret.fn}</b> hands back <b className="font-mono">{frame.ret.value?.r ?? "None"}</b></div>}

      {loops.map((lp, k) => (
        <div key={k} className="rounded-lg border px-2 py-1 text-[13px]" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>
          {lp.kind === "for" ? (
            <>
              {lp.seq && (
                <div className="mb-0.5 flex flex-wrap items-center gap-1 font-mono text-[12px]">
                  <span className="opacity-70">{lp.src} →</span>
                  {lp.seq.map((s, j) => (
                    <span key={j} className={`rounded px-1 ${j === lp.iter - 1 && !(lp.header && lp.total !== undefined && lp.iter > lp.total) ? "bg-yellow-400 text-stone-900 font-bold" : "opacity-60"}`}>{s}</span>
                  ))}
                  {lp.total !== undefined && lp.total > lp.seq.length && <span className="opacity-60">… ({lp.total})</span>}
                </div>
              )}
              {lp.header && lp.total !== undefined && lp.iter > lp.total ? (
                <div>🔁 No items left → the loop ends</div>
              ) : (
                <div>
                  🔁 Iteration <b>{lp.iter}</b>{lp.total !== undefined ? ` / ${lp.total}` : ""}
                  {lp.var && !lp.header && lp.value !== undefined && <> · <span className="font-mono">{lp.var} = {lp.value}</span></>}
                  {lp.header && <span className="opacity-70"> · picking the next item…</span>}
                </div>
              )}
            </>
          ) : (
            <div>🔁 while-loop check #{lp.iter}</div>
          )}
        </div>
      ))}

      {frame?.cond && (
        <div key={frame.i} className="anim-fadeup rounded-lg border-2 px-2 py-1 font-mono text-[13px]"
          style={{ borderColor: frame.cond.value === undefined ? "var(--line)" : frame.cond.value ? "var(--good)" : "var(--bad)" }}>
          <span className="opacity-70">{frame.cond.kind}</span> {frame.cond.text}{" "}
          {frame.cond.value !== undefined && (
            <b style={{ color: frame.cond.value ? "var(--good)" : "var(--bad)" }}>
              → {frame.cond.value ? "✓ True" : "✗ False"}
              <span className="font-sans font-normal opacity-80">
                {frame.cond.kind === "while" ? (frame.cond.value ? " (repeat)" : " (stop)") : frame.cond.value ? " (do the indented steps)" : " (skip them)"}
              </span>
            </b>
          )}
        </div>
      )}

      <div className="flex min-h-[110px] flex-1 flex-col">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider opacity-60">Tickets &amp; orders</div>
        <div className="max-h-[220px] flex-1 space-y-1 overflow-y-auto rounded-lg border p-1.5 font-mono text-[13px]" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }} aria-live="polite">
          {idle && io.length === 0 && <div className="p-1 font-sans text-sm italic opacity-60">Press Cook to run your recipe. Printed tickets appear here.</div>}
          {!idle && io.length === 0 && <div className="p-1 font-sans text-sm italic opacity-60">No tickets yet.</div>}
          {io.map((it, j) =>
            it.kind === "print" ? (
              <div key={j} className={`${j === io.length - 1 ? "anim-ticket" : ""} rounded border border-stone-300 bg-[#fffef5] px-2 py-0.5 text-stone-800 shadow-sm`}>
                <span className="mr-1 opacity-40">🧾</span>{it.text || " "}
              </div>
            ) : (
              <div key={j} className="rounded border border-sky-400/50 bg-sky-500/10 px-2 py-0.5 font-sans">
                {it.prompt && <div className="text-[12px] opacity-80">🐍 Pyu asks: <span className="font-mono">{it.prompt}</span></div>}
                <div>🧑 {speaker} says: <b className="font-mono">&quot;{it.value}&quot;</b> <span className="text-[11px] opacity-60">(text)</span></div>
              </div>
            ),
          )}
        </div>
      </div>

      {accident && <ErrorBox ex={accident} />}
    </div>
  );
}

export function ErrorBox({ ex }: { ex: Explained }) {
  return (
    <div className="anim-fadeup rounded-xl border-2 border-red-400 bg-red-500/10 p-2.5" role="alert">
      <div className="font-display text-base font-semibold text-red-700 dark:text-red-300">{ex.emoji} {ex.title}</div>
      <div className="mt-0.5 text-sm">{ex.explain}</div>
      {ex.python && (
        <div className="mt-1.5 rounded-md bg-stone-900 px-2 py-1 font-mono text-[12px] text-red-200">
          <div className="text-[10px] uppercase tracking-wider text-stone-400">Python says</div>
          {ex.python}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- result card

export function ResultCard({ outcome, level, points, onNext, onRetry, nextLabel, bestAlready }: {
  outcome: LevelOutcome; level: Level; points: number; onNext: () => void; onRetry: () => void; nextLabel: string; bestAlready: boolean;
}) {
  if (outcome.pass) {
    return (
      <div className="absolute inset-0 z-30 grid place-items-center bg-black/25 p-3 backdrop-blur-[1px]">
        <div className="anim-pop w-full max-w-sm rounded-3xl border-4 border-amber-300 bg-[var(--panel)] p-5 text-center shadow-2xl" role="dialog" aria-label="Dish perfect">
          <div className="text-2xl">✨ 🎉 ✨</div>
          <div className="mt-1 font-display text-3xl font-bold tracking-wide" style={{ color: "var(--accent)" }}>DISH PERFECT!</div>
          <div className="mt-1 text-sm opacity-80">{level.successText}</div>
          <div className="mt-2 font-display text-2xl font-bold">+{points} pts {bestAlready && <span className="text-xs font-normal opacity-60">(already earned)</span>}</div>
          <button className="btn btn-primary mt-4 w-full justify-center text-base" onClick={onNext} autoFocus>
            {nextLabel} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-black/25 p-3 backdrop-blur-[1px]">
      <div className="anim-pop w-full max-w-md rounded-3xl border-4 border-stone-300 bg-[var(--panel)] p-5 text-center shadow-2xl" role="dialog" aria-label="Not quite">
        <div className="font-display text-2xl font-bold">Not quite! 🍵</div>
        {outcome.accident && <div className="mt-1 font-mono text-xs text-red-600 dark:text-red-300">{outcome.accident.emoji} {outcome.accident.title}</div>}
        <div className="mt-2 text-[15px]">❌ {outcome.message}</div>
        {outcome.hint && <div className="mt-1 text-sm opacity-75">{outcome.hint}</div>}
        <button className="btn btn-primary mt-4 w-full justify-center text-base" onClick={onRetry} autoFocus>
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
        <div className="mt-2 text-[11px] opacity-60">Your recipe stays in the editor. Failed attempts never cost points.</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- customer strip

export function CustomerStrip({ customers, extras, selected, onSelect, label }: {
  customers: CustomerOutcome[]; extras: { label: string; pass: boolean }[]; selected: number; onSelect: (i: number) => void; label: string;
}) {
  if (!customers.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Results for each run">
      {customers.map((c) => (
        <button key={c.index} type="button" onClick={() => onSelect(c.index)}
          className={`rounded-full border-2 px-2.5 py-0.5 text-[12.5px] font-bold transition hover:-translate-y-px ${selected === c.index ? "ring-2 ring-offset-1" : ""}`}
          style={{ borderColor: c.pass ? "var(--good)" : "var(--bad)", background: c.pass ? "color-mix(in srgb, var(--good) 12%, transparent)" : "color-mix(in srgb, var(--bad) 12%, transparent)" }}
          title={c.pass ? "Served correctly. Click to replay." : `${c.message ?? "Not served correctly"}. Click to replay.`}>
          {c.hidden ? "🔒 " : ""}{/^(Day|Night) /.test(c.name) ? c.name : `${label} ${c.index + 1}`}{c.hidden ? "" : ""} {c.pass ? "✅" : "❌"}
        </button>
      ))}
      {extras.map((x) => (
        <span key={x.label} className="rounded-full border-2 px-2.5 py-0.5 text-[12.5px] font-bold" style={{ borderColor: x.pass ? "var(--good)" : "var(--bad)" }}>
          🧪 {x.label} {x.pass ? "✅" : "❌"}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- hints

export function HintPanel({ hints, used, onReveal, points }: { hints: string[]; used: number; onReveal: () => void; points: number }) {
  return (
    <div className="panel p-3">
      <div className="flex items-center gap-2">
        <Byte size={40} talking={used > 0} />
        <div className="flex-1">
          <div className="font-display font-semibold">Byte&apos;s hints</div>
          <div className="text-xs opacity-70">Each hint costs 10% of this level&apos;s points. Worth now: <b>{points} pts</b></div>
        </div>
        <button className="btn" onClick={onReveal} disabled={used >= hints.length} title="Ask Byte for a hint">
          <Lightbulb className="h-4 w-4" /> {used >= hints.length ? "No more hints" : `Ask Byte (${used}/${hints.length})`}
        </button>
      </div>
      {used > 0 && (
        <ol className="mt-2 space-y-1.5">
          {hints.slice(0, used).map((h, i) => (
            <li key={i} className="anim-fadeup rounded-xl border bg-sky-500/10 px-3 py-1.5 text-sm" style={{ borderColor: "color-mix(in srgb, #0ea5e9 40%, var(--line))" }}>
              <b className="mr-1">Hint {i + 1}:</b>{h}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

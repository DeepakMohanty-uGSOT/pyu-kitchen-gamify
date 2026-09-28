"use client";

import dynamic from "next/dynamic";
import { ArrowLeft, FastForward, Map as MapIcon, Pause, Play, RotateCcw, SkipForward, Timer } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { evaluateLevel, pointsFor, type LevelOutcome } from "@/lib/evaluate";
import { assembleCode, blankCount, CHAPTERS, levelsOf } from "@/lib/levels";
import { buildTimeline, frameDelay, presetVars, type Timeline } from "@/lib/playback";
import type { Progress } from "@/lib/progress";
import { buildPayload, getRunner } from "@/lib/runner";
import { play } from "@/lib/sound";
import type { Level } from "@/lib/types";
import Kitchen from "./kitchen/Kitchen";
import type { CustomerMood, PyuMood } from "./kitchen/Characters";
import FillEditor from "./editor/FillEditor";
import ReorderEditor from "./editor/ReorderEditor";
import { CustomerStrip, ExecutionPanel, HintPanel, ResultCard, RichText } from "./LevelParts";

const CodeEditor = dynamic(() => import("./editor/CodeEditor"), {
  ssr: false,
  loading: () => <div className="grid h-[260px] place-items-center rounded-xl border text-sm opacity-60" style={{ borderColor: "var(--line)" }}>Unrolling the recipe card…</div>,
});

type Phase = "idle" | "running" | "playing" | "paused" | "reacting" | "finished";

type Props = {
  level: Level;
  progress: Progress;
  update: (fn: (p: Progress) => Progress) => void;
  dark: boolean;
  onExit: () => void;
  onNext: () => void;
  nextLabel: string;
  header: React.ReactNode;
};

export default function LevelScreen({ level, progress, update, dark, onExit, onNext, nextLabel, header }: Props) {
  const chapter = CHAPTERS.find((c) => c.id === level.chapter)!;
  const chLevels = levelsOf(level.chapter);
  const lp = progress.levels[level.id];
  const speed = progress.settings.speed || 1;
  const sound = progress.settings.sound;

  // ---- student's work
  const [code, setCode] = useState<string>(() => lp?.code ?? level.starterCode ?? "");
  const [fill, setFill] = useState<string[]>(() => lp?.fill ?? Array(blankCount(level)).fill(""));
  const [order, setOrder] = useState<number[]>(() => (lp?.order && lp.order.length === (level.reorderLines?.length ?? 0) ? lp.order : (level.reorderLines || []).map((_, i) => i)));
  const work = useMemo(() => ({ code, fill, order }), [code, fill, order]);
  const script = useMemo(() => assembleCode(level, work), [level, work]);

  // persist work (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      update((p) => {
        const cur = p.levels[level.id] || { solved: false, best: 0, hints: 0 };
        return { ...p, levels: { ...p.levels, [level.id]: { ...cur, code, fill, order } } };
      });
    }, 400);
    return () => clearTimeout(t);
  }, [code, fill, order, level.id, update]);

  // ---- run state
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<LevelOutcome | null>(null);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [cust, setCust] = useState(0);
  const [idx, setIdx] = useState(0);
  const [queue, setQueue] = useState<number[]>([]);
  const [qpos, setQpos] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [awarded, setAwarded] = useState<{ points: number; already: boolean } | null>(null);
  const [runCode, setRunCode] = useState("");
  const firstFinish = useRef(false);
  const stepMode = useRef(false);

  const hintsUsed = lp?.hints ?? 0;
  const worth = pointsFor(level, hintsUsed);

  // ---- fire drill timer
  const [timeLeft, setTimeLeft] = useState(level.timer ?? 0);
  const [timeUp, setTimeUp] = useState(false);
  const solvedNow = outcome?.pass && phase === "finished";
  useEffect(() => {
    if (!level.timer || timeUp || solvedNow) return;
    const t = setInterval(() => setTimeLeft((s) => {
      if (s <= 1) { setTimeUp(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [level.timer, timeUp, solvedNow]);

  // ---- derived display
  const tl = timelines[cust];
  const frame = tl ? tl.frames[Math.min(idx, tl.frames.length - 1)] : null;
  const io = tl && frame ? tl.io.slice(0, frame.ioCount) : [];
  const custOutcome = outcome?.customers[cust];
  const compileAccident = outcome && !timelines.length ? outcome.accident ?? null : null;
  const frameAccident = frame?.done && (frame.error || frame.stopped) ? custOutcome?.accident ?? null : null;
  const accident = compileAccident || frameAccident;
  const vars = frame ? frame.g : presetVars(level.customers[cust]?.globals);
  const errorLine = accident?.line ?? null;
  const execLine = phase === "idle" || !frame ? 0 : frame.line;
  const customer = level.customers[cust] ?? null;

  const endOfCustomer = frame?.done && (phase === "reacting" || phase === "finished");
  let customerMood: CustomerMood = "waiting";
  if (frame?.input) customerMood = "talking";
  if (endOfCustomer && custOutcome) customerMood = custOutcome.pass ? (phase === "finished" && outcome?.pass ? "cheer" : "happy") : "unhappy";
  if (compileAccident) customerMood = "unhappy";

  let pyuMood: PyuMood = "idle";
  if (phase === "running" || phase === "playing" || phase === "paused") pyuMood = "cooking";
  if (frame?.stopped === "steps") pyuMood = "dizzy";
  else if (accident) pyuMood = "panicked";
  if (phase === "reacting" && custOutcome && !accident) pyuMood = custOutcome.pass ? "happy" : "confused";
  if (phase === "finished" && outcome) pyuMood = outcome.pass ? "proud" : accident ? "panicked" : "sheepish";

  const fireLevel = level.scene !== "fire" ? 0 : timeUp ? 1 : solvedNow ? 0 : (() => {
    const stages = level.fireStages?.length ?? 1;
    const out = outcome ? (outcome.pass ? stages : outcome.fireOut) : 0;
    const remaining = level.fireStages ? (stages - out) / stages : outcome?.pass ? 0 : 1;
    const t = level.timer ? 1 - timeLeft / level.timer : 0;
    return remaining * (0.45 + 0.55 * t);
  })();

  // ---- running
  const startRun = useCallback(async (asStep: boolean) => {
    if (level.mode === "fill" && fill.some((f) => !f.trim())) {
      setNotice("Fill in every blank before cooking.");
      return;
    }
    setNotice(null);
    setShowResult(false);
    setPhase("running");
    stepMode.current = asStep;
    const codeNow = script;
    const result = await getRunner().run(buildPayload(level, codeNow));
    const out = evaluateLevel(level, result, codeNow);
    const tls = result.runs.map(buildTimeline);
    // Animate visible customers up to (and including) the first failure.
    let q: number[] = [];
    if (!result.compile && tls.length) {
      for (const c of out.customers) {
        if (!c.hidden) q.push(c.index);
        if (!c.pass) { if (c.hidden) q.push(c.index); break; }
      }
      if (!q.length) q = [0];
    }
    setOutcome(out);
    setTimelines(tls);
    setRunCode(codeNow);
    setQueue(q);
    setQpos(0);
    setCust(q[0] ?? 0);
    setIdx(0);
    if (!tls.length) {
      firstFinish.current = false;
      setShowResult(true);
      setPhase("finished");
    } else {
      firstFinish.current = true;
      setPhase(asStep ? "paused" : "playing");
    }
  }, [level, script, fill]);

  const finish = useCallback(() => {
    setPhase("finished");
    if (!firstFinish.current) return;
    firstFinish.current = false;
    setShowResult(true);
  }, []);

  // award + effects when a run finishes
  useEffect(() => {
    if (phase !== "finished" || !showResult || !outcome) return;
    if (outcome.pass) {
      const pts = pointsFor(level, hintsUsed);
      const prev = progress.levels[level.id];
      const already = !!prev?.solved && prev.best >= pts;
      setAwarded({ points: pts, already });
      update((p) => {
        const cur = p.levels[level.id] || { solved: false, best: 0, hints: 0 };
        return { ...p, levels: { ...p.levels, [level.id]: { ...cur, solved: true, best: Math.max(cur.best || 0, pts) } } };
      });
      play("success", sound);
      import("canvas-confetti").then(({ default: confetti }) => {
        const opts = { particleCount: 70, spread: 65, startVelocity: 45, ticks: 160, disableForReducedMotion: true, zIndex: 60 };
        confetti({ ...opts, angle: 60, origin: { x: 0, y: 0.75 } });
        confetti({ ...opts, angle: 120, origin: { x: 1, y: 0.75 } });
      }).catch(() => undefined);
    } else {
      play("fail", sound);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, showResult]);

  const endCustomer = useCallback(() => {
    if (qpos < queue.length - 1) {
      const nq = qpos + 1;
      setQpos(nq);
      setCust(queue[nq]);
      setIdx(0);
      setPhase(stepMode.current ? "paused" : "playing");
    } else finish();
  }, [qpos, queue, finish]);

  const advance = useCallback(() => {
    if (!tl) return;
    if (idx < tl.frames.length - 1) {
      const next = tl.frames[idx + 1];
      if (next.kind === "print") play("print", sound);
      setIdx(idx + 1);
    } else {
      setPhase("reacting");
    }
  }, [tl, idx, sound]);

  // playback clock
  useEffect(() => {
    if (phase === "playing" && tl && frame) {
      const t = setTimeout(advance, frameDelay(frame, tl.frames.length) / speed);
      return () => clearTimeout(t);
    }
    if (phase === "reacting") {
      const t = setTimeout(endCustomer, stepMode.current ? 250 : 950 / speed);
      return () => clearTimeout(t);
    }
  }, [phase, tl, frame, advance, endCustomer, speed]);

  const cook = useCallback(() => {
    if (timeUp) return;
    if (phase === "paused" && script === runCode) { stepMode.current = false; setPhase("playing"); return; }
    if (phase === "playing") { setPhase("paused"); stepMode.current = true; return; }
    if (phase === "running") return;
    startRun(false);
  }, [phase, startRun, script, runCode, timeUp]);

  const step = useCallback(() => {
    if (timeUp || phase === "running") return;
    if (phase === "paused" && script === runCode) { advance(); return; }
    if (phase === "playing") { setPhase("paused"); stepMode.current = true; return; }
    if (phase === "reacting") { endCustomer(); return; }
    startRun(true);
  }, [phase, advance, startRun, script, runCode, endCustomer, timeUp]);

  const skip = useCallback(() => {
    if (!timelines.length || !queue.length) return;
    const last = queue[queue.length - 1];
    setQpos(queue.length - 1);
    setCust(last);
    setIdx(timelines[last].frames.length - 1);
    finish();
  }, [timelines, queue, finish]);

  const reset = useCallback(() => {
    setPhase("idle");
    setOutcome(null);
    setTimelines([]);
    setCust(0);
    setIdx(0);
    setShowResult(false);
    setNotice(null);
  }, []);

  const replay = (i: number) => {
    if (!timelines[i]) return;
    setShowResult(false);
    setQueue([i]);
    setQpos(0);
    setCust(i);
    setIdx(0);
    stepMode.current = false;
    setPhase("playing");
  };

  const restoreStarter = () => {
    if (!confirm("Put the original recipe back? Your current code will be replaced.")) return;
    setCode(level.starterCode ?? "");
    setFill(Array(blankCount(level)).fill(""));
    setOrder((level.reorderLines || []).map((_, i) => i));
    reset();
  };

  // keyboard shortcuts outside Monaco
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inMonaco = (e.target as HTMLElement | null)?.closest?.(".monaco-editor");
      if (inMonaco) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); cook(); }
      else if (e.key === "F10") { e.preventDefault(); step(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cook, step]);

  const revealHint = () => {
    if (hintsUsed >= level.hints.length) return;
    update((p) => {
      const cur = p.levels[level.id] || { solved: false, best: 0, hints: 0 };
      return { ...p, levels: { ...p.levels, [level.id]: { ...cur, hints: Math.min(level.hints.length, (cur.hints || 0) + 1) } } };
    });
  };

  const runLabel = level.runLabel === "Day" ? "Day" : "Customer";
  const who = customer ? (level.runLabel === "Day" || /^(Day|Night) /.test(customer.name) ? customer.name : `${runLabel} ${cust + 1} · ${customer.name}`) : "";
  const busy = phase === "running";
  const playing = phase === "playing";
  const levelNo = chLevels.findIndex((l) => l.id === level.id) + 1;
  const edited = phase !== "idle" && script !== runCode;
  const stale = edited && (phase === "paused" || phase === "finished");

  const timerBadge = level.timer ? (
    <div className={`flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-sm font-bold shadow ${timeLeft < 60 ? "bg-red-600 text-white" : "bg-stone-800 text-amber-100"}`} role="timer" aria-label="Time left">
      <Timer className="h-4 w-4" /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
      {level.fireStages && <span className="ml-1 font-sans text-xs font-normal">🧯 {outcome?.pass ? level.fireStages.length : outcome?.fireOut ?? 0}/{level.fireStages.length}</span>}
    </div>
  ) : null;

  const overlay = (
    <>
      {showResult && outcome && phase === "finished" && (
        <ResultCard outcome={outcome} level={level} points={awarded?.points ?? worth} bestAlready={!!awarded?.already}
          onNext={onNext} nextLabel={nextLabel}
          onRetry={() => { setShowResult(false); reset(); }} />
      )}
      {timeUp && (
        <div className="absolute inset-0 z-40 grid place-items-center bg-black/40 p-3">
          <div className="anim-pop max-w-sm rounded-3xl border-4 border-red-400 bg-[var(--panel)] p-5 text-center shadow-2xl" role="dialog">
            <div className="text-3xl">⏰🚒</div>
            <div className="font-display text-2xl font-bold">Time&apos;s up!</div>
            <p className="mt-1 text-sm">The fire brigade arrived to help. Nothing is lost: your code is still here. Take a breath and try again.</p>
            <button className="btn btn-primary mt-3 w-full justify-center" autoFocus onClick={() => { setTimeUp(false); setTimeLeft(level.timer ?? 0); reset(); }}>
              <RotateCcw className="h-4 w-4" /> Restart the timer
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-3 pb-10 sm:px-4" style={{ ["--accent" as string]: chapter.accent }}>
      {header}
      {/* breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button className="btn py-1" onClick={onExit}><ArrowLeft className="h-4 w-4" /> <MapIcon className="h-4 w-4" /> Map</button>
        <span className="font-semibold" style={{ color: chapter.accent }}>Ch {chapter.id} · {chapter.title}</span>
        <span className="opacity-60">·</span>
        <span>Level {levelNo}/{chLevels.length}</span>
        <span className="opacity-60">·</span>
        <span className="font-display text-base font-semibold">{level.id} {level.title}</span>
        <span className="rounded-full border px-2 text-xs opacity-80" style={{ borderColor: "var(--line)" }}>{level.concept}</span>
        <span className="ml-auto flex gap-1" aria-label="Level progress">
          {chLevels.map((l) => (
            <span key={l.id} title={`${l.id} ${l.title}`} className="inline-block h-2.5 w-2.5 rounded-full border"
              style={{ borderColor: chapter.accent, background: progress.levels[l.id]?.solved ? chapter.accent : l.id === level.id ? `color-mix(in srgb, ${chapter.accent} 45%, transparent)` : "transparent" }} />
          ))}
        </span>
      </div>

      <Kitchen
        level={level}
        chapter={chapter}
        vars={vars}
        stack={frame?.st ?? []}
        loops={frame?.loops}
        cond={frame?.cond}
        prints={io.filter((x) => x.kind === "print").map((x) => (x as { text: string }).text)}
        newPrint={frame?.kind === "print"}
        input={frame?.input ?? null}
        ret={frame?.ret}
        customer={customer}
        customerIndex={cust}
        customerMood={customerMood}
        pyuMood={pyuMood}
        accident={accident}
        result={phase === "finished" && outcome ? (outcome.pass ? "success" : "fail") : "none"}
        fireLevel={fireLevel}
        overlay={overlay}
        topRight={timerBadge}
      />

      {/* order */}
      <div className="panel p-3 sm:p-4" style={{ borderLeft: `6px solid ${chapter.accent}` }}>
        <div className="flex flex-col gap-2 lg:flex-row lg:gap-6">
          <div className="lg:w-[36%]">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-60">Story</div>
            <p className="text-[14.5px] leading-relaxed opacity-90">{level.story}</p>
            {level.alarm && (
              <div className="mt-2 rounded-lg border-2 border-red-500 bg-red-500/10 px-2 py-1.5 font-mono text-[12.5px] text-red-800 dark:text-red-200">
                🚨 <b>ALARM:</b> {level.alarm}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: chapter.accent }}>Order</div>
            <RichText text={level.goal} className="text-[15px] leading-relaxed" />
            {level.picture && (
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {level.picture.map((p) => (
                  <div key={p.label} className="rounded-xl border p-2 text-center" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>
                    <div className="text-3xl">{p.emoji}</div>
                    <div className="text-xs font-semibold">{p.label}</div>
                  </div>
                ))}
              </div>
            )}
            {level.notes && (
              <ul className="mt-2 space-y-0.5 text-[13px] opacity-80">
                {level.notes.map((n) => <li key={n}>📝 <RichText text={n} className="inline-block" /></li>)}
              </ul>
            )}
            {level.customers.length > 1 && (
              <div className="mt-2 text-[12.5px] opacity-70">
                {level.runLabel === "Day"
                  ? `Pyu will test your recipe on ${level.customers.length} different days${level.customers.some((c) => c.hidden) ? " (some are secret)" : ""}.`
                  : `${level.customers.length} customers will be served${level.customers.some((c) => c.hidden) ? ", some of them secret" : ""}. Your recipe must work for every one.`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* recipe + execution */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="panel flex flex-col gap-2 p-3">
          <div className="flex items-center justify-between">
            <div className="font-display text-lg font-semibold">📜 Recipe <span className="text-xs font-normal opacity-60">(real Python)</span></div>
            <button className="text-xs underline opacity-60 hover:opacity-100" onClick={restoreStarter}>restore original</button>
          </div>
          {level.mode === "fill" ? (
            <FillEditor template={level.fillTemplate || ""} values={fill} onChange={setFill} execLine={execLine} errorLine={errorLine} onCook={cook} />
          ) : level.mode === "reorder" ? (
            <ReorderEditor lines={level.reorderLines || []} order={order} onChange={setOrder} execLine={execLine} errorLine={errorLine} />
          ) : (
            <CodeEditor value={code} onChange={setCode} execLine={execLine} errorLine={errorLine} errorMessage={accident?.python} dark={dark} onCook={cook} onStep={step} />
          )}
          {notice && <div className="rounded-lg bg-amber-500/15 px-2 py-1 text-sm">✋ {notice}</div>}
          {stale && <div className="text-xs opacity-70">✏️ You changed the recipe. Press Cook to run the new version.</div>}
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn btn-primary text-base" onClick={cook} disabled={busy || timeUp} title="Cook (Ctrl/Cmd + Enter)">
              {playing ? <><Pause className="h-4 w-4" /> Pause</> : phase === "paused" && !edited ? <><Play className="h-4 w-4" /> Continue</> : <><Play className="h-4 w-4" /> {busy ? "Cooking…" : "Cook"}</>}
            </button>
            <button className="btn" onClick={step} disabled={busy || timeUp} title="Step one event (F10)"><SkipForward className="h-4 w-4" /> Step</button>
            <button className="btn" onClick={reset} disabled={busy} title="Reset the kitchen (keeps your code)"><RotateCcw className="h-4 w-4" /> Reset</button>
            {(playing || phase === "paused" || phase === "reacting") && (
              <button className="btn" onClick={skip} title="Skip to the result"><FastForward className="h-4 w-4" /> Skip</button>
            )}
            <span className="ml-auto hidden text-[11px] opacity-60 sm:inline"><span className="kbd">Ctrl</span>+<span className="kbd">Enter</span> cook · <span className="kbd">F10</span> step</span>
          </div>
          {outcome && outcome.customers.length > 0 && (
            <CustomerStrip customers={outcome.customers} extras={outcome.extras} selected={cust} onSelect={replay} label={runLabel} />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel flex flex-1 flex-col p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-display text-lg font-semibold">👀 Execution</div>
              <div className="flex items-center gap-1 text-xs" role="group" aria-label="Animation speed">
                <span className="opacity-60">Speed</span>
                {[0.5, 1, 2].map((s) => (
                  <button key={s} className={`rounded-md border px-1.5 py-0.5 font-mono ${speed === s ? "text-white" : ""}`}
                    style={{ borderColor: "var(--line)", background: speed === s ? chapter.accent : "transparent" }}
                    onClick={() => update((p) => ({ ...p, settings: { ...p.settings, speed: s } }))} aria-pressed={speed === s}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <ExecutionPanel frame={phase === "idle" ? null : frame} io={io} who={who} speaker={customer && !/^(Day|Night) /.test(customer.name) ? customer.name : "The customer"} accident={accident} idle={phase === "idle"} busy={busy}
              step={tl && phase !== "idle" ? { i: idx, n: tl.frames.length } : undefined} />
          </div>
          <HintPanel hints={level.hints} used={hintsUsed} onReveal={revealHint} points={worth} />
        </div>
      </div>
    </div>
  );
}

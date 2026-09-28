"use client";

import type { Explained } from "@/lib/errors";
import type { Chapter, CondInfo, Customer, Level, LoopInfo, SafeValue, StackFrame, VarMap } from "@/lib/types";
import { CustomerFigure, Pyu, type CustomerMood, type PyuMood } from "./Characters";
import { RecipeWall, Shelf } from "./Shelf";
import { SceneDecor, StationWidget } from "./Widgets";

export type KitchenProps = {
  level: Level;
  chapter: Chapter;
  vars: VarMap;
  stack: StackFrame[];
  loops?: LoopInfo[];
  cond?: CondInfo;
  prints: string[];
  newPrint?: boolean;
  input?: { prompt: string; value: string } | null;
  ret?: { fn: string; value?: SafeValue; raised?: boolean };
  customer: Customer | null;
  customerIndex: number;
  customerMood: CustomerMood;
  pyuMood: PyuMood;
  accident?: Explained | null;
  result: "none" | "success" | "fail";
  fireLevel?: number;
  overlay?: React.ReactNode;
  topRight?: React.ReactNode;
};

function Bubble({ children, side = "left", tone = "light" }: { children: React.ReactNode; side?: "left" | "right"; tone?: "light" | "warn" }) {
  return (
    <div className={`anim-bubble relative max-w-[210px] rounded-2xl border-2 px-3 py-1.5 text-sm font-bold shadow-md ${tone === "warn" ? "border-red-400 bg-red-50 text-red-900" : "border-stone-300 bg-white text-stone-800"}`}>
      {children}
      <span className={`absolute -bottom-2 h-3 w-3 rotate-45 border-b-2 border-r-2 ${tone === "warn" ? "border-red-400 bg-red-50" : "border-stone-300 bg-white"} ${side === "left" ? "left-5" : "right-5"}`} />
    </div>
  );
}

const lookup = (name: string, vars: VarMap, stack: StackFrame[]) => {
  const top = stack[stack.length - 1];
  return top?.loc[name] ?? vars[name];
};

export default function Kitchen(p: KitchenProps) {
  const { level, chapter } = p;
  const isDay = level.runLabel === "Day";
  const bindings = level.bindings || [];
  const condVars: string[] = p.cond ? Array.from(p.cond.text.match(/[A-Za-z_]\w*/g) || []) : [];
  const inner = p.loops && p.loops.length ? p.loops[p.loops.length - 1] : undefined;
  const loopValue = inner && !inner.header ? inner.value : undefined;
  const ghost = p.accident?.kind === "missing" ? (p.accident.python?.match(/'([^']+)'/)?.[1] ?? null) : null;
  const lastTickets = p.prints.slice(-3);
  const custName = p.customer?.name ?? "";
  const fire = p.fireLevel ?? 0;

  let customerLine: React.ReactNode = null;
  if (p.input) customerLine = <>&ldquo;{p.input.value}&rdquo;</>;
  else if (p.customerMood === "happy" || p.customerMood === "cheer") customerLine = <>Delicious! 😋</>;
  else if (p.customerMood === "unhappy") customerLine = <>Hmm… that&apos;s not right 😕</>;
  else if (p.customer?.says && p.customerMood === "waiting") customerLine = <>{p.customer.says}</>;

  let pyuLine: React.ReactNode = null;
  if (p.input) pyuLine = p.input.prompt ? <>{p.input.prompt}</> : <>…?</>;
  else if (p.accident) pyuLine = <span>{p.accident.emoji} Uh oh!</span>;
  else if (p.result === "success") pyuLine = <>Perfect! ✨</>;

  return (
    <div className="panel relative overflow-hidden" style={{ ["--accent" as string]: chapter.accent }}>
      {/* room */}
      <div className="kitchen-wall relative h-[250px] overflow-hidden sm:h-[285px]">
        <div className="kitchen-tiles absolute inset-x-0 top-[38%] bottom-[30%] opacity-70" />
        {/* hanging sign */}
        <div className="absolute left-1/2 top-0 hidden -translate-x-1/2 sm:block">
          <div className="mx-auto h-3 w-px bg-stone-500" />
          <div className="rounded-lg border-2 px-3 py-0.5 font-display text-sm font-semibold text-white shadow" style={{ background: chapter.accent, borderColor: "rgba(0,0,0,.2)" }}>
            {chapter.icon} {chapter.area} · {chapter.plainTitle}
          </div>
        </div>
        {/* window */}
        <div className="absolute left-[22%] top-[10%] hidden h-[70px] w-[110px] overflow-hidden rounded-t-[40px] border-4 border-amber-900/60 bg-gradient-to-b from-sky-300 to-sky-100 dark:from-indigo-900 dark:to-indigo-700 md:block">
          <div className="absolute bottom-0 left-2 h-8 w-5 bg-slate-400/70 dark:bg-slate-900/70" />
          <div className="absolute bottom-0 left-9 h-12 w-6 bg-slate-500/70 dark:bg-slate-900/80" />
          <div className="absolute bottom-0 left-16 h-6 w-8 bg-slate-400/70 dark:bg-slate-900/70" />
          {level.scene === "grand" && <div className="absolute right-2 top-2 text-lg anim-float">🎆</div>}
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-amber-900/60" />
        </div>
        {/* ticket printer */}
        <div className="absolute right-2 top-2 z-10 flex flex-col items-end sm:right-3 sm:top-3">
          {p.topRight}
          <div className="mt-1 flex w-[128px] flex-col items-center sm:w-[180px]">
            <div className="flex h-7 w-full items-center justify-between rounded-md bg-stone-700 px-2 text-[10px] font-bold uppercase tracking-wider text-stone-100 shadow">
              <span>🧾 tickets</span>
              <span className={`h-2 w-2 rounded-full ${p.newPrint ? "bg-green-400" : "bg-stone-500"}`} />
            </div>
            <div className="flex w-[88%] flex-col gap-0.5">
              {lastTickets.map((t, i) => {
                const isNew = p.newPrint && i === lastTickets.length - 1;
                return (
                  <div key={`${p.prints.length - lastTickets.length + i}`} className={`${isNew ? "anim-ticket" : ""} ${i < lastTickets.length - 1 ? "hidden sm:block" : ""} truncate border-x border-b border-stone-300 bg-[#fffef5] px-1.5 py-0.5 font-mono text-[10.5px] text-stone-800 shadow-sm`}
                    title={t}>{t || " "}</div>
                );
              })}
            </div>
          </div>
        </div>

        {/* counter */}
        <div className="absolute inset-x-0 bottom-0 z-[15] flex h-[30%] flex-col">
          <div className="counter-top h-[16px] shrink-0" />
          <div className="counter-front flex-1" />
        </div>

        {/* flames for the fire chapter */}
        {level.scene === "fire" && fire > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-around" aria-hidden>
            {Array.from({ length: 9 }).map((_, i) => (
              <svg key={i} viewBox="0 0 40 60" className="anim-flame" style={{ width: 30 + fire * 40, height: 30 + fire * 80, animationDelay: `${i * 0.13}s`, opacity: 0.55 + fire * 0.4 }}>
                <path d="M20 58 C 2 58, 0 36, 12 24 C 12 34, 18 34, 18 28 C 18 16, 24 8, 22 0 C 34 12, 40 30, 34 44 C 32 52, 28 58, 20 58 Z" fill="#f97316" />
                <path d="M20 58 C 10 58, 10 44, 16 38 C 18 44, 22 42, 22 36 C 28 42, 30 52, 20 58 Z" fill="#fde047" />
              </svg>
            ))}
          </div>
        )}
        {level.scene === "fire" && fire > 0 && (
          <div className="pointer-events-none absolute left-[38%] top-8 z-10 text-3xl" aria-hidden>
            <span className="anim-smoke inline-block">💨</span>
            <span className="anim-smoke inline-block" style={{ animationDelay: ".6s" }}>💨</span>
          </div>
        )}

        {/* Pyu */}
        <div className="absolute bottom-[13%] left-[1%] z-10 sm:left-[2%]">
          {pyuLine && (
            <div key={String(p.input?.prompt ?? p.accident?.title ?? p.result)} className="absolute -top-12 left-[62%] z-20 w-max max-w-[140px] sm:-top-9 sm:max-w-[240px]">
              <Bubble tone={p.accident ? "warn" : "light"}>{pyuLine}</Bubble>
            </div>
          )}
          <div className="w-[96px] sm:w-[140px]">
            <Pyu mood={p.pyuMood} size={140} />
          </div>
        </div>

        {/* station */}
        <div className="absolute bottom-[21%] left-[22%] right-[22%] z-20 flex items-end justify-center gap-1 sm:gap-3">
          {bindings.length === 0 ? (
            <SceneDecor scene={level.scene} />
          ) : (
            bindings.map((b) => (
              <StationWidget key={b.object + b.variable} b={b}
                value={lookup(b.variable, p.vars, p.stack)}
                extra={b.extra ? lookup(b.extra, p.vars, p.stack) : undefined}
                flash={condVars.includes(b.variable) || (!!b.extra && condVars.includes(b.extra))}
                loopValue={loopValue} prints={p.prints} />
            ))
          )}
        </div>
        {p.accident && (
          <div className="pointer-events-none absolute bottom-[40%] left-1/2 z-20 -translate-x-1/2 text-4xl" aria-hidden>
            <span className="anim-smoke inline-block">💨</span>
            <span className="anim-smoke inline-block" style={{ animationDelay: ".5s" }}>{p.accident.emoji}</span>
          </div>
        )}
        {p.result === "success" && (
          <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
            {["12% 30%", "30% 18%", "52% 26%", "70% 16%", "84% 36%", "44% 48%"].map((pos, i) => (
              <span key={i} className="anim-sparkle absolute text-2xl" style={{ left: pos.split(" ")[0], top: pos.split(" ")[1], animationDelay: `${i * 0.12}s` }}>✨</span>
            ))}
          </div>
        )}

        {/* customer or day sign */}
        <div className="absolute bottom-[3%] right-[1%] z-[16] flex flex-col items-end sm:right-[2%]">
          {isDay || !p.customer ? (
            <div key={p.customerIndex} className="anim-walkin mb-2 rounded-lg border-4 border-amber-900/70 bg-stone-800 px-3 py-2 text-center font-hand text-white shadow-lg">
              <div className="text-[11px] uppercase tracking-widest opacity-70">today is</div>
              <div className="text-2xl font-bold leading-6">{custName || "Day 1"}</div>
            </div>
          ) : (
            <div key={p.customerIndex} className="anim-walkin relative flex flex-col items-center">
              {customerLine && (
                <div key={String(p.input?.value ?? p.customerMood)} className="absolute -top-12 right-[30%] z-20 w-max max-w-[140px] sm:-top-9 sm:max-w-[240px]">
                  <Bubble side="right">{customerLine}</Bubble>
                </div>
              )}
              <div className="w-[76px] sm:w-[104px]">
                <CustomerFigure seed={p.customerIndex} mood={p.customerMood} size={104} />
              </div>
              <div className="-mt-1 rounded-full bg-black/60 px-2 text-[11px] font-bold text-white">{custName}</div>
            </div>
          )}
        </div>

      </div>

      {/* recipe wall + shelf */}
      <div className="relative" style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--wall-b) 80%, black 5%), var(--wall-b))" }}>
        <RecipeWall vars={p.vars} stack={p.stack} ret={p.ret} />
        <Shelf vars={p.vars} mystery={level.mysteryVars} ghost={ghost} glowNames={condVars} />
      </div>
      {p.overlay}
    </div>
  );
}

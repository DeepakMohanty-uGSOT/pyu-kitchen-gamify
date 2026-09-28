"use client";

import { Play } from "lucide-react";
import { useEffect, useState } from "react";
import type { SafeValue } from "@/lib/types";
import { Byte, CustomerFigure, Pyu } from "./kitchen/Characters";
import { Jar } from "./kitchen/Shelf";

/** A looping mini-demo of the game: code types itself, Cook is pressed, the kitchen reacts. */

type Line = { code: string; jar?: { name: string; sv: SafeValue }; ticket?: string };

const LINES: Line[] = [
  { code: "rice = 5", jar: { name: "rice", sv: { t: "int", v: 5, r: "5" } } },
  { code: 'chef = "Pyu"', jar: { name: "chef", sv: { t: "str", v: "Pyu", r: "'Pyu'" } } },
  { code: 'print(f"Hi, {chef}!")', ticket: "Hi, Pyu!" },
];

const CHAR_MS = 55;
const TYPE_END = LINES.reduce((a, l) => a + l.code.length, 0) * CHAR_MS + 300;
const PRESS_AT = TYPE_END + 350;
const RUN_START = PRESS_AT + 450;
const LINE_MS = 1000;
const SUCCESS_AT = RUN_START + LINES.length * LINE_MS;
const LOOP_MS = SUCCESS_AT + 2800;

function colorize(code: string) {
  const parts = code.split(/("[^"]*"?|\b\d+\b|\bprint\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('"')) return <span key={i} className="text-green-400">{p}</span>;
    if (/^\d+$/.test(p)) return <span key={i} className="text-orange-300">{p}</span>;
    if (p === "print") return <span key={i} className="text-sky-300">{p}</span>;
    return <span key={i}>{p}</span>;
  });
}

export default function HeroDemo() {
  const [t, setT] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setT(SUCCESS_AT + 100); return; }
    const start = performance.now();
    const id = setInterval(() => setT((performance.now() - start) % LOOP_MS), 50);
    return () => clearInterval(id);
  }, []);

  // how much of each line is typed
  let budget = Math.floor(t / CHAR_MS);
  const typed = LINES.map((l) => {
    const n = Math.max(0, Math.min(l.code.length, budget));
    budget -= l.code.length;
    return l.code.slice(0, n);
  });
  const typing = t < TYPE_END;
  const caretLine = typing ? Math.max(0, typed.findIndex((s, i) => s.length < LINES[i].code.length)) : -1;
  const pressed = t >= PRESS_AT && t < RUN_START + 150;
  const running = t >= RUN_START && t < SUCCESS_AT;
  const execLine = running ? Math.floor((t - RUN_START) / LINE_MS) : -1;
  const ranLines = t >= RUN_START ? Math.min(LINES.length, Math.floor((t - RUN_START) / LINE_MS) + 1) : 0;
  const success = t >= SUCCESS_AT;
  const jars = LINES.slice(0, ranLines).filter((l) => l.jar).map((l) => l.jar!);
  const ticket = LINES.slice(0, ranLines).find((l) => l.ticket)?.ticket;
  const mood = success ? "proud" : running ? "cooking" : "idle";

  return (
    <div className="relative mx-auto w-full max-w-[500px]" aria-label="Animated demo: code is typed, Cook is pressed and the kitchen shows the result" role="img">
      {/* Byte's hint bubble */}
      <div className="absolute -right-2 -top-10 z-20 hidden items-end gap-1 sm:flex">
        <div className="anim-float rounded-2xl rounded-br-sm border bg-white px-3 py-1.5 text-[12.5px] font-bold text-stone-800 shadow-lg" style={{ borderColor: "#bfdbfe" }}>
          {success ? "You did it! 🎉" : running ? "Watch it run! 👀" : typing ? "Type some Python…" : "Now press Cook!"}
        </div>
        <Byte size={46} talking />
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 shadow-2xl" style={{ borderColor: "color-mix(in srgb, #f59e0b 45%, var(--line))", background: "var(--panel)" }}>
        {/* window bar */}
        <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>
          <span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-3 rounded-md border px-2 py-0.5 font-mono text-[11px]" style={{ borderColor: "var(--line)" }}>📜 recipe.py</span>
          <span className="ml-auto text-[11px] font-semibold opacity-70">Level 1.1 · Label the Jars</span>
        </div>

        {/* code editor */}
        <div className="bg-[#1d1611] px-3 py-3 font-mono text-[13.5px] leading-7 text-amber-50 sm:text-[14.5px]">
          {LINES.map((l, i) => (
            <div key={i} className={`flex rounded-md px-1 transition-colors duration-300 ${execLine === i ? "bg-yellow-400/25" : ""}`}>
              <span className="w-6 shrink-0 select-none text-right text-[12px] text-stone-500">{execLine === i ? "▶" : i + 1}</span>
              <span className="ml-3 whitespace-pre">
                {colorize(typed[i])}
                {caretLine === i && <span className="ml-px inline-block h-4 w-[7px] translate-y-[3px] animate-pulse bg-amber-300" />}
              </span>
            </div>
          ))}
        </div>

        {/* controls */}
        <div className="flex items-center gap-2 border-y px-3 py-2" style={{ borderColor: "var(--line)" }}>
          <span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-bold text-white transition-all duration-150 ${pressed ? "translate-y-0.5 scale-95 shadow-none" : "shadow-[0_3px_0_#9a3412]"} ${!typing && !running && !success ? "anim-pulse" : ""}`}
            style={{ background: "#ea580c", ["--accent" as string]: "#ea580c" }}>
            <Play className="h-3.5 w-3.5" /> {running ? "Cooking…" : "Cook (run)"}
          </span>
          <span className="rounded-xl border px-2.5 py-1.5 text-sm opacity-70" style={{ borderColor: "var(--line)" }}>Step</span>
          <span className="ml-auto text-[12px] font-semibold opacity-75">
            {running ? `Running line ${execLine + 1}` : success ? "Finished ✓" : typing ? "Writing code…" : "Ready"}
          </span>
        </div>

        {/* mini kitchen */}
        <div className="kitchen-wall relative h-[190px] overflow-hidden sm:h-[205px]">
          <div className="kitchen-tiles absolute inset-x-0 top-[20%] bottom-[34%] opacity-60" />
          <div className="absolute inset-x-0 bottom-0 z-[5] flex h-[34%] flex-col">
            <div className="counter-top h-[10px] shrink-0" /><div className="counter-front flex-1" />
          </div>
          {/* ticket printer */}
          <div className="absolute right-3 top-3 z-10 w-[120px]">
            <div className="rounded-md bg-stone-700 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-stone-100">🧾 tickets</div>
            {ticket && <div key={ticket} className="anim-ticket mx-2 border-x border-b border-stone-300 bg-[#fffef5] px-1.5 py-0.5 font-mono text-[11px] text-stone-800 shadow">{ticket}</div>}
          </div>
          {/* Pyu */}
          <div className="absolute bottom-[18%] left-1 z-[4] w-[92px] sm:w-[104px]">
            <Pyu mood={mood} size={104} />
          </div>
          {/* shelf with jars */}
          <div className="absolute bottom-[36%] left-[30%] right-[26%] z-10 flex items-end justify-center gap-2">
            {jars.map((j) => <Jar key={j.name} name={j.name} sv={j.sv} small />)}
            {!jars.length && <span className="mb-3 rounded-lg bg-black/10 px-2 py-1 text-[11px] opacity-70 dark:bg-white/10">jars appear here</span>}
          </div>
          {/* customer */}
          <div className="absolute bottom-[4%] right-3 z-[6] w-[62px]">
            <CustomerFigure seed={0} mood={success ? "cheer" : ticket ? "happy" : "waiting"} size={62} />
          </div>
          {success && (
            <div className="absolute inset-0 z-20 grid place-items-center">
              <div className="anim-pop rounded-2xl border-4 border-amber-300 bg-[var(--panel)] px-5 py-2 text-center shadow-2xl">
                <div className="font-display text-xl font-bold text-amber-600">✨ DISH PERFECT! ✨</div>
                <div className="text-[12px] font-semibold opacity-80">+20 pts</div>
              </div>
              {["18% 20%", "78% 18%", "30% 72%", "70% 70%", "50% 12%"].map((p, i) => (
                <span key={i} className="anim-sparkle absolute text-xl" style={{ left: p.split(" ")[0], top: p.split(" ")[1], animationDelay: `${i * 0.12}s` }}>✨</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* step indicator */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[12px] font-semibold">
        {[["✍️ Write", typing], ["▶ Cook", pressed || (!typing && t < RUN_START)], ["👀 Watch", running], ["🎉 Done", success]].map(([label, on]) => (
          <span key={label as string} className="rounded-full border px-2.5 py-1 transition-all duration-300"
            style={{ borderColor: on ? "#f59e0b" : "var(--line)", background: on ? "color-mix(in srgb, #f59e0b 22%, var(--panel))" : "var(--panel)", transform: on ? "scale(1.08)" : "scale(1)" }}>
            {label as string}
          </span>
        ))}
      </div>
    </div>
  );
}

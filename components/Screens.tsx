"use client";

import { ArrowDown, ArrowRight, HelpCircle, Home, Lock, Map as MapIcon, Moon, Printer, RotateCcw, Settings, Sun, Volume2, VolumeX, X } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { CHAPTERS, LEVELS, levelsOf, rankFor, RANKS, TOTAL_POINTS } from "@/lib/levels";
import { chapterComplete, chapterPoints, chapterUnlocked, levelUnlocked, totalPoints, type Progress } from "@/lib/progress";
import { Byte, CustomerFigure, Logo, Pyu } from "./kitchen/Characters";
import HeroDemo from "./HeroDemo";

type RunnerState = { status: string; error: string };

// ---------------------------------------------------------------- header

export function Header({ progress, update, dark, onHome, onMap, onReset, onHelp, active }: {
  progress: Progress; update: (fn: (p: Progress) => Progress) => void; dark: boolean; onHome: () => void; onMap: () => void; onReset: () => void; onHelp: () => void;
  active: "home" | "map" | "other";
}) {
  const [open, setOpen] = useState(false);
  const pts = totalPoints(progress);
  const rank = rankFor(pts);
  const s = progress.settings;
  const set = (patch: Partial<Progress["settings"]>) => update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  return (
    <header className="sticky top-0 z-40 -mx-3 mb-1 border-b px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4" style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-2">
        <button onClick={onHome} className="flex items-center gap-2 whitespace-nowrap font-display text-base font-bold sm:text-xl" aria-label="Pyu's Kitchen: go to the home page">
          <Logo size={32} /> <span className="hidden md:inline">Pyu&apos;s Kitchen</span>
        </button>
        <nav className="ml-1 flex items-center gap-1" aria-label="Main">
          <button className={`btn px-2 py-1.5 ${active === "home" ? "btn-primary" : ""}`} style={{ ["--accent" as string]: "#d97706" }} onClick={onHome} aria-current={active === "home" ? "page" : undefined} title="Home">
            <Home className="h-4 w-4" /><span className="hidden sm:inline">Home</span>
          </button>
          <button className={`btn px-2 py-1.5 ${active === "map" ? "btn-primary" : ""}`} style={{ ["--accent" as string]: "#d97706" }} onClick={onMap} aria-current={active === "map" ? "page" : undefined} title="Learning map">
            <MapIcon className="h-4 w-4" /><span className="hidden sm:inline">Map</span>
          </button>
        </nav>
        <span className="hidden rounded-full border px-2 py-0.5 text-xs xl:inline" style={{ borderColor: "var(--line)" }} title="Your rank goes up as you earn points">{rank.icon} {rank.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="whitespace-nowrap rounded-full bg-amber-400/20 px-2.5 py-1 font-display text-sm font-bold" aria-label={`${pts} points`}>⭐ {pts}<span className="hidden sm:inline"> pts</span></span>
          <button className="btn px-2 py-1.5" onClick={onHelp} aria-label="How to play" title="How to play">
            <HelpCircle className="h-4 w-4" /><span className="hidden sm:inline">Help</span>
          </button>
          <button className="btn hidden px-2 py-1.5 sm:inline-flex" onClick={() => set({ sound: !s.sound })} aria-label={s.sound ? "Turn sounds off" : "Turn sounds on"} title={s.sound ? "Sound on" : "Sound off"}>
            {s.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button className="btn hidden px-2 py-1.5 sm:inline-flex" onClick={() => set({ theme: dark ? "light" : "dark" })} aria-label="Switch light or dark mode" title="Light / dark mode">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button className="btn px-2 py-1.5" onClick={() => setOpen(!open)} aria-label="Settings" aria-expanded={open}><Settings className="h-4 w-4" /></button>
            {open && (
              <div className="panel absolute right-0 top-10 z-50 w-[min(18rem,calc(100vw-1.5rem))] p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between font-display font-semibold">Settings <button onClick={() => setOpen(false)} aria-label="Close settings"><X className="h-4 w-4" /></button></div>
                <label className="flex items-center justify-between gap-2 py-1 text-sm">Colours
                  <select className="rounded border bg-transparent px-1 py-0.5" style={{ borderColor: "var(--line)" }} value={s.theme} onChange={(e) => set({ theme: e.target.value as Progress["settings"]["theme"] })}>
                    <option value="system">Same as my device</option><option value="light">Light</option><option value="dark">Dark</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-2 py-1 text-sm">Sound effects
                  <input type="checkbox" checked={s.sound} onChange={(e) => set({ sound: e.target.checked })} />
                </label>
                <label className="flex items-center justify-between gap-2 py-1 text-sm" title="For teachers: open every chapter without finishing the one before">Open all levels (teacher mode)
                  <input type="checkbox" checked={s.unlockAll} onChange={(e) => set({ unlockAll: e.target.checked })} />
                </label>
                <hr className="my-2" style={{ borderColor: "var(--line)" }} />
                <button className="btn w-full justify-center border-red-400 text-red-600" onClick={() => { if (confirm("Delete ALL your progress, points and saved code? This can't be undone.")) { setOpen(false); onReset(); } }}>
                  Start again from zero
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- how to play guide

const STEPS: { icon: string; title: string; text: React.ReactNode }[] = [
  { icon: "🗺️", title: "Open the map", text: <>Press <b>Start cooking</b>. You&apos;ll see the kitchen map with 9 chapters. Start with <b>Chapter 1</b>. The next chapter opens when you finish the one before.</> },
  { icon: "📋", title: "Pick a level", text: <>Press <b>Start</b> on a chapter, then choose the first level that isn&apos;t done yet. Each chapter has 3 to 6 short levels.</> },
  { icon: "🎯", title: "Read the task", text: <>Read the <b>🎯 Your task</b> box. It says exactly what Pyu needs. The <b>💡 New idea</b> box explains the new Python idea with a small example.</> },
  { icon: "✍️", title: "Type your code", text: <>Click inside the <b>✍️ Your code</b> box and type Python. Lines starting with <code className="inline">#</code> are notes for you; Python ignores them. Some levels have <b>empty boxes to fill</b> or <b>cards to drag</b> instead.</> },
  { icon: "▶️", title: "Press Cook (run)", text: <>Press <b>▶ Cook (run)</b>, or <span className="kbd">Ctrl</span>+<span className="kbd">Enter</span>. Python really runs your code. The line running right now is <b>highlighted in yellow</b>, jars fill up on the shelf, and printed messages come out as tickets.</> },
  { icon: "✅", title: "See the result", text: <><b>DISH PERFECT!</b> means you solved it: you earn points and can go to the next level. <b>Not quite</b> means something is off. The message tells you what went wrong, not the answer.</> },
  { icon: "🔁", title: "Fix and try again", text: <>Change your code and press Cook again, as many times as you like. <b>Trying again never costs points.</b> Mistakes are normal and part of learning.</> },
  { icon: "💡", title: "Stuck? Ask Byte", text: <>Press <b>Ask Byte for a hint</b> to get a clue. There are 3 clues per level, from gentle to more specific. Each clue lowers that level&apos;s points by 10%.</> },
];

const SCREEN_PARTS: { icon: string; name: string; text: string }[] = [
  { icon: "👨‍🍳", name: "The kitchen (top)", text: "Pyu acts out your code. Customers ask questions and react to your answer." },
  { icon: "🫙", name: "The shelf of jars", text: "Every variable (a named value) becomes a glass jar. The colour shows its kind: int, float, str or bool." },
  { icon: "🎯", name: "Your task", text: "What Pyu needs this level. Read it carefully: exact spelling and spaces matter." },
  { icon: "✍️", name: "Your code", text: "Where you type Python. Start over puts the starting code back." },
  { icon: "▶️", name: "Cook / Step / Reset", text: "Cook runs your code. Step runs one step at a time. Reset clears the kitchen but keeps your code. Skip jumps to the result." },
  { icon: "🐢", name: "Speed 0.5x · 1x · 2x", text: "Makes the animation slower or faster." },
  { icon: "👀", name: "What's happening", text: "Shows the running line, loop rounds, if-questions (True/False), printed tickets and error messages." },
  { icon: "👥", name: "Result buttons", text: "After cooking, one button per customer or day: ✅ right, ❌ wrong. Click one to replay it." },
];

export function HowToPlay({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-5 text-left">
      <section>
        <h3 className="font-display text-2xl font-bold">🤔 What is Pyu&apos;s Kitchen?</h3>
        <div className="mt-2 space-y-2 text-[15px] leading-relaxed">
          <p>A free game that teaches you <b>Python</b>, a real programming language, starting from zero. You don&apos;t need to install anything, and you don&apos;t need to know any coding.</p>
          <p><b>Chef Pyu</b> 🐍 is a snake chef who does <b>exactly</b> what he&apos;s told, step by step, and never guesses. That&apos;s just how a computer works. You play <b>Byte</b> 🤖, his helper, and you write the instructions (Pyu calls them <i>recipes</i>) in Python.</p>
          <p>When you press <b>Cook</b>, your code really runs, and the kitchen shows what it did. Right code gives a perfect dish. A mistake gives a cold cup of tea, and you learn why.</p>
        </div>
      </section>

      <section>
        <h3 className="font-display text-2xl font-bold">🧭 How to play, step by step</h3>
        <ol className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl border p-3" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
              <div className="flex shrink-0 flex-col items-center">
                <span className="grid h-8 w-8 place-items-center rounded-full font-display text-sm font-bold text-white" style={{ background: "#d97706" }}>{i + 1}</span>
                <span className="mt-1 text-xl">{s.icon}</span>
              </div>
              <div>
                <div className="font-display text-[16px] font-semibold">{s.title}</div>
                <div className="text-[14px] leading-relaxed opacity-90">{s.text}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="font-display text-2xl font-bold">🖥️ The level screen, part by part</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SCREEN_PARTS.map((p) => (
            <div key={p.name} className="flex gap-2.5 rounded-xl border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
              <span className="text-xl">{p.icon}</span>
              <div className="text-[14px]"><b>{p.name}:</b> {p.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-2xl font-bold">✍️ Typing tips for beginners</h3>
        <ul className="mt-2 grid gap-1.5 text-[14.5px] sm:grid-cols-2">
          <li>🔤 Python cares about capitals: <code className="inline">Rice</code> and <code className="inline">rice</code> are different.</li>
          <li>💬 Words (text) go inside quote marks: <code className="inline">&quot;hello&quot;</code>. Numbers don&apos;t: <code className="inline">5</code>.</li>
          <li>↹ Lines under <code className="inline">if</code>, <code className="inline">for</code>, <code className="inline">while</code> or <code className="inline">def</code> are pushed right by 4 spaces. Press <span className="kbd">Tab</span>.</li>
          <li>➕ Lines that start an <code className="inline">if</code>, a loop or a <code className="inline">def</code> end with a colon <code className="inline">:</code></li>
          <li>🔴 A red message isn&apos;t a failure. It tells you which line to look at.</li>
          <li>🐢 Use <b>Step</b> and speed <b>0.5x</b> to watch your code slowly.</li>
        </ul>
      </section>

      {!compact && (
        <section>
          <h3 className="font-display text-2xl font-bold">⭐ Points, ranks and saving</h3>
          <ul className="mt-2 space-y-1 text-[14.5px]">
            <li>🏅 Every chapter is worth <b>100 points</b> (900 in total). Your rank grows from Kitchen Helper to <b>Master Chef</b>.</li>
            <li>💾 Your progress and code are <b>saved automatically</b> in this browser. Come back any time and continue.</li>
            <li>💻 A laptop or computer is easiest for typing code, but phones and tablets work too.</li>
            <li>🌐 The first visit downloads Python into your browser (a few seconds). After that it&apos;s quick.</li>
          </ul>
        </section>
      )}
    </div>
  );
}

export function GuideModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-2 sm:p-6" onClick={onClose} role="dialog" aria-modal="true" aria-label="How to play">
      <div className="anim-fadeup relative my-2 w-full max-w-4xl rounded-3xl border p-4 shadow-2xl sm:p-6" style={{ background: "var(--bg)", borderColor: "var(--line)" }} onClick={(e) => e.stopPropagation()}>
        <button className="btn absolute right-3 top-3 px-2 py-1.5" onClick={onClose} aria-label="Close" autoFocus><X className="h-4 w-4" /></button>
        <HowToPlay compact />
        <div className="mt-4 text-center"><button className="btn btn-primary" style={{ ["--accent" as string]: "#d97706" }} onClick={onClose}>Got it, let&apos;s cook!</button></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- landing

function SectionTitle({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-6 text-center">
      <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">{kicker}</div>
      <h2 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {sub && <p className="mx-auto mt-2 max-w-2xl text-[15px] opacity-80">{sub}</p>}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex items-center justify-center text-amber-500" aria-hidden>
      <ArrowRight className="hidden h-8 w-8 lg:block" strokeWidth={2.5} />
      <ArrowDown className="h-7 w-7 lg:hidden" strokeWidth={2.5} />
    </div>
  );
}

const FLOW = [
  { n: 1, color: "#7c3aed", icon: "🎯", title: "Read the task", text: "Each level tells you what Pyu needs.",
    visual: <div className="rounded-lg border border-violet-400/50 bg-violet-500/10 px-2 py-1.5 text-left text-[12px]"><b>🎯 Your task</b><br />Make a jar called <code className="inline">rice</code> with <b>5</b> inside.</div> },
  { n: 2, color: "#0284c7", icon: "✍️", title: "Write the code", text: "Type a few lines of real Python.",
    visual: <div className="rounded-lg bg-stone-900 px-3 py-2 text-left font-mono text-[13px] text-amber-100"><span className="opacity-40">1 </span>rice = <span className="text-green-400">5</span><span className="anim-pulse ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-amber-300" /></div> },
  { n: 3, color: "#ea580c", icon: "▶️", title: "Press Cook", text: "Python really runs your code, line by line.",
    visual: <div className="flex justify-center"><span className="rounded-xl px-4 py-1.5 font-bold text-white shadow" style={{ background: "#ea580c" }}>▶ Cook (run)</span></div> },
  { n: 4, color: "#16a34a", icon: "👀", title: "Watch & learn", text: "The kitchen shows exactly what happened.",
    visual: (
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col items-center">
          <span className="rounded bg-[#fffbeb] px-1 font-mono text-[10px] font-bold text-stone-800">rice</span>
          <span className="glass grid h-9 w-10 place-items-center rounded-b-xl rounded-t-md border-2 font-mono text-[12px] font-bold">5</span>
        </div>
        <span className="rounded-lg bg-green-600 px-2 py-1 text-[11px] font-bold text-white">✅ DISH PERFECT!</span>
      </div>
    ) },
];

const SCREEN = [
  { n: 1, color: "#d97706", name: "The kitchen", text: "Pyu acts out your code. Customers order and react." },
  { n: 2, color: "#8b5cf6", name: "The jar shelf", text: "Each variable becomes a glass jar you can see." },
  { n: 3, color: "#7c3aed", name: "Your task + New idea", text: "What to do, plus the new idea explained simply." },
  { n: 4, color: "#0284c7", name: "Your code", text: "Where you type Python." },
  { n: 5, color: "#ea580c", name: "Cook · Step · Reset", text: "Run everything, go one step at a time, or start fresh." },
  { n: 6, color: "#e11d48", name: "What's happening", text: "The line running now, loop rounds, output and errors." },
  { n: 7, color: "#2563eb", name: "Ask Byte", text: "3 clues per level if you get stuck." },
];

function Badge({ n, color }: { n: number; color: string }) {
  return <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white shadow ring-2 ring-white/70" style={{ background: color }}>{n}</span>;
}

function ScreenMock() {
  const c = (n: number) => SCREEN[n - 1].color;
  const box = (n: number) => ({ borderColor: c(n), background: `color-mix(in srgb, ${c(n)} 10%, var(--panel))` });
  return (
    <div className="rounded-2xl border-2 p-2.5 shadow-xl sm:p-3" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }} aria-hidden>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 h-2 flex-1 rounded-full bg-black/10 dark:bg-white/10" />
      </div>
      <div className="relative rounded-xl border-2 p-2" style={box(1)}>
        <div className="absolute -left-2 -top-2"><Badge n={1} color={c(1)} /></div>
        <div className="flex h-20 items-end justify-between px-2 sm:h-24">
          <div className="w-12 sm:w-14"><Pyu mood="happy" size={56} /></div>
          <div className="text-2xl sm:text-3xl">🍲</div>
          <div className="w-9 sm:w-11"><CustomerFigure seed={2} mood="happy" size={44} /></div>
        </div>
        <div className="relative mt-1 flex gap-1.5 rounded-lg border-2 border-dashed py-1.5 pl-5 pr-1.5" style={{ borderColor: c(2) }}>
          <div className="absolute -left-2 -top-2"><Badge n={2} color={c(2)} /></div>
          {["rice", "name"].map((j, i) => (
            <div key={j} className="flex flex-col items-center">
              <span className="rounded bg-[#fffbeb] px-1 font-mono text-[8px] font-bold text-stone-800">{j}</span>
              <span className="glass grid h-6 w-8 place-items-center rounded-b-lg rounded-t border font-mono text-[9px] font-bold">{i ? "“Pyu”" : "5"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-2 rounded-xl border-2 px-2 py-1.5" style={box(3)}>
        <div className="absolute -left-2 -top-2"><Badge n={3} color={c(3)} /></div>
        <div className="h-1.5 w-2/3 rounded-full bg-current opacity-30" /><div className="mt-1 h-1.5 w-1/2 rounded-full bg-current opacity-20" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <div className="relative rounded-xl border-2 bg-stone-900 py-1.5 pl-5 pr-2 font-mono text-[9px] leading-4 text-amber-100" style={{ borderColor: c(4) }}>
            <div className="absolute -left-2 -top-2"><Badge n={4} color={c(4)} /></div>
            <div className="rounded bg-yellow-400/25">rice = 5</div><div>name = &quot;Pyu&quot;</div>
          </div>
          <div className="relative flex gap-1 rounded-xl border-2 py-1 pl-5 pr-1" style={box(5)}>
            <div className="absolute -left-2 -top-2"><Badge n={5} color={c(5)} /></div>
            <span className="rounded bg-orange-600 px-1.5 text-[9px] font-bold text-white">▶ Cook</span>
            <span className="rounded border px-1 text-[9px]" style={{ borderColor: "var(--line)" }}>Step</span>
            <span className="rounded border px-1 text-[9px]" style={{ borderColor: "var(--line)" }}>Reset</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative flex-1 rounded-xl border-2 py-1.5 pl-5 pr-2 text-[9px]" style={box(6)}>
            <div className="absolute -left-2 -top-2"><Badge n={6} color={c(6)} /></div>
            <div className="font-bold">Running line 2</div>
            <div className="mt-1 rounded border border-stone-300 bg-[#fffef5] px-1 font-mono text-stone-800">🧾 Hello!</div>
          </div>
          <div className="relative rounded-xl border-2 py-1 pl-5 pr-2 text-[9px] font-bold" style={box(7)}>
            <div className="absolute -left-2 -top-2"><Badge n={7} color={c(7)} /></div>
            💡 Ask Byte
          </div>
        </div>
      </div>
    </div>
  );
}

function Journey() {
  return (
    <ol className="relative grid gap-3 lg:grid-cols-9 lg:gap-2">
      <span className="absolute bottom-6 left-[27px] top-6 w-1 rounded-full bg-gradient-to-b from-amber-400 via-rose-400 to-yellow-500 lg:bottom-auto lg:left-[5%] lg:right-[5%] lg:top-[27px] lg:h-1 lg:w-auto lg:bg-gradient-to-r" aria-hidden />
      {CHAPTERS.map((ch) => (
        <li key={ch.id} className="relative flex items-center gap-3 lg:flex-col lg:gap-2 lg:text-center">
          <div className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-full border-4 text-2xl shadow-md" style={{ borderColor: ch.accent, background: "var(--panel)" }}>
            {ch.icon}
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: ch.accent }}>{ch.id}</span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-[15px] font-semibold leading-tight">{ch.plainTitle}</div>
            <div className="text-[12px] opacity-70">{ch.concept}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function Landing({ runner, onStart, onRetry, hasProgress }: { runner: RunnerState; onStart: () => void; onRetry: () => void; hasProgress: boolean }) {
  const status = (
    <div className="min-h-[24px] text-sm" aria-live="polite">
      {runner.status === "ready" ? <span className="text-green-700 dark:text-green-400">✅ Ready! Python is loaded.</span>
        : runner.status === "error" ? <span className="text-red-600">⚠️ Python couldn&apos;t load. Please check your internet. <button className="underline" onClick={onRetry}>Try again</button></span>
        : <span className="inline-flex items-center gap-2"><span className="anim-flame inline-block">🔥</span> Pyu is warming up the stove (loading Python)…</span>}
    </div>
  );
  const cta = (label: string) => (
    <button className="btn btn-primary px-8 py-3 text-lg" style={{ ["--accent" as string]: "#d97706" }} onClick={onStart}>{label}</button>
  );
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-1 pb-8 pt-2 sm:px-4 sm:pb-12">
      {/* hero */}
      <section className="relative -mx-2 overflow-hidden rounded-[2rem] px-4 py-8 sm:-mx-4 sm:px-8 sm:py-10 lg:pb-[clamp(1rem,4vh,2.5rem)] lg:pt-[clamp(1rem,4.5vh,2.75rem)]">
        {/* background: warm glow, dotted grid and floating ingredients */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-amber-500/25 blur-3xl" />
          <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: "radial-gradient(color-mix(in srgb, var(--ink) 18%, transparent) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
          {[["🍅", "6%", "18%", 0], ["🥕", "44%", "8%", 0.8], ["🧅", "90%", "12%", 1.6], ["🌶️", "4%", "78%", 2.2], ["🥚", "52%", "90%", 1.1], ["🧂", "94%", "70%", 0.4], ["🍋", "30%", "60%", 2.8]].map(([e, x, y, d]) => (
            <span key={e as string} className="anim-float absolute text-2xl opacity-40 sm:text-3xl" style={{ left: x as string, top: y as string, animationDelay: `${d}s`, animationDuration: "5s" }}>{e as string}</span>
          ))}
        </div>

        <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_1fr] lg:gap-10">
          {/* text */}
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:gap-[clamp(0.6rem,2.6vh,1.75rem)] lg:text-left">
            <span className="anim-fadeup inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[13px] font-semibold shadow-sm" style={{ borderColor: "color-mix(in srgb, #f59e0b 50%, var(--line))", background: "var(--panel)" }}>
              <Logo size={20} /> Game 1 · Python for complete beginners
            </span>
            <h1 className="anim-fadeup font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-[3.4rem] lg:text-[clamp(2.3rem,min(4.5vw,8.6vh),4.4rem)]" style={{ animationDelay: ".08s" }}>
              Learn Python by{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">cooking with Chef&nbsp;Pyu</span>
            </h1>
            <p className="anim-fadeup max-w-xl text-[16px] leading-relaxed opacity-90 lg:text-[clamp(14.5px,2.3vh,19px)]" style={{ animationDelay: ".16s" }}>
              Pyu the snake chef follows your instructions <b>exactly</b>, just like a computer. Write a few lines of <b>real Python</b>, press <b>Cook</b>, and watch the kitchen bring your code to life.
            </p>
            <div className="anim-fadeup flex flex-col items-center gap-2.5 sm:flex-row" style={{ animationDelay: ".24s" }}>
              {cta(hasProgress ? "Continue cooking →" : "Start cooking, it's free →")}
              <a href="#how-it-works" className="btn px-5 py-3">👀 See how it works</a>
            </div>
            <div className="anim-fadeup" style={{ animationDelay: ".3s" }}>{status}</div>
            <div className="anim-fadeup grid w-full max-w-md grid-cols-3 gap-2 lg:max-w-lg" style={{ animationDelay: ".36s" }}>
              {[["9", "chapters"], [String(LEVELS.length), "short levels"], ["0", "setup needed"]].map(([n, l]) => (
                <div key={l} className="rounded-2xl border px-2 py-2 text-center lg:py-[clamp(0.35rem,1.6vh,1rem)]" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
                  <div className="font-display text-xl font-bold text-amber-600 dark:text-amber-400 lg:text-[clamp(1.1rem,3.6vh,2rem)]">{n}</div>
                  <div className="text-[12px] opacity-75">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* live demo */}
          <div className="anim-fadeup" style={{ animationDelay: ".2s" }}>
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* how it works: flow diagram */}
      <section id="how-it-works" className="scroll-mt-20">
        <SectionTitle kicker="How it works" title="4 simple steps, every level" sub="Every level follows the same loop. Once you've done it once, you know how the whole game works." />
        <div className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
          {FLOW.map((s, i) => (
            <Fragment key={s.n}>
              <div className="panel relative flex flex-col items-center gap-3 p-4 pt-6 text-center shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[12px] font-bold text-white shadow" style={{ background: s.color }}>STEP {s.n}</span>
                <div className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `color-mix(in srgb, ${s.color} 16%, transparent)` }}>{s.icon}</div>
                <div>
                  <div className="font-display text-lg font-semibold">{s.title}</div>
                  <div className="text-[13.5px] opacity-80">{s.text}</div>
                </div>
                <div className="mt-auto w-full">{s.visual}</div>
              </div>
              {i < FLOW.length - 1 && <FlowArrow />}
            </Fragment>
          ))}
        </div>
        <div className="mx-auto mt-4 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3 text-center text-[14px]" style={{ borderColor: "color-mix(in srgb, #e11d48 45%, var(--line))" }}>
          <RotateCcw className="h-6 w-6 shrink-0 text-rose-500" />
          <span><b>Not quite right?</b> Pyu shows what went wrong. Change your code and cook again. <b>Trying again never costs points.</b></span>
        </div>
      </section>

      {/* screen diagram */}
      <section>
        <SectionTitle kicker="Your screen" title="Everything on one screen" sub="Here's what you'll see inside every level." />
        <div className="grid items-center gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="mx-auto w-full max-w-lg"><ScreenMock /></div>
          <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {SCREEN.map((p) => (
              <li key={p.n} className="flex items-start gap-3 rounded-xl border px-3 py-2" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
                <Badge n={p.n} color={p.color} />
                <div className="text-[14px]"><b>{p.name}</b><div className="opacity-80">{p.text}</div></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* journey */}
      <section>
        <SectionTitle kicker="Your journey" title="9 chapters, from zero to your own programs" sub="Each chapter teaches one skill. Finish one and the next opens." />
        <div className="panel p-4 sm:p-6"><Journey /></div>
      </section>

      {/* good to know */}
      <section>
        <SectionTitle kicker="Good to know" title="Made for beginners" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["💡", "Stuck? Ask Byte", "Every level has 3 clues, from gentle to more helpful. Each clue costs 10% of that level's points."],
            ["💾", "Saved automatically", "Your progress and code are kept in this browser. Come back any time."],
            ["🏅", "Earn points & ranks", "100 points per chapter. Grow from Kitchen Helper to Master Chef."],
            ["📱", "Any device", "Works on laptops, tablets and phones. A keyboard makes typing easier."],
          ].map(([icon, t, d]) => (
            <div key={t} className="panel flex flex-col gap-1.5 p-4">
              <div className="text-3xl">{icon}</div>
              <div className="font-display text-lg font-semibold">{t}</div>
              <div className="text-[13.5px] opacity-80">{d}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[12.5px]">
          {RANKS.map((r, i) => (
            <Fragment key={r.title}>
              <span className="rounded-full border px-2.5 py-1" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>{r.icon} {r.title} <span className="opacity-60">{r.min}+</span></span>
              {i < RANKS.length - 1 && <ArrowRight className="h-3.5 w-3.5 opacity-50" />}
            </Fragment>
          ))}
        </div>
      </section>

      {/* final call to action */}
      <section className="relative overflow-hidden rounded-3xl p-6 text-center text-white shadow-xl sm:p-10" style={{ background: "linear-gradient(135deg,#d97706,#ea580c 55%,#be123c)" }}>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:text-left">
          <div className="w-[110px] shrink-0"><Pyu mood="proud" size={110} /></div>
          <div className="flex-1">
            <h2 className="font-display text-3xl font-bold">Ready to cook your first program?</h2>
            <p className="mt-1 opacity-90">It takes about 2 minutes to finish the first level.</p>
          </div>
          <button className="btn shrink-0 border-white bg-white px-6 py-3 text-lg text-orange-700" onClick={onStart}>{hasProgress ? "Continue →" : "Start cooking →"}</button>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- map

const JOURNEY = [
  { icon: "👨‍🍳", name: "Pyu's Kitchen", topic: "Python basics", current: true },
  { icon: "🌐", name: "Packet's Delivery Run", topic: "How the internet works" },
  { icon: "🗄️", name: "Data & Databases", topic: "" },
  { icon: "☁️", name: "Cloud", topic: "" },
  { icon: "🐳", name: "Docker", topic: "" },
  { icon: "⚙️", name: "DevOps", topic: "" },
];

export function MapScreen({ progress, onPlay, onFinale }: { progress: Progress; onPlay: (id: string) => void; onFinale: () => void }) {
  const pts = totalPoints(progress);
  const rank = rankFor(pts);
  const allDone = CHAPTERS.every((c) => chapterComplete(progress, c.id));
  const currentCh = CHAPTERS.find((c) => chapterUnlocked(progress, c.id) && !chapterComplete(progress, c.id))?.id ?? 9;
  const [sel, setSel] = useState<number>(currentCh);
  const selCh = CHAPTERS.find((c) => c.id === sel)!;
  const selLevels = levelsOf(sel);
  const selUnlocked = chapterUnlocked(progress, sel);
  const selNext = selLevels.find((l) => !progress.levels[l.id]?.solved && levelUnlocked(progress, l.id));
  const selDone = selLevels.filter((l) => progress.levels[l.id]?.solved).length;

  const choose = (id: number) => {
    setSel(id);
    document.getElementById("chapter-levels")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-12 pt-2">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold">Your learning path</h2>
          <p className="max-w-2xl text-[15px] opacity-85">9 chapters, each teaching <b>one Python skill</b>. Go in order: finish every level in a chapter to open the next one.</p>
        </div>
        <div className="panel w-full p-3 md:w-80">
          <div className="flex items-center justify-between text-sm"><span className="font-display font-semibold">{rank.icon} {rank.title}</span><span className="font-bold">⭐ {pts} / {TOTAL_POINTS}</span></div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full bg-amber-500 smooth" style={{ width: `${(pts / TOTAL_POINTS) * 100}%` }} /></div>
          <div className="mt-1 text-xs opacity-75">{rank.next ? `${rank.next.min - pts} more points to become ${rank.next.icon} ${rank.next.title}` : "The highest rank. Bravo, Chef!"}</div>
        </div>
      </div>

      {allDone && (
        <button className="panel anim-pulse flex items-center justify-center gap-2 p-3 font-display text-lg font-semibold" style={{ ["--accent" as string]: "#ca8a04" }} onClick={onFinale}>
          🎆 Watch the Grand Opening again and get your certificate
        </button>
      )}

      {/* selected chapter: its levels as a path */}
      <section id="chapter-levels" className="panel scroll-mt-20 overflow-hidden" style={{ borderColor: selCh.accent, borderWidth: 2 }}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" style={{ background: `color-mix(in srgb, ${selCh.accent} 12%, var(--panel))` }}>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `color-mix(in srgb, ${selCh.accent} 25%, transparent)` }}>{selCh.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-bold uppercase tracking-wider" style={{ color: selCh.accent }}>Chapter {selCh.id} · {selCh.concept}</div>
            <div className="font-display text-2xl font-bold leading-tight">{selCh.plainTitle}</div>
            <div className="text-[14px] opacity-80">{selCh.simple}</div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
            <span className="text-[13px] font-semibold">{selDone} of {selLevels.length} levels done · ⭐ {chapterPoints(progress, sel)}/100</span>
            {selUnlocked && selNext && (
              <button className="btn btn-primary justify-center" style={{ ["--accent" as string]: selCh.accent }} onClick={() => onPlay(selNext.id)}>▶ {selDone ? "Continue" : "Start"} Level {selLevels.indexOf(selNext) + 1}</button>
            )}
            {!selUnlocked && <span className="rounded-lg border border-dashed px-2 py-1 text-[13px]" style={{ borderColor: "var(--line)" }}>🔒 Finish Chapter {sel - 1} to open</span>}
          </div>
        </div>
        <ol className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3" style={{ ["--accent" as string]: selCh.accent }}>
          {selLevels.map((l, i) => {
            const lp = progress.levels[l.id];
            const open = levelUnlocked(progress, l.id);
            const isNext = selNext?.id === l.id;
            return (
              <li key={l.id}>
                <button disabled={!open} onClick={() => onPlay(l.id)}
                  className={`flex h-full w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${isNext ? "anim-pulse" : ""}`}
                  style={{ borderColor: lp?.solved || isNext ? selCh.accent : "var(--line)", background: lp?.solved ? `color-mix(in srgb, ${selCh.accent} 10%, var(--panel))` : "var(--panel)" }}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full font-display font-bold text-white" style={{ background: open ? selCh.accent : "#a8a29e" }}>
                    {lp?.solved ? "✓" : open ? i + 1 : <Lock className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-tight">{l.title}</span>
                    <span className="block text-[12px] opacity-70">Learn: {l.concept}</span>
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-[12px] font-semibold">{lp?.solved ? `⭐ ${lp.best}` : isNext ? "▶ Play" : `${l.points} pts`}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* all chapters: uniform cards */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl font-bold">All chapters</h3>
          <div className="flex flex-wrap gap-x-3 text-[12.5px] opacity-80"><span>✅ finished</span><span>▶️ you are here</span><span>🔒 locked</span></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch) => {
            const unlocked = chapterUnlocked(progress, ch.id);
            const done = chapterComplete(progress, ch.id);
            const current = ch.id === currentCh && unlocked && !done;
            const lv = levelsOf(ch.id);
            const solvedCount = lv.filter((l) => progress.levels[l.id]?.solved).length;
            const selected = ch.id === sel;
            return (
              <div key={ch.id} role="button" tabIndex={0} onClick={() => choose(ch.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(ch.id); } }}
                className={`group flex h-full cursor-pointer flex-col rounded-2xl border-2 p-3.5 text-left transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${selected ? "shadow-lg" : ""}`}
                style={{ borderColor: selected || current ? ch.accent : "var(--line)", background: done ? `color-mix(in srgb, ${ch.accent} 10%, var(--panel))` : "var(--panel)", boxShadow: selected ? `0 0 0 3px color-mix(in srgb, ${ch.accent} 35%, transparent)` : undefined }}
                aria-pressed={selected} aria-label={`Chapter ${ch.id}: ${ch.plainTitle}. ${done ? "Finished" : unlocked ? "Open" : "Locked"}. Show its levels.`}>
                <div className="flex items-center justify-between">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: unlocked ? ch.accent : "#78716c" }}>Chapter {ch.id}</span>
                  <span className="text-[12px] font-bold">{done ? "✅ Finished" : !unlocked ? "🔒 Locked" : current ? "▶️ You are here" : "Open"}</span>
                </div>
                <div className={`mt-3 flex items-center gap-3 ${unlocked ? "" : "opacity-60"}`}>
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in srgb, ${ch.accent} 20%, transparent)` }}>{ch.icon}</div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-xl font-bold leading-tight">{ch.plainTitle}</div>
                    <div className="truncate text-[12.5px] opacity-75">Python topic: <b>{ch.concept}</b></div>
                  </div>
                </div>
                <p className={`mt-2.5 line-clamp-3 min-h-[3.9rem] text-[13.5px] leading-snug ${unlocked ? "opacity-90" : "opacity-55"}`}>{ch.simple}</p>
                <pre className={`mt-2.5 flex h-[62px] items-center overflow-hidden rounded-lg border px-2.5 font-mono text-[12px] leading-5 ${unlocked ? "" : "opacity-55"}`} style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>{ch.example}</pre>
                <div className="mt-auto pt-3">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span>{solvedCount}/{lv.length} levels</span>
                    <span className="font-bold">⭐ {chapterPoints(progress, ch.id)}/100</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full smooth" style={{ width: `${(solvedCount / lv.length) * 100}%`, background: ch.accent }} /></div>
                  <div className="mt-2.5 rounded-lg py-1.5 text-center text-[13px] font-semibold transition group-hover:brightness-110"
                    style={unlocked ? { background: ch.accent, color: "white" } : { border: "1px dashed var(--line)" }}>
                    {unlocked ? (selected ? "Levels shown above ↑" : "Show levels") : `🔒 Finish Chapter ${ch.id - 1} first`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel p-3">
        <div className="mb-1 font-display font-semibold">🧭 What comes after this game</div>
        <p className="mb-2 text-[13px] opacity-75">Pyu&apos;s Kitchen is game 1 of a bigger learning journey. More games are coming soon.</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {JOURNEY.map((g) => (
            <div key={g.name} className={`min-w-[150px] rounded-xl border-2 p-2 text-sm ${g.current ? "" : "opacity-55"}`} style={{ borderColor: g.current ? "#d97706" : "var(--line)" }}>
              <div className="text-xl">{g.icon} {!g.current && <Lock className="inline h-3.5 w-3.5" />}</div>
              <div className="font-semibold">{g.name}</div>
              <div className="text-xs opacity-70">{g.current ? `${g.topic} · you are here` : `${g.topic ? g.topic + " · " : ""}coming soon`}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- finale

export function Finale({ progress, update, onBack }: { progress: Progress; update: (fn: (p: Progress) => Progress) => void; onBack: () => void }) {
  const pts = totalPoints(progress);
  const rank = rankFor(pts);
  const [name, setName] = useState(progress.chefName ?? "");
  useEffect(() => {
    let stop = false;
    import("canvas-confetti").then(({ default: confetti }) => {
      const end = Date.now() + 4500;
      const burst = () => {
        if (stop) return;
        confetti({ particleCount: 60, startVelocity: 32, spread: 360, ticks: 70, gravity: 0.6, origin: { x: Math.random(), y: Math.random() * 0.4 }, disableForReducedMotion: true, zIndex: 60,
          colors: ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#fde047"] });
        if (Date.now() < end) setTimeout(burst, 380);
      };
      burst();
    }).catch(() => undefined);
    return () => { stop = true; };
  }, []);
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 pb-16 pt-4 text-center">
      <div className="relative h-[240px] w-full overflow-hidden rounded-3xl border-4 sm:h-[260px]" style={{ borderColor: "#ca8a04", background: "linear-gradient(180deg,#1e1b4b,#4c1d95 55%,#f59e0b)" }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="anim-sparkle absolute text-lg" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 45}%`, animationDelay: `${(i % 8) * 0.25}s`, animationIterationCount: "infinite" }}>✨</span>
        ))}
        <div className="absolute bottom-0 left-1/2 w-[280px] -translate-x-1/2 sm:w-[340px]">
          <div className="mx-auto w-fit rounded-t-lg bg-red-700 px-3 py-1 font-display text-sm font-bold text-amber-100 shadow sm:text-lg">PYU&apos;S KITCHEN · GRAND OPENING</div>
          <div className="h-[110px] rounded-t-md border-4 border-amber-900 bg-amber-100">
            <div className="flex h-full items-end justify-center gap-6 pb-1">
              <div className="h-16 w-14 rounded-t-md border-4 border-amber-900 bg-amber-700" />
              <Pyu mood="proud" size={76} />
              <div className="h-12 w-16 rounded-md border-4 border-amber-900 bg-sky-200" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 hidden sm:flex">
          {[0, 1, 2, 3].map((i) => <div key={i} className="-ml-4 first:ml-2"><CustomerFigure seed={i} mood="cheer" size={58} /></div>)}
        </div>
        <div className="absolute bottom-0 right-0 hidden sm:flex">
          {[4, 5, 6, 7].map((i) => <div key={i} className="-mr-4 last:mr-2"><CustomerFigure seed={i} mood="cheer" size={58} /></div>)}
        </div>
      </div>

      <div>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">The whole city is queueing outside!</h2>
        <p className="mt-1 opacity-85">You wrote real Python programs: variables, kinds of values, maths, input and output, decisions, loops and functions. You fixed real errors, and you solved problems on your own.</p>
      </div>

      <label className="flex flex-wrap items-center justify-center gap-2 text-sm">Your name for the certificate:
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => update((p) => ({ ...p, chefName: name }))}
          className="rounded-lg border px-2 py-1" style={{ borderColor: "var(--line)", background: "var(--panel)" }} placeholder="Your name" />
      </label>

      <div className="print-area w-full max-w-2xl rounded-2xl border-[6px] border-double bg-[#fffbeb] p-5 text-stone-800 shadow-2xl sm:p-6" style={{ borderColor: "#b45309" }}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800">Certificate of Completion</div>
        <div className="mt-2 flex items-center justify-center gap-2 font-display text-3xl font-bold"><Logo size={36} /> Pyu&apos;s Kitchen</div>
        <div className="text-sm opacity-70">Game 1 · Python Fundamentals</div>
        <div className="mt-4 text-sm">This certifies that</div>
        <div className="font-hand text-4xl font-bold text-amber-900">{name.trim() || "Byte"}</div>
        <div className="mt-1 text-sm">has finished all 9 chapters of real Python and earned the rank of</div>
        <div className="mt-1 font-display text-2xl font-bold">{rank.icon} {rank.title}</div>
        <div className="mt-3 flex items-center justify-center gap-6 text-sm">
          <div><div className="font-display text-2xl font-bold">{pts}</div><div className="opacity-70">of {TOTAL_POINTS} points</div></div>
          <div className="h-10 w-px bg-amber-800/30" />
          <div><div className="font-display text-lg font-bold">{date}</div><div className="opacity-70">Grand Opening</div></div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs opacity-70"><Pyu mood="proud" size={40} /> Signed, Chef Pyu</div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <button className="btn" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print certificate</button>
        <button className="btn btn-primary" style={{ ["--accent" as string]: "#ca8a04" }} onClick={onBack}>Back to the map</button>
      </div>
    </div>
  );
}

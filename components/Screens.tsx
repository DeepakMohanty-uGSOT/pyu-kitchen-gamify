"use client";

import { HelpCircle, Lock, Moon, Printer, Settings, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CHAPTERS, LEVELS, levelsOf, rankFor, TOTAL_POINTS } from "@/lib/levels";
import { chapterComplete, chapterPoints, chapterUnlocked, levelUnlocked, totalPoints, type Progress } from "@/lib/progress";
import { Byte, CustomerFigure, Logo, Pyu } from "./kitchen/Characters";

type RunnerState = { status: string; error: string };

// ---------------------------------------------------------------- header

export function Header({ progress, update, dark, onHome, onReset, onHelp }: {
  progress: Progress; update: (fn: (p: Progress) => Progress) => void; dark: boolean; onHome: () => void; onReset: () => void; onHelp: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pts = totalPoints(progress);
  const rank = rankFor(pts);
  const s = progress.settings;
  const set = (patch: Partial<Progress["settings"]>) => update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  return (
    <header className="sticky top-0 z-40 -mx-3 mb-1 border-b px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4" style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 88%, transparent)" }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-2">
        <button onClick={onHome} className="flex items-center gap-2 whitespace-nowrap font-display text-base font-bold sm:text-xl" aria-label="Pyu's Kitchen: go to the map">
          <Logo size={32} /> <span className="hidden min-[400px]:inline">Pyu&apos;s Kitchen</span>
        </button>
        <span className="hidden rounded-full border px-2 py-0.5 text-xs md:inline" style={{ borderColor: "var(--line)" }} title="Your rank goes up as you earn points">{rank.icon} {rank.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="whitespace-nowrap rounded-full bg-amber-400/20 px-2.5 py-1 font-display text-sm font-bold" aria-label={`${pts} points`}>⭐ {pts}<span className="hidden sm:inline"> pts</span></span>
          <button className="btn px-2 py-1.5" onClick={onHelp} aria-label="How to play" title="How to play">
            <HelpCircle className="h-4 w-4" /><span className="hidden sm:inline">Help</span>
          </button>
          <button className="btn px-2 py-1.5" onClick={() => set({ sound: !s.sound })} aria-label={s.sound ? "Turn sounds off" : "Turn sounds on"} title={s.sound ? "Sound on" : "Sound off"}>
            {s.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button className="btn px-2 py-1.5" onClick={() => set({ theme: dark ? "light" : "dark" })} aria-label="Switch light or dark mode" title="Light / dark mode">
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

export function Landing({ runner, onStart, onRetry, hasProgress }: { runner: RunnerState; onStart: () => void; onRetry: () => void; hasProgress: boolean }) {
  const status = (
    <div className="min-h-[24px] text-sm" aria-live="polite">
      {runner.status === "ready" ? <span className="text-green-700 dark:text-green-400">✅ Ready! Python is loaded.</span>
        : runner.status === "error" ? <span className="text-red-600">⚠️ Python couldn&apos;t load. Please check your internet. <button className="underline" onClick={onRetry}>Try again</button></span>
        : <span className="inline-flex items-center gap-2"><span className="anim-flame inline-block">🔥</span> Pyu is warming up the stove (loading Python)…</span>}
    </div>
  );
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 px-1 py-8 sm:px-4 sm:py-12">
      <section className="relative flex flex-col items-center gap-5 text-center">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(ellipse at 50% 30%, color-mix(in srgb, #f59e0b 30%, transparent), transparent 60%)" }} />
        <div className="flex items-end justify-center gap-2">
          <div className="w-[150px] sm:w-[190px]"><Pyu mood="happy" size={190} /></div>
          <div className="mb-4"><Byte size={64} talking /></div>
        </div>
        <div>
          <h1 className="flex items-center justify-center gap-3 font-display text-4xl font-bold tracking-tight sm:text-6xl"><Logo size={52} /> Pyu&apos;s Kitchen</h1>
          <p className="mt-2 font-display text-lg opacity-85 sm:text-xl">Learn Python from zero by cooking with Chef Pyu.</p>
        </div>
        <p className="max-w-2xl text-[15.5px] leading-relaxed opacity-90">
          Chef Pyu follows instructions <b>exactly</b>, step by step, just like a computer. You write those instructions in <b>real Python</b>, press <b>Cook</b>, and watch the kitchen do exactly what your code says.
        </p>
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <button className="btn btn-primary px-8 py-3 text-lg" style={{ ["--accent" as string]: "#d97706" }} onClick={onStart}>
            {hasProgress ? "Continue cooking →" : "Start cooking →"}
          </button>
          <a href="#how-to-play" className="btn px-5 py-3">📖 How does it work?</a>
        </div>
        {status}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {[
            ["✍️", "1. Write", "Type a few lines of real Python. No installing, no setup."],
            ["▶️", "2. Cook", "Press Cook. Pyu follows every line, and you see each step happen."],
            ["🔁", "3. Fix", "Not right yet? Read the tip, change your code, and cook again."],
          ].map(([e, t, d]) => (
            <div key={t} className="panel p-3"><div className="text-2xl">{e}</div><div className="font-display font-semibold">{t}</div><div className="text-sm opacity-85">{d}</div></div>
          ))}
        </div>
        <div className="text-xs opacity-70">9 chapters · {LEVELS.length} short levels · {TOTAL_POINTS} points · for complete beginners</div>
      </section>

      <section id="how-to-play" className="panel scroll-mt-20 p-4 sm:p-6">
        <HowToPlay />
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <button className="btn btn-primary px-8 py-3 text-lg" style={{ ["--accent" as string]: "#d97706" }} onClick={onStart}>
            {hasProgress ? "Continue cooking →" : "I'm ready, start cooking →"}
          </button>
          {status}
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
  const [openCh, setOpenCh] = useState<number | null>(currentCh);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 pb-12 pt-2">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold">Your learning path</h2>
          <p className="max-w-2xl text-[15px] opacity-85">Pyu&apos;s restaurant has 9 kitchen stations. Each one teaches <b>one Python skill</b>, from the very basics to building a full program. Go in order: finish every level in a chapter to open the next one.</p>
        </div>
        <div className="panel w-full p-3 md:w-80">
          <div className="flex items-center justify-between text-sm"><span className="font-display font-semibold">{rank.icon} {rank.title}</span><span className="font-bold">⭐ {pts} / {TOTAL_POINTS}</span></div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full bg-amber-500 smooth" style={{ width: `${(pts / TOTAL_POINTS) * 100}%` }} /></div>
          <div className="mt-1 text-xs opacity-75">{rank.next ? `${rank.next.min - pts} more points to become ${rank.next.icon} ${rank.next.title}` : "The highest rank. Bravo, Chef!"}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border px-3 py-2 text-[13px]" style={{ borderColor: "var(--line)", background: "var(--panel)" }}>
        <b>How to read the map:</b>
        <span>✅ finished</span><span>▶️ next level to play</span><span>🔒 locked (finish the one before)</span><span>⭐ points earned</span>
      </div>

      {allDone && (
        <button className="panel anim-pulse flex items-center justify-center gap-2 p-3 font-display text-lg font-semibold" style={{ ["--accent" as string]: "#ca8a04" }} onClick={onFinale}>
          🎆 Watch the Grand Opening again and get your certificate
        </button>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CHAPTERS.map((ch) => {
          const unlocked = chapterUnlocked(progress, ch.id);
          const done = chapterComplete(progress, ch.id);
          const current = ch.id === currentCh && unlocked && !done;
          const cp = chapterPoints(progress, ch.id);
          const lv = levelsOf(ch.id);
          const solvedCount = lv.filter((l) => progress.levels[l.id]?.solved).length;
          const nextLevel = lv.find((l) => !progress.levels[l.id]?.solved && levelUnlocked(progress, l.id));
          return (
            <div key={ch.id}
              className={`relative flex flex-col rounded-2xl border-2 p-3.5 transition ${current ? "anim-pulse" : ""}`}
              style={{ ["--accent" as string]: ch.accent, borderColor: unlocked ? ch.accent : "var(--line)", background: done ? `color-mix(in srgb, ${ch.accent} 12%, var(--panel))` : "var(--panel)" }}>
              <div className="flex items-center justify-between">
                <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: unlocked ? ch.accent : "#78716c" }}>Chapter {ch.id}</span>
                <span className="text-[12px] font-bold">{done ? "✅ Finished" : !unlocked ? "🔒 Locked" : current ? "▶️ You are here" : ""}</span>
              </div>
              <div className={`mt-2 flex items-start gap-3 ${unlocked ? "" : "opacity-60"}`}>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in srgb, ${ch.accent} 20%, transparent)` }}>{ch.icon}</div>
                <div className="min-w-0">
                  <div className="font-display text-xl font-bold leading-tight">{ch.plainTitle}</div>
                  <div className="text-[12.5px] opacity-80">Python topic: <b>{ch.concept}</b></div>
                  <div className="text-[12px] opacity-65">Kitchen station: {ch.title}</div>
                </div>
              </div>
              <p className={`mt-2 text-[14px] leading-snug ${unlocked ? "" : "opacity-60"}`}>{ch.simple}</p>
              <pre className={`mt-2 overflow-x-auto rounded-lg border px-2.5 py-1.5 font-mono text-[12.5px] leading-5 ${unlocked ? "" : "opacity-60"}`} style={{ borderColor: "var(--line)", background: "var(--panel-2)" }}>
                <span className="mr-1 font-sans text-[10px] font-bold uppercase tracking-wider opacity-60">example</span>{"\n"}{ch.example}
              </pre>
              <div className="mt-2.5 flex items-center justify-between text-[13px]">
                <span>{solvedCount} of {lv.length} levels done</span>
                <span className="font-bold">⭐ {cp}/100</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10"><div className="h-full rounded-full smooth" style={{ width: `${(solvedCount / lv.length) * 100}%`, background: ch.accent }} /></div>
              <div className="mt-auto pt-3">
                {unlocked ? (
                  <div className="flex gap-2">
                    {nextLevel && <button className="btn btn-primary flex-1 justify-center" onClick={() => onPlay(nextLevel.id)}>▶ {solvedCount ? "Continue" : "Start"}</button>}
                    <button className={`btn justify-center ${nextLevel ? "" : "flex-1"}`} onClick={() => setOpenCh(openCh === ch.id ? null : ch.id)} aria-expanded={openCh === ch.id}>
                      {openCh === ch.id ? "Hide levels" : "See levels"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed px-2 py-1.5 text-center text-[13px] opacity-80" style={{ borderColor: "var(--line)" }}>🔒 Finish Chapter {ch.id - 1} to open this</div>
                )}
              </div>
              {unlocked && openCh === ch.id && (
                <ul className="mt-2 space-y-1">
                  {lv.map((l, i) => {
                    const lp = progress.levels[l.id];
                    const open = levelUnlocked(progress, l.id);
                    const isNext = nextLevel?.id === l.id;
                    return (
                      <li key={l.id}>
                        <button disabled={!open} onClick={() => onPlay(l.id)}
                          className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-white/5"
                          style={{ borderColor: isNext ? ch.accent : "var(--line)" }}>
                          <span className="w-5 text-center">{lp?.solved ? "✅" : isNext ? "▶️" : open ? "⚪" : "🔒"}</span>
                          <span className="flex-1"><span className="font-semibold">Level {i + 1}: {l.title}</span><span className="block text-[11.5px] opacity-70">Learn: {l.concept}</span></span>
                          <span className="whitespace-nowrap text-xs">{lp?.solved ? `⭐ ${lp.best}` : `${l.points} pts`}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
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

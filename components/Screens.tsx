"use client";

import { Lock, Moon, Printer, Settings, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CHAPTERS, LEVELS, levelsOf, rankFor, TOTAL_POINTS } from "@/lib/levels";
import { chapterComplete, chapterPoints, chapterUnlocked, levelUnlocked, totalPoints, type Progress } from "@/lib/progress";
import { Byte, CustomerFigure, Pyu } from "./kitchen/Characters";

type RunnerState = { status: string; error: string };

// ---------------------------------------------------------------- header

export function Header({ progress, update, dark, onHome, onReset }: {
  progress: Progress; update: (fn: (p: Progress) => Progress) => void; dark: boolean; onHome: () => void; onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pts = totalPoints(progress);
  const rank = rankFor(pts);
  const s = progress.settings;
  const set = (patch: Partial<Progress["settings"]>) => update((p) => ({ ...p, settings: { ...p.settings, ...patch } }));
  return (
    <header className="sticky top-0 z-40 -mx-3 mb-1 border-b px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4" style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 85%, transparent)" }}>
      <div className="mx-auto flex max-w-[1400px] items-center gap-2">
        <button onClick={onHome} className="whitespace-nowrap font-display text-base font-bold sm:text-xl" aria-label="Pyu's Kitchen: back to the map">🍳 Pyu&apos;s Kitchen</button>
        <span className="hidden rounded-full border px-2 py-0.5 text-xs sm:inline" style={{ borderColor: "var(--line)" }}>{rank.icon} {rank.title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="whitespace-nowrap rounded-full bg-amber-400/20 px-2.5 py-1 font-display text-sm font-bold" aria-label={`${pts} points`}>⭐ {pts} pts</span>
          <button className="btn px-2 py-1.5" onClick={() => set({ sound: !s.sound })} aria-label={s.sound ? "Mute sounds" : "Turn sounds on"} title={s.sound ? "Sound on" : "Sound off"}>
            {s.sound ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button className="btn px-2 py-1.5" onClick={() => set({ theme: dark ? "light" : "dark" })} aria-label="Toggle light/dark theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative">
            <button className="btn px-2 py-1.5" onClick={() => setOpen(!open)} aria-label="Settings" aria-expanded={open}><Settings className="h-4 w-4" /></button>
            {open && (
              <div className="panel absolute right-0 top-10 z-50 w-72 p-3 shadow-xl">
                <div className="mb-2 flex items-center justify-between font-display font-semibold">Settings <button onClick={() => setOpen(false)} aria-label="Close settings"><X className="h-4 w-4" /></button></div>
                <label className="flex items-center justify-between gap-2 py-1 text-sm">Theme
                  <select className="rounded border bg-transparent px-1 py-0.5" style={{ borderColor: "var(--line)" }} value={s.theme} onChange={(e) => set({ theme: e.target.value as Progress["settings"]["theme"] })}>
                    <option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option>
                  </select>
                </label>
                <label className="flex items-center justify-between gap-2 py-1 text-sm">Sound effects
                  <input type="checkbox" checked={s.sound} onChange={(e) => set({ sound: e.target.checked })} />
                </label>
                <label className="flex items-center justify-between gap-2 py-1 text-sm" title="For teachers: open every chapter without finishing the previous one">Unlock all levels (preview)
                  <input type="checkbox" checked={s.unlockAll} onChange={(e) => set({ unlockAll: e.target.checked })} />
                </label>
                <hr className="my-2" style={{ borderColor: "var(--line)" }} />
                <button className="btn w-full justify-center border-red-400 text-red-600" onClick={() => { if (confirm("Reset ALL progress, points, hints and saved recipes? This can't be undone.")) { setOpen(false); onReset(); } }}>
                  Reset progress
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- landing

export function Landing({ runner, onStart, onRetry, hasProgress }: { runner: RunnerState; onStart: () => void; onRetry: () => void; hasProgress: boolean }) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-60px)] max-w-5xl flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" style={{ background: "radial-gradient(ellipse at 50% 30%, color-mix(in srgb, #f59e0b 30%, transparent), transparent 60%)" }} />
      <div className="flex items-end justify-center gap-2">
        <Pyu mood="happy" size={190} />
        <div className="mb-4"><Byte size={70} talking /></div>
      </div>
      <div>
        <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">🍳 Pyu&apos;s Kitchen</h1>
        <p className="mt-2 font-display text-xl opacity-80">A recipe is a program. Pyu is the computer.</p>
      </div>
      <p className="max-w-2xl text-[15.5px] leading-relaxed opacity-85">
        Chef Pyu has to cook for the whole city, but he can only follow written recipes <b>exactly</b>, word for word, in order. He never guesses.
        You are <b>Byte</b>, his helper. Write the recipes in <b>real Python</b> and watch the kitchen do exactly what your code says, perfect dish or kitchen disaster.
      </p>
      <div className="flex flex-col items-center gap-2">
        <button className="btn btn-primary px-8 py-3 text-lg" style={{ ["--accent" as string]: "#d97706" }} onClick={onStart}>
          {hasProgress ? "Back to the kitchen →" : "Start cooking →"}
        </button>
        <div className="min-h-[24px] text-sm" aria-live="polite">
          {runner.status === "ready" ? <span className="text-green-700 dark:text-green-400">✅ The stove is hot. Python is ready.</span>
            : runner.status === "error" ? <span className="text-red-600">⚠️ The stove won&apos;t light ({runner.error}). Check your internet connection. <button className="underline" onClick={onRetry}>Try again</button></span>
            : <span className="inline-flex items-center gap-2"><span className="anim-flame inline-block">🔥</span> Pyu is warming up the stove…</span>}
        </div>
      </div>
      <div className="mt-2 grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
        {[
          ["✍️", "Write", "Real Python. No made-up game commands. Everything you learn works anywhere."],
          ["👀", "Watch", "Every line runs for real. Jars fill, customers order, pots stir."],
          ["🔁", "Fix", "Mistakes are part of cooking. Read the kitchen, fix the recipe, cook again."],
        ].map(([e, t, d]) => (
          <div key={t} className="panel p-3"><div className="text-2xl">{e}</div><div className="font-display font-semibold">{t}</div><div className="text-sm opacity-80">{d}</div></div>
        ))}
      </div>
      <div className="text-xs opacity-60">Game 1 of the Learning Journey · Python Fundamentals · 9 chapters · {LEVELS.length} levels · {TOTAL_POINTS} points</div>
    </div>
  );
}

// ---------------------------------------------------------------- map

const JOURNEY = [
  { icon: "🍳", name: "Pyu's Kitchen", topic: "Python Fundamentals", current: true },
  { icon: "🌐", name: "Packet's Delivery Run", topic: "Internet & Web" },
  { icon: "🗄️", name: "Data & Databases", topic: "" },
  { icon: "☁️", name: "Cloud", topic: "" },
  { icon: "🐳", name: "Docker", topic: "" },
  { icon: "⚙️", name: "DevOps", topic: "" },
];

export function MapScreen({ progress, onPlay, onFinale }: { progress: Progress; onPlay: (id: string) => void; onFinale: () => void }) {
  const pts = totalPoints(progress);
  const rank = rankFor(pts);
  const allDone = CHAPTERS.every((c) => chapterComplete(progress, c.id));
  const [openCh, setOpenCh] = useState<number | null>(null);
  const currentCh = CHAPTERS.find((c) => chapterUnlocked(progress, c.id) && !chapterComplete(progress, c.id))?.id ?? 9;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 pb-12 pt-2 sm:px-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-3xl font-bold">The Kitchen Floor Plan</h2>
          <p className="opacity-75">Each station teaches one part of Python. Finish a station to unlock the next.</p>
        </div>
        <div className="panel w-full p-3 sm:w-80">
          <div className="flex items-center justify-between text-sm"><span className="font-display font-semibold">{rank.icon} {rank.title}</span><span className="font-bold">⭐ {pts} / {TOTAL_POINTS}</span></div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-amber-500 smooth" style={{ width: `${(pts / TOTAL_POINTS) * 100}%` }} /></div>
          <div className="mt-1 text-xs opacity-70">{rank.next ? `${rank.next.min - pts} pts to ${rank.next.icon} ${rank.next.title}` : "The highest rank. Bravo, Chef!"}</div>
        </div>
      </div>

      {allDone && (
        <button className="panel anim-pulse flex items-center justify-center gap-2 p-3 font-display text-lg font-semibold" style={{ ["--accent" as string]: "#ca8a04" }} onClick={onFinale}>
          🎆 Watch the Grand Opening again & get your certificate
        </button>
      )}

      <div className="relative rounded-3xl border-4 p-3 sm:p-5" style={{ borderColor: "var(--counter-edge)", background: "repeating-conic-gradient(color-mix(in srgb, var(--tile) 55%, var(--bg)) 0% 25%, var(--bg) 0% 50%) 0 0 / 44px 44px" }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CHAPTERS.map((ch) => {
            const unlocked = chapterUnlocked(progress, ch.id);
            const done = chapterComplete(progress, ch.id);
            const current = ch.id === currentCh && unlocked && !done;
            const cp = chapterPoints(progress, ch.id);
            const lv = levelsOf(ch.id);
            return (
              <div key={ch.id}
                className={`relative rounded-2xl border-2 p-3 transition ${unlocked ? "hover:-translate-y-0.5" : "opacity-55 grayscale"} ${current ? "anim-pulse" : ""}`}
                style={{ ["--accent" as string]: ch.accent, borderColor: unlocked ? ch.accent : "var(--line)", background: done ? `color-mix(in srgb, ${ch.accent} 18%, var(--panel))` : "var(--panel)", boxShadow: done ? `0 0 24px color-mix(in srgb, ${ch.accent} 35%, transparent)` : undefined }}>
                <div className="flex items-start gap-2">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: `color-mix(in srgb, ${ch.accent} 22%, transparent)` }}>{unlocked ? ch.icon : <Lock className="h-5 w-5" />}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ch.accent }}>Chapter {ch.id} · {ch.concept}</div>
                    <div className="font-display text-lg font-semibold leading-tight">{ch.title}</div>
                    <div className="text-[13px] opacity-75">{ch.blurb}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex gap-1" aria-label={`${lv.filter((l) => progress.levels[l.id]?.solved).length} of ${lv.length} levels done`}>
                    {lv.map((l) => {
                      const solved = progress.levels[l.id]?.solved;
                      const open = levelUnlocked(progress, l.id);
                      return <span key={l.id} className="inline-block h-3 w-3 rounded-full border-2" style={{ borderColor: ch.accent, background: solved ? ch.accent : open ? `linear-gradient(90deg, ${ch.accent} 50%, transparent 50%)` : "transparent" }} title={`${l.id} ${l.title}${solved ? " ✓" : ""}`} />;
                    })}
                  </div>
                  <span className="text-sm font-bold">{done ? "✅ " : ""}{cp}/100</span>
                </div>
                {unlocked && (
                  <button className="btn btn-primary mt-2 w-full justify-center" onClick={() => setOpenCh(openCh === ch.id ? null : ch.id)}>
                    {openCh === ch.id ? "Hide levels" : done ? "Replay levels" : "Enter station"}
                  </button>
                )}
                {openCh === ch.id && (
                  <ul className="mt-2 space-y-1">
                    {lv.map((l) => {
                      const lp = progress.levels[l.id];
                      const open = levelUnlocked(progress, l.id);
                      return (
                        <li key={l.id}>
                          <button disabled={!open} onClick={() => onPlay(l.id)}
                            className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ borderColor: "var(--line)" }}>
                            <span className="w-8 font-mono text-xs opacity-60">{l.id}</span>
                            <span className="flex-1 font-semibold">{l.title}<span className="block text-[11px] font-normal opacity-60">{l.concept}</span></span>
                            <span className="text-xs">{lp?.solved ? `✅ ${lp.best}` : open ? `${l.points} pts` : <Lock className="h-3.5 w-3.5" />}</span>
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
      </div>

      <div className="panel p-3">
        <div className="mb-2 font-display font-semibold">🧭 Learning Journey</div>
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
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-3 pb-16 pt-4 text-center">
      <div className="relative h-[260px] w-full overflow-hidden rounded-3xl border-4" style={{ borderColor: "#ca8a04", background: "linear-gradient(180deg,#1e1b4b,#4c1d95 55%,#f59e0b)" }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="anim-sparkle absolute text-lg" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 45}%`, animationDelay: `${(i % 8) * 0.25}s`, animationIterationCount: "infinite" }}>✨</span>
        ))}
        <div className="absolute bottom-0 left-1/2 w-[340px] -translate-x-1/2">
          <div className="mx-auto w-fit rounded-t-lg bg-red-700 px-4 py-1 font-display text-lg font-bold text-amber-100 shadow">🍳 PYU&apos;S KITCHEN · GRAND OPENING</div>
          <div className="h-[110px] rounded-t-md border-4 border-amber-900 bg-amber-100">
            <div className="flex h-full items-end justify-center gap-6 pb-1">
              <div className="h-16 w-14 rounded-t-md border-4 border-amber-900 bg-amber-700" />
              <Pyu mood="proud" size={80} />
              <div className="h-12 w-16 rounded-md border-4 border-amber-900 bg-sky-200" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 flex gap-[-8px]">
          {[0, 1, 2, 3].map((i) => <div key={i} className="-ml-4 first:ml-2"><CustomerFigure seed={i} mood="cheer" size={58} /></div>)}
        </div>
        <div className="absolute bottom-0 right-0 flex">
          {[4, 5, 6, 7].map((i) => <div key={i} className="-mr-4 last:mr-2"><CustomerFigure seed={i} mood="cheer" size={58} /></div>)}
        </div>
      </div>

      <div>
        <h2 className="font-display text-4xl font-bold">The city is queueing outside!</h2>
        <p className="mt-1 opacity-80">You wrote real programs with variables, types, operators, input and output, conditions, loops and functions. You debugged real errors, and you solved problems where nobody told you which tool to use.</p>
      </div>

      <label className="flex items-center gap-2 text-sm">Your name for the certificate:
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => update((p) => ({ ...p, chefName: name }))}
          className="rounded-lg border px-2 py-1" style={{ borderColor: "var(--line)", background: "var(--panel)" }} placeholder="Chef ..." />
      </label>

      <div className="print-area w-full max-w-2xl rounded-2xl border-[6px] border-double bg-[#fffbeb] p-6 text-stone-800 shadow-2xl" style={{ borderColor: "#b45309" }}>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-amber-800">Certificate of Completion</div>
        <div className="mt-2 font-display text-3xl font-bold">🍳 Pyu&apos;s Kitchen</div>
        <div className="text-sm opacity-70">Game 1 · Python Fundamentals</div>
        <div className="mt-4 text-sm">This certifies that</div>
        <div className="font-hand text-4xl font-bold text-amber-900">{name.trim() || "Byte"}</div>
        <div className="mt-1 text-sm">has cooked through all 9 chapters of real Python and earned the rank of</div>
        <div className="mt-1 font-display text-2xl font-bold">{rank.icon} {rank.title}</div>
        <div className="mt-3 flex items-center justify-center gap-6 text-sm">
          <div><div className="font-display text-2xl font-bold">{pts}</div><div className="opacity-70">of {TOTAL_POINTS} points</div></div>
          <div className="h-10 w-px bg-amber-800/30" />
          <div><div className="font-display text-lg font-bold">{date}</div><div className="opacity-70">Grand Opening</div></div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 text-xs opacity-70"><Pyu mood="proud" size={40} /> Signed, Chef Pyu 🐍</div>
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print certificate</button>
        <button className="btn btn-primary" style={{ ["--accent" as string]: "#ca8a04" }} onClick={onBack}>Back to the kitchen map</button>
      </div>
    </div>
  );
}

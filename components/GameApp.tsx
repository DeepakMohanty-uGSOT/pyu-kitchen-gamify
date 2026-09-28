"use client";

import { useCallback, useEffect, useState } from "react";
import { getLevel, LEVELS } from "@/lib/levels";
import { chapterComplete, clearProgress, defaultProgress, levelAfter, levelUnlocked, loadProgress, saveProgress, type Progress } from "@/lib/progress";
import { getRunner } from "@/lib/runner";
import LevelScreen from "./LevelScreen";
import { Finale, Header, Landing, MapScreen } from "./Screens";

type Screen = { name: "landing" } | { name: "map" } | { name: "level"; id: string } | { name: "finale" };

function parseHash(): Screen {
  const h = typeof window !== "undefined" ? window.location.hash : "";
  const m = h.match(/^#\/level\/([\d.]+)$/);
  if (m && getLevel(m[1])) return { name: "level", id: m[1] };
  if (h === "#/map") return { name: "map" };
  if (h === "#/finale") return { name: "finale" };
  return { name: "landing" };
}

function toHash(s: Screen) {
  return s.name === "level" ? `#/level/${s.id}` : s.name === "landing" ? "#/" : `#/${s.name}`;
}

export default function GameApp() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [screen, setScreenState] = useState<Screen>(() => parseHash());
  const [runner, setRunner] = useState({ status: "idle", error: "" });
  const [systemDark, setSystemDark] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [toast, setToast] = useState<string | null>(null);

  const update = useCallback((fn: (p: Progress) => Progress) => {
    setProgress((prev) => {
      const next = fn(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  // Pyodide: preload from the very first screen.
  useEffect(() => {
    const r = getRunner();
    const unsub = r.subscribe((status, error) => setRunner({ status, error: error ?? "" }));
    r.init().catch(() => undefined);
    return unsub;
  }, []);

  // Theme
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setSystemDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const theme = progress.settings.theme;
  const dark = theme === "dark" || (theme === "system" && systemDark);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  // Navigation (hash based so refresh keeps your place)
  const setScreen = useCallback((s: Screen) => {
    setScreenState(s);
    const h = toHash(s);
    if (window.location.hash !== h) window.history.pushState(null, "", h);
    window.scrollTo({ top: 0 });
  }, []);
  useEffect(() => {
    const onPop = () => setScreenState(parseHash());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Guard locked levels
  useEffect(() => {
    if (screen.name === "level" && !levelUnlocked(progress, screen.id)) setScreenState({ name: "map" });
  }, [screen, progress]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const header = (
    <Header progress={progress} update={update} dark={dark} onHome={() => setScreen({ name: "map" })}
      onReset={() => { clearProgress(); const fresh = { ...defaultProgress(), settings: progress.settings }; setProgress(fresh); saveProgress(fresh); setScreen({ name: "map" }); }} />
  );

  if (screen.name === "level") {
    const level = getLevel(screen.id)!;
    const nextId = levelAfter(level.id);
    const nextLevel = nextId ? getLevel(nextId) : null;
    const isLast = level.id === LEVELS[LEVELS.length - 1].id;
    const sameChapter = nextLevel && nextLevel.chapter === level.chapter;
    const nextLabel = isLast ? "Grand Opening 🎆" : sameChapter ? "Next Level" : "Back to the map";
    const onNext = () => {
      if (isLast) { update((p) => ({ ...p, finished: true })); setScreen({ name: "finale" }); return; }
      if (sameChapter && nextId) { setScreen({ name: "level", id: nextId }); return; }
      if (chapterComplete(progress, level.chapter)) setToast(`🎉 Chapter ${level.chapter} complete! A new station is open.`);
      setScreen({ name: "map" });
    };
    return (
      <div className="min-h-screen">
        <LevelScreen key={level.id} level={level} progress={progress} update={update} dark={dark}
          onExit={() => setScreen({ name: "map" })} onNext={onNext} nextLabel={nextLabel} header={header} />
        {runner.status === "loading" && <Loader />}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4">
      {header}
      {screen.name === "landing" && (
        <Landing runner={runner} hasProgress={Object.keys(progress.levels).length > 0}
          onStart={() => setScreen({ name: "map" })} onRetry={() => getRunner().init().catch(() => undefined)} />
      )}
      {screen.name === "map" && (
        <MapScreen progress={progress} onPlay={(id) => setScreen({ name: "level", id })} onFinale={() => setScreen({ name: "finale" })} />
      )}
      {screen.name === "finale" && <Finale progress={progress} update={update} onBack={() => setScreen({ name: "map" })} />}
      {toast && (
        <div className="anim-fadeup fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-stone-900 px-4 py-2 font-semibold text-amber-50 shadow-xl" role="status">{toast}</div>
      )}
    </div>
  );
}

function Loader() {
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-2xl bg-stone-900 px-4 py-2 text-sm font-semibold text-amber-50 shadow-xl" role="status">
      <span className="anim-flame mr-1 inline-block">🔥</span> Pyu is warming up the stove…
    </div>
  );
}

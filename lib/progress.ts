import { LEVELS, levelsOf, CHAPTERS } from "./levels";

export type LevelProgress = {
  solved: boolean;
  best: number;
  hints: number;
  code?: string;
  fill?: string[];
  order?: number[];
};

export type Settings = {
  theme: "system" | "light" | "dark";
  sound: boolean;
  unlockAll: boolean;
  speed: number;
};

export type Progress = {
  v: 1;
  levels: Record<string, LevelProgress>;
  settings: Settings;
  chefName?: string;
  finished?: boolean;
};

const KEY = "pyus-kitchen-progress-v1";

export const defaultProgress = (): Progress => ({
  v: 1,
  levels: {},
  settings: { theme: "system", sound: false, unlockAll: false, speed: 1 },
});

export function loadProgress(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw);
    if (!p || p.v !== 1) return defaultProgress();
    return { ...defaultProgress(), ...p, settings: { ...defaultProgress().settings, ...(p.settings || {}) } };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable: the game still works for this session */
  }
}

export function clearProgress() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export const totalPoints = (p: Progress) =>
  LEVELS.reduce((a, l) => a + (p.levels[l.id]?.solved ? p.levels[l.id].best : 0), 0);

export const chapterPoints = (p: Progress, ch: number) =>
  levelsOf(ch).reduce((a, l) => a + (p.levels[l.id]?.solved ? p.levels[l.id].best : 0), 0);

export const chapterComplete = (p: Progress, ch: number) => levelsOf(ch).every((l) => p.levels[l.id]?.solved);

export const chapterUnlocked = (p: Progress, ch: number) =>
  p.settings.unlockAll || ch === 1 || chapterComplete(p, ch - 1);

export function levelUnlocked(p: Progress, id: string) {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) return false;
  if (!chapterUnlocked(p, level.chapter)) return false;
  if (p.settings.unlockAll) return true;
  const list = levelsOf(level.chapter);
  const i = list.findIndex((l) => l.id === id);
  return i === 0 || !!p.levels[list[i - 1].id]?.solved || !!p.levels[id]?.solved;
}

/** The level a student should play next. */
export function nextLevelId(p: Progress): string {
  for (const ch of CHAPTERS) {
    for (const l of levelsOf(ch.id)) if (!p.levels[l.id]?.solved && levelUnlocked(p, l.id)) return l.id;
  }
  return LEVELS[LEVELS.length - 1].id;
}

export function levelAfter(id: string): string | null {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1].id : null;
}

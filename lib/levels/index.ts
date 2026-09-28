import type { Level } from "../types";
import { CH1, CH2, CH3 } from "./ch1-3";
import { CH4, CH5, CH6 } from "./ch4-6";
import { CH7, CH8, CH9 } from "./ch7-9";

export { CHAPTERS, RANKS, rankFor } from "./chapters";

export const LEVELS: Level[] = [...CH1, ...CH2, ...CH3, ...CH4, ...CH5, ...CH6, ...CH7, ...CH8, ...CH9];

export const levelsOf = (chapter: number) => LEVELS.filter((l) => l.chapter === chapter);

export const getLevel = (id: string) => LEVELS.find((l) => l.id === id);

export const TOTAL_POINTS = LEVELS.reduce((a, l) => a + l.points, 0);

/** Assemble the real Python script for a level from the student's work. */
export function assembleCode(level: Level, work: { code?: string; fill?: string[]; order?: number[] }): string {
  if (level.mode === "fill") {
    const blanks = work.fill || [];
    let i = 0;
    return (level.fillTemplate || "").replace(/\[\[\]\]/g, () => blanks[i++] ?? "");
  }
  if (level.mode === "reorder") {
    const lines = level.reorderLines || [];
    const order = work.order && work.order.length === lines.length ? work.order : lines.map((_, k) => k);
    return order.map((k) => lines[k]).join("\n") + "\n";
  }
  return work.code ?? level.starterCode ?? "";
}

export const blankCount = (level: Level) => ((level.fillTemplate || "").match(/\[\[\]\]/g) || []).length;

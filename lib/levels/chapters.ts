import type { Chapter } from "../types";

export const CHAPTERS: Chapter[] = [
  { id: 1, title: "The Pantry", concept: "Variables", area: "Pantry", accent: "#d97706", icon: "🫙",
    blurb: "The jars have lost their labels. Give every ingredient a name." },
  { id: 2, title: "What's in the Jar", concept: "Data Types", area: "Pantry", accent: "#0d9488", icon: "🏷️",
    blurb: "Rice grains, flour, labels and light switches — every jar holds a kind of thing." },
  { id: 3, title: "The Scales Counter", concept: "Operators", area: "Scales Counter", accent: "#0284c7", icon: "⚖️",
    blurb: "Weigh, mix, split and compare ingredients." },
  { id: 4, title: "The Front Counter", concept: "Input & Output", area: "Front Counter", accent: "#7c3aed", icon: "🛎️",
    blurb: "Customers arrive. Take their orders and print their tickets." },
  { id: 5, title: "The Tasting Station", concept: "Conditions", area: "Tasting Station", accent: "#e11d48", icon: "🥄",
    blurb: "Taste, decide, adjust. Every dish takes a different path." },
  { id: 6, title: "The Stove Line", concept: "Loops", area: "Stove Line", accent: "#ea580c", icon: "🍲",
    blurb: "Stir, heat, plate and pack — again and again." },
  { id: 7, title: "The Recipe Wall", concept: "Functions", area: "Recipe Wall", accent: "#059669", icon: "📜",
    blurb: "Write reusable recipe cards and pin them on the wall." },
  { id: 8, title: "Kitchen on Fire", concept: "Debugging", area: "Fire Drill", accent: "#dc2626", icon: "🧯",
    blurb: "Smoke alarms everywhere. Read the alarms and put out the fires." },
  { id: 9, title: "Grand Opening", concept: "Final Challenge", area: "Grand Opening", accent: "#ca8a04", icon: "🎉",
    blurb: "The whole city is queueing. Nobody tells you which tool to use." },
];

export const RANKS = [
  { min: 0, title: "Kitchen Helper", icon: "🧽" },
  { min: 200, title: "Line Cook", icon: "🔪" },
  { min: 450, title: "Sous Chef", icon: "🍳" },
  { min: 700, title: "Head Chef", icon: "👨‍🍳" },
  { min: 900, title: "Master Chef", icon: "🏆" },
];

export function rankFor(points: number) {
  let r = RANKS[0];
  for (const rank of RANKS) if (points >= rank.min) r = rank;
  const next = RANKS.find((x) => x.min > points) || null;
  return { ...r, next };
}

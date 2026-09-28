import type { Chapter } from "../types";

// `title` is the kitchen station's name (the story), `plainTitle` says what you actually learn.
export const CHAPTERS: Chapter[] = [
  { id: 1, title: "The Pantry", plainTitle: "Give things a name", concept: "Variables", area: "Pantry", accent: "#d97706", icon: "🫙",
    blurb: "Pyu's jars have lost their labels. Give every ingredient a name.",
    simple: "A variable is like a labelled jar. You give it a name and put a value inside, so you can use it later.",
    example: "rice = 5" },
  { id: 2, title: "What's in the Jar", plainTitle: "Kinds of values", concept: "Data types", area: "Pantry", accent: "#0d9488", icon: "🏷️",
    blurb: "Some jars hold whole numbers, some decimals, some words, some a yes/no switch.",
    simple: "Numbers, decimals, words and True/False are different kinds of values. Learn to tell them apart and switch between them.",
    example: "sugar = 2.5\ndish = \"soup\"" },
  { id: 3, title: "The Scales Counter", plainTitle: "Do maths and compare", concept: "Operators", area: "Scales Counter", accent: "#0284c7", icon: "⚖️",
    blurb: "Weigh, add, split and compare ingredients.",
    simple: "Add, subtract, multiply and divide numbers, and ask yes/no questions like \"is this bigger than that?\"",
    example: "total = flour + sugar" },
  { id: 4, title: "The Front Counter", plainTitle: "Talk to the customer", concept: "Input & output", area: "Front Counter", accent: "#7c3aed", icon: "🛎️",
    blurb: "Customers arrive. Ask what they want and print their tickets.",
    simple: "Show messages on the screen with print(), and let someone type an answer with input().",
    example: "name = input()\nprint(\"Hello\", name)" },
  { id: 5, title: "The Tasting Station", plainTitle: "Make decisions", concept: "Conditions (if / else)", area: "Tasting Station", accent: "#e11d48", icon: "🥄",
    blurb: "Taste each dish and decide what to do next.",
    simple: "Tell the computer to do something only when a rule is true, and something else when it isn't.",
    example: "if salt > 5:\n    print(\"Too salty\")" },
  { id: 6, title: "The Stove Line", plainTitle: "Repeat steps", concept: "Loops", area: "Stove Line", accent: "#ea580c", icon: "🍲",
    blurb: "Stir, heat, plate and pack, again and again.",
    simple: "Make the computer repeat steps for you, instead of writing the same line many times.",
    example: "for i in range(3):\n    print(\"stir\")" },
  { id: 7, title: "The Recipe Wall", plainTitle: "Reusable recipes", concept: "Functions", area: "Recipe Wall", accent: "#059669", icon: "📜",
    blurb: "Write a recipe card once and use it again and again.",
    simple: "Group some steps together, give them a name, and run them whenever you want by calling that name.",
    example: "def make_tea():\n    print(\"tea!\")" },
  { id: 8, title: "Kitchen on Fire", plainTitle: "Find and fix mistakes", concept: "Debugging", area: "Fire Drill", accent: "#dc2626", icon: "🧯",
    blurb: "The smoke alarms are going off. Read them and fix the recipes.",
    simple: "Every programmer makes mistakes. Learn to read Python's error messages and fix broken code.",
    example: "NameError: name 'sugr'\n  is not defined" },
  { id: 9, title: "Grand Opening", plainTitle: "Final challenge", concept: "Everything together", area: "Grand Opening", accent: "#ca8a04", icon: "🎉",
    blurb: "The whole city is queueing, and nobody tells you which tool to use.",
    simple: "Real problems. Nobody tells you which tool to use. You choose, using everything you have learned.",
    example: "# your turn, chef!" },
];

export const RANKS = [
  { min: 0, title: "Kitchen Helper", icon: "🧽" },
  { min: 200, title: "Line Cook", icon: "🔪" },
  { min: 450, title: "Sous Chef", icon: "🥘" },
  { min: 700, title: "Head Chef", icon: "👨‍🍳" },
  { min: 900, title: "Master Chef", icon: "🏆" },
];

export function rankFor(points: number) {
  let r = RANKS[0];
  for (const rank of RANKS) if (points >= rank.min) r = rank;
  const next = RANKS.find((x) => x.min > points) || null;
  return { ...r, next };
}

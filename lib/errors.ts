import type { PyError, StopReason } from "./types";

export type AccidentKind =
  | "smudge" | "missing" | "mix" | "order" | "zero" | "slot" | "loop" | "inputs" | "import" | "recursion" | "timeout" | "generic";

export type Explained = {
  emoji: string;
  title: string; // e.g. "🔥 NameError on line 4"
  explain: string; // friendly kitchen explanation
  python?: string; // the real python message: "NameError: name 'sugr' is not defined"
  line: number | null;
  kind: AccidentKind;
};

const KEYWORDS = [
  "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue", "def", "del", "elif",
  "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal", "not", "or",
  "pass", "raise", "return", "try", "while", "with", "yield",
];

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function similarName(name: string, known: string[]): string | null {
  let best: string | null = null;
  let bestD = 99;
  for (const k of known) {
    if (k === name) continue;
    const d = k.toLowerCase() === name.toLowerCase() ? 0 : levenshtein(k, name);
    if (d < bestD && d <= Math.max(1, Math.floor(name.length / 3))) { best = k; bestD = d; }
  }
  return best;
}

const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const numWord = (n: number) => words[n] ?? String(n);

export function explainError(err: PyError, code: string, knownNames: string[] = []): Explained {
  const line = err.line ?? null;
  const src = line ? (code.split("\n")[line - 1] ?? "") : "";
  const python = `${err.type}: ${err.msg}`;
  const at = line ? ` on line ${line}` : "";
  const base = { python, line };
  const msg = err.msg || "";

  if (err.type === "SyntaxError" || err.type === "IndentationError" || err.type === "TabError") {
    let explain = `Pyu can't read line ${line ?? "?"} of the recipe. It's smudged.`;
    const kw = src.match(/^\s*([A-Za-z_]+)\s*=[^=]/);
    if (err.type !== "SyntaxError") {
      if (/expected an indented block/.test(msg)) explain = `The steps after a line ending with a colon must be indented underneath it. Pyu expected an indented step on line ${line}.`;
      else if (/unexpected indent/.test(msg)) explain = `Line ${line} is indented, but nothing above it asked for an indented block.`;
      else if (/unindent/.test(msg)) explain = `Line ${line} doesn't line up with the lines above it. Check the spaces at the start of the line.`;
      else explain = `The steps around line ${line} aren't lined up properly.`;
    } else if (kw && KEYWORDS.includes(kw[1])) {
      explain = `"${kw[1]}" is a word Python keeps for itself, so it can't be used as a jar label.`;
    } else if (/expected ':'/.test(msg)) explain = `Pyu can't read line ${line}. It looks like a colon ( : ) is missing at the end of the line.`;
    else if (/never closed/.test(msg)) explain = `A bracket was opened on line ${line} but never closed.`;
    else if (/unterminated string|EOL while scanning|unterminated triple/.test(msg)) explain = `Some text on line ${line} is missing its closing quote mark.`;
    else if (/invalid decimal literal|invalid digit/.test(msg)) explain = `Something on line ${line} starts with a digit. A jar label can't start with a number.`;
    else if (/unmatched/.test(msg)) explain = `There's a closing bracket on line ${line} with no opening bracket to match it.`;
    else if (/forgot a comma/.test(msg)) explain = `Python found two things side by side on line ${line} with nothing between them. A jar label can't contain spaces, and list items need commas between them.`;
    else if (/cannot assign to|assign to expression|assign to literal/.test(msg)) explain = `The left side of = on line ${line} must be a jar label.`;
    else if (/Maybe you meant '==' or ':='/.test(msg)) explain = `Line ${line} uses = (put in a jar) where Python expected a comparison or something else. To ask "are these equal?", use ==.`;
    return { ...base, emoji: "📜", kind: "smudge", title: `${err.type}${at}`, explain };
  }

  if (err.type === "NameError" || err.type === "UnboundLocalError") {
    const m = msg.match(/'([^']+)'/);
    const name = m ? m[1] : "?";
    const isCard = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`).test(src);
    const sim = similarName(name, knownNames);
    let explain = isCard
      ? `Pyu looked for a recipe card called "${name}" but there's no card with that name on the wall.`
      : `Pyu looked for a jar called "${name}" but there's no jar with that name.`;
    if (err.type === "UnboundLocalError") explain = `Pyu tried to use the jar "${name}" inside a recipe card before anything was put in it.`;
    if (sim) explain += ` Did you mean "${sim}"?`;
    return { ...base, emoji: "🔍", kind: "missing", title: `${err.type}${at}`, explain };
  }

  if (err.type === "TypeError") {
    let explain = "Pyu tried to mix things that don't go together, and the pot sputtered.";
    let mm: RegExpMatchArray | null;
    if (/can only concatenate str/.test(msg)) explain = "Pyu tried to glue text and a number together with +. Python won't mix those two.";
    else if ((mm = msg.match(/unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/)))
      explain = `Pyu tried to use ${mm[1]} on ${kindName(mm[2])} and ${kindName(mm[3])}. Those don't mix.`;
    else if ((mm = msg.match(/'(.+)' not supported between instances of '(\w+)' and '(\w+)'/)))
      explain = `Pyu tried to compare ${kindName(mm[2])} with ${kindName(mm[3])} using ${mm[1]}. Is one of them a number written as text?`;
    else if ((mm = msg.match(/(\w+)\(\) missing (\d+) required positional arguments?: (.+)/)))
      explain = `The recipe card ${mm[1]} needs ${mm[2] === "1" ? "the ingredient" : "the ingredients"} ${mm[3]}, but ${mm[2] === "1" ? "it wasn't" : "they weren't"} handed over.`;
    else if ((mm = msg.match(/(\w+)\(\) takes (\d+) positional arguments? but (\d+) (?:was|were) given/)))
      explain = `The recipe card ${mm[1]} has ${mm[2]} ingredient slot${mm[2] === "1" ? "" : "s"}, but Pyu handed it ${mm[3]}.`;
    else if ((mm = msg.match(/(\w+)\(\) got an unexpected keyword argument '(\w+)'/)))
      explain = `The recipe card ${mm[1]} has no ingredient slot called "${mm[2]}".`;
    else if (/object is not callable/.test(msg)) explain = "Pyu tried to use a jar as if it were a recipe card (with round brackets after it).";
    else if (/can't multiply sequence by non-int/.test(msg)) explain = "Pyu tried to multiply text by a decimal number. That's not possible.";
    else if (/object is not iterable/.test(msg)) explain = "Pyu tried to go through something one item at a time, but it isn't a list or anything else with items in it.";
    else if (/object is not subscriptable/.test(msg)) explain = "Pyu tried to pick a slot out of something that doesn't have slots.";
    return { ...base, emoji: "💨", kind: "mix", title: `TypeError${at}`, explain };
  }

  if (err.type === "ValueError") {
    const m = msg.match(/invalid literal for int\(\) with base 10: (.+)$/);
    const f = msg.match(/could not convert string to float: (.+)$/);
    let explain = "A value had the right kind but a value Pyu can't use.";
    if (m) explain = `The order ${m[1].replace(/^'|'$/g, "\"")} can't be turned into a whole number.`;
    else if (f) explain = `The order ${f[1].replace(/^'|'$/g, "\"")} can't be turned into a decimal number.`;
    return { ...base, emoji: "❓", kind: "order", title: `ValueError${at}`, explain };
  }

  if (err.type === "ZeroDivisionError")
    return { ...base, emoji: "🍽️", kind: "zero", title: `ZeroDivisionError${at}`, explain: "Pyu tried to split food onto zero plates. Dividing by zero is impossible!" };

  if (err.type === "IndexError")
    return { ...base, emoji: "🫙", kind: "slot", title: `IndexError${at}`, explain: "Pyu reached for a slot on the tray that doesn't exist. Lists start counting at 0." };

  if (err.type === "KeyError")
    return { ...base, emoji: "🔑", kind: "slot", title: `KeyError${at}`, explain: `Pyu looked for the label ${msg} in a dictionary, but it isn't there.` };

  if (err.type === "RecursionError")
    return { ...base, emoji: "🌀", kind: "recursion", title: `RecursionError${at}`, explain: "A recipe card kept using itself over and over and never finished." };

  if (err.type === "AttributeError")
    return { ...base, emoji: "🤔", kind: "generic", title: `AttributeError${at}`, explain: "Pyu tried to use a tool that this kind of value doesn't have." };

  return { ...base, emoji: "🔥", kind: "generic", title: `${err.type}${at}`, explain: "Something went wrong while Pyu was cooking. Read Python's message below." };
}

function kindName(t: string) {
  switch (t) {
    case "int": return "a whole number";
    case "float": return "a decimal number";
    case "str": return "text";
    case "bool": return "True/False";
    case "list": return "a list";
    case "NoneType": return "nothing (None)";
    default: return `a ${t}`;
  }
}

export function explainStop(reason: StopReason, opts: { inputs?: number; name?: string; blocked?: string | null }): Explained {
  switch (reason) {
    case "steps":
      return { emoji: "🌀", kind: "loop", line: null, title: "Pyu has been stirring forever",
        explain: "Pyu has been stirring forever. Your loop may never end. Check that something inside the loop changes, so it eventually stops." };
    case "inputs": {
      const n = opts.inputs ?? 0;
      const who = opts.name && !/^(Day|Night) /.test(opts.name) ? opts.name : "This customer";
      return { emoji: "🤷", kind: "inputs", line: null, title: "Out of answers",
        explain: n === 0
          ? `${who} didn't give Pyu any answers, but your recipe asked a question.`
          : `${who} only gave ${numWord(n)} answer${n === 1 ? "" : "s"}, but your recipe asked ${n + 1 === 2 ? "twice" : numWord(n + 1) + " times"}.` };
    }
    case "import":
      return { emoji: "📦", kind: "import", line: null, title: "Not in this kitchen",
        explain: `Pyu's kitchen doesn't stock "${opts.blocked ?? "that"}". Everything here can be done with plain Python, no imports needed.` };
    case "output":
      return { emoji: "🧾", kind: "loop", line: null, title: "The ticket printer jammed",
        explain: "Pyu printed so many tickets that the printer jammed (over 3,000!). Is a print stuck inside a loop?" };
    case "timeout":
    default:
      return { emoji: "⏲️", kind: "timeout", line: null, title: "The stove was switched off",
        explain: "Pyu was cooking for so long that the stove switched itself off. Is something taking forever, like a loop that never ends?" };
  }
}

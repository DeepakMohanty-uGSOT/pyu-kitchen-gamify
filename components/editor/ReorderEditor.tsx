"use client";

import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { useState } from "react";

type Props = {
  lines: string[];
  order: number[];
  onChange: (o: number[]) => void;
  execLine: number;
  errorLine: number | null;
};

/** Recipe steps as cards. The chosen order is assembled into a real script and executed. */
export default function ReorderEditor({ lines, order, onChange, execLine, errorLine }: Props) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = order.slice();
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  return (
    <ol className="flex flex-col gap-1.5 rounded-xl border p-2" style={{ borderColor: "var(--line)", background: "var(--panel-2)" }} aria-label="Recipe steps, in order">
      {order.map((k, pos) => {
        const n = pos + 1;
        const state = n === errorLine ? "border-red-500 bg-red-500/10" : n === execLine ? "border-yellow-500 bg-yellow-400/25" : "";
        return (
          <li
            key={k}
            draggable
            onDragStart={(e) => { setDrag(pos); e.dataTransfer.effectAllowed = "move"; }}
            onDragOver={(e) => { e.preventDefault(); setOver(pos); }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); if (drag !== null) move(drag, pos); setDrag(null); setOver(null); }}
            onDragEnd={() => { setDrag(null); setOver(null); }}
            className={`flex items-center gap-2 rounded-lg border-2 px-2 py-1.5 font-mono text-[14px] shadow-sm transition ${state} ${over === pos && drag !== pos ? "translate-y-0.5 border-dashed" : ""} ${drag === pos ? "opacity-50" : ""}`}
            style={{ background: state ? undefined : "var(--panel)", borderColor: state ? undefined : "var(--line)" }}
          >
            <span className="w-5 text-right text-xs opacity-50">{n === execLine ? "▶" : n}</span>
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab opacity-50" aria-hidden />
            <code className="flex-1 whitespace-pre-wrap break-all">{lines[k]}</code>
            <button type="button" className="rounded p-0.5 hover:bg-black/10 disabled:opacity-20" onClick={() => move(pos, pos - 1)} disabled={pos === 0} aria-label={`Move step ${n} up`}>
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" className="rounded p-0.5 hover:bg-black/10 disabled:opacity-20" onClick={() => move(pos, pos + 1)} disabled={pos === order.length - 1} aria-label={`Move step ${n} down`}>
              <ChevronDown className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ol>
  );
}

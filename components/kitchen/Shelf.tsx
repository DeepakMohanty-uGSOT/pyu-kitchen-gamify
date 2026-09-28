"use client";

import type { SafeValue, StackFrame, VarMap } from "@/lib/types";

export const TYPE_INFO: Record<string, { color: string; plain: string }> = {
  int: { color: "#f59e0b", plain: "whole number" },
  float: { color: "#06b6d4", plain: "decimal number" },
  str: { color: "#a855f7", plain: "text" },
  bool: { color: "#22c55e", plain: "True / False" },
  list: { color: "#ec4899", plain: "list" },
  tuple: { color: "#ec4899", plain: "tuple" },
  dict: { color: "#6366f1", plain: "dictionary" },
  NoneType: { color: "#94a3b8", plain: "nothing" },
};
const colorOf = (t: string) => TYPE_INFO[t]?.color ?? "#64748b";

/** What you can see through the glass. */
function Contents({ sv, small }: { sv: SafeValue; small?: boolean }) {
  const c = colorOf(sv.t);
  const valueText = (s: string) => (
    <span className="relative z-10 rounded px-1 font-mono font-bold leading-tight" style={{ fontSize: small ? 11 : 14, color: "var(--ink)", background: "color-mix(in srgb, var(--panel) 70%, transparent)" }}>
      {s.length > 9 ? s.slice(0, 8) + "…" : s}
    </span>
  );
  if (sv.t === "int") {
    const n = typeof sv.v === "number" ? Math.max(0, Math.min(15, Math.round(sv.v))) : 0;
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-between py-1">
        {valueText(sv.r)}
        <div className="flex flex-wrap-reverse justify-center gap-[2px] px-1.5">
          {Array.from({ length: n }).map((_, i) => (
            <span key={i} className="block rounded-full" style={{ width: small ? 5 : 8, height: small ? 5 : 8, background: `radial-gradient(circle at 35% 35%, #fde68a, ${c})`, boxShadow: "0 1px 1px rgba(0,0,0,.25)" }} />
          ))}
        </div>
      </div>
    );
  }
  if (sv.t === "float") {
    const v = typeof sv.v === "number" ? sv.v : 0;
    const lvl = Math.max(0.15, Math.min(0.92, Math.abs(v) / 5));
    return (
      <div className="relative flex h-full w-full items-start justify-center pt-1">
        <div className="absolute inset-x-0 bottom-0 smooth" style={{ height: `${lvl * 100}%`, background: `linear-gradient(180deg, color-mix(in srgb, ${c} 55%, white), ${c})`, opacity: 0.7 }} />
        {[0.25, 0.5, 0.75].map((m) => <span key={m} className="absolute right-1 h-px w-2 bg-slate-500/60" style={{ bottom: `${m * 100}%` }} />)}
        {valueText(sv.r)}
      </div>
    );
  }
  if (sv.t === "str") {
    const s = String(sv.v ?? "");
    return (
      <div className="flex h-full w-full items-center justify-center px-1">
        <span className="max-w-full -rotate-3 rounded-sm border border-amber-700/40 bg-[#fffbeb] px-1 text-center font-hand font-bold leading-none text-amber-900 shadow"
          style={{ fontSize: small ? 12 : s.length > 10 ? 13 : 16, wordBreak: "break-word" }}>
          &ldquo;{s.length > 18 ? s.slice(0, 17) + "…" : s}&rdquo;
        </span>
      </div>
    );
  }
  if (sv.t === "bool") {
    const on = sv.v === true;
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
        <span className="grid place-items-center rounded-full border-2 font-black text-white"
          style={{ width: small ? 15 : 22, height: small ? 15 : 22, fontSize: small ? 9 : 12, background: on ? "#22c55e" : "#6b7280", borderColor: on ? "#15803d" : "#4b5563", boxShadow: on ? "0 0 14px 4px rgba(34,197,94,.65)" : "none" }}>
          {on ? "✓" : "✗"}
        </span>
        <span className="font-mono font-bold" style={{ fontSize: small ? 10 : 12, color: "var(--ink)" }}>{sv.r}</span>
      </div>
    );
  }
  if (sv.t === "NoneType") return <div className="grid h-full w-full place-items-center font-mono text-xs opacity-70">empty</div>;
  return <div className="grid h-full w-full place-items-center px-1 text-center font-mono text-[10px] leading-tight break-all" style={{ color: "var(--ink)" }}>{sv.r.slice(0, 30)}</div>;
}

function NameTag({ name, small, danger }: { name: string; small?: boolean; danger?: boolean }) {
  return (
    <div className={`relative z-10 mb-0.5 max-w-full truncate rounded-md border px-1.5 text-center font-mono font-bold shadow-sm ${danger ? "border-dashed border-red-500 bg-red-100 text-red-700" : "border-amber-800/30 bg-[#fffbeb] text-stone-800"}`}
      style={{ fontSize: small ? 9.5 : 11.5, lineHeight: small ? "14px" : "17px" }} title={name}>
      {name}
    </div>
  );
}

function TypeChip({ t, small }: { t: string; small?: boolean }) {
  const info = TYPE_INFO[t];
  return (
    <span className="mt-1 whitespace-nowrap rounded-full px-1.5 font-mono font-bold text-white" style={{ background: t === "?" ? "#8b5cf6" : colorOf(t), fontSize: small ? 8.5 : 10 }}
      title={info ? `${t} = ${info.plain}` : undefined}>
      {t === "NoneType" ? "None" : t}
    </span>
  );
}

/** A glass jar. The label is the variable's name; you see its value through the glass. */
export function Jar({ name, sv, mystery, small, glow }: { name: string; sv: SafeValue; mystery?: boolean; small?: boolean; glow?: boolean }) {
  const isList = (sv.t === "list" || sv.t === "tuple") && !mystery;
  const c = mystery ? "#8b5cf6" : colorOf(sv.t);
  const w = small ? 60 : 88;
  const h = small ? 40 : 62;
  if (isList) {
    const list = (sv.v || []) as SafeValue[];
    return (
      <div className={`anim-pop flex shrink-0 flex-col items-center ${glow ? "anim-glow rounded-xl" : ""}`} title={`${name} = ${sv.r}`}>
        <NameTag name={name} small={small} />
        <div key={sv.r} className="anim-refill glass relative flex min-h-[46px] min-w-[70px] max-w-[250px] flex-wrap items-center gap-1 rounded-xl border-2 p-1.5">
          {list.length === 0 && <span className="px-1 font-mono text-[11px] opacity-60">empty list</span>}
          {list.slice(0, 8).map((it, i) => (
            <span key={i} className="rounded border border-black/10 bg-white/90 px-1 font-mono text-[10.5px] text-stone-800 shadow-sm">
              {it.t === "str" ? String(it.v).slice(0, 9) : it.r.slice(0, 9)}
            </span>
          ))}
          {(sv.n ?? 0) > 8 && <span className="font-mono text-[10px] opacity-70">+{(sv.n ?? 0) - 8}</span>}
        </div>
        <TypeChip t={sv.t} small={small} />
      </div>
    );
  }
  return (
    <div className={`anim-pop flex shrink-0 flex-col items-center ${glow ? "anim-glow rounded-xl" : ""}`} style={{ width: w }} title={mystery ? `${name} = ?` : `${name} = ${sv.r}`}>
      <NameTag name={name} small={small} />
      {/* lid */}
      <div className="w-[76%] rounded-t-md" style={{ height: small ? 6 : 9, background: `repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 2px, transparent 2px 6px), linear-gradient(180deg, color-mix(in srgb, ${c} 55%, white), color-mix(in srgb, ${c} 75%, black))` }} />
      {/* neck */}
      <div className="glass w-[68%] border-x-2" style={{ height: small ? 3 : 4 }} />
      {/* glass body */}
      <div key={mystery ? "m" : sv.t} className="anim-morph glass relative w-full overflow-hidden rounded-b-[18px] rounded-t-[10px] border-2" style={{ height: h }}>
        <span className="pointer-events-none absolute left-[9%] top-[10%] h-[72%] w-[9%] rounded-full bg-white/55" />
        <span className="pointer-events-none absolute right-[12%] top-[14%] h-[22%] w-[5%] rounded-full bg-white/40" />
        {mystery ? (
          <div className="grid h-full w-full place-items-center font-display text-2xl font-bold text-violet-600 dark:text-violet-300">?</div>
        ) : (
          <div key={sv.r} className="anim-refill h-full w-full"><Contents sv={sv} small={small} /></div>
        )}
      </div>
      <TypeChip t={mystery ? "?" : sv.t} small={small} />
    </div>
  );
}

function GhostJar({ name }: { name: string }) {
  return (
    <div className="anim-pop flex w-[88px] shrink-0 flex-col items-center" title={`There is no jar called ${name}`}>
      <NameTag name={name} danger />
      <div className="relative grid h-[75px] w-full place-items-center rounded-b-[18px] rounded-t-[10px] border-2 border-dashed border-red-500 bg-red-500/5 text-2xl">🔍</div>
      <span className="mt-1 rounded-full bg-red-600 px-1.5 font-mono text-[10px] font-bold text-white">not found</span>
    </div>
  );
}

export function Shelf({ vars, mystery = [], ghost, glowNames = [] }: { vars: VarMap; mystery?: string[]; ghost?: string | null; glowNames?: string[] }) {
  const entries = Object.entries(vars).filter(([, sv]) => sv.t !== "function");
  const shown = Array.from(new Set(entries.map(([n, sv]) => (mystery.includes(n) ? "" : sv.t)))).filter((t) => t && TYPE_INFO[t]);
  return (
    <div className="relative">
      <div className="flex min-h-[112px] items-end gap-3 overflow-x-auto px-3 pb-2 pt-3" aria-label="Shelf: your variables">
        {entries.length === 0 && !ghost && (
          <div className="pb-6 pl-1 text-sm italic opacity-70">🫙 Your variables show up here as glass jars when your code makes them.</div>
        )}
        {entries.map(([name, sv]) => (
          <Jar key={name} name={name} sv={sv} mystery={mystery.includes(name)} glow={glowNames.includes(name)} />
        ))}
        {ghost && !vars[ghost] && <GhostJar name={ghost} />}
      </div>
      <div className="shelf-board mx-1 h-3 rounded-sm" />
      {shown.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 px-3 py-1.5 text-[11px]" style={{ color: "var(--ink-2)" }} aria-label="What the jar colours mean">
          {shown.map((t) => (
            <span key={t} className="inline-flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colorOf(t) }} />
              <b className="font-mono">{t === "NoneType" ? "None" : t}</b> = {TYPE_INFO[t].plain}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function RecipeWall({ vars, stack, ret }: { vars: VarMap; stack: StackFrame[]; ret?: { fn: string; value?: SafeValue; raised?: boolean } }) {
  const cards = Object.entries(vars).filter(([, sv]) => sv.t === "function");
  if (!cards.length) return null;
  return (
    <div className="flex flex-wrap gap-3 px-3 pt-3" aria-label="Recipe wall: your functions">
      {cards.map(([key, sv]) => {
        const fn = sv.name || key;
        const frames = stack.filter((f) => f.fn === fn);
        const active = frames.length > 0;
        const top = frames[frames.length - 1];
        const isTop = stack.length > 0 && stack[stack.length - 1].fn === fn;
        const returned = ret && ret.fn === fn && !ret.raised;
        return (
          <div key={key} className={`anim-pop relative min-w-[160px] max-w-full rounded-md border bg-[#fffbeb] px-2.5 pb-2 pt-2.5 text-stone-800 shadow-md transition sm:max-w-[300px] ${active ? "ring-4 ring-emerald-400/70" : ""}`}
            style={{ borderColor: active ? "#059669" : "#d6d3d1", boxShadow: isTop ? "0 0 22px rgba(16,185,129,.55)" : undefined }}>
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600 shadow" />
            <div className="text-[9.5px] font-bold uppercase tracking-wide text-emerald-800">recipe card (function)</div>
            <div className="break-all font-mono text-[12px] font-bold">
              📜 {fn}(
              {(sv.params || []).map((p, i) => {
                const pname = p.split("=")[0];
                const val = top?.loc[pname];
                return (
                  <span key={p}>
                    {i > 0 && ", "}
                    <span className="text-emerald-700">{p}</span>
                    {val && <span key={val.r} className="anim-flyin ml-0.5 rounded bg-emerald-600 px-1 text-[10px] text-white">{val.r.slice(0, 14)}</span>}
                  </span>
                );
              })}
              )
            </div>
            {active && top && (
              <div className="mt-1.5 rounded border border-dashed border-emerald-600/50 bg-emerald-50 p-1">
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800">this card&apos;s own shelf (disappears when it finishes)</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(top.loc).filter(([, v]) => v.t !== "function").length === 0 && <span className="text-[10px] italic opacity-60">empty</span>}
                  {Object.entries(top.loc).filter(([, v]) => v.t !== "function").map(([n, v]) => (
                    <Jar key={n} name={n} sv={v} small />
                  ))}
                </div>
              </div>
            )}
            {returned && (
              <div key={`${ret!.value?.r}`} className="anim-slideout mt-1 inline-block rounded-full border-2 border-amber-600 bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900 shadow">
                🍽️ gives back {ret!.value ? ret!.value.r.slice(0, 18) : "None"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

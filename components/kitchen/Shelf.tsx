"use client";

import type { SafeValue, StackFrame, VarMap } from "@/lib/types";

const TYPE_COLORS: Record<string, string> = {
  int: "#f59e0b",
  float: "#06b6d4",
  str: "#a855f7",
  bool: "#22c55e",
  list: "#ec4899",
  tuple: "#ec4899",
  dict: "#6366f1",
  NoneType: "#94a3b8",
};

function JarBody({ sv, small }: { sv: SafeValue; small?: boolean }) {
  const h = small ? 34 : 50;
  if (sv.t === "int") {
    const n = typeof sv.v === "number" ? Math.max(0, Math.min(12, Math.round(sv.v))) : 0;
    return (
      <div className="relative flex h-full w-full flex-col items-center justify-end">
        <div className="flex flex-wrap-reverse justify-center gap-[2px] px-1 pb-1" style={{ maxHeight: h - 16 }}>
          {Array.from({ length: n }).map((_, i) => (
            <span key={i} className="block rounded-full" style={{ width: small ? 4 : 6, height: small ? 4 : 6, background: "#fbbf24", boxShadow: "inset -1px -1px 0 rgba(0,0,0,.25)" }} />
          ))}
        </div>
        <span className="absolute inset-x-0 top-0.5 text-center font-mono font-bold text-amber-900 dark:text-amber-200" style={{ fontSize: small ? 11 : 14 }}>
          {sv.r.length > 9 ? sv.r.slice(0, 8) + "…" : sv.r}
        </span>
      </div>
    );
  }
  if (sv.t === "float") {
    const v = typeof sv.v === "number" ? sv.v : 0;
    const lvl = Math.max(0.12, Math.min(1, Math.abs(v) / 5));
    return (
      <div className="relative h-full w-full">
        <div className="absolute inset-x-0 bottom-0 smooth" style={{ height: `${lvl * 100}%`, background: "linear-gradient(180deg,#67e8f9,#0891b2)", opacity: 0.75 }} />
        {[0.25, 0.5, 0.75].map((m) => (
          <span key={m} className="absolute right-0 h-px w-2 bg-cyan-900/60" style={{ bottom: `${m * 100}%` }} />
        ))}
        <span className="absolute inset-x-0 top-0.5 text-center font-mono font-bold text-cyan-950 dark:text-cyan-100" style={{ fontSize: small ? 11 : 13 }}>
          {sv.r.length > 9 ? sv.r.slice(0, 8) + "…" : sv.r}
        </span>
      </div>
    );
  }
  if (sv.t === "str") {
    const s = String(sv.v ?? "");
    return (
      <div className="flex h-full w-full items-center justify-center px-0.5">
        <span className="max-w-full rotate-[-3deg] rounded-sm border border-amber-700/40 bg-[#fffbeb] px-1 text-center font-hand font-bold leading-none text-amber-900 shadow-sm"
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
        <span className="grid place-items-center rounded-full border-2 text-[10px] font-black text-white"
          style={{ width: small ? 14 : 20, height: small ? 14 : 20, background: on ? "#22c55e" : "#6b7280", borderColor: on ? "#15803d" : "#4b5563", boxShadow: on ? "0 0 12px 3px rgba(34,197,94,.7)" : "none" }}>
          {on ? "✓" : "✗"}
        </span>
        <span className="font-mono font-bold" style={{ fontSize: small ? 10 : 12 }}>{sv.r}</span>
      </div>
    );
  }
  if (sv.t === "NoneType") return <div className="grid h-full w-full place-items-center font-mono text-xs opacity-70">None</div>;
  return <div className="grid h-full w-full place-items-center px-1 text-center font-mono text-[10px] leading-tight break-all">{sv.r.slice(0, 30)}</div>;
}

export function Jar({ name, sv, mystery, small, glow }: { name: string; sv: SafeValue; mystery?: boolean; small?: boolean; glow?: boolean }) {
  const isList = sv.t === "list" || sv.t === "tuple";
  const color = mystery ? "#8b5cf6" : TYPE_COLORS[sv.t] ?? "#64748b";
  const w = small ? 58 : 84;
  const h = small ? 40 : 58;
  if (isList && !mystery) {
    const list = (sv.v || []) as SafeValue[];
    return (
      <div className={`anim-pop flex shrink-0 flex-col items-center ${glow ? "anim-glow rounded-xl" : ""}`} title={`${name} = ${sv.r}`}>
        <div className="mb-0.5 max-w-[180px] truncate rounded bg-stone-800 px-1.5 text-[11px] font-bold text-amber-50">{name}</div>
        <div key={sv.r} className="anim-refill flex min-h-[42px] min-w-[64px] max-w-[240px] flex-wrap items-center gap-1 rounded-lg border-2 p-1"
          style={{ borderColor: color, background: "color-mix(in srgb, " + color + " 12%, var(--panel))" }}>
          {list.length === 0 && <span className="px-1 font-mono text-[11px] opacity-60">empty</span>}
          {list.slice(0, 8).map((it, i) => (
            <span key={i} className="rounded border border-black/10 bg-white/85 px-1 font-mono text-[10px] text-stone-800 shadow-sm">
              {it.t === "str" ? String(it.v).slice(0, 8) : it.r.slice(0, 8)}
            </span>
          ))}
          {(sv.n ?? 0) > 8 && <span className="font-mono text-[10px] opacity-70">+{(sv.n ?? 0) - 8}</span>}
        </div>
        <TypeChip t={sv.t} color={color} small={small} />
      </div>
    );
  }
  return (
    <div className={`anim-pop flex shrink-0 flex-col items-center ${glow ? "anim-glow rounded-xl" : ""}`} style={{ width: w }} title={mystery ? `${name} = ?` : `${name} = ${sv.r}`}>
      <div className="relative z-10 -mb-1 w-[86%] truncate rounded-t-md rounded-b-sm bg-stone-800 px-1 text-center text-[11px] font-bold text-amber-50 shadow" style={{ fontSize: small ? 9.5 : 11 }}>
        {name}
      </div>
      <div key={mystery ? "m" : sv.t} className="anim-morph relative w-full overflow-hidden rounded-b-2xl rounded-t-lg border-2"
        style={{ height: h, borderColor: color, background: "color-mix(in srgb, " + color + " 14%, rgba(255,255,255,.55))", boxShadow: "inset 6px 0 0 rgba(255,255,255,.35)" }}>
        {mystery ? (
          <div className="grid h-full w-full place-items-center font-display text-2xl font-bold text-violet-700 dark:text-violet-300">?</div>
        ) : (
          <div key={sv.r} className="anim-refill h-full w-full"><JarBody sv={sv} small={small} /></div>
        )}
      </div>
      <TypeChip t={mystery ? "?" : sv.t} color={color} small={small} />
    </div>
  );
}

function TypeChip({ t, color, small }: { t: string; color: string; small?: boolean }) {
  return (
    <span className="mt-0.5 rounded-full px-1.5 font-mono font-bold text-white" style={{ background: color, fontSize: small ? 8.5 : 10 }}>
      {t === "NoneType" ? "None" : t}
    </span>
  );
}

function GhostJar({ name }: { name: string }) {
  return (
    <div className="anim-pop flex w-[84px] shrink-0 flex-col items-center" title={`No jar called ${name}`}>
      <div className="-mb-1 w-[86%] truncate rounded-t-md border border-dashed border-red-500 bg-red-100 px-1 text-center text-[11px] font-bold text-red-700">{name}</div>
      <div className="relative grid h-[58px] w-full place-items-center rounded-b-2xl rounded-t-lg border-2 border-dashed border-red-500 bg-red-500/5 text-2xl">🔍</div>
      <span className="mt-0.5 rounded-full bg-red-600 px-1.5 font-mono text-[10px] font-bold text-white">missing</span>
    </div>
  );
}

export function Shelf({ vars, mystery = [], ghost, glowNames = [] }: { vars: VarMap; mystery?: string[]; ghost?: string | null; glowNames?: string[] }) {
  const entries = Object.entries(vars).filter(([, sv]) => sv.t !== "function");
  return (
    <div className="relative">
      <div className="flex min-h-[92px] items-end gap-3 overflow-x-auto px-3 pb-2 pt-2" aria-label="Pantry shelf: your variables">
        {entries.length === 0 && !ghost && (
          <div className="pb-4 pl-1 text-sm italic opacity-60">The shelf is empty. Jars appear here as your recipe creates them.</div>
        )}
        {entries.map(([name, sv]) => (
          <Jar key={name} name={name} sv={sv} mystery={mystery.includes(name)} glow={glowNames.includes(name)} />
        ))}
        {ghost && !vars[ghost] && <GhostJar name={ghost} />}
      </div>
      <div className="shelf-board mx-1 h-3 rounded-sm" />
    </div>
  );
}

export function RecipeWall({ vars, stack, ret }: { vars: VarMap; stack: StackFrame[]; ret?: { fn: string; value?: SafeValue; raised?: boolean } }) {
  const cards = Object.entries(vars).filter(([, sv]) => sv.t === "function");
  if (!cards.length) return null;
  return (
    <div className="flex flex-wrap gap-3 px-3 pt-2" aria-label="Recipe wall: your functions">
      {cards.map(([key, sv]) => {
        const fn = sv.name || key;
        const frames = stack.filter((f) => f.fn === fn);
        const active = frames.length > 0;
        const top = frames[frames.length - 1];
        const isTop = stack.length > 0 && stack[stack.length - 1].fn === fn;
        const returned = ret && ret.fn === fn && !ret.raised;
        return (
          <div key={key} className={`anim-pop relative min-w-[150px] max-w-[280px] rounded-md border bg-[#fffbeb] px-2.5 pb-2 pt-2.5 text-stone-800 shadow-md transition ${active ? "ring-4 ring-emerald-400/70" : ""}`}
            style={{ transform: `rotate(${(key.length % 3) - 1}deg)`, borderColor: active ? "#059669" : "#d6d3d1", boxShadow: isTop ? "0 0 22px rgba(16,185,129,.55)" : undefined }}>
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-600 shadow" />
            <div className="font-mono text-[12px] font-bold">
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
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-800">card&apos;s own shelf</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(top.loc).filter(([, v]) => v.t !== "function").length === 0 && <span className="text-[10px] italic opacity-60">empty</span>}
                  {Object.entries(top.loc).filter(([, v]) => v.t !== "function").map(([n, v]) => (
                    <Jar key={n} name={n} sv={v} small />
                  ))}
                </div>
              </div>
            )}
            {returned && (
              <div key={`${ret!.value?.r}`} className="anim-slideout absolute -right-3 -bottom-3 rounded-full border-2 border-amber-600 bg-amber-100 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-900 shadow">
                🍽️ returns {ret!.value ? ret!.value.r.slice(0, 18) : "None"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

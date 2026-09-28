"use client";

import type { Binding, SafeValue } from "@/lib/types";

type WProps = {
  b: Binding;
  value?: SafeValue;
  extra?: SafeValue;
  flash?: boolean;
  loopValue?: string;
  prints: string[];
};

const num = (sv?: SafeValue): number | null =>
  sv && (sv.t === "int" || sv.t === "float") && typeof sv.v === "number" ? (sv.v as number) : null;
const text = (sv?: SafeValue) => (sv && sv.t === "str" ? String(sv.v ?? "") : null);
const items = (sv?: SafeValue): SafeValue[] => (sv && (sv.t === "list" || sv.t === "tuple") ? ((sv.v || []) as SafeValue[]) : []);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const plain = (sv: SafeValue) => (sv.t === "str" ? String(sv.v) : sv.r);

function Frame({ children, caption, flash, missing, name }: { children: React.ReactNode; caption: React.ReactNode; flash?: boolean; missing?: boolean; name: string }) {
  return (
    <div
      key={flash ? "f" : "n"}
      className={`relative flex flex-col items-center rounded-2xl px-1 pt-1 pb-1.5 ${flash ? "anim-glow" : ""}`}
      style={{ opacity: missing ? 0.45 : 1, filter: missing ? "grayscale(.7)" : undefined }}
      aria-label={`${name}: ${typeof caption === "string" ? caption : ""}`}
    >
      <svg viewBox="0 0 120 110" className="w-[92px] h-[84px] sm:w-[112px] sm:h-[102px] overflow-visible">{children}</svg>
      <div className="mt-0.5 max-w-[130px] truncate rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] font-mono text-white">
        {caption}
      </div>
    </div>
  );
}

const Steam = ({ x = 60, y = 30, n = 3 }: { x?: number; y?: number; n?: number }) => (
  <g fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="3" strokeLinecap="round">
    {Array.from({ length: n }).map((_, i) => (
      <path key={i} className="anim-steam" style={{ animationDelay: `${i * 0.6}s` }} d={`M${x - 14 + i * 14} ${y} q -6 -8 0 -14 q 6 -6 0 -14`} />
    ))}
  </g>
);

const Pot = ({ fill = "#f59e0b", level = 1 }: { fill?: string; level?: number }) => (
  <g>
    <rect x="14" y="92" width="92" height="8" rx="2" fill="#3f3f46" />
    <rect x="8" y="56" width="10" height="6" rx="2" fill="#52525b" />
    <rect x="102" y="56" width="10" height="6" rx="2" fill="#52525b" />
    <path d="M18 52 h84 v30 a10 10 0 0 1 -10 10 h-64 a10 10 0 0 1 -10 -10 Z" fill="#9ca3af" stroke="#4b5563" strokeWidth="2" />
    <path d="M18 60 h84" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
    <ellipse cx="60" cy="52" rx="42" ry="8" fill="#6b7280" stroke="#4b5563" strokeWidth="2" />
    <ellipse cx="60" cy={52 + (1 - level) * 4} rx={36} ry={5 * level + 1} fill={fill} />
  </g>
);

const Flame = ({ size = 1 }: { size?: number }) => (
  <g transform={`translate(60 104) scale(${size}) translate(-60 -104)`}>
    <path className="anim-flame" d="M40 104 q 4 -14 10 -10 q 2 -12 10 -16 q 8 4 10 16 q 6 -4 10 10 Z" fill="#f97316" />
    <path className="anim-flame" style={{ animationDelay: ".2s" }} d="M50 104 q 4 -10 10 -14 q 6 4 10 14 Z" fill="#fde047" />
  </g>
);

function PotWidget({ b, value, flash }: WProps) {
  const n = num(value) ?? 0;
  const deg = n * 36;
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.label ?? b.variable}: ${value.r}` : `${b.variable}: no jar yet`}>
      <Pot fill="#fb923c" />
      {n > 0 && <Steam y={40} />}
      <g key={value?.r} className="anim-swirl"><ellipse cx="60" cy="52" rx="18" ry="3" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeDasharray="6 5" /></g>
      <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: "60px 52px", transition: "transform .45s cubic-bezier(.3,.9,.3,1)" }}>
        <line x1="60" y1="54" x2="84" y2="12" stroke="#92400e" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="58" cy="55" rx="7" ry="3.5" fill="#b45309" />
      </g>
    </Frame>
  );
}

function ThermoWidget({ b, value, flash }: WProps) {
  const t = num(value);
  const level = t === null ? 0 : clamp(t / 130, 0, 1);
  const boiling = t !== null && t >= 100;
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}°` : `${b.variable}: no jar yet`}>
      <g transform="translate(-10 0)">
        <Pot fill={boiling ? "#fdba74" : "#fcd34d"} />
        <Flame size={t === null ? 0.3 : 0.6 + level * 0.6} />
        {boiling && (
          <>
            <Steam y={38} />
            <g fill="rgba(255,255,255,.8)">
              <circle className="anim-bubbleup" cx="46" cy="52" r="2.5" />
              <circle className="anim-bubbleup" style={{ animationDelay: ".4s" }} cx="66" cy="52" r="2" />
              <circle className="anim-bubbleup" style={{ animationDelay: ".8s" }} cx="78" cy="52" r="2.5" />
            </g>
          </>
        )}
      </g>
      <g transform="translate(100 0)">
        <rect x="-7" y="6" width="14" height="80" rx="7" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
        <rect x="-3" y={80 - level * 70} width="6" height={level * 70 + 4} fill="#ef4444" className="smooth" />
        <circle cx="0" cy="90" r="9" fill="#ef4444" stroke="#64748b" strokeWidth="2" />
        <line x1="-10" y1={80 - (100 / 130) * 70} x2="10" y2={80 - (100 / 130) * 70} stroke="#0f172a" strokeWidth="1.5" strokeDasharray="2 2" />
        <text x="12" y={83 - (100 / 130) * 70} fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">100</text>
      </g>
    </Frame>
  );
}

function WaterPotWidget({ b, value, flash }: WProps) {
  const w = num(value);
  const lvl = w === null ? 0 : clamp(w / 10, 0, 1);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r} cups` : `${b.variable}: no jar yet`}>
      <rect x="22" y="14" width="76" height="84" rx="10" fill="rgba(186,230,253,.25)" stroke="#0369a1" strokeWidth="2.5" />
      <rect x="25" y={95 - lvl * 78} width="70" height={lvl * 78} rx="7" fill="#38bdf8" opacity=".8" className="smooth" />
      {lvl > 0 && <path d={`M25 ${95 - lvl * 78} q 9 -4 17 0 t 17 0 t 17 0 t 17 0`} fill="none" stroke="#e0f2fe" strokeWidth="2" className="smooth" />}
      {[0.2, 0.4, 0.6, 0.8].map((m) => (
        <line key={m} x1="86" x2="96" y1={95 - m * 78} y2={95 - m * 78} stroke="#0369a1" strokeWidth="1.5" />
      ))}
    </Frame>
  );
}

function SaltWidget({ b, value, flash }: WProps) {
  const s = num(value);
  const lvl = s === null ? 0 : clamp(s / 10, 0, 1);
  const salty = s !== null && s > 5;
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}${salty ? " ⚠" : ""}` : `${b.variable}: no jar yet`}>
      <g transform="translate(8 8)">
        <path d="M14 30 h30 l -4 60 h-22 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />
        <rect x="12" y="18" width="34" height="14" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
        {[20, 29, 38].map((x) => <circle key={x} cx={x} cy="24" r="1.6" fill="#334155" />)}
        <text x="29" y="66" textAnchor="middle" fontSize="16" fontWeight="800" fill="#475569" fontFamily="var(--font-display)">S</text>
      </g>
      <g transform="translate(72 8)">
        <rect x="0" y="4" width="18" height="86" rx="6" fill="rgba(0,0,0,.08)" stroke="#475569" strokeWidth="2" />
        <rect x="2" y="4" width="14" height="43" rx="4" fill="rgba(239,68,68,.18)" />
        <rect x="3" y={88 - lvl * 82} width="12" height={lvl * 82} rx="4" fill={salty ? "#ef4444" : "#22c55e"} className="smooth" />
        <line x1="-4" x2="22" y1="47" y2="47" stroke="#b91c1c" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="24" y="50" fontSize="9" fill="currentColor" fontFamily="var(--font-mono)">5</text>
      </g>
    </Frame>
  );
}

function PlatesWidget({ b, value, flash }: WProps) {
  const n = num(value) ?? (value && value.t === "list" ? value.n ?? 0 : null);
  const isText = value?.t === "str";
  const count = n === null ? 0 : clamp(Math.round(n), 0, 10);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}` : `${b.variable}: no jar yet`}>
      <ellipse cx="60" cy="98" rx="44" ry="6" fill="rgba(0,0,0,.15)" />
      {Array.from({ length: count }).map((_, i) => (
        <g key={i} className="anim-pop" style={{ animationDelay: `${i * 0.04}s` }}>
          <ellipse cx="60" cy={92 - i * 7} rx="40" ry="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          <ellipse cx="60" cy={91 - i * 7} rx="24" ry="4" fill="#e2e8f0" />
        </g>
      ))}
      {n !== null && n > 10 && <text x="104" y="30" fontSize="14" fontWeight="800" fill="currentColor">+{Math.round(n) - 10}</text>}
      {isText && (
        <g className="anim-pop">
          <rect x="18" y="30" width="84" height="40" rx="4" fill="#fef9c3" stroke="#ca8a04" strokeWidth="2" transform="rotate(-4 60 50)" />
          <text x="60" y="56" textAnchor="middle" fontSize="16" fill="#92400e" fontFamily="var(--font-hand)" transform="rotate(-4 60 50)">
            {value!.r.slice(0, 12)}
          </text>
          <text x="60" y="84" textAnchor="middle" fontSize="10" fill="#b91c1c" fontFamily="var(--font-mono)">text, not plates!</text>
        </g>
      )}
    </Frame>
  );
}

function ReceiptWidget({ b, value, flash }: WProps) {
  const shown = value ? (value.t === "str" ? value.r : value.r) : "…";
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}` : `${b.variable}: no jar yet`}>
      <rect x="20" y="92" width="80" height="10" rx="3" fill="#475569" />
      <g key={value?.r} className="anim-ticket">
        <path d="M28 8 h64 v80 l -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 -8 -5 -8 5 Z" fill="#fffef5" stroke="#a8a29e" strokeWidth="1.5" />
        <text x="60" y="26" textAnchor="middle" fontSize="10" fill="#57534e" fontFamily="var(--font-mono)">PYU&apos;S KITCHEN</text>
        <line x1="34" x2="86" y1="34" y2="34" stroke="#d6d3d1" strokeDasharray="3 2" />
        <text x="60" y="50" textAnchor="middle" fontSize="10" fill="#57534e" fontFamily="var(--font-mono)">TOTAL</text>
        <text x="60" y="70" textAnchor="middle" fontSize={shown.length > 8 ? 11 : 17} fontWeight="700" fill={value?.t === "str" ? "#b91c1c" : "#1c1917"} fontFamily="var(--font-mono)">
          {shown.length > 13 ? shown.slice(0, 12) + "…" : shown}
        </text>
      </g>
    </Frame>
  );
}

function ChilliWidget({ b, value, flash }: WProps) {
  const s = num(value);
  const lit = s === null ? 0 : clamp(Math.round(s), 0, 10);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r} 🌶️` : `${b.variable}: no jar yet`}>
      <rect x="6" y="30" width="108" height="52" rx="12" fill="rgba(0,0,0,.08)" stroke="#9f1239" strokeWidth="2" />
      {Array.from({ length: 10 }).map((_, i) => {
        const x = 12 + (i % 5) * 20;
        const y = i < 5 ? 36 : 58;
        const on = i < lit;
        return (
          <path key={i} d={`M${x + 4} ${y + 4} q 10 -2 12 6 q 2 10 -10 12 q 6 -6 -2 -18 Z`}
            fill={on ? (i >= 9 ? "#7f1d1d" : i >= 6 ? "#dc2626" : i >= 3 ? "#f97316" : "#84cc16") : "rgba(120,113,108,.35)"}
            className={on ? "anim-pop" : ""} style={{ animationDelay: `${i * 0.04}s` }} />
        );
      })}
      <text x="60" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" fontFamily="var(--font-display)">SPICE METER</text>
    </Frame>
  );
}

function TeaCupWidget({ b, value, flash }: WProps) {
  const t = (text(value) || "").toLowerCase();
  const hasTea = t.includes("tea");
  const hot = t.includes("hot");
  const cold = t.includes("cold");
  const fill = !value ? "transparent" : hasTea ? (cold ? "#a16207" : "#92400e") : t.includes("water") ? "#7dd3fc" : "#e5e7eb";
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}` : `${b.variable}: empty`}>
      <ellipse cx="56" cy="98" rx="42" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M20 40 h72 l -8 50 a 8 8 0 0 1 -8 6 h-40 a 8 8 0 0 1 -8 -6 Z" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
      <path d="M92 50 q 20 0 16 18 q -3 12 -20 14" fill="none" stroke="#94a3b8" strokeWidth="6" />
      {value && <path key={value.r} className="anim-refill" d="M24 48 h64 l -6 38 a 6 6 0 0 1 -6 4 h-40 a 6 6 0 0 1 -6 -4 Z" fill={fill} />}
      {hasTea && <g fill="#166534">{[40, 56, 70].map((x) => <ellipse key={x} cx={x} cy="52" rx="4" ry="2" transform={`rotate(20 ${x} 52)`} />)}</g>}
      {hot && <Steam x={56} y={34} />}
      {cold && <g><rect x="38" y="46" width="12" height="12" rx="2" fill="#e0f2fe" stroke="#7dd3fc" transform="rotate(12 44 52)" /><text x="96" y="30" fontSize="16">🥶</text></g>}
    </Frame>
  );
}

function KettleWidget({ b, value, flash }: WProps) {
  const t = (text(value) || "").toLowerCase();
  const hot = t.includes("hot");
  const cold = t.includes("cold");
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}` : `${b.variable}: empty`}>
      <rect x="18" y="92" width="80" height="8" rx="2" fill="#3f3f46" />
      {hot && <Flame size={0.7} />}
      <path d="M26 90 q -6 -40 32 -48 q 38 8 32 48 Z" fill={cold ? "#bae6fd" : hot ? "#fca5a5" : "#cbd5e1"} stroke="#475569" strokeWidth="2.5" className="smooth" />
      <path d="M88 60 q 18 -10 22 -26" fill="none" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
      <path d="M40 44 q 18 -22 36 0" fill="none" stroke="#475569" strokeWidth="5" />
      <circle cx="58" cy="38" r="4" fill="#475569" />
      {hot && <Steam x={112} y={30} n={2} />}
      {cold && <text x="44" y="76" fontSize="18">❄️</text>}
    </Frame>
  );
}

function OvenWidget({ b, value, flash }: WProps) {
  const isBool = value?.t === "bool";
  const on = isBool && value!.v === true;
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r} ${isBool ? (on ? "✓ ON" : "✗ OFF") : "?"}` : `${b.variable}: no jar yet`}>
      <rect x="14" y="8" width="92" height="92" rx="8" fill="#475569" stroke="#1e293b" strokeWidth="2" />
      <rect x="14" y="8" width="92" height="18" rx="8" fill="#334155" />
      {[30, 48, 66].map((x) => <circle key={x} cx={x} cy="17" r="4.5" fill="#cbd5e1" />)}
      <circle cx="92" cy="17" r="4" fill={on ? "#22c55e" : "#64748b"} />
      <rect x="24" y="34" width="72" height="52" rx="6" fill={on ? "#fb923c" : "#1e293b"} stroke="#0f172a" strokeWidth="2" className="smooth" />
      {on && <rect x="24" y="34" width="72" height="52" rx="6" fill="url(#ovenGlow)" />}
      <defs>
        <radialGradient id="ovenGlow"><stop offset="0" stopColor="#fde68a" stopOpacity=".9" /><stop offset="1" stopColor="#f97316" stopOpacity="0" /></radialGradient>
      </defs>
      {!isBool && value && <text x="60" y="68" textAnchor="middle" fontSize="14" fill="#fbbf24" fontFamily="var(--font-mono)">{value.r.slice(0, 8)}</text>}
      <rect x="30" y="90" width="60" height="5" rx="2" fill="#cbd5e1" />
    </Frame>
  );
}

function FridgeWidget({ b, value, flash, loopValue }: WProps) {
  const list = items(value);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.n ?? 0} item${value.n === 1 ? "" : "s"}` : `${b.variable}: no jar yet`}>
      <rect x="10" y="4" width="70" height="100" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <rect x="15" y="9" width="60" height="90" rx="4" fill="#f0f9ff" />
      {[36, 60, 84].map((y) => <line key={y} x1="15" x2="75" y1={y} y2={y} stroke="#94a3b8" strokeWidth="2" />)}
      <path d="M80 6 l 30 10 v 80 l -30 10 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
      {list.slice(0, 9).map((it, i) => {
        const hit = loopValue !== undefined && it.r === loopValue;
        const x = 17 + (i % 3) * 20;
        const y = 14 + Math.floor(i / 3) * 24;
        return (
          <g key={i}>
            <rect x={x} y={y} width="18" height="18" rx="4" fill={hit ? "#facc15" : "#fff"} stroke={hit ? "#ca8a04" : "#94a3b8"} strokeWidth={hit ? 2.5 : 1} className="smooth" />
            <text x={x + 9} y={y + 13} textAnchor="middle" fontSize="8" fill="#0f172a" fontFamily="var(--font-mono)">{plain(it).slice(0, 4)}</text>
          </g>
        );
      })}
    </Frame>
  );
}

function TicketsWidget({ b, value, flash, loopValue }: WProps) {
  const list = items(value);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.n ?? 0} order${value.n === 1 ? "" : "s"}` : `${b.variable}: no jar yet`}>
      <rect x="4" y="10" width="112" height="6" rx="3" fill="#78716c" />
      {list.length === 0 && value && <text x="60" y="60" textAnchor="middle" fontSize="11" fill="currentColor" opacity=".7">no orders</text>}
      {list.slice(0, 10).map((it, i) => {
        const hit = loopValue !== undefined && it.r === loopValue;
        const x = 6 + (i % 5) * 22;
        const y = 16 + Math.floor(i / 5) * 44;
        return (
          <g key={i} className="anim-ticket" style={{ animationDelay: `${i * 0.03}s` }}>
            <rect x={x} y={y + (hit ? 4 : 0)} width="20" height="38" rx="2" fill={hit ? "#fde047" : "#fffbeb"} stroke={hit ? "#ca8a04" : "#d6d3d1"} strokeWidth={hit ? 2 : 1} className="smooth" />
            <text x={x + 10} y={y + 22 + (hit ? 4 : 0)} textAnchor="middle" fontSize="7" fill="#292524" fontFamily="var(--font-mono)">{plain(it).slice(0, 5)}</text>
          </g>
        );
      })}
      {list.length > 10 && <text x="116" y="104" textAnchor="end" fontSize="10" fill="currentColor">+{list.length - 10}</text>}
    </Frame>
  );
}

function CookieBoxWidget({ b, value, extra, flash }: WProps) {
  const boxes = num(value);
  const left = num(extra);
  return (
    <Frame name={b.variable} flash={flash} missing={!value && !extra}
      caption={`${b.variable}: ${value ? value.r : "?"} · ${b.extra}: ${extra ? extra.r : "?"}`}>
      {Array.from({ length: clamp(boxes ?? 0, 0, 8) }).map((_, i) => (
        <g key={i} className="anim-pop" style={{ animationDelay: `${i * 0.05}s` }} transform={`translate(${6 + (i % 4) * 27} ${14 + Math.floor(i / 4) * 30})`}>
          <rect width="24" height="24" rx="3" fill="#f9a8d4" stroke="#be185d" strokeWidth="1.5" />
          <path d="M0 8 h24" stroke="#be185d" strokeWidth="1.2" />
          <circle cx="12" cy="16" r="4" fill="#b45309" />
        </g>
      ))}
      {Array.from({ length: clamp(left ?? 0, 0, 10) }).map((_, i) => (
        <circle key={i} className="anim-pop" cx={12 + i * 10} cy="96" r="4.5" fill="#d97706" stroke="#92400e" />
      ))}
    </Frame>
  );
}

function ScaleWidget({ b, value, flash }: WProps) {
  const w = num(value);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.label ?? b.variable}: ${value.r} g` : `${b.variable}: no jar yet`}>
      <path d="M20 36 q 40 -20 80 0 l -6 10 h-68 Z" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2" />
      <rect x="54" y="46" width="12" height="16" fill="#9ca3af" />
      <path d="M14 62 h92 l 6 36 h-104 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <rect x="30" y="70" width="60" height="20" rx="3" fill="#052e16" />
      <text key={value?.r} className="anim-refill" x="60" y="85" textAnchor="middle" fontSize="13" fill="#4ade80" fontFamily="var(--font-mono)">
        {w === null ? (value ? "ERR" : "----") : w.toFixed(Number.isInteger(w) ? 0 : 2).slice(0, 7)}
      </text>
    </Frame>
  );
}

function TrayWidget({ b, value, extra, flash, prints }: WProps) {
  const rows = clamp(num(value) ?? 0, 0, 6);
  const spots = clamp(num(extra) ?? 0, 0, 8);
  const filled = new Set<string>();
  for (const p of prints) {
    const m = p.match(/row\s*(\d+)\D+spot\s*(\d+)/i);
    if (m) filled.add(`${m[1]}-${m[2]}`);
  }
  const cw = spots ? Math.min(22, 104 / spots) : 20;
  const ch = rows ? Math.min(22, 84 / rows) : 20;
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={`tray: ${value ? value.r : "?"} × ${extra ? extra.r : "?"} · ${filled.size} 🍪`}>
      <rect x="4" y="6" width="112" height="96" rx="6" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: spots }).map((__, s) => {
          const on = filled.has(`${r + 1}-${s + 1}`);
          const cx = 60 - ((spots - 1) * cw) / 2 + s * cw;
          const cy = 54 - ((rows - 1) * ch) / 2 + r * ch;
          return on ? (
            <g key={`${r}-${s}`} className="anim-pop">
              <circle cx={cx} cy={cy} r={Math.min(cw, ch) / 2 - 1.5} fill="#d97706" stroke="#92400e" />
              <circle cx={cx - 2} cy={cy - 1} r="1.4" fill="#451a03" />
              <circle cx={cx + 2} cy={cy + 2} r="1.2" fill="#451a03" />
            </g>
          ) : (
            <circle key={`${r}-${s}`} cx={cx} cy={cy} r={Math.min(cw, ch) / 2 - 2} fill="none" stroke="#e2e8f0" strokeDasharray="2 2" />
          );
        }),
      )}
    </Frame>
  );
}

function DishWidget({ b, value, flash }: WProps) {
  const t = text(value);
  const color = t === "mild" ? "#84cc16" : t === "medium" ? "#f97316" : t === "hot" ? "#dc2626" : t === "dangerous" ? "#7f1d1d" : "#f59e0b";
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.label ?? b.variable}: ${value.r}` : `${b.variable}: no jar yet`}>
      <path d="M12 58 h96 q -6 36 -48 38 q -42 -2 -48 -38 Z" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
      <ellipse cx="60" cy="58" rx="48" ry="9" fill={color} opacity=".85" />
      <Steam y={44} n={2} />
      {value && (
        <g key={value.r} className="anim-pop">
          <line x1="96" y1="20" x2="96" y2="58" stroke="#78716c" strokeWidth="2" />
          <rect x="62" y="12" width="56" height="18" rx="3" fill="#fff7ed" stroke="#c2410c" strokeWidth="1.5" />
          <text x="90" y="25" textAnchor="middle" fontSize="11" fill="#7c2d12" fontFamily="var(--font-hand)" fontWeight="700">{plain(value).slice(0, 10)}</text>
        </g>
      )}
    </Frame>
  );
}

function AllergyWidget({ b, value, flash }: WProps) {
  const t = text(value);
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.r}` : `${b.variable}: no jar yet`}>
      <rect x="8" y="10" width="104" height="80" rx="4" fill="#1f2937" stroke="#92400e" strokeWidth="5" />
      <text x="60" y="34" textAnchor="middle" fontSize="11" fill="#e5e7eb" fontFamily="var(--font-hand)">ALLERGY</text>
      <text key={value?.r} className="anim-refill" x="60" y="62" textAnchor="middle" fontSize="18" fill={t === "peanuts" ? "#fca5a5" : "#a7f3d0"} fontFamily="var(--font-hand)" fontWeight="700">
        {t ?? "?"}
      </text>
      {t === "peanuts" && <text x="96" y="84" fontSize="14">🥜</text>}
    </Frame>
  );
}

function CookieBeltWidget({ b, value, flash, loopValue }: WProps) {
  const list = items(value);
  const color = (w: string) => (w === "burnt" ? "#292524" : w === "golden" ? "#f59e0b" : w === "chewy" ? "#d6a36b" : w === "crispy" ? "#ea580c" : "#c08457");
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.variable}: ${value.n ?? 0}` : `${b.variable}: no jar yet`}>
      <rect x="2" y="64" width="116" height="14" rx="7" fill="#57534e" />
      {[10, 30, 50, 70, 90, 110].map((x) => <circle key={x} cx={x} cy="71" r="4" fill="#a8a29e" />)}
      {list.slice(0, 6).map((it, i) => {
        const hit = loopValue !== undefined && it.r === loopValue;
        const w = plain(it);
        return (
          <g key={i}>
            <circle cx={12 + i * 19} cy={hit ? 46 : 54} r="8" fill={color(w)} stroke={hit ? "#facc15" : "#78350f"} strokeWidth={hit ? 3 : 1.2} className="smooth" />
            {w === "burnt" && <text x={12 + i * 19} y={30} textAnchor="middle" fontSize="9">💨</text>}
            <text x={12 + i * 19} y="94" textAnchor="middle" fontSize="7" fill="currentColor" fontFamily="var(--font-mono)">{w.slice(0, 5)}</text>
          </g>
        );
      })}
    </Frame>
  );
}

function CounterWidget({ b, value, flash }: WProps) {
  return (
    <Frame name={b.variable} flash={flash} missing={!value} caption={value ? `${b.label ?? b.variable}: ${value.r}` : `${b.variable}: no jar yet`}>
      <rect x="20" y="16" width="80" height="80" rx="16" fill="#fef3c7" stroke="#d97706" strokeWidth="3" />
      <text x="60" y="38" textAnchor="middle" fontSize="11" fill="#92400e" fontFamily="var(--font-display)">{(b.label ?? b.variable).toUpperCase()}</text>
      <text key={value?.r} className="anim-pop" x="60" y="78" textAnchor="middle" fontSize="32" fontWeight="800" fill="#78350f" fontFamily="var(--font-display)">
        {value ? value.r.slice(0, 5) : "?"}
      </text>
    </Frame>
  );
}

export function StationWidget(p: WProps) {
  switch (p.b.object) {
    case "pot": return <PotWidget {...p} />;
    case "thermometer": return <ThermoWidget {...p} />;
    case "waterPot": return <WaterPotWidget {...p} />;
    case "saltMeter": return <SaltWidget {...p} />;
    case "plates": return <PlatesWidget {...p} />;
    case "receipt": return <ReceiptWidget {...p} />;
    case "chilli": return <ChilliWidget {...p} />;
    case "teaCup": return <TeaCupWidget {...p} />;
    case "kettle": return <KettleWidget {...p} />;
    case "oven": return <OvenWidget {...p} />;
    case "fridge": return <FridgeWidget {...p} />;
    case "tickets": return <TicketsWidget {...p} />;
    case "cookieBox": return <CookieBoxWidget {...p} />;
    case "scale": return <ScaleWidget {...p} />;
    case "tray": return <TrayWidget {...p} />;
    case "dish": return <DishWidget {...p} />;
    case "allergyBoard": return <AllergyWidget {...p} />;
    case "cookieBelt": return <CookieBeltWidget {...p} />;
    case "counter": return <CounterWidget {...p} />;
    default: return null;
  }
}

/** Default props for scene decor when a level has no bindings. */
export function SceneDecor({ scene }: { scene: string }) {
  const common = "w-[110px] h-[96px] sm:w-[130px] sm:h-[112px]";
  if (scene === "pantry")
    return (
      <svg viewBox="0 0 130 112" className={common} aria-hidden>
        <rect x="8" y="6" width="114" height="100" rx="6" fill="#92400e" />
        <rect x="14" y="12" width="102" height="88" rx="3" fill="#fef3c7" />
        {[40, 70].map((y) => <rect key={y} x="14" y={y} width="102" height="5" fill="#b45309" />)}
        {[20, 44, 68, 92].map((x, i) => <g key={x}><rect x={x} y="18" width="16" height="22" rx="4" fill={["#fde68a", "#bbf7d0", "#fecaca", "#bfdbfe"][i]} stroke="#78350f" /><rect x={x} y="16" width="16" height="4" fill="#78350f" /></g>)}
        {[24, 54, 84].map((x, i) => <g key={x}><rect x={x} y="47" width="20" height="23" rx="5" fill={["#e9d5ff", "#fed7aa", "#d9f99d"][i]} stroke="#78350f" /></g>)}
        <text x="65" y="92" textAnchor="middle" fontSize="12" fill="#78350f" fontFamily="var(--font-hand)" fontWeight="700">pantry</text>
      </svg>
    );
  if (scene === "counter" || scene === "grand")
    return (
      <svg viewBox="0 0 130 112" className={common} aria-hidden>
        <ellipse cx="65" cy="100" rx="50" ry="7" fill="rgba(0,0,0,.15)" />
        <path d="M20 70 h90 q -6 28 -45 28 q -39 0 -45 -28 Z" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
        <ellipse cx="65" cy="70" rx="45" ry="8" fill="#fbbf24" />
        <path d="M30 66 q 35 -40 70 0" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
        <Steam x={65} y={36} />
        <path d="M100 18 l6 6 M106 12 l2 8" stroke="#d97706" strokeWidth="2" />
      </svg>
    );
  if (scene === "tasting")
    return (
      <svg viewBox="0 0 130 112" className={common} aria-hidden>
        <path d="M20 60 h90 q -6 34 -45 34 q -39 0 -45 -34 Z" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
        <ellipse cx="65" cy="60" rx="45" ry="8" fill="#f97316" />
        <path d="M84 20 l -26 40" stroke="#a8a29e" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="56" cy="62" rx="9" ry="4" fill="#d6d3d1" />
        <Steam y={44} />
      </svg>
    );
  if (scene === "wall")
    return (
      <svg viewBox="0 0 130 112" className={common} aria-hidden>
        <rect x="8" y="8" width="114" height="96" rx="6" fill="#a16207" />
        <rect x="14" y="14" width="102" height="84" rx="3" fill="#d9b48a" />
        {[[22, 22], [70, 26], [34, 60], [80, 62]].map(([x, y], i) => (
          <g key={i} transform={`rotate(${[-5, 4, 3, -3][i]} ${x + 16} ${y + 12})`}>
            <rect x={x} y={y} width="32" height="26" rx="2" fill="#fffbeb" stroke="#a8a29e" />
            <circle cx={x + 16} cy={y + 2} r="2.5" fill="#dc2626" />
            <line x1={x + 5} x2={x + 27} y1={y + 12} y2={y + 12} stroke="#a8a29e" />
            <line x1={x + 5} x2={x + 22} y1={y + 18} y2={y + 18} stroke="#a8a29e" />
          </g>
        ))}
      </svg>
    );
  if (scene === "stove" || scene === "fire")
    return (
      <svg viewBox="0 0 130 112" className={common} aria-hidden>
        <g transform="translate(5 0)"><Pot fill="#fb923c" /><Flame size={0.8} /><Steam y={40} /></g>
      </svg>
    );
  return (
    <svg viewBox="0 0 130 112" className={common} aria-hidden>
      <path d="M20 36 q 45 -20 90 0 l -6 10 h-78 Z" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2" />
      <rect x="58" y="46" width="14" height="16" fill="#9ca3af" />
      <path d="M14 62 h102 l 6 36 h-114 Z" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
      <rect x="35" y="70" width="60" height="20" rx="3" fill="#052e16" />
      <text x="65" y="85" textAnchor="middle" fontSize="13" fill="#4ade80" fontFamily="var(--font-mono)">0.00</text>
    </svg>
  );
}

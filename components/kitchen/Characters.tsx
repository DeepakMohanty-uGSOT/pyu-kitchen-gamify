"use client";

export type PyuMood = "idle" | "cooking" | "happy" | "confused" | "panicked" | "proud" | "sheepish" | "dizzy";

/** Chef Pyu: a friendly snake chef with a tall chef's hat, chef's jacket and wooden spoon. */
export function Pyu({ mood = "idle", size = 150 }: { mood?: PyuMood; size?: number }) {
  const anim =
    mood === "panicked" || mood === "dizzy" ? "anim-shake" : mood === "proud" || mood === "happy" ? "anim-hop" : "anim-bob";
  const eyesClosed = mood === "proud";
  const pupilR = mood === "panicked" ? 2.4 : 4.6;
  const look = mood === "confused" ? -2 : mood === "cooking" ? 3 : 0;
  const blush = mood === "happy" || mood === "proud" || mood === "sheepish" ? 0.85 : 0.35;
  return (
    <svg viewBox="0 0 150 190" width={size} height={(size * 190) / 150} className={anim} role="img" aria-label={`Chef Pyu looks ${mood}`}>
      <defs>
        <linearGradient id="pyuBody" x1="0" x2="1">
          <stop offset="0" stopColor="#3aa757" />
          <stop offset="1" stopColor="#5fcf78" />
        </linearGradient>
        <linearGradient id="pyuCoat" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="181" rx="58" ry="7" fill="rgba(0,0,0,.18)" />
      {/* coil */}
      <path d="M22 170 C 20 146, 128 142, 128 168 C 128 182, 26 186, 22 170 Z" fill="url(#pyuBody)" stroke="#2c8a45" strokeWidth="2" />
      <path d="M40 168 C 60 160, 100 160, 114 167" stroke="#2c8a45" strokeWidth="2" fill="none" opacity=".5" />
      {/* tail holding a wooden spoon */}
      <g>
        <line x1="130" y1="160" x2="146" y2="104" stroke="#a16207" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="147" cy="98" rx="6" ry="9" fill="#ca8a04" stroke="#854d0e" strokeWidth="1.5" transform="rotate(16 147 98)" />
        <path d="M126 166 q 16 -4 12 -18 q -1 6 -10 10" fill="#4cc26a" stroke="#2c8a45" strokeWidth="2" />
      </g>
      {/* neck */}
      <path d="M104 160 C 124 126, 44 124, 66 88" stroke="#2c8a45" strokeWidth="30" fill="none" strokeLinecap="round" />
      <path d="M104 160 C 124 126, 44 124, 66 88" stroke="url(#pyuBody)" strokeWidth="26" fill="none" strokeLinecap="round" />
      {/* chef's jacket */}
      <path d="M44 100 Q 72 90 102 100 L 104 138 Q 74 150 44 138 Z" fill="url(#pyuCoat)" stroke="#94a3b8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M73 97 L 73 144" stroke="#cbd5e1" strokeWidth="1.5" />
      {[108, 120, 132].map((y) => (
        <g key={y} fill="#475569">
          <circle cx="64" cy={y} r="2.2" />
          <circle cx="82" cy={y} r="2.2" />
        </g>
      ))}
      {/* neckerchief */}
      <path d="M52 98 L 94 96 L 74 114 Z" fill="#e8483f" stroke="#b83229" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="73" cy="99" r="3.5" fill="#b83229" />
      {/* head */}
      <ellipse cx="72" cy="76" rx="38" ry="29" fill="url(#pyuBody)" stroke="#2c8a45" strokeWidth="2" />
      <ellipse cx="58" cy="88" rx="6" ry="3" fill="#ff9aa2" opacity={blush} />
      <ellipse cx="88" cy="88" rx="6" ry="3" fill="#ff9aa2" opacity={blush} />
      {/* eyes */}
      {eyesClosed ? (
        <g stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M52 72 q 7 -7 14 0" />
          <path d="M80 72 q 7 -7 14 0" />
        </g>
      ) : mood === "dizzy" ? (
        <g stroke="#1f2937" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M53 68 l10 10 M63 68 l-10 10" />
          <path d="M81 68 l10 10 M91 68 l-10 10" />
        </g>
      ) : (
        <g>
          <ellipse cx="59" cy="72" rx="10" ry="11" fill="#fff" stroke="#1f2937" strokeWidth="1.5" />
          <ellipse cx="87" cy="72" rx="10" ry="11" fill="#fff" stroke="#1f2937" strokeWidth="1.5" />
          <circle cx={60 + look} cy="74" r={pupilR} fill="#1f2937" />
          <circle cx={88 + look} cy="74" r={pupilR} fill="#1f2937" />
          <circle cx={61.5 + look} cy="72" r="1.4" fill="#fff" />
          <circle cx={89.5 + look} cy="72" r="1.4" fill="#fff" />
        </g>
      )}
      {mood === "confused" && <path d="M78 58 q 9 -6 18 0" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mood === "panicked" && (
        <g stroke="#1f2937" strokeWidth="3" strokeLinecap="round">
          <path d="M50 59 l 14 -4" />
          <path d="M96 59 l -14 -4" />
        </g>
      )}
      {/* mouth */}
      {mood === "happy" || mood === "proud" ? (
        <path d="M60 89 q 13 12 26 0 q -13 5 -26 0 Z" fill="#9f1239" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
      ) : mood === "panicked" ? (
        <ellipse cx="73" cy="92" rx="6" ry="6" fill="#9f1239" stroke="#1f2937" strokeWidth="2" />
      ) : mood === "confused" || mood === "dizzy" ? (
        <path d="M62 92 q 5 -4 10 0 q 5 4 10 0" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === "sheepish" ? (
        <path d="M63 91 q 10 6 20 -2" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M63 89 q 10 8 20 0" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* tall pleated chef's hat */}
      <g>
        <path d="M46 50 L 46 22 Q 46 12 56 12 L 88 12 Q 98 12 98 22 L 98 50 Z" fill="url(#pyuCoat)" stroke="#94a3b8" strokeWidth="1.8" />
        <circle cx="52" cy="16" r="11" fill="#fff" stroke="#94a3b8" strokeWidth="1.8" />
        <circle cx="72" cy="9" r="13" fill="#fff" stroke="#94a3b8" strokeWidth="1.8" />
        <circle cx="92" cy="16" r="11" fill="#fff" stroke="#94a3b8" strokeWidth="1.8" />
        <rect x="47" y="14" width="50" height="22" fill="#fff" />
        {[58, 72, 86].map((x) => <path key={x} d={`M${x} 22 L ${x} 44`} stroke="#cbd5e1" strokeWidth="1.5" />)}
        <rect x="42" y="42" width="60" height="11" rx="3" fill="#fff" stroke="#94a3b8" strokeWidth="1.8" />
      </g>
      {(mood === "panicked" || mood === "sheepish") && (
        <path d="M108 60 q 5 8 0 12 q -5 -4 0 -12 Z" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1" />
      )}
      {mood === "confused" && (
        <text x="110" y="54" fontSize="26" fontWeight="800" fill="#d97706" fontFamily="var(--font-display)">?</text>
      )}
      {mood === "proud" && (
        <g fill="#facc15">
          <path className="anim-sparkle" d="M18 50 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" />
          <path className="anim-sparkle" style={{ animationDelay: ".3s" }} d="M118 36 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" />
        </g>
      )}
    </svg>
  );
}

/** The game's logo: Chef Pyu's face in his chef's hat. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label="Pyu's Kitchen logo">
      <defs>
        <linearGradient id="logoBg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logoBg)" />
      <ellipse cx="32" cy="44" rx="19" ry="14" fill="#4cc26a" stroke="#2c8a45" strokeWidth="2" />
      <circle cx="25" cy="42" r="5" fill="#fff" />
      <circle cx="39" cy="42" r="5" fill="#fff" />
      <circle cx="26" cy="43" r="2.4" fill="#1f2937" />
      <circle cx="40" cy="43" r="2.4" fill="#1f2937" />
      <path d="M26 50 q 6 5 12 0" stroke="#1f2937" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M19 31 L 19 16 Q 19 11 24 11 L 40 11 Q 45 11 45 16 L 45 31 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="22" cy="14" r="6" fill="#fff" />
      <circle cx="32" cy="9" r="7" fill="#fff" />
      <circle cx="42" cy="14" r="6" fill="#fff" />
      <path d="M26 17 v12 M32 17 v12 M38 17 v12" stroke="#e2e8f0" strokeWidth="1.5" />
      <rect x="16" y="28" width="32" height="6" rx="2" fill="#fff" stroke="#cbd5e1" strokeWidth="1.2" />
    </svg>
  );
}

/** Byte: the student's little helper robot. */
export function Byte({ size = 56, talking = false }: { size?: number; talking?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={talking ? "anim-bob" : ""} role="img" aria-label="Byte, your helper">
      <line x1="32" y1="10" x2="32" y2="3" stroke="#475569" strokeWidth="2.5" />
      <circle cx="32" cy="4" r="3.5" fill={talking ? "#facc15" : "#fde68a"} stroke="#ca8a04" strokeWidth="1.2" />
      <rect x="9" y="10" width="46" height="40" rx="12" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="2" />
      <rect x="15" y="16" width="34" height="24" rx="7" fill="#0f172a" />
      <circle cx="25" cy="27" r="4" fill="#67e8f9" />
      <circle cx="39" cy="27" r="4" fill="#67e8f9" />
      <path d={talking ? "M26 34 q 6 5 12 0" : "M27 34 h10"} stroke="#67e8f9" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="18" y="50" width="8" height="8" rx="2" fill="#1d4ed8" />
      <rect x="38" y="50" width="8" height="8" rx="2" fill="#1d4ed8" />
      <text x="32" y="47.5" textAnchor="middle" fontSize="6" fill="#dbeafe" fontFamily="var(--font-mono)">01</text>
    </svg>
  );
}

const CAST = [
  { skin: "#c68642", hair: "#1f1a17", shirt: "#8b5cf6", style: 0 },
  { skin: "#8d5524", hair: "#111827", shirt: "#0ea5e9", style: 1 },
  { skin: "#f1c27d", hair: "#3b2416", shirt: "#f43f5e", style: 2 },
  { skin: "#e0ac69", hair: "#b45309", shirt: "#10b981", style: 3 },
  { skin: "#6b4226", hair: "#0f0f0f", shirt: "#f59e0b", style: 2 },
  { skin: "#ffdbac", hair: "#78350f", shirt: "#6366f1", style: 1 },
  { skin: "#a5673f", hair: "#27272a", shirt: "#ec4899", style: 0 },
  { skin: "#d9a066", hair: "#52525b", shirt: "#14b8a6", style: 3 },
];

export type CustomerMood = "waiting" | "talking" | "happy" | "unhappy" | "cheer";

export function CustomerFigure({ seed = 0, mood = "waiting", size = 120 }: { seed?: number; mood?: CustomerMood; size?: number }) {
  const c = CAST[((seed % CAST.length) + CAST.length) % CAST.length];
  const hairPath = [
    "M30 36 q 20 -26 40 0 q -4 -10 -20 -10 q -16 0 -20 10 Z",
    "M28 40 q 2 -26 22 -26 q 20 0 22 26 q -6 -14 -22 -14 q -16 0 -22 14 Z",
    "M26 44 q 0 -30 24 -30 q 24 0 24 30 l -4 22 q -2 -26 -20 -30 q -18 4 -20 30 Z",
    "M32 30 q 18 -16 36 0 q 2 -12 -18 -14 q -20 2 -18 14 Z",
  ][c.style];
  const mouth =
    mood === "happy" || mood === "cheer" ? <path d="M42 56 q 8 8 16 0" stroke="#3f1d0b" strokeWidth="2.5" fill="#9f1239" strokeLinecap="round" /> :
    mood === "unhappy" ? <path d="M42 60 q 8 -7 16 0" stroke="#3f1d0b" strokeWidth="2.5" fill="none" strokeLinecap="round" /> :
    mood === "talking" ? <ellipse cx="50" cy="57" rx="4" ry="3" fill="#9f1239" /> :
    <path d="M44 57 h12" stroke="#3f1d0b" strokeWidth="2.5" strokeLinecap="round" />;
  return (
    <svg viewBox="0 0 100 130" width={size} height={(size * 130) / 100} className={mood === "cheer" ? "anim-hop" : mood === "unhappy" ? "anim-shake" : ""} role="img" aria-label={`Customer looks ${mood}`}>
      <ellipse cx="50" cy="126" rx="34" ry="4" fill="rgba(0,0,0,.15)" />
      {/* body */}
      <path d="M18 128 q 0 -44 32 -44 q 32 0 32 44 Z" fill={c.shirt} />
      <path d="M40 86 l10 10 10 -10" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" />
      {mood === "cheer" && (
        <g stroke={c.shirt} strokeWidth="9" strokeLinecap="round">
          <path d="M24 96 l -12 -26" />
          <path d="M76 96 l 12 -26" />
        </g>
      )}
      <rect x="44" y="70" width="12" height="16" fill={c.skin} />
      {/* head */}
      <circle cx="50" cy="46" r="24" fill={c.skin} />
      <path d={hairPath} fill={c.hair} />
      <circle cx="41" cy="46" r="3" fill="#1f1308" />
      <circle cx="59" cy="46" r="3" fill="#1f1308" />
      {mood === "unhappy" && <path d="M36 38 l8 3 M64 38 l-8 3" stroke="#1f1308" strokeWidth="2" strokeLinecap="round" />}
      {(mood === "happy" || mood === "cheer") && (
        <g fill="#fb7185" opacity=".45"><ellipse cx="36" cy="54" rx="4" ry="2.5" /><ellipse cx="64" cy="54" rx="4" ry="2.5" /></g>
      )}
      {mouth}
    </svg>
  );
}

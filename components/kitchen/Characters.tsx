"use client";

export type PyuMood = "idle" | "cooking" | "happy" | "confused" | "panicked" | "proud" | "sheepish" | "dizzy";

/** Chef Pyu: a friendly snake chef in a tall hat. */
export function Pyu({ mood = "idle", size = 150 }: { mood?: PyuMood; size?: number }) {
  const anim =
    mood === "panicked" ? "anim-shake" : mood === "proud" || mood === "happy" ? "anim-hop" : mood === "dizzy" ? "anim-shake" : "anim-bob";
  const eyesClosed = mood === "proud";
  const pupilR = mood === "panicked" ? 2.4 : 4.6;
  const look = mood === "confused" ? -2 : mood === "cooking" ? 3 : 0;
  return (
    <svg viewBox="0 0 150 180" width={size} height={(size * 180) / 150} className={anim} role="img" aria-label={`Chef Pyu looks ${mood}`}>
      <defs>
        <linearGradient id="pyuBody" x1="0" x2="1">
          <stop offset="0" stopColor="#3aa757" />
          <stop offset="1" stopColor="#5fcf78" />
        </linearGradient>
        <linearGradient id="pyuBelly" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#f6e7a1" />
          <stop offset="1" stopColor="#e9cf72" />
        </linearGradient>
      </defs>
      <ellipse cx="75" cy="170" rx="58" ry="8" fill="rgba(0,0,0,.18)" />
      {/* coil */}
      <path d="M22 160 C 20 136, 128 132, 128 158 C 128 172, 26 176, 22 160 Z" fill="url(#pyuBody)" stroke="#2c8a45" strokeWidth="2" />
      <path d="M40 158 C 60 150, 100 150, 114 157" stroke="#2c8a45" strokeWidth="2" fill="none" opacity=".5" />
      {/* tail tip */}
      <path d="M126 156 q 16 -4 14 -18 q -2 8 -12 10" fill="#4cc26a" stroke="#2c8a45" strokeWidth="2" />
      {/* neck */}
      <path d="M104 150 C 124 116, 44 112, 66 76" stroke="#2c8a45" strokeWidth="30" fill="none" strokeLinecap="round" />
      <path d="M104 150 C 124 116, 44 112, 66 76" stroke="url(#pyuBody)" strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M100 146 C 114 118, 52 116, 70 82" stroke="url(#pyuBelly)" strokeWidth="9" fill="none" strokeLinecap="round" opacity=".9" />
      {/* neckerchief */}
      <path d="M50 88 L 92 86 L 72 106 Z" fill="#e8483f" stroke="#b83229" strokeWidth="2" strokeLinejoin="round" />
      {/* head */}
      <ellipse cx="72" cy="66" rx="38" ry="30" fill="url(#pyuBody)" stroke="#2c8a45" strokeWidth="2" />
      <ellipse cx="60" cy="78" rx="6" ry="3" fill="#ff9aa2" opacity={mood === "happy" || mood === "proud" || mood === "sheepish" ? 0.8 : 0.35} />
      <ellipse cx="88" cy="78" rx="6" ry="3" fill="#ff9aa2" opacity={mood === "happy" || mood === "proud" || mood === "sheepish" ? 0.8 : 0.35} />
      {/* eyes */}
      {eyesClosed ? (
        <g stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M52 62 q 7 -7 14 0" />
          <path d="M80 62 q 7 -7 14 0" />
        </g>
      ) : mood === "dizzy" ? (
        <g stroke="#1f2937" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M53 58 l10 10 M63 58 l-10 10" />
          <path d="M81 58 l10 10 M91 58 l-10 10" />
        </g>
      ) : (
        <g>
          <ellipse cx="59" cy="62" rx="10" ry="11" fill="#fff" stroke="#1f2937" strokeWidth="1.5" />
          <ellipse cx="87" cy="62" rx="10" ry="11" fill="#fff" stroke="#1f2937" strokeWidth="1.5" />
          <circle cx={60 + look} cy="64" r={pupilR} fill="#1f2937" />
          <circle cx={88 + look} cy="64" r={pupilR} fill="#1f2937" />
          <circle cx={61.5 + look} cy="62" r="1.4" fill="#fff" />
          <circle cx={89.5 + look} cy="62" r="1.4" fill="#fff" />
        </g>
      )}
      {/* brows */}
      {mood === "confused" && <path d="M78 47 q 9 -6 18 0" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {mood === "panicked" && (
        <g stroke="#1f2937" strokeWidth="3" strokeLinecap="round">
          <path d="M50 49 l 14 -4" />
          <path d="M96 49 l -14 -4" />
        </g>
      )}
      {/* mouth */}
      {mood === "happy" || mood === "proud" ? (
        <path d="M60 80 q 13 12 26 0 q -13 5 -26 0 Z" fill="#9f1239" stroke="#1f2937" strokeWidth="2" strokeLinejoin="round" />
      ) : mood === "panicked" ? (
        <ellipse cx="73" cy="83" rx="6" ry="7" fill="#9f1239" stroke="#1f2937" strokeWidth="2" />
      ) : mood === "confused" || mood === "dizzy" ? (
        <path d="M62 84 q 5 -4 10 0 q 5 4 10 0" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : mood === "sheepish" ? (
        <path d="M63 82 q 10 6 20 -2" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M63 80 q 10 8 20 0" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {(mood === "happy" || mood === "proud") && <path d="M72 88 q 2 8 -2 12 M72 88 q 4 7 4 12" stroke="#e11d48" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {/* chef hat */}
      <g>
        <rect x="44" y="30" width="56" height="14" rx="3" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="52" cy="24" r="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="72" cy="16" r="15" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <circle cx="92" cy="24" r="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="45" y="28" width="54" height="10" fill="#fff" />
        <path d="M46 38 h52" stroke="#e2e8f0" strokeWidth="2" />
      </g>
      {/* extras */}
      {(mood === "panicked" || mood === "sheepish") && (
        <path d="M108 50 q 5 8 0 12 q -5 -4 0 -12 Z" fill="#7dd3fc" stroke="#0284c7" strokeWidth="1" />
      )}
      {mood === "confused" && (
        <text x="112" y="42" fontSize="26" fontWeight="800" fill="#d97706" fontFamily="var(--font-display)">?</text>
      )}
      {mood === "proud" && (
        <g fill="#facc15">
          <path className="anim-sparkle" d="M20 40 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" />
          <path className="anim-sparkle" style={{ animationDelay: ".3s" }} d="M122 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 Z" />
        </g>
      )}
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

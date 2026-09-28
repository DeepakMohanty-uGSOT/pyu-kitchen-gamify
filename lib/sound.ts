// Tiny synthesized sounds (no audio files). Off by default; toggled in the header.

let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

export function play(kind: "success" | "fail" | "tick" | "print", enabled: boolean) {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx = ctx || new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (kind === "success") [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.35, "triangle"));
    else if (kind === "fail") { tone(330, 0, 0.25, "sine", 0.06); tone(262, 0.18, 0.35, "sine", 0.06); }
    else if (kind === "print") tone(1200, 0, 0.05, "square", 0.02);
    else tone(880, 0, 0.04, "sine", 0.03);
  } catch {
    /* audio not available */
  }
}

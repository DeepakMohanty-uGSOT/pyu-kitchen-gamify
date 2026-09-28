"use client";

import dynamic from "next/dynamic";

const GameApp = dynamic(() => import("@/components/GameApp"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen grid place-items-center">
      <div className="font-display text-2xl opacity-70">👨‍🍳 Opening Pyu&apos;s Kitchen…</div>
    </div>
  ),
});

export default function Page() {
  return <GameApp />;
}

import type { Metadata, Viewport } from "next";
import { Caveat, Fredoka, JetBrains_Mono, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", weight: ["400", "500", "600", "700"] });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Pyu's Kitchen: Learn Python by Cooking",
  description:
    "Write real Python recipes for Chef Pyu and watch the kitchen react to what your code actually does. Game 1 of the learning journey: Python Fundamentals.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf5ec" },
    { media: "(prefers-color-scheme: dark)", color: "#17120e" },
  ],
};

const themeScript = `(function(){try{var p=JSON.parse(localStorage.getItem('pyus-kitchen-progress-v1')||'{}');var t=(p.settings&&p.settings.theme)||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fredoka.variable} ${nunito.variable} ${mono.variable} ${caveat.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

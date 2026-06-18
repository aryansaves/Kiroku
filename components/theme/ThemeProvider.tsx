"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Must mirror ThemePaletteSwitcher palettes exactly
const palettes = [
  { name: "Amber Archive",  paper: "250 248 240", ink: "22 20 28",    accent: "220 135 25",  card: "245 242 232", muted: "135 118 95"  },
  { name: "Midnight Type",  paper: "18 18 28",    ink: "230 235 245", accent: "0 210 180",   card: "26 26 38",    muted: "120 125 145" },
  { name: "Verdigris",      paper: "228 242 238",  ink: "20 30 28",    accent: "225 75 70",   card: "238 248 244", muted: "100 125 118" },
  { name: "Inkwell",        paper: "252 250 245",  ink: "15 18 38",    accent: "55 130 225",  card: "248 245 238", muted: "110 105 95"  },
  { name: "Concrete",       paper: "245 242 240",  ink: "18 18 22",    accent: "245 195 40",  card: "238 235 232", muted: "140 135 128" },
  { name: "Crimson Press",  paper: "250 246 240",  ink: "24 20 22",    accent: "215 45 75",   card: "248 242 235", muted: "130 115 110" },
];

function applyStoredPalette() {
  try {
    const stored = localStorage.getItem("kiroku.palette");
    const p = palettes.find((x) => x.name === stored) ?? palettes[0];
    const r = document.documentElement;
    r.style.setProperty("--paper", p.paper);
    r.style.setProperty("--ink", p.ink);
    r.style.setProperty("--accent", p.accent);
    r.style.setProperty("--card", p.card);
    r.style.setProperty("--muted", p.muted);
  } catch {
    // localStorage may be unavailable in private mode
  }
}

/**
 * Applies the saved palette on every client-side page navigation.
 * Rendered once in the root layout so it's always present.
 */
export function ThemeProvider() {
  const pathname = usePathname();

  useEffect(() => {
    applyStoredPalette();
  }, [pathname]); // re-fires on every route change

  return null;
}

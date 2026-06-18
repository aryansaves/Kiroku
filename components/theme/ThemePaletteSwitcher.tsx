"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

type ColorSet = {
  paper: string;
  ink: string;
  accent: string;
  card: string;
  muted: string;
};

type PaletteDef = {
  name: string;
  colors: ColorSet;
};

const palettes: PaletteDef[] = [
  {
    name: "Amber Archive",
    colors: {
      paper: "250 248 240",
      ink: "22 20 28",
      accent: "220 135 25",
      card: "245 242 232",
      muted: "135 118 95"
    }
  },
  {
    name: "Midnight Type",
    colors: {
      paper: "18 18 28",
      ink: "230 235 245",
      accent: "0 210 180",
      card: "26 26 38",
      muted: "120 125 145"
    }
  },
  {
    name: "Verdigris",
    colors: {
      paper: "228 242 238",
      ink: "20 30 28",
      accent: "225 75 70",
      card: "238 248 244",
      muted: "100 125 118"
    }
  },
  {
    name: "Inkwell",
    colors: {
      paper: "252 250 245",
      ink: "15 18 38",
      accent: "55 130 225",
      card: "248 245 238",
      muted: "110 105 95"
    }
  },
  {
    name: "Concrete",
    colors: {
      paper: "245 242 240",
      ink: "18 18 22",
      accent: "245 195 40",
      card: "238 235 232",
      muted: "140 135 128"
    }
  },
  {
    name: "Crimson Press",
    colors: {
      paper: "250 246 240",
      ink: "24 20 22",
      accent: "215 45 75",
      card: "248 242 235",
      muted: "130 115 110"
    }
  }
];

const STORAGE_KEY = "kiroku.palette";

function applyColors(colors: ColorSet) {
  const root = document.documentElement;
  root.style.setProperty("--paper", colors.paper, "important");
  root.style.setProperty("--ink", colors.ink, "important");
  root.style.setProperty("--accent", colors.accent, "important");
  root.style.setProperty("--card", colors.card, "important");
  root.style.setProperty("--muted", colors.muted, "important");
}

export function ThemePaletteSwitcher({ terse = false }: { terse?: boolean }) {
  // Always start with default — avoids SSR/client hydration mismatch.
  // The stored palette is applied by ThemeProvider on mount.
  const [active, setActive] = useState(palettes[0].name);

  // Sync UI indicator to stored palette after first client render
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && palettes.some((p) => p.name === stored)) {
      setActive(stored);
    }
  }, []);

  // Apply colors whenever the active palette changes
  useEffect(() => {
    const palette = palettes.find((p) => p.name === active);
    if (palette) applyColors(palette.colors);
  }, [active]);

  function pick(palette: PaletteDef) {
    setActive(palette.name);
    localStorage.setItem(STORAGE_KEY, palette.name);
  }

  return (
    <div
      className={`inline-flex items-center gap-2 border-2 border-ink bg-card px-2 py-1.5 ${
        terse ? "shadow-none" : "shadow-[3px_3px_0_rgb(var(--ink))]"
      }`}
    >
      {!terse ? (
        <Palette className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
      ) : null}
      <div className="flex items-center gap-1">
        {palettes.map((palette) => (
          <button
            key={palette.name}
            type="button"
            aria-label={`${palette.name} theme`}
            title={palette.name}
            onClick={() => pick(palette)}
            className={`relative flex h-5 w-5 shrink-0 items-center justify-center border transition hover:scale-110 ${
              active === palette.name
                ? "border-ink shadow-[2px_2px_0_rgb(var(--ink))]"
                : "border-muted"
            }`}
            style={{ background: `rgb(${palette.colors.paper})` }}
          >
            <span
              className="block h-2 w-2"
              style={{ background: `rgb(${palette.colors.accent})` }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

import type { Theme } from "@/lib/types";
import type { CSSProperties } from "react";

function hexToRgb(hex: string, fallback: string) {
  const normalized = hex.replace("#", "").trim();
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;

  const value = Number.parseInt(normalized, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}

export function themeVariables(theme: Theme) {
  const { background, text, accent, card } = theme.colorScheme;

  return {
    "--paper": hexToRgb(background, "250 248 240"),
    "--ink": hexToRgb(text, "22 20 28"),
    "--accent": hexToRgb(accent, "220 135 25"),
    "--card": hexToRgb(card, "245 242 232"),
    "--muted": "135 118 95"
  } as CSSProperties;
}

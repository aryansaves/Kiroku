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
    "--paper": hexToRgb(background, "255 247 214"),
    "--ink": hexToRgb(text, "18 18 18"),
    "--accent": hexToRgb(accent, "255 75 31"),
    "--card": hexToRgb(card, "255 247 214"),
    "--muted": "89 80 67"
  } as CSSProperties;
}

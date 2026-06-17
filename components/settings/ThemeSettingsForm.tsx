"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Grid3X3, Rows3, Save } from "lucide-react";
import { getCurrentUser, updateTheme } from "@/lib/api";
import { readSession } from "@/lib/client-auth";
import type { JournalLayout, PublicUser, Theme } from "@/lib/types";

const layoutOptions: Array<{ value: JournalLayout; label: string; Icon: typeof Grid3X3 }> = [
  { value: "grid", label: "Grid", Icon: Grid3X3 },
  { value: "feed", label: "Feed", Icon: Rows3 },
  { value: "masonry", label: "Masonry", Icon: Grid3X3 }
];

const defaultColors = {
  background: "#faf8f0",
  text: "#16141c",
  accent: "#dc8719",
  card: "#f5f2e8"
};

export function ThemeSettingsForm() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [colors, setColors] = useState<Theme["colorScheme"]>(defaultColors);
  const [font, setFont] = useState("Space Mono");
  const [layout, setLayout] = useState<JournalLayout>("grid");
  const [customCss, setCustomCss] = useState("");
  const [guestbookEnabled, setGuestbookEnabled] = useState(true);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "saved" | "error" | "unauthenticated">("loading");

  useEffect(() => {
    async function loadSettings() {
      const session = readSession();
      if (!session) {
        setStatus("unauthenticated");
        return;
      }

      setToken(session.accessToken);
      try {
        const currentUser = await getCurrentUser(session.accessToken);
        setUser(currentUser);
        setColors(currentUser.theme.colorScheme);
        setFont(currentUser.theme.font);
        setLayout(currentUser.theme.layout);
        setCustomCss(currentUser.theme.customCss);
        setGuestbookEnabled(currentUser.theme.guestbookEnabled);
        setStatus("idle");
      } catch {
        setStatus("unauthenticated");
      }
    }

    void loadSettings();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setStatus("saving");
    try {
      const saved = await updateTheme(token, {
        colorScheme: colors,
        font,
        layout,
        customCss,
        guestbookEnabled
      });
      setUser(saved);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  if (status === "loading") {
    return <div className="archive-panel p-5 text-sm font-black uppercase text-muted">Loading theme...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="archive-panel p-5">
        <h1 className="text-3xl font-black uppercase text-ink">Sign in required</h1>
        <Link href="/login" className="pixel-button-solid mt-5 inline-flex px-4 py-3 text-xs font-black uppercase">
          Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="archive-panel grid gap-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(colors).map(([key, value]) => (
            <label key={key} className="grid gap-2 text-xs font-black uppercase text-ink">
              {key}
              <span className="flex items-center gap-3 border-2 border-ink bg-paper px-3 py-2">
                <input
                  type="color"
                  value={value}
                  onChange={(event) =>
                    setColors({ ...colors, [key]: event.target.value })
                  }
                  className="h-9 w-9 border-2 border-ink bg-transparent p-0"
                />
                <span className="text-xs text-muted">{value}</span>
              </span>
            </label>
          ))}
        </div>

        <label className="grid gap-2 text-xs font-black uppercase text-ink">
          Font stack
          <input
            value={font}
            onChange={(event) => setFont(event.target.value)}
            className="field-input"
          />
        </label>

        <fieldset className="grid gap-3">
          <legend className="text-xs font-black uppercase text-ink">Layout</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {layoutOptions.map(({ value, label, Icon }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 border-2 border-ink bg-paper px-3 py-2 text-xs font-black uppercase has-[:checked]:bg-accent has-[:checked]:text-paper"
              >
                <input
                  type="radio"
                  name="layout"
                  checked={layout === value}
                  onChange={() => setLayout(value)}
                />
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center justify-between gap-4 border-2 border-ink bg-paper px-3 py-2 text-xs font-black uppercase text-ink">
          Guestbook enabled
          <input
            type="checkbox"
            checked={guestbookEnabled}
            onChange={(event) => setGuestbookEnabled(event.target.checked)}
            className="h-5 w-5 accent-[rgb(var(--accent))]"
          />
        </label>

        <label className="grid gap-2 text-xs font-black uppercase text-ink">
          Sanitized custom CSS
          <textarea
            value={customCss}
            onChange={(event) => setCustomCss(event.target.value)}
            rows={8}
            className="field-input resize-none font-mono text-sm"
            placeholder=".journal-card { }"
          />
        </label>
      </div>

      <aside className="archive-panel p-5">
        <p className="stamp-label">theme</p>
        <div
          className="mt-5 border-2 border-ink p-4"
          style={{
            background: colors.background,
            color: colors.text,
            fontFamily: font
          }}
        >
          <div className="border-2 p-3" style={{ borderColor: colors.text, background: colors.card }}>
            <p className="text-xs font-black uppercase" style={{ color: colors.accent }}>
              {layout}
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase">Shelf card</h2>
          </div>
        </div>
        <Link
          href={user ? `/u/${user.username}` : "/"}
          className="pixel-button mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          Preview
        </Link>
        <button
          type="submit"
          disabled={status === "saving"}
          className="pixel-button-solid mt-3 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {status === "saving" ? "Saving" : "Save theme"}
        </button>
        {status === "saved" ? <p className="mt-4 text-xs font-black uppercase text-accent">Saved.</p> : null}
        {status === "error" ? <p className="mt-4 text-xs font-black uppercase text-accent">Could not save.</p> : null}
      </aside>
    </form>
  );
}

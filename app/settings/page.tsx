import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  return (
    <main className="pixel-grid min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between border-2 border-ink bg-paper px-3 py-2">
          <Link href="/" className="text-base font-black uppercase">
            KIROKU
          </Link>
          <Link
            href="/settings/theme"
            className="pixel-button inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase"
          >
            Theme
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <section className="py-10">
          <p className="text-xs font-black uppercase text-accent">
            PATCH /users/me/profile
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase text-ink">Profile</h1>
          <form className="pixel-panel mt-8 grid gap-5 p-5">
            <label className="grid gap-2 text-sm font-black uppercase">
              Display name
              <input
                className="border-2 border-ink bg-paper px-3 py-2 font-bold outline-none focus:bg-accent focus:text-paper"
                placeholder="Mira"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase">
              Bio
              <textarea
                rows={5}
                className="resize-none border-2 border-ink bg-paper px-3 py-2 font-bold outline-none focus:bg-accent focus:text-paper"
                placeholder="A short journal introduction"
              />
            </label>
            <label className="grid gap-2 text-sm font-black uppercase">
              Song URL
              <input
                className="border-2 border-ink bg-paper px-3 py-2 font-bold outline-none focus:bg-accent focus:text-paper"
                placeholder="https://open.spotify.com/..."
              />
            </label>
            <button className="pixel-button-solid inline-flex w-fit items-center gap-2 px-4 py-2 text-xs font-black uppercase">
              <Save className="h-4 w-4" aria-hidden="true" />
              Save profile
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

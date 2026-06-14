import type { Metadata } from "next";
import type { ElementType } from "react";
import Link from "next/link";
import { Grid3X3, Rows3, Save } from "lucide-react";

export const metadata: Metadata = {
  title: "Theme"
};

const layoutOptions: Array<{ value: "grid" | "feed" | "masonry"; Icon: ElementType }> = [
  { value: "grid", Icon: Grid3X3 },
  { value: "feed", Icon: Rows3 },
  { value: "masonry", Icon: Grid3X3 }
];

export default function ThemeSettingsPage() {
  return (
    <main className="pixel-grid min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-2 border-ink bg-paper px-3 py-2">
          <Link href="/" className="text-base font-black uppercase">
            KIROKU
          </Link>
          <Link
            href="/u/demo"
            className="pixel-button px-3 py-2 text-xs font-black uppercase"
          >
            Preview journal
          </Link>
        </header>

        <section className="py-10">
          <p className="text-xs font-black uppercase text-accent">
            PATCH /users/me/theme
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase text-ink">
            Theme studio
          </h1>

          <form className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="pixel-panel grid gap-5 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Background", "#fff7d6"],
                  ["Text", "#121212"],
                  ["Accent", "#ff4b1f"],
                  ["Card", "#fff7d6"]
                ].map(([label, value]) => (
                  <label key={label} className="grid gap-2 text-sm font-black uppercase">
                    {label}
                    <span className="flex items-center gap-2 border-2 border-ink bg-paper px-3 py-2">
                      <input
                        type="color"
                        defaultValue={value}
                        className="h-8 w-8 border-2 border-ink bg-transparent p-0"
                      />
                      <span className="text-xs text-muted">{value}</span>
                    </span>
                  </label>
                ))}
              </div>

              <fieldset className="grid gap-3">
                <legend className="text-sm font-black uppercase">Layout</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {layoutOptions.map(({ value: layout, Icon }) => (
                    <label
                      key={String(layout)}
                      className="flex cursor-pointer items-center gap-2 border-2 border-ink bg-paper px-3 py-2 text-xs font-black uppercase has-[:checked]:bg-accent has-[:checked]:text-paper"
                    >
                      <input type="radio" name="layout" defaultChecked={layout === "grid"} />
                      <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
                      {layout}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="grid gap-2 text-sm font-black uppercase">
                Sanitized custom CSS
                <textarea
                  rows={8}
                  className="resize-none border-2 border-ink bg-paper px-3 py-2 font-mono text-sm outline-none focus:bg-accent focus:text-paper"
                  placeholder=".journal-card { }"
                />
              </label>
            </div>

            <aside className="pixel-panel-accent p-5">
              <h2 className="font-black uppercase">Default direction</h2>
              <p className="mt-2 text-sm font-bold leading-6">
                Three colors. Square borders. Centered shelf. No premium gloss.
              </p>
              <button className="mt-6 inline-flex w-full items-center justify-center gap-2 border-2 border-paper bg-ink px-4 py-2 text-xs font-black uppercase text-paper">
                <Save className="h-4 w-4" aria-hidden="true" />
                Save theme
              </button>
            </aside>
          </form>
        </section>
      </div>
    </main>
  );
}

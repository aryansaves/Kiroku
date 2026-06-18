import Link from "next/link";
import { ArrowRight, MessageSquare, Palette, Radio } from "lucide-react";
import { ThemePaletteSwitcher } from "@/components/theme/ThemePaletteSwitcher";
import { HomeNavAuth } from "@/components/auth/HomeNavAuth";

const features = [
  {
    icon: MessageSquare,
    title: "Natural language logging",
    text: "Type what you watched or read. AI parses it and finds the right cover — from the web or via Telegram."
  },
  {
    icon: Radio,
    title: "Public journal",
    text: "One profile route reads stored covers, notes, ratings, and progress."
  },
  {
    icon: Palette,
    title: "Custom themes",
    text: "Colors, layout, stickers, song links, and sanitized CSS are all yours to configure."
  }
];

export default function HomePage() {
  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 md:px-6">
      <div className="scanlines absolute inset-0 z-10" aria-hidden="true" />
      <section className="relative z-20 mx-auto flex min-h-[calc(100vh-32px)] max-w-5xl flex-col">
        <nav className="archive-topbar flex items-center justify-between px-3 py-2">
          <Link href="/" className="text-base font-black uppercase tracking-wider">
            KIROKU
          </Link>
          <div className="flex items-center gap-3">
            <ThemePaletteSwitcher terse />
            <HomeNavAuth />
          </div>
        </nav>

        <div className="grid flex-1 place-items-center py-10">
          <div className="archive-shell w-full max-w-3xl p-6 text-center md:p-10">
            <p className="stamp-label">
              log anything, share everything
            </p>
            <h1 className="mt-5 text-6xl font-black uppercase leading-none text-ink md:text-8xl">
              Shelf signal
            </h1>
            <div className="pixel-divider-light mx-auto mt-6 max-w-sm" />
            <p className="mx-auto mt-6 max-w-xl text-balance text-base font-bold leading-7 text-ink md:text-lg">
              A public media journal that feels like a stamped desk file:
              fast pages, sharp filters, real covers — log from Telegram or
              directly on the web.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/u/demo"
                className="pixel-button-solid inline-flex items-center gap-2 px-5 py-3 text-sm font-black uppercase"
              >
                Open journal
                <ArrowRight className="link-arrow h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/settings/theme"
                className="pixel-button px-5 py-3 text-sm font-black uppercase"
              >
                Theme studio
              </Link>
            </div>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3 text-left">
              {["anime", "books", "film"].map((item, index) => (
                <div
                  key={item}
                  className={index === 1 ? "pixel-panel-accent p-3" : "archive-panel p-3"}
                >
                  <div className="aspect-square border-2 border-current bg-current/5" />
                  <p className="mt-2 text-xs font-black uppercase">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="archive-panel grid gap-3 p-3 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="border-2 border-ink bg-card p-3">
              <feature.icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-black uppercase text-ink">
                {feature.title}
              </h2>
              <p className="mt-2 text-xs font-bold leading-5 text-muted">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

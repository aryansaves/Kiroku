import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { ThemeSettingsForm } from "@/components/settings/ThemeSettingsForm";

export const metadata: Metadata = {
  title: "Theme"
};

export default function ThemeSettingsPage() {
  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 md:px-6">
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="archive-topbar flex items-center justify-between px-3 py-2">
          <Link href="/" className="text-base font-black uppercase tracking-wider">
            KIROKU
          </Link>
          <Link
            href="/settings"
            className="pixel-button inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase"
          >
            Profile
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <section className="py-10">
          <p className="stamp-label">settings</p>
          <h1 className="mt-2 text-4xl font-black uppercase text-ink">
            Theme studio
          </h1>
          <div className="mt-8">
            <ThemeSettingsForm />
          </div>
        </section>
      </div>
    </main>
  );
}

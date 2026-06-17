import type { Metadata } from "next";
import Link from "next/link";
import { Palette } from "lucide-react";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export const metadata: Metadata = {
  title: "Settings"
};

export default function SettingsPage() {
  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 md:px-6">
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-3xl">
        <header className="archive-topbar flex items-center justify-between px-3 py-2">
          <Link href="/" className="text-base font-black uppercase tracking-wider">
            KIROKU
          </Link>
          <Link
            href="/settings/theme"
            className="pixel-button inline-flex items-center gap-2 px-3 py-2 text-xs font-black uppercase"
          >
            Theme
            <Palette className="h-4 w-4" aria-hidden="true" />
          </Link>
        </header>

        <section className="py-10">
          <p className="stamp-label">settings</p>
          <h1 className="mt-3 text-4xl font-black uppercase text-ink">Profile</h1>
          <div className="mt-8">
            <ProfileSettingsForm />
          </div>
        </section>
      </div>
    </main>
  );
}

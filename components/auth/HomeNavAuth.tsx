"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";
import { readSession, clearSession } from "@/lib/client-auth";
import type { AuthSession } from "@/lib/types";

export function HomeNavAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-32" />;
  }

  if (session?.user?.username) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            clearSession();
            setSession(null);
          }}
          className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted hover:text-ink transition-colors flex items-center gap-1"
        >
          <LogOut className="h-3 w-3" />
          Logout
        </button>
        <Link
          href={`/u/${session.user.username}`}
          className="pixel-button-solid inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-wider"
        >
          My Shelf
          <ArrowRight className="link-arrow h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-ink hover:bg-ink hover:text-paper transition-colors"
      >
        Login
      </Link>
      <Link
        href="/u/demo"
        className="pixel-button-solid inline-flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-wider"
      >
        Demo
        <ArrowRight className="link-arrow h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  );
}

/**
 * Smart CTA button: logged-in → /u/username, guest → /u/demo
 */
export function OpenJournalCTA() {
  const [href, setHref] = useState("/u/demo");
  const [label, setLabel] = useState("Open journal");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (session?.user?.username) {
      setHref(`/u/${session.user.username}`);
      setLabel("My shelf");
    }
    setMounted(true);
  }, []);

  return (
    <Link
      href={href}
      className="pixel-button-solid inline-flex items-center gap-2 px-5 py-3 text-sm font-black uppercase"
      style={{ opacity: mounted ? 1 : 0.7 }}
    >
      {label}
      <ArrowRight className="link-arrow h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

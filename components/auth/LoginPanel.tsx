"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, MessageCircle } from "lucide-react";
import { devLogin, telegramLogin } from "@/lib/api";
import { saveSession } from "@/lib/client-auth";

declare global {
  interface Window {
    onTelegramAuth?: (payload: unknown) => void;
  }
}

export function LoginPanel({
  botName,
  devLoginEnabled
}: {
  botName?: string;
  devLoginEnabled: boolean;
}) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    window.onTelegramAuth = async (payload: unknown) => {
      setStatus("loading");
      try {
        const session = await telegramLogin(payload);
        saveSession(session);
        window.location.href = "/settings";
      } catch {
        setStatus("error");
      }
    };

    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  async function submitDevLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = username.trim();
    if (!value) return;

    setStatus("loading");
    try {
      const session = await devLogin(value);
      saveSession(session);
      window.location.href = "/settings";
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1fr_380px]">
      <div className="archive-shell min-h-[520px] p-5 md:p-8">
        <Link href="/" className="text-base font-black uppercase text-ink">
          KIROKU
        </Link>
        <div className="mt-16 max-w-2xl">
          <p className="stamp-label">locked desk</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-none text-ink md:text-7xl">
            Open your shelf
          </h1>
          <p className="mt-5 max-w-xl text-sm font-bold leading-7 text-muted md:text-base">
            Settings belong to bot-created accounts. Log in to edit profile
            copy, theme colors, guestbook visibility, and the now-playing link.
          </p>
        </div>
      </div>

      <aside className="archive-panel p-5">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-accent" aria-hidden="true" />
          <h2 className="text-lg font-black uppercase text-ink">
            Telegram login
          </h2>
        </div>

        <div className="mt-5 border-2 border-dashed border-ink bg-paper p-4 text-center">
          {botName ? (
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login={botName}
              data-size="large"
              data-onauth="onTelegramAuth(user)"
              data-request-access="write"
            />
          ) : (
            <p className="text-sm font-bold leading-6 text-muted">
              Set NEXT_PUBLIC_TELEGRAM_BOT_NAME for production Telegram login.
            </p>
          )}
        </div>

        {devLoginEnabled ? (
          <form onSubmit={submitDevLogin} className="mt-6 grid gap-3">
            <label className="grid gap-2 text-xs font-black uppercase text-ink">
              Local username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="sillymista"
                className="field-input"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="pixel-button-solid inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {status === "loading" ? "Opening" : "Use dev login"}
            </button>
          </form>
        ) : null}

        {status === "error" ? (
          <p className="mt-4 border-2 border-ink bg-accent px-3 py-2 text-xs font-black uppercase text-paper">
            Login failed. Check API env and account username.
          </p>
        ) : null}

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase text-accent"
        >
          Back home
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </aside>
    </section>
  );
}

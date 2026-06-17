"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, MessageCircle } from "lucide-react";
import { devLogin, telegramLogin, googleAuthUrl } from "@/lib/api";
import { saveSession } from "@/lib/client-auth";

declare global {
  interface Window {
    onTelegramAuth?: (payload: unknown) => void;
  }
}

/** Simple Google "G" monochrome SVG icon */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function LoginPanel({
  botName,
  devLoginEnabled,
  googleEnabled,
}: {
  botName?: string;
  devLoginEnabled: boolean;
  googleEnabled: boolean;
}) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"google" | "telegram">(
    googleEnabled ? "google" : "telegram"
  );

  // Check for OAuth error params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "oauth_denied") {
      setErrorMsg("Google sign-in was cancelled.");
      setStatus("error");
    } else if (err === "oauth_failed") {
      setErrorMsg("Google sign-in failed. Please try again.");
      setStatus("error");
    } else if (err === "google_not_configured") {
      setErrorMsg("Google login is not set up on this server.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    window.onTelegramAuth = async (payload: unknown) => {
      setStatus("loading");
      try {
        const session = await telegramLogin(payload);
        saveSession(session);
        window.location.href = "/settings";
      } catch {
        setErrorMsg("Telegram login failed. Make sure your account was set up via the bot.");
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
      setErrorMsg("Dev login failed. Check username.");
      setStatus("error");
    }
  }

  function handleGoogleLogin() {
    try {
      window.location.href = googleAuthUrl();
    } catch {
      setErrorMsg("API URL not configured.");
      setStatus("error");
    }
  }

  const tabs = [
    ...(googleEnabled ? [{ id: "google" as const, label: "Google" }] : []),
    { id: "telegram" as const, label: "Telegram" },
  ];

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-5 lg:grid-cols-[1fr_420px]">
      {/* ── Left panel ── */}
      <div className="archive-shell min-h-[520px] p-5 md:p-8">
        <Link href="/" className="text-base font-black uppercase text-ink">
          KIROKU
        </Link>
        <div className="mt-16 max-w-2xl">
          <p className="stamp-label">your shelf, your way</p>
          <h1 className="mt-4 text-5xl font-black uppercase leading-none text-ink md:text-7xl">
            Open your shelf
          </h1>
          <p className="mt-5 max-w-xl text-sm font-bold leading-7 text-muted md:text-base">
            Sign in to edit your profile, change theme colors, and log media
            directly from the web — no Telegram required.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
            {["anime", "books", "film"].map((item) => (
              <div key={item} className="archive-panel p-3">
                <div className="aspect-square border-2 border-current bg-current/5" />
                <p className="mt-2 text-xs font-black uppercase">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <aside className="archive-panel p-5">
        <p className="stamp-label">sign in</p>
        <h2 className="mt-4 text-xl font-black uppercase text-ink">
          Welcome back
        </h2>
        <p className="mt-2 text-xs font-bold leading-5 text-muted">
          New here? Use Google to create an account.
        </p>

        {/* Tab switcher */}
        {tabs.length > 1 && (
          <div className="mt-6 flex border-2 border-ink">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-xs font-black uppercase transition-colors ${
                  activeTab === tab.id
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink hover:bg-ink/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5">
          {/* ── Google tab ── */}
          {activeTab === "google" && googleEnabled && (
            <div className="grid gap-4">
              <p className="text-xs font-bold leading-5 text-muted">
                Sign in with your Google account. First-time users will pick a
                username after signing in.
              </p>
              <button
                id="btn-google-login"
                type="button"
                onClick={handleGoogleLogin}
                disabled={status === "loading"}
                className="pixel-button-solid inline-flex items-center justify-center gap-3 px-4 py-3 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
              >
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </button>
            </div>
          )}

          {/* ── Telegram tab ── */}
          {activeTab === "telegram" && (
            <div className="grid gap-4">
              <p className="text-xs font-bold leading-5 text-muted">
                Log in using your Telegram account. You must have used the{" "}
                <code className="font-black">/start</code> command on the bot
                first.
              </p>
              <div className="border-2 border-dashed border-ink bg-paper p-4 text-center">
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
                    Set NEXT_PUBLIC_TELEGRAM_BOT_NAME to enable Telegram login.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Dev login ── */}
        {devLoginEnabled && (
          <form onSubmit={submitDevLogin} className="mt-6 grid gap-3 border-t-2 border-ink/20 pt-5">
            <p className="text-xs font-black uppercase text-muted">Dev login</p>
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
              className="pixel-button inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              {status === "loading" ? "Opening..." : "Use dev login"}
            </button>
          </form>
        )}

        {/* ── Error ── */}
        {status === "error" && (
          <p className="mt-4 border-2 border-ink bg-accent px-3 py-2 text-xs font-black uppercase text-paper">
            {errorMsg || "Login failed. Please try again."}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between border-t-2 border-ink/20 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase text-muted hover:text-ink"
          >
            Back home
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/u/demo"
            className="text-xs font-black uppercase text-accent hover:underline"
          >
            View demo
          </Link>
        </div>
      </aside>
    </section>
  );
}

"use client";

import type { FormEvent } from "react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Check, X, ArrowRight } from "lucide-react";
import { registerGoogleUser, checkUsernameAvailable } from "@/lib/api";
import { saveSession } from "@/lib/client-auth";

type UsernameState = "idle" | "checking" | "available" | "taken" | "invalid";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
}

function isValidUsername(value: string): boolean {
  return /^[a-z0-9-]{2,32}$/.test(value);
}

/**
 * /onboarding
 *
 * Shown to new Google-authenticated users so they can pick their Kiroku username.
 * The pending JWT from the API is passed via URL params (?pending=<jwt>&suggested=<str>&...)
 */
export default function OnboardingPage() {
  const [pendingToken, setPendingToken] = useState("");
  const [suggestedUsername, setSuggestedUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [username, setUsername] = useState("");
  const [usernameState, setUsernameState] = useState<UsernameState>("idle");
  const [checkTimer, setCheckTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pending = params.get("pending");
    const suggested = params.get("suggested") ?? "";
    const name = params.get("name") ?? "";
    const avatar = params.get("avatar") ?? "";

    if (!pending) {
      window.location.href = "/login?error=oauth_failed";
      return;
    }

    setPendingToken(pending);
    setDisplayName(name);
    setAvatarUrl(avatar);

    // Pre-fill the suggested username
    const cleanSuggestion = slugify(suggested);
    setSuggestedUsername(cleanSuggestion);
    setUsername(cleanSuggestion);
  }, []);

  // Debounced availability check
  const checkAvailability = useCallback(
    (value: string) => {
      if (checkTimer) clearTimeout(checkTimer);

      if (!value) {
        setUsernameState("idle");
        return;
      }

      if (!isValidUsername(value)) {
        setUsernameState("invalid");
        return;
      }

      setUsernameState("checking");
      const timer = setTimeout(async () => {
        const available = await checkUsernameAvailable(value);
        setUsernameState(available ? "available" : "taken");
      }, 500);
      setCheckTimer(timer);
    },
    [checkTimer]
  );

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Auto-slugify as they type
    const clean = slugify(raw);
    setUsername(clean);
    checkAvailability(clean);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (usernameState !== "available" || !pendingToken) return;

    setSubmitStatus("loading");
    try {
      const session = await registerGoogleUser({
        username,
        displayName,
        avatarUrl: avatarUrl || null,
        googlePendingToken: pendingToken,
      });
      saveSession(session);
      window.location.href = `/u/${session.user.username}`;
    } catch (err: any) {
      const msg = err?.message ?? "";
      if (msg.includes("409") || msg.includes("taken")) {
        setUsernameState("taken");
        setErrorMsg("That username was just taken. Please choose another.");
      } else if (msg.includes("401")) {
        setErrorMsg("Your sign-in session expired. Please sign in with Google again.");
        setTimeout(() => (window.location.href = "/login"), 3000);
      } else {
        setErrorMsg("Registration failed. Please try again.");
      }
      setSubmitStatus("error");
    }
  }

  const canSubmit =
    usernameState === "available" && submitStatus !== "loading";

  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 md:px-6">
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-lg py-20">
        <div className="archive-panel p-6 md:p-8">
          {/* Header */}
          <p className="stamp-label">almost there</p>
          <h1 className="mt-4 text-3xl font-black uppercase text-ink">
            Choose your username
          </h1>

          {/* Google profile preview */}
          {(avatarUrl || displayName) && (
            <div className="mt-6 flex items-center gap-4 border-2 border-ink bg-paper p-3">
              {avatarUrl && (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 border-2 border-ink object-cover"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-black text-ink truncate">{displayName}</p>
                <p className="text-xs font-bold text-muted">Signing in with Google</p>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs font-bold leading-6 text-muted">
            Your username appears in your public profile URL:{" "}
            <span className="font-black text-ink">
              kiroku.com/u/
              {username || "your-username"}
            </span>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate>
            {/* Username field */}
            <label className="grid gap-2 text-xs font-black uppercase text-ink">
              Username
              <div className="relative">
                <input
                  id="input-username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder={suggestedUsername || "your-handle"}
                  maxLength={32}
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="field-input w-full pr-8"
                />
                {/* Inline status indicator */}
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                  {usernameState === "checking" && (
                    <span className="block h-3 w-3 animate-spin rounded-full border border-ink border-t-transparent" />
                  )}
                  {usernameState === "available" && (
                    <Check className="h-4 w-4 text-green-700" />
                  )}
                  {(usernameState === "taken" || usernameState === "invalid") && (
                    <X className="h-4 w-4 text-accent" />
                  )}
                </span>
              </div>
              {/* Hint messages */}
              {usernameState === "available" && (
                <span className="text-xs font-bold text-green-700">✓ Available</span>
              )}
              {usernameState === "taken" && (
                <span className="text-xs font-bold text-accent">✗ Already taken</span>
              )}
              {usernameState === "invalid" && (
                <span className="text-xs font-bold text-muted">
                  2–32 characters, lowercase letters, numbers, hyphens only
                </span>
              )}
            </label>

            {/* Display name — pre-filled from Google, editable */}
            <label className="grid gap-2 text-xs font-black uppercase text-ink">
              Display name
              <input
                id="input-displayname"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                className="field-input"
              />
            </label>

            {/* Error */}
            {submitStatus === "error" && (
              <p className="border-2 border-ink bg-accent px-3 py-2 text-xs font-black uppercase text-paper">
                {errorMsg}
              </p>
            )}

            <button
              id="btn-create-account"
              type="submit"
              disabled={!canSubmit}
              className="pixel-button-solid inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitStatus === "loading" ? (
                <>
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
                  Creating account…
                </>
              ) : (
                <>
                  Create my shelf
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-xs font-bold text-muted">
            Your avatar is imported from Google. You can change it any time in
            settings.
          </p>

          <a
            href="/login"
            className="mt-4 inline-flex items-center gap-1 text-xs font-black uppercase text-muted hover:text-ink"
          >
            ← Back to login
          </a>
        </div>
      </div>
    </main>
  );
}

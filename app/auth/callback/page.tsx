"use client";

import { useEffect, useState } from "react";
import { saveSession } from "@/lib/client-auth";
import type { AuthSession } from "@/lib/types";

/**
 * /auth/callback
 *
 * Handles the return from the Google OAuth flow for existing users.
 * The API passes session tokens as URL search params after a successful login.
 * We save the session to localStorage and redirect to /settings.
 *
 * URL shape:
 *   /auth/callback?access=<JWT>&refresh=<JWT>&username=<str>&displayName=<str>&id=<str>
 */
export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("access");
    const refresh = params.get("refresh");
    const username = params.get("username");
    const displayName = params.get("displayName");
    const id = params.get("id");

    if (!access || !refresh || !username || !id) {
      setErrorMsg("Invalid callback — missing session data. Please try signing in again.");
      setStatus("error");
      return;
    }

    const session: AuthSession = {
      accessToken: access,
      refreshToken: refresh,
      user: {
        id,
        username,
        displayName: displayName ?? username,
      },
    };

    try {
      saveSession(session);
      window.location.href = `/u/${username}`;
    } catch {
      setErrorMsg("Could not save session. Please allow localStorage access in your browser.");
      setStatus("error");
    }
  }, []);

  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 md:px-6">
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="archive-panel p-8 text-center">
          {status === "processing" ? (
            <>
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-transparent" />
              <p className="text-sm font-black uppercase text-ink">
                Signing you in…
              </p>
            </>
          ) : (
            <>
              <p className="stamp-label">error</p>
              <p className="mt-4 text-sm font-bold text-muted">{errorMsg}</p>
              <a
                href="/login"
                className="pixel-button-solid mt-6 inline-flex items-center gap-2 px-4 py-3 text-xs font-black uppercase"
              >
                Back to login
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

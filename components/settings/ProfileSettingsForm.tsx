"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, LogOut, Save } from "lucide-react";
import { getCurrentUser, updateProfile } from "@/lib/api";
import { clearSession, readSession } from "@/lib/client-auth";
import type { PublicUser } from "@/lib/types";

type LinkDraft = { label: string; url: string };

function blankLinks(): LinkDraft[] {
  return [
    { label: "", url: "" },
    { label: "", url: "" },
    { label: "", url: "" }
  ];
}

export function ProfileSettingsForm() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [songUrl, setSongUrl] = useState("");
  const [songSource, setSongSource] = useState<"spotify" | "soundcloud" | "youtube" | "">("");
  const [links, setLinks] = useState<LinkDraft[]>(blankLinks);
  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "saved" | "error" | "unauthenticated">("loading");

  useEffect(() => {
    async function loadSettings() {
      const session = readSession();
      if (!session) {
        setStatus("unauthenticated");
        return;
      }

      setToken(session.accessToken);
      try {
        const currentUser = await getCurrentUser(session.accessToken);
        setUser(currentUser);
        setDisplayName(currentUser.displayName);
        setBio(currentUser.bio);
        setAvatarUrl(currentUser.avatarUrl ?? "");
        setSongUrl(currentUser.theme.nowPlaying.url ?? "");
        setSongSource(currentUser.theme.nowPlaying.source ?? "");
        setLinks([
          ...currentUser.links.map((link) => ({ ...link })),
          ...blankLinks()
        ].slice(0, 3));
        setStatus("idle");
      } catch {
        setStatus("unauthenticated");
      }
    }

    void loadSettings();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setStatus("saving");
    try {
      const saved = await updateProfile(token, {
        displayName,
        bio,
        avatarUrl: avatarUrl.trim() || null,
        links: links.filter((link) => link.label.trim() && link.url.trim()),
        nowPlaying: {
          url: songUrl.trim() || null,
          source: songUrl.trim() ? songSource || null : null
        }
      });
      setUser(saved);
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  }

  function logout() {
    clearSession();
    window.location.href = "/login";
  }

  if (status === "loading") {
    return <div className="archive-panel p-5 text-sm font-black uppercase text-muted">Loading settings...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="archive-panel p-5">
        <h1 className="text-3xl font-black uppercase text-ink">Sign in required</h1>
        <Link href="/login" className="pixel-button-solid mt-5 inline-flex px-4 py-3 text-xs font-black uppercase">
          Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="archive-panel grid gap-5 p-5">
        <label className="grid gap-2 text-xs font-black uppercase text-ink">
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={80}
            className="field-input"
          />
        </label>

        <label className="grid gap-2 text-xs font-black uppercase text-ink">
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={500}
            rows={5}
            className="field-input resize-none"
          />
        </label>

        <label className="grid gap-2 text-xs font-black uppercase text-ink">
          Avatar URL
          <input
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://..."
            className="field-input"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="grid gap-2 text-xs font-black uppercase text-ink">
            Song URL
            <input
              value={songUrl}
              onChange={(event) => setSongUrl(event.target.value)}
              placeholder="https://open.spotify.com/..."
              className="field-input"
            />
          </label>
          <label className="grid gap-2 text-xs font-black uppercase text-ink">
            Source
            <select
              value={songSource}
              onChange={(event) => setSongSource(event.target.value as typeof songSource)}
              className="field-input"
            >
              <option value="">None</option>
              <option value="spotify">Spotify</option>
              <option value="soundcloud">SoundCloud</option>
              <option value="youtube">YouTube</option>
            </select>
          </label>
        </div>

        <fieldset className="grid gap-3">
          <legend className="text-xs font-black uppercase text-ink">Links</legend>
          {links.map((link, index) => (
            <div key={index} className="grid gap-2 md:grid-cols-[160px_1fr]">
              <input
                value={link.label}
                onChange={(event) => {
                  const next = [...links];
                  next[index] = { ...link, label: event.target.value };
                  setLinks(next);
                }}
                placeholder="Label"
                className="field-input"
              />
              <input
                value={link.url}
                onChange={(event) => {
                  const next = [...links];
                  next[index] = { ...link, url: event.target.value };
                  setLinks(next);
                }}
                placeholder="https://..."
                className="field-input"
              />
            </div>
          ))}
        </fieldset>
      </div>

      <aside className="archive-panel p-5">
        <p className="stamp-label">profile</p>
        <h2 className="mt-4 text-2xl font-black uppercase text-ink">
          {user?.username}
        </h2>
        <Link
          href={user ? `/u/${user.username}` : "/"}
          className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase text-accent"
        >
          Preview
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
        <button
          type="submit"
          disabled={status === "saving"}
          className="pixel-button-solid mt-8 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {status === "saving" ? "Saving" : "Save profile"}
        </button>
        <button
          type="button"
          onClick={logout}
          className="pixel-button mt-3 inline-flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-black uppercase"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
        {status === "saved" ? <p className="mt-4 text-xs font-black uppercase text-accent">Saved.</p> : null}
        {status === "error" ? <p className="mt-4 text-xs font-black uppercase text-accent">Could not save.</p> : null}
      </aside>
    </form>
  );
}

"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { Send, X, RefreshCw, CheckCircle2, AlertCircle, BookOpen, Tv, Film, ChevronRight } from "lucide-react";
import { chatParse, chatSearch, chatLog } from "@/lib/api";
import { readSession } from "@/lib/client-auth";
import type { ChatParsed, ChatSearchItem, MediaType } from "@/lib/types";

type ChatState =
  | { stage: "idle" }
  | { stage: "parsing" }
  | { stage: "searching"; parsed: ChatParsed }
  | { stage: "not-found"; parsed: ChatParsed; title: string }
  | { stage: "disambiguate"; parsed: ChatParsed; results: ChatSearchItem[] }
  | { stage: "logging" }
  | { stage: "success"; title: string; cover?: string | null }
  | { stage: "error"; message: string };

const EXAMPLES = [
  "Watched Inception, loved it 9/10",
  "Reading Dune, on page 200",
  "Finished Attack on Titan, masterpiece 10/10",
  "Dropped The Witcher S3, 5/10",
  "Planned to watch Interstellar",
];

const mediaLabels: Record<string, string> = {
  anime: "Anime", movie: "Film", series: "Series",
  book: "Book", manga: "Manga", comic: "Comic",
};

const mediaIcons: Record<string, typeof BookOpen> = {
  book: BookOpen, manga: BookOpen, comic: BookOpen,
  anime: Tv, series: Tv,
  movie: Film,
};

export function QuickLogBar({ onLogged }: { onLogged?: () => void }) {
  const [message, setMessage]   = useState("");
  const [state, setState]       = useState<ChatState>({ stage: "idle" });
  const [placeholder, setPlaceholder] = useState(EXAMPLES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder examples
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % EXAMPLES.length;
      setPlaceholder(EXAMPLES[i]);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const session = typeof window !== "undefined" ? readSession() : null;
  const token   = session?.accessToken ?? null;

  if (!token) return null;

  const isBusy    = state.stage === "parsing" || state.stage === "searching" || state.stage === "logging";
  const isIdle    = state.stage === "idle";
  const isSuccess = state.stage === "success";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = message.trim();
    if (!text || isBusy) return;

    setState({ stage: "parsing" });
    try {
      const parsed = await chatParse(token!, text);
      if (parsed.confidence === "low" || !parsed.title) {
        setState({ stage: "error", message: 'Couldn\'t understand that. Try: "Watched Inception 9/10"' });
        return;
      }
      setState({ stage: "searching", parsed });
      const { results } = await chatSearch(token!, parsed.title, parsed.mediaType);
      if (results.length === 0) {
        setState({ stage: "not-found", parsed, title: parsed.title! });
      } else if (results.length === 1) {
        await doLog(parsed, results[0]!);
      } else {
        setState({ stage: "disambiguate", parsed, results });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("401")) {
        setState({ stage: "error", message: "Session expired — please log out and sign in again." });
      } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
        setState({ stage: "error", message: "Can't reach the server. Check your connection." });
      } else {
        setState({ stage: "error", message: msg.slice(0, 120) });
      }
    }
  }

  async function doLog(parsed: ChatParsed, selected: ChatSearchItem) {
    setState({ stage: "logging" });
    try {
      await chatLog(token!, {
        mediaType: selected.mediaType as MediaType,
        status: parsed.status,
        title: selected.canonicalTitle,
        coverImage: selected.coverImage ?? null,
        rating: parsed.rating ?? null,
        notes: parsed.notes ?? null,
        // Always send fully-shaped objects — undefined values break Zod on the server
        progress: {
          episode:    parsed.progress?.episode    ?? null,
          chapter:    parsed.progress?.chapter    ?? null,
          page:       parsed.progress?.page       ?? null,
          percentage: parsed.progress?.percentage ?? null,
        },
        externalIds: {
          anilistId: selected.externalIds?.anilistId ?? null,
          malId:     selected.externalIds?.malId     ?? null,
          tmdbId:    selected.externalIds?.tmdbId    ?? null,
        },
      });
      setMessage("");
      setState({ stage: "success", title: selected.canonicalTitle, cover: selected.coverImage });
      onLogged?.();
      // Auto-reset after 4 seconds
      setTimeout(() => setState({ stage: "idle" }), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("401")) {
        setState({ stage: "error", message: "Session expired — please log out and sign in again." });
      } else {
        setState({ stage: "error", message: "Failed to save. Please try again." });
      }
    }
  }

  function reset() {
    setMessage("");
    setState({ stage: "idle" });
    inputRef.current?.focus();
  }

  const busyLabel =
    state.stage === "parsing"   ? "Reading your entry…" :
    state.stage === "searching" ? `Searching for "${state.parsed.title}"…` :
    state.stage === "logging"   ? "Saving to your shelf…" : "";

  return (
    <div className="w-full">

      {/* ── Input bar ── */}
      <form onSubmit={handleSubmit} className="flex items-stretch border-2 border-ink bg-paper shadow-[3px_3px_0_rgb(var(--ink))]">

        {/* Label */}
        <div className="flex shrink-0 items-center border-r-2 border-ink bg-card px-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-accent">Log</span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isBusy}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm font-medium text-ink placeholder:text-muted/50 outline-none disabled:opacity-60"
        />

        {/* Clear */}
        {!isIdle && (
          <button
            type="button"
            onClick={reset}
            className="shrink-0 border-l-2 border-ink px-2.5 text-muted transition-colors hover:bg-ink hover:text-paper"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!message.trim() || isBusy}
          className="shrink-0 border-l-2 border-ink bg-ink px-4 py-2.5 text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Log entry"
        >
          {isBusy
            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            : <Send className="h-3.5 w-3.5" />
          }
        </button>
      </form>

      {/* ── Status / results panel ── */}

      {/* Loading */}
      {isBusy && (
        <div className="mt-1 flex items-center gap-2 border-2 border-ink/30 bg-card px-3 py-2">
          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-accent" />
          <p className="text-[11px] font-medium text-muted">{busyLabel}</p>
        </div>
      )}

      {/* Success */}
      {isSuccess && state.stage === "success" && (
        <div className="mt-1 flex items-center gap-3 border-2 border-ink bg-card px-3 py-2 shadow-[2px_2px_0_rgb(var(--ink))]">
          {state.cover && (
            <Image src={state.cover} alt="" width={20} height={28} className="h-7 w-5 shrink-0 border border-ink object-cover" unoptimized />
          )}
          <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase text-ink truncate">Logged: {state.title}</p>
          </div>
          <button onClick={reset} className="shrink-0 text-[10px] font-bold uppercase text-muted hover:text-ink">
            Log more
          </button>
        </div>
      )}

      {/* Disambiguate */}
      {state.stage === "disambiguate" && (
        <div className="mt-1 border-2 border-ink bg-paper shadow-[3px_3px_0_rgb(var(--ink))]">
          <p className="border-b-2 border-ink bg-ink px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-paper">
            Which one did you mean?
          </p>
          <div className="max-h-56 overflow-y-auto">
            {state.results.map((item, i) => {
              const Icon = mediaIcons[item.mediaType] ?? Film;
              return (
                <button
                  key={i}
                  onClick={() => doLog(state.parsed, item)}
                  className="flex w-full items-center gap-3 border-b border-ink/10 px-3 py-2 text-left transition-colors last:border-0 hover:bg-accent hover:text-paper"
                >
                  {item.coverImage ? (
                    <Image src={item.coverImage} alt="" width={24} height={32} unoptimized className="h-8 w-6 shrink-0 border border-ink object-cover" />
                  ) : (
                    <div className="flex h-8 w-6 shrink-0 items-center justify-center border border-ink bg-card">
                      <Icon className="h-3 w-3 text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{item.canonicalTitle}</p>
                    <p className="text-[10px] font-medium uppercase opacity-70">
                      {mediaLabels[item.mediaType] ?? item.mediaType}{item.year ? ` · ${item.year}` : ""}
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-40" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Not found */}
      {state.stage === "not-found" && (
        <div className="mt-1 flex items-center justify-between border-2 border-ink bg-card px-3 py-2.5">
          <p className="text-[11px] font-medium text-ink">
            Nothing found for <span className="font-black">"{state.title}"</span>
          </p>
          <button onClick={reset} className="ml-3 shrink-0 text-[10px] font-black uppercase text-accent hover:underline">
            Try again
          </button>
        </div>
      )}

      {/* Error */}
      {state.stage === "error" && (
        <div className="mt-1 flex items-center gap-2 border-2 border-ink bg-card px-3 py-2.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-accent" />
          <p className="flex-1 text-[11px] font-medium text-ink">{state.message}</p>
          <button onClick={reset} className="shrink-0 text-[10px] font-black uppercase text-muted hover:text-ink">
            Retry
          </button>
        </div>
      )}

      {/* Hint — shown only when idle and empty */}
      {isIdle && !message && (
        <p className="mt-1 px-1 text-[10px] text-muted/60">
          Tip: just describe what you watched, read, or are planning — e.g. <span className="font-medium italic">Finished Dune 8/10</span>
        </p>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, type FormEvent } from "react";
import Image from "next/image";
import { Send, Check, X, Star, ChevronDown, RefreshCw } from "lucide-react";
import { chatParse, chatSearch, chatLog } from "@/lib/api";
import { readSession } from "@/lib/client-auth";
import type { ChatParsed, ChatSearchItem, MediaType } from "@/lib/types";

type ChatState =
  | { stage: "idle" }
  | { stage: "parsing" }
  | { stage: "parsed"; parsed: ChatParsed; message: string }
  | { stage: "searching"; parsed: ChatParsed }
  | { stage: "not-found"; parsed: ChatParsed; title: string }
  | { stage: "disambiguate"; parsed: ChatParsed; results: ChatSearchItem[] }
  | { stage: "adding-note"; parsed: ChatParsed; selected: ChatSearchItem; rating: number | null }
  | { stage: "logging" }
  | { stage: "success"; title: string }
  | { stage: "error"; message: string };

const mediaLabels: Record<string, string> = {
  anime: "Anime", movie: "Film", series: "Series",
  book: "Book", manga: "Manga", comic: "Comic",
};
const statusLabels: Record<string, string> = {
  watching: "Watching", completed: "Done", dropped: "Dropped",
  planned: "Planned", rewatching: "Rewatch",
};

export function QuickLogBar({ onLogged }: { onLogged?: () => void }) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<ChatState>({ stage: "idle" });
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const session = typeof window !== "undefined" ? readSession() : null;
  const token = session?.accessToken ?? null;

  if (!token) return null;

  const isBusy = ["parsing", "searching", "logging"].includes(state.stage);
  const showDropdown = expanded && state.stage !== "idle";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = message.trim();
    if (!text || isBusy) return;
    setExpanded(true);
    setState({ stage: "parsing" });
    try {
      const parsed = await chatParse(token!, text);
      if (parsed.confidence === "low" || !parsed.title) {
        setState({ stage: "error", message: 'Could not understand that. Try: "Watched Inception 9/10"' });
        return;
      }
      // auto-search immediately
      setState({ stage: "searching", parsed });
      const { results } = await chatSearch(token!, parsed.title, parsed.mediaType);
      if (results.length === 0) {
        setState({ stage: "not-found", parsed, title: parsed.title! });
      } else if (results.length === 1) {
        await doLog(parsed, results[0]!, parsed.notes, parsed.rating);
      } else {
        setState({ stage: "disambiguate", parsed, results });
      }
    } catch {
      setState({ stage: "error", message: "Failed. Check connection." });
    }
  }

  async function doLog(parsed: ChatParsed, selected: ChatSearchItem, note: string | null, rating: number | null) {
    setState({ stage: "logging" });
    try {
      await chatLog(token!, {
        mediaType: selected.mediaType as MediaType,
        status: parsed.status,
        title: selected.canonicalTitle,
        coverImage: selected.coverImage,
        rating,
        notes: note,
        progress: parsed.progress,
        externalIds: selected.externalIds,
      });
      setMessage("");
      setState({ stage: "success", title: selected.canonicalTitle });
      onLogged?.();
    } catch {
      setState({ stage: "error", message: "Failed to save log." });
    }
  }

  function handleSelect(item: ChatSearchItem) {
    const cur = state as { stage: "disambiguate"; parsed: ChatParsed };
    doLog(cur.parsed, item, cur.parsed.notes, cur.parsed.rating);
  }

  function reset() {
    setMessage("");
    setState({ stage: "idle" });
    setExpanded(false);
  }

  return (
    <div className="relative w-full">
      {/* ── Horizontal input bar ── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-0 border-2 border-ink bg-paper shadow-[3px_3px_0_rgb(var(--ink))]"
      >
        <span className="shrink-0 border-r-2 border-ink px-2 py-2 text-[10px] font-black uppercase text-muted">
          Quick log
        </span>
        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setExpanded(true)}
          placeholder='"Watched Inception, amazing 9/10" or "Reading Dune p.200"'
          disabled={isBusy}
          className="flex-1 bg-transparent px-3 py-2 text-xs font-bold text-ink placeholder:text-muted/60 outline-none disabled:opacity-50 min-w-[200px]"
        />
        {state.stage === "success" && (
          <span className="shrink-0 border-l-2 border-ink bg-ink px-3 py-2 text-[10px] font-black uppercase text-paper hidden sm:inline-block">
            ✓ Logged
          </span>
        )}
        {isBusy && (
          <span className="shrink-0 border-l-2 border-ink px-3 py-2">
            <RefreshCw className="h-3 w-3 animate-spin text-muted" />
          </span>
        )}
        <button
          type="button"
          onClick={state.stage !== "idle" ? reset : undefined}
          className="shrink-0 border-l-2 border-ink px-2 py-2 text-muted hover:bg-ink hover:text-paper transition-colors"
          aria-label={state.stage !== "idle" ? "Clear" : "Expand"}
        >
          {state.stage !== "idle" ? (
            <X className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="submit"
          disabled={!message.trim() || isBusy}
          className="shrink-0 border-l-2 border-ink bg-ink px-3 py-2 text-paper transition-colors hover:bg-accent disabled:opacity-40"
          aria-label="Parse and log"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* ── Dropdown panel ── */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-[2px] z-50 border-2 border-ink bg-paper shadow-[3px_4px_0_rgb(var(--ink))]">

          {/* Parsing / searching / logging */}
          {isBusy && (
            <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-ink">
              <span className="block h-3 w-3 animate-spin rounded-full border border-ink border-t-transparent" />
              <p className="text-[10px] font-black uppercase text-muted">
                {state.stage === "parsing" ? "Reading…" : state.stage === "searching" ? "Finding…" : "Saving…"}
              </p>
            </div>
          )}

          {/* Disambiguate */}
          {state.stage === "disambiguate" && (
            <div className="max-h-60 overflow-y-auto">
              <p className="border-b-2 border-ink bg-ink px-3 py-1.5 text-[10px] font-black uppercase text-paper">Pick the right title</p>
              {state.results.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(item)}
                  className="flex w-full items-center gap-3 border-b-2 border-ink/20 px-3 py-2 text-left hover:bg-accent hover:text-paper transition-colors"
                >
                  {item.coverImage ? (
                    <Image src={item.coverImage} alt="" width={24} height={32} className="h-8 w-6 shrink-0 border border-ink object-cover" />
                  ) : (
                    <div className="h-8 w-6 shrink-0 border border-ink bg-card flex items-center justify-center">
                       <Star className="h-3 w-3 text-muted" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate">{item.canonicalTitle}</p>
                    <p className="text-[10px] font-bold uppercase opacity-80">{mediaLabels[item.mediaType] ?? item.mediaType}{item.year ? ` · ${item.year}` : ""}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Not found */}
          {state.stage === "not-found" && (
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
              <p className="text-xs font-bold text-muted">No matches for <span className="font-black text-ink">{state.title}</span></p>
              <button onClick={reset} className="text-[10px] font-black uppercase text-accent hover:underline">Try again</button>
            </div>
          )}

          {/* Adding note */}
          {state.stage === "adding-note" && (
            <div className="flex flex-col gap-2 px-4 py-3 border-b-2 border-ink">
              <p className="text-xs font-black text-ink truncate">{state.selected.canonicalTitle}</p>
              <div className="flex shrink-0 gap-2 self-end">
                <button onClick={() => doLog(state.parsed, state.selected, null, state.rating)} className="pixel-button px-2 py-1 text-[10px] font-black uppercase">
                  <Check className="h-3 w-3" /> Log
                </button>
              </div>
            </div>
          )}

          {/* Success */}
          {state.stage === "success" && (
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
              <p className="text-xs font-black text-accent">Logged: <span className="text-ink">{state.title}</span></p>
              <button onClick={reset} className="text-[10px] font-black uppercase text-muted hover:text-ink">Log another</button>
            </div>
          )}

          {/* Error */}
          {state.stage === "error" && (
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-ink">
              <p className="text-xs font-bold text-accent">{state.message}</p>
              <button onClick={reset} className="text-[10px] font-black uppercase text-muted hover:text-ink">Try again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

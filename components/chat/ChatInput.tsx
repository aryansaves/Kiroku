"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Send, MessageCircle, Star, X, Check } from "lucide-react";
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
  | { stage: "adding-rating"; parsed: ChatParsed; selected: ChatSearchItem; note: string | null }
  | { stage: "logging" }
  | { stage: "success"; title: string }
  | { stage: "error"; message: string };

const mediaTypeLabels: Record<string, string> = {
  anime: "Anime",
  movie: "Film",
  series: "Series",
  book: "Book",
  manga: "Manga",
  comic: "Comic",
};

const statusLabels: Record<string, string> = {
  watching: "Watching",
  completed: "Completed",
  dropped: "Dropped",
  planned: "Planned",
  rewatching: "Rewatching",
};

function ratingToStars(rating: number | null): string {
  if (rating === null || rating === undefined) return "";
  const stars = Math.round(rating / 2);
  return "\u2605".repeat(stars) + "\u2606".repeat(5 - stars);
}

export function ChatInput() {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<ChatState>({ stage: "idle" });
  const token = typeof window !== "undefined" ? readSession()?.accessToken ?? null : null;

  if (!token) return null;

  async function handleParse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    setState({ stage: "parsing" });
    try {
      const parsed = await chatParse(token!, text);
      if (parsed.confidence === "low" || !parsed.title) {
        setState({ stage: "error", message: "Could not understand that. Try being more specific (e.g. \"Watched Inception, great movie 9/10\")." });
        return;
      }
      setState({ stage: "parsed", parsed, message: text });
    } catch {
      setState({ stage: "error", message: "Failed to parse message. Check your connection." });
    }
  }

  async function handleSearch() {
    const current = state as { stage: "parsed"; parsed: ChatParsed; message: string };
    if (!current.parsed.title) return;

    setState({ stage: "searching", parsed: current.parsed });
    try {
      const { results } = await chatSearch(token!, current.parsed.title, current.parsed.mediaType);
      if (results.length === 0) {
        setState({ stage: "not-found", parsed: current.parsed, title: current.parsed.title });
      } else if (results.length === 1) {
        const item = results[0]!;
        if (current.parsed.notes) {
          await doLog(current.parsed, item, current.parsed.notes, current.parsed.rating);
        } else if (current.parsed.rating !== null) {
          await doLog(current.parsed, item, current.parsed.notes, current.parsed.rating);
        } else {
          setState({
            stage: "adding-note",
            parsed: current.parsed,
            selected: item,
            rating: current.parsed.rating,
          });
        }
      } else {
        setState({ stage: "disambiguate", parsed: current.parsed, results });
      }
    } catch {
      setState({ stage: "error", message: "Search failed. Try again." });
    }
  }

  function handleSelectResult(item: ChatSearchItem) {
    const current = state as { stage: "disambiguate"; parsed: ChatParsed };
    if (current.parsed.notes) {
      doLog(current.parsed, item, current.parsed.notes, current.parsed.rating);
    } else if (current.parsed.rating !== null) {
      doLog(current.parsed, item, current.parsed.notes, current.parsed.rating);
    } else {
      setState({
        stage: "adding-note",
        parsed: current.parsed,
        selected: item,
        rating: current.parsed.rating,
      });
    }
  }

  function handleSkipToLog() {
    const current = state as { stage: "adding-note"; parsed: ChatParsed; selected: ChatSearchItem; rating: number | null };
    doLog(current.parsed, current.selected, null, current.rating);
  }

  function handleAddRatingFirst() {
    const current = state as { stage: "adding-note"; parsed: ChatParsed; selected: ChatSearchItem; rating: number | null };
    setState({
      stage: "adding-rating",
      parsed: current.parsed,
      selected: current.selected,
      note: null,
    });
  }

  function handleSubmitRating(ratingStr: string) {
    const current = state as { stage: "adding-rating"; parsed: ChatParsed; selected: ChatSearchItem; note: string | null };
    const rating = parseInt(ratingStr, 10);
    if (isNaN(rating) || rating < 0 || rating > 10) return;
    doLog(current.parsed, current.selected, current.note, rating);
  }

  async function doLog(
    parsed: ChatParsed,
    selected: ChatSearchItem,
    note: string | null,
    rating: number | null
  ) {
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
    } catch {
      setState({ stage: "error", message: "Failed to save log. Try again." });
    }
  }

  function handleReset() {
    setMessage("");
    setState({ stage: "idle" });
  }

  function handleEditParsed() {
    setState({ stage: "idle" });
  }

  const isBusy = ["parsing", "searching", "logging"].includes(state.stage);

  return (
    <section className="archive-panel p-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-black uppercase text-ink flex items-center gap-2">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Quick Log
          </h2>
          <p className="text-xs font-bold text-muted">Log media without Telegram.</p>
        </div>
      </div>

      {state.stage === "idle" && (
        <form onSubmit={handleParse} className="grid gap-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='e.g. "Watched Inception, amazing 9/10"'
            maxLength={500}
            rows={3}
            className="field-input resize-none"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="pixel-button-solid inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            Parse
          </button>
        </form>
      )}

      {isBusy && (
        <div className="flex items-center gap-3 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink border-t-transparent" />
          <p className="text-sm font-bold text-muted uppercase">
            {state.stage === "parsing" ? "Reading your message..." :
             state.stage === "searching" ? "Finding matches..." :
             "Saving to journal..."}
          </p>
        </div>
      )}

      {state.stage === "parsed" && (
        <div className="grid gap-4">
          <div className="border-2 border-ink bg-paper p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="grid gap-1">
                <p className="text-sm font-black text-ink">{state.parsed.title || "(no title)"}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="status-badge">{mediaTypeLabels[state.parsed.mediaType] || state.parsed.mediaType}</span>
                  <span className="status-badge">{statusLabels[state.parsed.status]}</span>
                  {state.parsed.rating !== null && (
                    <span className="text-xs font-black text-accent">{ratingToStars(state.parsed.rating)}</span>
                  )}
                </div>
                {state.parsed.notes && (
                  <p className="text-xs font-bold text-muted mt-1 italic">&ldquo;{state.parsed.notes}&rdquo;</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSearch}
              className="pixel-button-solid inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
            >
              <Check className="h-4 w-4" />
              Find match
            </button>
            <button
              onClick={handleEditParsed}
              className="pixel-button inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
            >
              <X className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      )}

      {state.stage === "not-found" && (
        <div className="grid gap-3">
          <p className="text-sm font-bold text-muted">
            No matches found for &ldquo;<span className="text-ink font-black">{state.title}</span>&rdquo;.
          </p>
          <button
            onClick={handleEditParsed}
            className="pixel-button inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
          >
            Try again
          </button>
        </div>
      )}

      {state.stage === "disambiguate" && (
        <div className="grid gap-2 max-h-80 overflow-y-auto">
          <p className="text-xs font-bold text-muted mb-1">Pick the correct title:</p>
          {state.results.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelectResult(item)}
              className="field-input text-left flex items-center gap-3 hover:bg-accent hover:text-paper transition-colors"
            >
              {item.coverImage && (
                <Image
                  src={item.coverImage}
                  alt=""
                  width={32}
                  height={40}
                  className="h-10 w-8 object-cover border border-ink shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-sm font-black truncate">{item.canonicalTitle}</p>
                <p className="text-[10px] font-bold uppercase text-muted">
                  {mediaTypeLabels[item.mediaType] || item.mediaType}
                  {item.year ? ` \u00B7 ${item.year}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {state.stage === "adding-note" && (
        <div className="grid gap-3">
          <div className="flex items-start gap-3 border-2 border-ink bg-paper p-3">
            {state.selected.coverImage && (
              <Image
                src={state.selected.coverImage}
                alt=""
                width={48}
                height={64}
                className="h-16 w-12 object-cover border border-ink shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-black text-ink truncate">{state.selected.canonicalTitle}</p>
              <p className="text-[10px] font-bold uppercase text-muted">
                {mediaTypeLabels[state.selected.mediaType] || state.selected.mediaType}
                {state.selected.year ? ` \u00B7 ${state.selected.year}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleSkipToLog}
              className="pixel-button-solid inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
            >
              <Check className="h-4 w-4" />
              Log now
            </button>
            <button
              onClick={handleAddRatingFirst}
              className="pixel-button inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
            >
              <Star className="h-4 w-4" />
              Add rating
            </button>
          </div>
        </div>
      )}

      {state.stage === "adding-rating" && (
        <div className="grid gap-3">
          <div className="border-2 border-ink bg-paper p-3">
            <p className="text-sm font-black text-ink mb-2">{state.selected.canonicalTitle}</p>
            <p className="text-xs font-bold text-muted mb-3">Rate 0-10:</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmitRating(String(i))}
                  className="pixel-button px-3 py-1.5 text-xs font-black uppercase min-w-[2.5rem]"
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSkipToLog}
            className="pixel-button inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
          >
            Skip rating
          </button>
        </div>
      )}

      {state.stage === "success" && (
        <div className="grid gap-3">
          <p className="text-sm font-black text-accent">
            Logged: <span className="text-ink">{state.title}</span>
          </p>
          <button
            onClick={handleReset}
            className="pixel-button inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
          >
            Log another
          </button>
        </div>
      )}

      {state.stage === "error" && (
        <div className="grid gap-3">
          <p className="text-sm font-bold text-accent">{state.message}</p>
          <button
            onClick={handleReset}
            className="pixel-button inline-flex items-center gap-2 px-4 py-2 text-xs font-black uppercase"
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

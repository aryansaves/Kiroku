"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { getGuestbookEntries, postGuestbookEntry } from "@/lib/api";
import type { GuestbookEntry } from "@/lib/types";

export function Guestbook({
  username,
  enabled
}: {
  username: string;
  enabled: boolean;
}) {
  const [visitorName, setVisitorName] = useState("");
  const [message, setMessage] = useState("");
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!enabled) return;

    getGuestbookEntries(username)
      .then((payload) => setEntries(payload.entries))
      .catch(() => setEntries([]));
  }, [enabled, username]);

  if (!enabled) return null;

  async function submitGuestbook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = visitorName.trim();
    const body = message.trim();
    if (!name || !body) return;

    setStatus("sending");
    try {
      const entry = await postGuestbookEntry(username, { visitorName: name, message: body });
      setVisitorName("");
      setMessage("");
      setEntries((current) => [entry as GuestbookEntry, ...current].slice(0, 8));
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="archive-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black uppercase text-ink">Guestbook</h2>
        <p className="text-xs font-bold text-muted">Leave a note.</p>
      </div>
    </div>

      {entries.length ? (
        <div className="mt-5 grid gap-3">
          {entries.map((entry) => (
            <article key={entry._id} className="border-2 border-ink bg-paper p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase text-accent">
                  {entry.visitorName}
                </p>
                <time className="text-[10px] font-black uppercase text-muted">
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric"
                  }).format(new Date(entry.createdAt))}
                </time>
              </div>
              <p className="mt-2 text-sm font-bold leading-5 text-ink">
                {entry.message}
              </p>
            </article>
          ))}
        </div>
      ) : null}

      <form onSubmit={submitGuestbook} className="mt-5 grid gap-3">
        <input
          name="visitorName"
          value={visitorName}
          onChange={(event) => setVisitorName(event.target.value)}
          placeholder="Name"
          maxLength={48}
          className="field-input"
        />
        <textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message"
          maxLength={280}
          rows={4}
          className="field-input resize-none"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="pixel-button-solid inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-black uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {status === "sending" ? "Sending" : "Sign guestbook"}
        </button>
        {status === "sent" ? (
          <p className="text-sm text-accent">Signed.</p>
        ) : status === "error" ? (
          <p className="text-sm text-accent">Could not send right now.</p>
        ) : null}
      </form>
    </section>
  );
}

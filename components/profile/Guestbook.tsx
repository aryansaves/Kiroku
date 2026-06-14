"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import { postGuestbookEntry } from "@/lib/api";

export function Guestbook({
  username,
  enabled
}: {
  username: string;
  enabled: boolean;
}) {
  const [visitorName, setVisitorName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  if (!enabled) return null;

  async function submitGuestbook(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = visitorName.trim();
    const body = message.trim();
    if (!name || !body) return;

    setStatus("sending");
    try {
      await postGuestbookEntry(username, { visitorName: name, message: body });
      setVisitorName("");
      setMessage("");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="pixel-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black uppercase text-ink">Guestbook</h2>
          <p className="text-xs font-bold text-muted">Leave a note.</p>
        </div>
      </div>

      <form onSubmit={submitGuestbook} className="mt-5 grid gap-3">
        <input
          name="visitorName"
          value={visitorName}
          onChange={(event) => setVisitorName(event.target.value)}
          placeholder="Name"
          maxLength={48}
          className="border-2 border-ink bg-paper px-3 py-2 text-sm font-bold outline-none placeholder:text-muted focus:bg-accent focus:text-paper"
        />
        <textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Message"
          maxLength={280}
          rows={4}
          className="resize-none border-2 border-ink bg-paper px-3 py-2 text-sm font-bold outline-none placeholder:text-muted focus:bg-accent focus:text-paper"
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

import { LogCard } from "@/components/journal/LogCard";
import type { JournalLayout, Log } from "@/lib/types";

export function LogGrid({ logs, layout }: { logs: Log[]; layout: JournalLayout }) {
  if (!logs.length) {
    return (
      <div className="pixel-panel p-10 text-center text-sm font-black uppercase text-muted">
        No entries here yet.
      </div>
    );
  }

  if (layout === "feed") {
    return (
      <div className="mx-auto grid max-w-2xl gap-5">
        {logs.map((log, index) => (
          <LogCard key={log._id} log={log} featured={index === 0} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={
        layout === "masonry"
          ? "mx-auto max-w-4xl columns-1 gap-5 sm:columns-2 [&>*]:mb-5 [&>*]:break-inside-avoid"
          : "mx-auto grid max-w-4xl gap-5 sm:grid-cols-2"
      }
    >
      {logs.map((log, index) => (
        <LogCard key={log._id} log={log} featured={layout === "grid" && index === 0} />
      ))}
    </div>
  );
}

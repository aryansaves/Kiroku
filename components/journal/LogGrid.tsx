import { LogCard } from "@/components/journal/LogCard";
import type { Log } from "@/lib/types";

/** Legacy grid used by older routes — prefer LogShelf for the profile page */
export function LogGrid({ logs }: { logs: Log[] }) {
  if (!logs.length) {
    return (
      <div className="pixel-panel p-10 text-center text-sm font-black uppercase text-muted">
        No entries here yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
      {logs.map((log) => (
        <LogCard key={log._id} log={log} />
      ))}
    </div>
  );
}

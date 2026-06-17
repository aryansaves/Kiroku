"use client";

import { useState, useCallback, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { LogCard, LogCardFeatured } from "@/components/journal/LogCard";
import { getUserLogs } from "@/lib/api";
import type { Log, MediaType } from "@/lib/types";

const mediaTypes: Array<{ label: string; value?: MediaType }> = [
  { label: "All" },
  { label: "Anime", value: "anime" },
  { label: "Movies", value: "movie" },
  { label: "Series", value: "series" },
  { label: "Books", value: "book" },
  { label: "Manga", value: "manga" },
  { label: "Comics", value: "comic" }
];

function countByType(logs: Log[]) {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    counts[log.mediaType] = (counts[log.mediaType] ?? 0) + 1;
  }
  return counts;
}

export function LogShelf({
  username,
  initialLogs,
  initialTotal,
  initialType
}: {
  username: string;
  initialLogs: Log[];
  initialTotal: number;
  initialType?: MediaType;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [activeType, setActiveType] = useState<MediaType | undefined>(initialType);
  const [isPending, startTransition] = useTransition();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const typeCounts = countByType(logs);

  const fetchLogs = useCallback(
    async (type?: MediaType) => {
      try {
        const result = await getUserLogs({
          username,
          type,
          limit: 60
        });
        setLogs(result.logs);
        setTotal(result.total);
      } catch {
        // keep existing logs on error
      }
    },
    [username]
  );

  function handleFilter(type?: MediaType) {
    setActiveType(type);
    startTransition(() => {
      fetchLogs(type);
    });
  }

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    setLastRefreshed(new Date());
    startTransition(() => {
      fetchLogs(activeType);
    });
  }

  // Split: top 4 most recent as featured, rest as compact grid
  const recentLogs = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const featured = recentLogs.slice(0, 3);
  const gridLogs = activeType ? recentLogs : recentLogs.slice(3);

  return (
    <div className="grid gap-4">
      {/* ── Filter bar + Refresh ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap gap-1" aria-label="Media type filter">
          {mediaTypes.map((f) => {
            const count = f.value ? typeCounts[f.value] : logs.length;
            const active = f.value === activeType || (!f.value && !activeType);
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => handleFilter(f.value)}
                className={`shrink-0 border-2 px-2 py-1 text-[10px] font-black uppercase transition-all ${
                  active
                    ? "border-ink bg-ink text-paper shadow-[2px_2px_0_rgb(var(--accent))]"
                    : "border-ink bg-card text-ink hover:bg-accent hover:text-paper"
                }`}
              >
                {f.label}
                {count !== undefined && (
                  <span className={`ml-1 ${active ? "text-paper/70" : "text-muted"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isPending}
          aria-label="Refresh logs"
          className="pixel-button inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {isPending ? "Loading" : "Refresh"}
        </button>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted">
          <span className="block h-3 w-3 animate-spin rounded-full border border-ink border-t-transparent" />
          Fetching…
        </div>
      )}

      {/* ── Recent spotlight strip (only on "All") ── */}
      {!activeType && featured.length > 0 && (
        <div className="grid gap-2">
          <p className="text-[10px] font-black uppercase text-muted">Recently logged</p>
          <div className="grid gap-2">
            {featured.map((log) => (
              <LogCardFeatured key={`${log._id}-${refreshKey}`} log={log} />
            ))}
          </div>
          {gridLogs.length > 0 && (
            <p className="mt-1 text-[10px] font-black uppercase text-muted">All entries</p>
          )}
        </div>
      )}

      {/* ── Compact grid ── */}
      {logs.length === 0 ? (
        <div className="border-2 border-dashed border-ink p-8 text-center text-xs font-black uppercase text-muted">
          {activeType ? `No ${activeType} entries yet.` : "No entries yet."}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {(activeType ? recentLogs : gridLogs).map((log) => (
            <LogCard key={`${log._id}-${refreshKey}`} log={log} />
          ))}
        </div>
      )}

      <p className="text-[9px] font-black uppercase text-muted">
        {total} total · {activeType ?? "all types"}
        {lastRefreshed && (
          <> · refreshed {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</>
        )}
      </p>
    </div>
  );
}

"use client";

import { useState, useCallback, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { LogCard, LogCardFeatured } from "@/components/journal/LogCard";
import { getUserLogs } from "@/lib/api";
import type { Log, MediaType } from "@/lib/types";

const mediaTypes: Array<{ label: string; value?: MediaType; includes?: MediaType[] }> = [
  { label: "All" },
  { label: "Series", value: "series", includes: ["anime", "series"] },
  { label: "Movies", value: "movie"  },
  { label: "Books",  value: "book"   },
  { label: "Manga",  value: "manga"  },
  { label: "Comics", value: "comic"  }
];

function countByType(logs: Log[]) {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    const key = log.mediaType === "anime" ? "series" : log.mediaType;
    counts[key] = (counts[key] ?? 0) + 1;
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
  const [logs, setLogs]           = useState(initialLogs);
  const [total, setTotal]         = useState(initialTotal);
  const [activeType, setActiveType] = useState<MediaType | undefined>(initialType);
  const [isPending, startTransition] = useTransition();
  const [refreshKey, setRefreshKey]  = useState(0);

  const allTypeCounts = countByType(initialLogs); // always from full set

  const fetchLogs = useCallback(
    async (type?: MediaType) => {
      try {
        // "series" filter fetches both anime + series and merges them
        if (type === "series") {
          const [seriesResult, animeResult] = await Promise.all([
            getUserLogs({ username, type: "series", limit: 60 }),
            getUserLogs({ username, type: "anime",  limit: 60 }),
          ]);
          const merged = [...seriesResult.logs, ...animeResult.logs];
          setLogs(merged);
          setTotal(seriesResult.total + animeResult.total);
        } else {
          const result = await getUserLogs({ username, type, limit: 60 });
          setLogs(result.logs);
          setTotal(result.total);
        }
      } catch {
        // keep existing logs on error
      }
    },
    [username]
  );

  function handleFilter(type?: MediaType) {
    if (type === activeType) return; // already active, no-op
    setActiveType(type);
    startTransition(() => { fetchLogs(type); });
  }

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
    startTransition(() => { fetchLogs(activeType); });
  }

  // Sort descending by creation date
  const sorted = [...logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // When a filter is active → just show the compact grid (all filtered results)
  // When on "All"           → show top 3 as featured cards + rest as compact grid
  const isFiltered = Boolean(activeType);
  const featured   = isFiltered ? [] : sorted.slice(0, 3);
  const gridLogs   = isFiltered ? sorted : sorted.slice(3);

  return (
    <div className="grid gap-4">

      {/* ── Filter bar + Refresh ── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <nav className="flex flex-wrap gap-1" aria-label="Media type filter">
          {mediaTypes.map((f) => {
            const count  = f.value ? (allTypeCounts[f.value] ?? 0) : initialLogs.length;
            const active = f.value === activeType || (!f.value && !activeType);
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => handleFilter(f.value)}
                className={`shrink-0 border-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide transition-all ${
                  active
                    ? "border-ink bg-ink text-paper shadow-[2px_2px_0_rgb(var(--accent))]"
                    : "border-ink/40 bg-card text-ink hover:border-ink hover:bg-ink hover:text-paper"
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className={`ml-1 text-[10px] ${active ? "text-paper/60" : "text-muted"}`}>
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
          className="pixel-button inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
          {isPending ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* ── Loading bar ── */}
      {isPending && (
        <div className="h-0.5 w-full overflow-hidden bg-card">
          <div className="h-full w-1/2 animate-pulse bg-accent" />
        </div>
      )}

      {/* ── No results ── */}
      {logs.length === 0 && !isPending && (
        <div className="border-2 border-dashed border-ink/40 p-10 text-center text-xs font-bold uppercase text-muted">
          {activeType ? `No ${activeType} entries yet.` : "No entries logged yet."}
        </div>
      )}

      {/* ── Featured strip — only on "All" ── */}
      {!isFiltered && featured.length > 0 && (
        <div className="grid gap-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Recently logged</p>
          <div className="grid gap-2">
            {featured.map((log) => (
              <LogCardFeatured key={`${log._id}-${refreshKey}`} log={log} />
            ))}
          </div>
          {gridLogs.length > 0 && (
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-muted">All entries</p>
          )}
        </div>
      )}

      {/* ── Compact poster grid ── */}
      {gridLogs.length > 0 && (
        <div className="log-grid">
          {gridLogs.map((log) => (
            <LogCard key={`${log._id}-${refreshKey}`} log={log} />
          ))}
        </div>
      )}

      <p className="text-[10px] font-bold uppercase text-muted/70">
        {total} total · {activeType ?? "all types"}
      </p>
    </div>
  );
}

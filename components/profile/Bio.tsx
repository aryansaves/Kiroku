import { ExternalLink, CalendarDays, BookMarked } from "lucide-react";
import Image from "next/image";
import type { PublicUser, Log } from "@/lib/types";

function formatJoined(iso: string) {
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(iso));
}

function statsByType(logs: Log[]) {
  const counts: Record<string, number> = {};
  for (const log of logs) {
    counts[log.mediaType] = (counts[log.mediaType] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
}

export function Bio({
  user,
  logs
}: {
  user: PublicUser;
  logs: Log[];
}) {
  const topTypes = statsByType(logs);

  return (
    <aside className="archive-panel flex flex-col gap-0 overflow-hidden">
      {/* Avatar + name header */}
      <div className="border-b-2 border-ink p-4">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden border-2 border-ink shadow-[3px_3px_0_rgb(var(--ink))]">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt=""
                width={56}
                height={56}
                unoptimized
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent text-2xl font-black text-paper">
                {user.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase text-muted">/u/{user.username}</p>
            <h1 className="mt-0.5 text-xl font-black uppercase leading-tight text-ink">
              {user.displayName}
            </h1>
          </div>
        </div>

        {user.bio && (
          <p className="mt-3 text-xs font-bold leading-5 text-ink">
            {user.bio}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 border-b-2 border-ink">
        <div className="border-r-2 border-ink p-3">
          <p className="flex items-center gap-1 text-[10px] font-black uppercase text-muted">
            <BookMarked className="h-3 w-3" aria-hidden="true" />
            Entries
          </p>
          <p className="mt-0.5 text-2xl font-black text-ink">{logs.length}</p>
        </div>
        <div className="p-3">
          <p className="flex items-center gap-1 text-[10px] font-black uppercase text-muted">
            <CalendarDays className="h-3 w-3" aria-hidden="true" />
            Since
          </p>
          <p className="mt-0.5 text-sm font-black uppercase text-ink">
            {formatJoined(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Top types */}
      {topTypes.length > 0 && (
        <div className="border-b-2 border-ink p-3">
          <p className="mb-2 text-[10px] font-black uppercase text-muted">Shelf breakdown</p>
          <div className="grid gap-1">
            {topTypes.map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-ink">{type}</span>
                <span className="flex items-center gap-1">
                  {/* Mini bar */}
                  <span
                    className="h-2 bg-accent border border-ink"
                    style={{ width: `${Math.max(12, (count / logs.length) * 64)}px` }}
                  />
                  <span className="text-[10px] font-black text-muted">{count}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {user.links.length > 0 && (
        <div className="p-3">
          <p className="mb-2 text-[10px] font-black uppercase text-muted">Links</p>
          <div className="grid gap-1">
            {user.links.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 border-2 border-ink bg-paper px-2 py-1 text-[10px] font-black uppercase text-ink hover:bg-accent hover:text-paper transition-colors"
              >
                {link.label}
                <ExternalLink className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

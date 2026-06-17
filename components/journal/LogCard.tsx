import Image from "next/image";
import {
  BookOpen,
  Clapperboard,
  MonitorPlay,
  PanelsTopLeft,
  Star
} from "lucide-react";
import type { ElementType } from "react";
import type { Log, MediaType } from "@/lib/types";

const typeIcons: Record<MediaType, ElementType> = {
  anime: MonitorPlay,
  movie: Clapperboard,
  series: MonitorPlay,
  book: BookOpen,
  manga: BookOpen,
  comic: PanelsTopLeft
};

const statusDots: Record<string, string> = {
  completed: "bg-green-600",
  watching: "bg-accent",
  rewatching: "bg-accent",
  dropped: "bg-red-500",
  planned: "bg-muted"
};

function ratingStars(rating: number) {
  const full = Math.round(rating / 2);
  return Array.from({ length: 5 }, (_, i) => (i < full ? "★" : "☆")).join("");
}

/** Compact card — letterboxd-style poster tile */
export function LogCard({ log }: { log: Log }) {
  const Icon = typeIcons[log.mediaType];
  const dot = statusDots[log.status] ?? "bg-muted";

  return (
    <article
      className="group relative border-2 border-ink bg-card shadow-[3px_3px_0_rgb(var(--ink))] hover:shadow-[1px_1px_0_rgb(var(--ink))] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-100"
      title={`${log.title}${log.rating !== null ? ` · ${log.rating}/10` : ""} · ${log.status}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden border-b-2 border-ink bg-paper">
        {log.coverImage ? (
          <Image
            src={log.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 14vw, (min-width: 640px) 20vw, 33vw"
            unoptimized
            className="object-cover grayscale-[15%] transition duration-200 group-hover:grayscale-0 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="pixel-grid flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
            <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
            <span className="text-[9px] font-black uppercase leading-tight text-ink line-clamp-3">
              {log.title}
            </span>
          </div>
        )}

        {/* Status dot */}
        <span
          className={`absolute right-1 top-1 h-2.5 w-2.5 border border-ink ${dot}`}
          aria-label={log.status}
        />

        {/* Type badge on hover */}
        <span className="absolute bottom-0 left-0 right-0 translate-y-full border-t-2 border-ink bg-ink px-1 py-0.5 text-[9px] font-black uppercase text-paper opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 flex items-center gap-1">
          <Icon className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
          {log.mediaType}
        </span>
      </div>

      {/* Info strip */}
      <div className="p-1.5">
        <p className="text-[9px] font-black uppercase leading-tight text-ink truncate">
          {log.title}
        </p>
        {log.rating !== null ? (
          <p className="mt-0.5 text-[8px] font-black text-accent tracking-tight">
            {ratingStars(log.rating)}
          </p>
        ) : (
          <p className="mt-0.5 flex items-center gap-1 text-[8px] font-black uppercase text-muted">
            <Star className="h-2 w-2" aria-hidden="true" />
            {log.status}
          </p>
        )}
      </div>
    </article>
  );
}

/** Large featured card for the "recently logged" spotlight */
export function LogCardFeatured({ log }: { log: Log }) {
  const Icon = typeIcons[log.mediaType];
  const credit =
    log.metadata.author ??
    log.metadata.director ??
    log.metadata.studio ??
    (log.metadata.year ? String(log.metadata.year) : null);

  return (
    <article className="group relative flex gap-3 border-2 border-ink bg-card shadow-[4px_4px_0_rgb(var(--ink))]">
      {/* Poster */}
      <div className="relative w-20 shrink-0 overflow-hidden border-r-2 border-ink bg-paper">
        {log.coverImage ? (
          <Image
            src={log.coverImage}
            alt=""
            fill
            sizes="80px"
            unoptimized
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2">
            <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-1 top-1 inline-flex items-center border border-ink bg-accent px-1 text-[8px] font-black uppercase text-paper">
          {log.mediaType}
        </span>
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-col justify-center py-3 pr-3">
        <p className="text-[10px] font-black uppercase text-muted">{log.status}</p>
        <h3 className="mt-0.5 text-sm font-black uppercase leading-tight text-ink truncate">
          {log.title}
        </h3>
        {credit && (
          <p className="mt-0.5 text-[10px] font-bold uppercase text-muted truncate">{credit}</p>
        )}
        {log.notes && (
          <p className="mt-1.5 line-clamp-2 text-[11px] font-bold leading-4 text-ink italic">
            "{log.notes}"
          </p>
        )}
        {log.rating !== null && (
          <p className="mt-1 text-[10px] font-black text-accent">
            {"★".repeat(Math.round(log.rating / 2))}
            {"☆".repeat(5 - Math.round(log.rating / 2))}
            <span className="ml-1 text-muted">({log.rating}/10)</span>
          </p>
        )}
      </div>
    </article>
  );
}

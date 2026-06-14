import {
  BookOpen,
  Clapperboard,
  Disc3,
  Gamepad2,
  Headphones,
  MonitorPlay,
  Star
} from "lucide-react";
import Image from "next/image";
import type { ElementType } from "react";
import type { Log, MediaType } from "@/lib/types";

const typeIcons: Record<MediaType, ElementType> = {
  anime: MonitorPlay,
  movie: Clapperboard,
  book: BookOpen,
  manga: BookOpen,
  game: Gamepad2,
  music: Disc3,
  podcast: Headphones
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function progressLabel(log: Log) {
  if (log.progress.episode) return `Episode ${log.progress.episode}`;
  if (log.progress.chapter) return `Chapter ${log.progress.chapter}`;
  if (log.progress.page) return `Page ${log.progress.page}`;
  if (log.progress.percentage) return `${log.progress.percentage}%`;
  return log.status;
}

export function LogCard({ log, featured = false }: { log: Log; featured?: boolean }) {
  const Icon = typeIcons[log.mediaType];
  const credit =
    log.metadata.author ??
    log.metadata.director ??
    log.metadata.studio ??
    (log.metadata.year ? String(log.metadata.year) : null);

  return (
    <article
      className={`group relative border-2 border-ink bg-card shadow-[6px_6px_0_rgb(var(--ink))] ${
        featured ? "md:col-span-2 md:grid md:grid-cols-[minmax(180px,0.72fr)_1fr]" : ""
      }`}
    >
      <div className="relative aspect-[3/4] overflow-hidden border-b-2 border-ink bg-paper md:border-b-0 md:border-r-2">
        {log.coverImage ? (
          <Image
            src={log.coverImage}
            alt=""
            fill
            sizes={featured ? "(min-width: 768px) 40vw, 100vw" : "(min-width: 1280px) 30vw, (min-width: 640px) 50vw, 100vw"}
            unoptimized
            className="object-cover grayscale-[25%] contrast-125 transition duration-200 group-hover:grayscale-0"
            loading="lazy"
          />
        ) : (
          <div className="pixel-grid flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <Icon className="h-9 w-9 text-accent" aria-hidden="true" />
            <span className="max-w-[12rem] text-balance text-sm font-black uppercase text-ink">
              {log.title}
            </span>
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 border-2 border-ink bg-accent px-2 py-1 text-[10px] font-black uppercase text-paper">
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {log.mediaType}
        </span>
      </div>

      <div className="flex min-h-[210px] flex-col p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase text-muted">
              {formatDate(log.createdAt)}
            </p>
            <h3 className="mt-2 text-xl font-black uppercase leading-tight text-ink">
              {log.title}
            </h3>
          </div>
          {log.rating !== null ? (
            <span className="inline-flex shrink-0 items-center gap-1 border-2 border-ink bg-paper px-2 py-1 text-xs font-black text-accent shadow-[2px_2px_0_rgb(var(--ink))]">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              {log.rating}
            </span>
          ) : null}
        </div>

        {credit ? (
          <p className="mt-2 text-xs font-bold uppercase text-muted">{credit}</p>
        ) : null}

        {log.notes ? (
          <p className="mt-4 line-clamp-4 text-sm font-bold leading-6 text-ink">
            {log.notes}
          </p>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t-2 border-ink pt-4 text-xs font-black uppercase">
          <span className="text-ink">{progressLabel(log)}</span>
          <span className="border-2 border-ink bg-accent px-2 py-1 text-paper">
            {log.status}
          </span>
        </div>
      </div>
    </article>
  );
}

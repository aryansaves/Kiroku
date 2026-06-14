import Link from "next/link";
import type { MediaType } from "@/lib/types";

const filters: Array<{ label: string; value?: MediaType }> = [
  { label: "All" },
  { label: "Anime", value: "anime" },
  { label: "Movies", value: "movie" },
  { label: "Books", value: "book" },
  { label: "Manga", value: "manga" },
  { label: "Games", value: "game" },
  { label: "Music", value: "music" },
  { label: "Podcasts", value: "podcast" }
];

export function TypeFilter({
  username,
  activeType
}: {
  username: string;
  activeType?: MediaType;
}) {
  return (
    <nav
      className="mx-auto flex max-w-full gap-2 overflow-x-auto pb-2"
      aria-label="Media filters"
    >
      {filters.map((filter) => {
        const active = filter.value === activeType || (!filter.value && !activeType);
        const href = filter.value
          ? `/u/${username}?type=${filter.value}`
          : `/u/${username}`;

        return (
          <Link
            key={filter.label}
            href={href}
            className={`shrink-0 border-2 px-3 py-1.5 text-xs font-black uppercase transition ${
              active
                ? "border-ink bg-accent text-paper shadow-[3px_3px_0_rgb(var(--ink))]"
                : "border-ink bg-card text-ink hover:bg-ink hover:text-paper"
            }`}
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );
}

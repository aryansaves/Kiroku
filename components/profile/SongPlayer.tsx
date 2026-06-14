import { Music2 } from "lucide-react";
import type { Theme } from "@/lib/types";

export function SongPlayer({ nowPlaying }: { nowPlaying: Theme["nowPlaying"] }) {
  if (!nowPlaying.url || !nowPlaying.source) return null;

  return (
    <a
      href={nowPlaying.url}
      className="pixel-button inline-flex max-w-full items-center gap-2 px-3 py-2 text-xs font-black uppercase"
    >
      <Music2 className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <span className="truncate">Now playing on {nowPlaying.source}</span>
    </a>
  );
}

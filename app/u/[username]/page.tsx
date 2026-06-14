import type { Metadata } from "next";
import Link from "next/link";
import { Bio } from "@/components/profile/Bio";
import { Guestbook } from "@/components/profile/Guestbook";
import { SongPlayer } from "@/components/profile/SongPlayer";
import { LogGrid } from "@/components/journal/LogGrid";
import { TypeFilter } from "@/components/journal/TypeFilter";
import { StickerLayer } from "@/components/stickers/StickerLayer";
import { getPublicUser, getUserLogs, recentFirst } from "@/lib/api";
import { themeVariables } from "@/lib/theme";
import type { MediaType } from "@/lib/types";

const mediaTypes: MediaType[] = [
  "anime",
  "movie",
  "book",
  "manga",
  "game",
  "music",
  "podcast"
];

function normalizeType(value: string | string[] | undefined) {
  const type = Array.isArray(value) ? value[0] : value;
  return mediaTypes.includes(type as MediaType) ? (type as MediaType) : undefined;
}

export async function generateMetadata({
  params
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await getPublicUser(params.username);
  return {
    title: `${user.displayName}'s journal`,
    description: user.bio,
    openGraph: {
      title: `${user.displayName}'s Kiroku`,
      description: user.bio,
      images: user.avatarUrl ? [user.avatarUrl] : []
    }
  };
}

export default async function UserJournalPage({
  params,
  searchParams
}: {
  params: { username: string };
  searchParams: { type?: string | string[] };
}) {
  const type = normalizeType(searchParams.type);
  const [user, paginatedLogs] = await Promise.all([
    getPublicUser(params.username),
    getUserLogs({ username: params.username, type, limit: 30 })
  ]);
  const logs = recentFirst(paginatedLogs.logs);

  return (
    <main
      className="pixel-grid relative min-h-screen overflow-hidden px-4 py-4 md:px-6"
      style={themeVariables(user.theme)}
    >
      <StickerLayer stickers={user.theme.stickers} />
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-3 border-2 border-ink bg-paper px-3 py-2">
          <Link href="/" className="text-base font-black uppercase text-ink">
            KIROKU
          </Link>
          <SongPlayer nowPlaying={user.theme.nowPlaying} />
        </header>

        <section className="py-10 md:py-14">
          <Bio user={user} />
        </section>

        <div className="journal-rule mb-6" />

        <section className="grid gap-8">
          <div className="min-w-0">
            <div className="mb-5 grid justify-items-center gap-4 text-center">
              <div>
                <p className="text-xs font-black uppercase text-accent">
                  {paginatedLogs.total} entries
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase text-ink">
                  Shelf
                </h2>
              </div>
              <TypeFilter username={user.username} activeType={type} />
            </div>
            <LogGrid logs={logs} layout={user.theme.layout} />
          </div>

          <aside className="mx-auto w-full max-w-xl">
            <Guestbook
              username={user.username}
              enabled={user.theme.guestbookEnabled}
            />
          </aside>
        </section>
      </div>

      {user.theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: user.theme.customCss }} />
      ) : null}
    </main>
  );
}

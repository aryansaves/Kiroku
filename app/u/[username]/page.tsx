import type { Metadata } from "next";
import Link from "next/link";
import { Bio } from "@/components/profile/Bio";
import { Guestbook } from "@/components/profile/Guestbook";
import { SongPlayer } from "@/components/profile/SongPlayer";
import { LogGrid } from "@/components/journal/LogGrid";
import { TypeFilter } from "@/components/journal/TypeFilter";
import { StickerLayer } from "@/components/stickers/StickerLayer";
import { ThemePaletteSwitcher } from "@/components/theme/ThemePaletteSwitcher";
import { getPublicUser, getUserLogs, recentFirst } from "@/lib/api";
import { themeVariables } from "@/lib/theme";
import type { MediaType } from "@/lib/types";

const mediaTypes: MediaType[] = [
  "anime",
  "movie",
  "series",
  "book",
  "manga",
  "comic"
];

function normalizeType(value: string | string[] | undefined) {
  const type = Array.isArray(value) ? value[0] : value;
  return mediaTypes.includes(type as MediaType) ? (type as MediaType) : undefined;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getPublicUser(username);
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
  params: Promise<{ username: string }>;
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const [{ username }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams
  ]);
  const type = normalizeType(resolvedSearchParams.type);
  const [user, paginatedLogs] = await Promise.all([
    getPublicUser(username),
    getUserLogs({ username, type, limit: 30 })
  ]);
  const logs = recentFirst(paginatedLogs.logs);

  return (
    <main
      className="archive-grid relative min-h-screen overflow-hidden px-4 py-4 md:px-6"
      style={themeVariables(user.theme)}
    >
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <StickerLayer stickers={user.theme.stickers} />
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="archive-topbar flex flex-wrap items-center justify-between gap-3 px-3 py-2">
          <Link href="/" className="text-base font-black uppercase tracking-wider text-ink">
            KIROKU
          </Link>
          <div className="flex items-center gap-3">
            <ThemePaletteSwitcher terse />
            <SongPlayer nowPlaying={user.theme.nowPlaying} />
          </div>
        </header>

        <section className="py-10 md:py-14">
          <Bio user={user} />
        </section>

        <div className="pixel-divider mb-8" />

        <section className="grid gap-8">
          <div className="min-w-0">
            <div className="mb-5 grid justify-items-center gap-4 text-center">
              <div>
                <p className="stamp-label">
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

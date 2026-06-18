import type { Metadata } from "next";
import Link from "next/link";
import { Bio } from "@/components/profile/Bio";
import { Guestbook } from "@/components/profile/Guestbook";
import { SongPlayer } from "@/components/profile/SongPlayer";
import { LogShelf } from "@/components/journal/LogShelf";
import { StickerLayer } from "@/components/stickers/StickerLayer";
import { ThemePaletteSwitcher } from "@/components/theme/ThemePaletteSwitcher";
import { QuickLogBarSection } from "@/components/chat/QuickLogBarSection";
import { getPublicUser, getUserLogs, recentFirst } from "@/lib/api";
import type { MediaType } from "@/lib/types";

const mediaTypes: MediaType[] = ["anime", "movie", "series", "book", "manga", "comic"];

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
    getUserLogs({ username, limit: 60 }) // always fetch all for client-side filtering
  ]);
  const logs = recentFirst(paginatedLogs.logs);

  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 pb-12 md:px-6">
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <StickerLayer stickers={user.theme.stickers} />

      {/* Full-width wrapper */}
      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ── Top bar ── */}
        <header className="archive-topbar mb-4 flex items-center justify-between px-3 py-2">
          <Link href="/" className="text-sm font-black uppercase tracking-wider text-ink">
            KIROKU
          </Link>
          <div className="flex items-center gap-2">
            <ThemePaletteSwitcher terse />
            <SongPlayer nowPlaying={user.theme.nowPlaying} />
          </div>
        </header>

        {/* ── Two-column layout ── */}
        <div className="mt-4 grid gap-5 lg:grid-cols-[320px_1fr]">

          {/* ─── Left sidebar ─── */}
          <div className="flex flex-col gap-4">
            {/* Profile card */}
            <Bio user={user} logs={logs} />

            {/* Guestbook */}
            <Guestbook
              username={user.username}
              enabled={user.theme.guestbookEnabled}
            />
          </div>

          {/* ─── Right: shelf ─── */}
          <div className="archive-panel flex flex-col gap-4 p-4">
            {/* Quick log bar */}
            <div className="relative z-20">
              <QuickLogBarSection />
            </div>

            {/* Shelf header */}
            <div className="flex items-center justify-between border-b-2 border-ink pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">shelf</p>
                <h2 className="text-2xl font-black uppercase leading-none text-ink">
                  {user.displayName}
                </h2>
              </div>
              <span className="stamp-label">{paginatedLogs.total} entries</span>
            </div>

            {/* Client shelf */}
            <LogShelf
              username={user.username}
              initialLogs={logs}
              initialTotal={paginatedLogs.total}
              initialType={type}
            />
          </div>
        </div>
      </div>

      {user.theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: user.theme.customCss }} />
      ) : null}
    </main>
  );
}

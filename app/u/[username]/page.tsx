import type { Metadata } from "next";
import Link from "next/link";
import { Bio } from "@/components/profile/Bio";
import { Guestbook } from "@/components/profile/Guestbook";
import { SongPlayer } from "@/components/profile/SongPlayer";
import { LogShelf } from "@/components/journal/LogShelf";
import { StickerLayer } from "@/components/stickers/StickerLayer";
import { ThemePaletteSwitcher } from "@/components/theme/ThemePaletteSwitcher";
// QuickLogBarSection is a client component that reads localStorage
import { QuickLogBarSection } from "@/components/chat/QuickLogBarSection";
import { getPublicUser, getUserLogs, recentFirst } from "@/lib/api";
import { themeVariables } from "@/lib/theme";
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
    <main
      className="archive-grid relative min-h-screen overflow-hidden px-3 py-3 md:px-4"
      style={themeVariables(user.theme)}
    >
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <StickerLayer stickers={user.theme.stickers} />

      {/* ── Page wrapper — expanded max-width ── */}
      <div className="relative z-10 mx-auto max-w-5xl">

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
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">

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
          <div className="archive-panel p-3">
            {/* Quick log bar — sticky at top of shelf */}
            <div className="relative mb-3 z-20">
              <QuickLogBarSection />
            </div>

            {/* Shelf header */}
            <div className="mb-3 flex items-baseline justify-between border-b-2 border-ink pb-2">
              <div>
                <p className="text-[10px] font-black uppercase text-muted">shelf</p>
                <h2 className="text-lg font-black uppercase leading-none text-ink">
                  {user.displayName}
                </h2>
              </div>
              <span className="stamp-label">{paginatedLogs.total} entries</span>
            </div>

            {/* Client shelf — owns filter state + refresh */}
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

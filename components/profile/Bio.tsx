import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { PublicUser } from "@/lib/types";

export function Bio({ user }: { user: PublicUser }) {
  return (
    <section className="mx-auto grid max-w-3xl justify-items-center gap-4 text-center">
      <div className="h-20 w-20 overflow-hidden border-2 border-ink bg-card shadow-[4px_4px_0_rgb(var(--ink))]">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={96}
            height={96}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-accent">
            {user.displayName.slice(0, 1)}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-black uppercase text-accent">
          /u/{user.username}
        </p>
        <h1 className="mt-2 text-5xl font-black uppercase leading-none text-ink md:text-7xl">
          {user.displayName}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-sm font-bold leading-6 text-ink md:text-base">
          {user.bio}
        </p>
        {user.links.length ? (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {user.links.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                className="pixel-button inline-flex items-center gap-1 px-2 py-1 text-xs font-black uppercase"
              >
                {link.label}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

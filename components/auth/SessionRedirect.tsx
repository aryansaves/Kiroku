"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readSession } from "@/lib/client-auth";

/**
 * Redirects a logged-in user to their profile page.
 * Skipped when NEXT_PUBLIC_ENABLE_DEV_LOGIN=true so local testing works.
 * Add ?noredict=1 to any URL to bypass on any environment.
 */
export function SessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Allow bypassing redirect for local/dev testing
    const params = new URLSearchParams(window.location.search);
    if (params.get("noredirect")) return;
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true") return;

    const session = readSession();
    if (session?.user?.username) {
      router.replace(`/u/${session.user.username}`);
    }
  }, [router]);

  return null;
}

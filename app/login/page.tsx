import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  const authUrl = process.env.NEXT_PUBLIC_TELEGRAM_AUTH_URL ?? "/api/auth/telegram";

  return (
    <main className="pixel-grid grid min-h-screen place-items-center px-5 py-10">
      <section className="pixel-panel w-full max-w-md p-5">
        <Link href="/" className="text-base font-black uppercase text-ink">
          KIROKU
        </Link>
        <h1 className="mt-10 text-4xl font-black uppercase leading-tight text-ink">
          Telegram login
        </h1>
        <p className="mt-4 text-sm font-bold leading-6 text-muted">
          Accounts are created by messaging the bot first. The web login only
          unlocks settings for an existing bot account.
        </p>

        <div className="mt-8 border-2 border-dashed border-ink bg-paper p-4 text-center">
          {botName ? (
            <script
              async
              src="https://telegram.org/js/telegram-widget.js?22"
              data-telegram-login={botName}
              data-size="large"
              data-auth-url={authUrl}
              data-request-access="write"
            />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <MessageCircle className="h-8 w-8 text-accent" aria-hidden="true" />
              <p className="text-sm font-bold text-muted">
                Set NEXT_PUBLIC_TELEGRAM_BOT_NAME to render the Telegram Login
                Widget.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

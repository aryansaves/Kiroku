import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { SessionRedirect } from "@/components/auth/SessionRedirect";

export const metadata: Metadata = {
  title: "Login"
};

export default function LoginPage() {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
  const devLoginEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";
  const googleEnabled = !!(
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"
  );

  return (
    <main className="archive-grid relative min-h-screen px-4 py-4 md:px-6">
      <SessionRedirect />
      <div className="scanlines absolute inset-0" aria-hidden="true" />
      <div className="relative z-10">
        <LoginPanel
          botName={botName}
          devLoginEnabled={devLoginEnabled}
          googleEnabled={googleEnabled}
        />
      </div>
    </main>
  );
}

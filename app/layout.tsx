import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kiroku",
    template: "%s | Kiroku"
  },
  description: "A personal media journal written from Telegram and read on the web.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiroku.com")
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

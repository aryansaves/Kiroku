"use client";

import dynamic from "next/dynamic";

// Dynamically import ChatInput to avoid SSR issues (it reads localStorage)
const ChatInput = dynamic(
  () => import("@/components/chat/ChatInput").then((m) => ({ default: m.ChatInput })),
  { ssr: false }
);

/**
 * Thin client wrapper so the server component settings/page.tsx
 * can import ChatInput without crossing the client boundary.
 */
export function ChatInputSection() {
  return <ChatInput />;
}

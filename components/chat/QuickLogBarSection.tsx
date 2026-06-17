"use client";

import dynamic from "next/dynamic";

const QuickLogBar = dynamic(
  () => import("@/components/chat/QuickLogBar").then((m) => ({ default: m.QuickLogBar })),
  { ssr: false }
);

export function QuickLogBarSection({ onLogged }: { onLogged?: () => void }) {
  return <QuickLogBar onLogged={onLogged} />;
}

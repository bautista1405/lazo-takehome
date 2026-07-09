"use client";

import { useEffect, useState } from "react";
import type { ToastProps } from "../interfaces/components";

const defaultDurationMs = 8000;

export function Toast({
  durationMs = defaultDurationMs,
  message,
  title,
  tone,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), durationMs);

    return () => window.clearTimeout(timeout);
  }, [durationMs]);

  if (!visible) {
    return null;
  }

  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-[color:var(--lazo-green)] bg-[var(--lazo-green-soft)] text-[#151517]";

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-lg border p-4 shadow-[0_18px_44px_rgba(20,20,21,0.14)] ${toneClass}`}
      role="status"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

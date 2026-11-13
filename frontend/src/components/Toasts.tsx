"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface ToastItem {
  id: number;
  kind: "success" | "error";
  message: string;
}

export default function Toasts({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-navy-900 px-4 py-3 text-sm text-white shadow-xl ring-1 ring-white/10"
        >
          {t.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          )}
          <p className="flex-1">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

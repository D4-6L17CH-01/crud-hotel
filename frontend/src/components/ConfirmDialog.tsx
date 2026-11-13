"use client";

import { useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Room } from "@/types/room";

export default function ConfirmDialog({
  room,
  busy,
  onCancel,
  onConfirm,
}: {
  room: Room;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="animate-modal w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2
          id="confirm-title"
          className="mt-4 font-serif text-xl font-semibold text-navy-900"
        >
          Delete room {room.number}?
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          This action cannot be undone. The room will be permanently removed
          from the system.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

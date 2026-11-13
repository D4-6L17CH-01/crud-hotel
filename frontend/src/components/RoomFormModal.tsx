"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { Room, RoomInput } from "@/types/room";
import { ROOM_STATUSES, ROOM_TYPES } from "@/types/room";
import {
  emptyForm,
  toRoomInput,
  validateRoom,
  type RoomFormErrors,
  type RoomFormValues,
} from "@/lib/validation";

function fromRoom(room: Room): RoomFormValues {
  return {
    number: room.number,
    type: room.type,
    pricePerNight: String(room.pricePerNight),
    capacity: String(room.capacity),
    status: room.status,
    description: room.description ?? "",
  };
}

const inputCls = (invalid: boolean) =>
  `mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-navy-900 shadow-sm outline-none transition focus:ring-2 ${
    invalid
      ? "border-rose-400 focus:ring-rose-200"
      : "border-slate-300 focus:border-gold-500 focus:ring-gold-300/50"
  }`;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {children}
      {error && (
        <span className="mt-1 block text-xs font-normal text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function RoomFormModal({
  room,
  onClose,
  onSubmit,
}: {
  /** Room being edited, or null to create a new one. */
  room: Room | null;
  onClose: () => void;
  onSubmit: (input: RoomInput) => Promise<void>;
}) {
  const [values, setValues] = useState<RoomFormValues>(
    room ? fromRoom(room) : emptyForm,
  );
  const [errors, setErrors] = useState<RoomFormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onClose]);

  const set = <K extends keyof RoomFormValues>(k: K, v: RoomFormValues[K]) => {
    setValues((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateRoom(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    try {
      await onSubmit(toRoomInput(values));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-form-title"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="animate-modal flex max-h-[95vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2
            id="room-form-title"
            className="font-serif text-xl font-semibold text-navy-900"
          >
            {room ? `Edit room ${room.number}` : "New room"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <Field label="Room number" error={errors.number}>
            <input
              value={values.number}
              onChange={(e) => set("number", e.target.value)}
              maxLength={20}
              placeholder="e.g. 101"
              className={inputCls(!!errors.number)}
              autoFocus
            />
          </Field>
          <Field label="Type" error={errors.type}>
            <select
              value={values.type}
              onChange={(e) => set("type", e.target.value as RoomFormValues["type"])}
              className={inputCls(!!errors.type)}
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Price per night (USD)" error={errors.pricePerNight}>
            <input
              value={values.pricePerNight}
              onChange={(e) => set("pricePerNight", e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className={inputCls(!!errors.pricePerNight)}
            />
          </Field>
          <Field label="Capacity (guests)" error={errors.capacity}>
            <input
              type="number"
              min={1}
              max={10}
              value={values.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              className={inputCls(!!errors.capacity)}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Status" error={errors.status}>
              <select
                value={values.status}
                onChange={(e) =>
                  set("status", e.target.value as RoomFormValues["status"])
                }
                className={inputCls(!!errors.status)}
              >
                {ROOM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description (optional)" error={errors.description}>
              <textarea
                rows={3}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputCls(!!errors.description)}
                placeholder="Ocean view, king bed, balcony..."
              />
              <span className="mt-1 block text-right text-xs font-normal text-slate-400">
                {values.description.length}/300
              </span>
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2 text-sm font-semibold text-gold-300 shadow hover:bg-navy-800 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {room ? "Save changes" : "Create room"}
          </button>
        </div>
      </form>
    </div>
  );
}

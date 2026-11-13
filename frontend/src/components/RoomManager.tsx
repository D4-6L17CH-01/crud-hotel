"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  Hotel,
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Wrench,
} from "lucide-react";
import { roomsApi } from "@/lib/api";
import type { Room, RoomInput, RoomStatus, RoomType } from "@/types/room";
import { ROOM_STATUSES, ROOM_TYPES } from "@/types/room";
import StatusBadge from "./StatusBadge";
import RoomFormModal from "./RoomFormModal";
import ConfirmDialog from "./ConfirmDialog";
import Toasts, { type ToastItem } from "./Toasts";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full ${tone}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl font-semibold text-navy-900">
        {value}
      </p>
    </div>
  );
}

export default function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<RoomStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RoomType | "all">("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleting, setDeleting] = useState<Room | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((kind: ToastItem["kind"], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRooms(await roomsApi.list());
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const stats = useMemo(
    () => ({
      total: rooms.length,
      available: rooms.filter((r) => r.status === "available").length,
      occupied: rooms.filter((r) => r.status === "occupied").length,
      maintenance: rooms.filter((r) => r.status === "maintenance").length,
    }),
    [rooms],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms
      .filter((r) => statusFilter === "all" || r.status === statusFilter)
      .filter((r) => typeFilter === "all" || r.type === typeFilter)
      .filter(
        (r) =>
          !q ||
          r.number.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) =>
        a.number.localeCompare(b.number, undefined, { numeric: true }),
      );
  }, [rooms, query, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (room: Room) => {
    setEditing(room);
    setFormOpen(true);
  };
  const closeForm = useCallback(() => setFormOpen(false), []);
  const cancelDelete = useCallback(() => setDeleting(null), []);

  const handleSubmit = async (input: RoomInput) => {
    try {
      if (editing) {
        const updated = await roomsApi.update(editing.id, input);
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        notify("success", `Room ${updated.number} updated.`);
      } else {
        const created = await roomsApi.create(input);
        setRooms((prev) => [...prev, created]);
        notify("success", `Room ${created.number} created.`);
      }
      setFormOpen(false);
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Could not save room.");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await roomsApi.remove(deleting.id);
      setRooms((prev) => prev.filter((r) => r.id !== deleting.id));
      notify("success", `Room ${deleting.number} deleted.`);
      setDeleting(null);
    } catch (e) {
      notify("error", e instanceof Error ? e.message : "Could not delete room.");
    } finally {
      setDeleteBusy(false);
    }
  };

  const hasFilters = query !== "" || statusFilter !== "all" || typeFilter !== "all";

  return (
    <div className="min-h-screen">
      <header className="relative overflow-hidden bg-navy-900 text-white">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-navy-700/60 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6">
          <div className="flex items-center gap-2.5 text-gold-400">
            <Hotel className="h-6 w-6" />
            <span className="font-serif text-lg tracking-wide">Grand Hotel</span>
          </div>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-gold-400 uppercase">
                Administration
              </p>
              <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
                Room Management
              </h1>
              <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
                Keep every room in order: track availability, update rates and
                manage maintenance from a single place.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-400"
            >
              <Plus className="h-4 w-4" />
              Add room
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto -mt-14 max-w-6xl px-4 pb-16 sm:px-6">
        <section
          aria-label="Statistics"
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <StatCard
            label="Total rooms"
            value={stats.total}
            tone="bg-navy-900/10 text-navy-800"
            icon={<BedDouble className="h-4 w-4" />}
          />
          <StatCard
            label="Available"
            value={stats.available}
            tone="bg-emerald-50 text-emerald-600"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatCard
            label="Occupied"
            value={stats.occupied}
            tone="bg-rose-50 text-rose-600"
            icon={<KeyRound className="h-4 w-4" />}
          />
          <StatCard
            label="Maintenance"
            value={stats.maintenance}
            tone="bg-amber-50 text-amber-600"
            icon={<Wrench className="h-4 w-4" />}
          />
        </section>

        <section className="mt-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by room number or description"
                aria-label="Search rooms"
                className="w-full rounded-lg border border-slate-300 py-2 pr-3 pl-9 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-300/50"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as RoomType | "all")}
              aria-label="Filter by type"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-300/50"
            >
              <option value="all">All types</option>
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {cap(t)}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as RoomStatus | "all")
              }
              aria-label="Filter by status"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-300/50"
            >
              <option value="all">All statuses</option>
              {ROOM_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {cap(s)}
                </option>
              ))}
            </select>
            <button
              onClick={() => void load()}
              disabled={loading}
              aria-label="Refresh rooms"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-6">
            {loading && rooms.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
                <p className="text-sm">Loading rooms...</p>
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <AlertTriangle className="h-9 w-9 text-rose-500" />
                <p className="font-medium text-navy-900">
                  We could not load the rooms
                </p>
                <p className="text-sm text-slate-500">{loadError}</p>
                <button
                  onClick={() => void load()}
                  className="mt-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-medium text-gold-300 hover:bg-navy-800"
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <BedDouble className="h-10 w-10 text-slate-300" />
                <p className="font-medium text-navy-900">
                  {hasFilters ? "No rooms match your filters" : "No rooms yet"}
                </p>
                <p className="text-sm text-slate-500">
                  {hasFilters
                    ? "Try adjusting the search or filters."
                    : "Add your first room to get started."}
                </p>
                {!hasFilters && (
                  <button
                    onClick={openCreate}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add room
                  </button>
                )}
              </div>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((room) => (
                  <li
                    key={room.id}
                    className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-gold-400 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold tracking-widest text-gold-600 uppercase">
                          {cap(room.type)}
                        </p>
                        <h3 className="font-serif text-2xl font-semibold text-navy-900">
                          Room {room.number}
                        </h3>
                      </div>
                      <StatusBadge status={room.status} />
                    </div>
                    <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-500">
                      {room.description || "No description."}
                    </p>
                    <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-lg font-semibold text-navy-900">
                          {money.format(room.pricePerNight)}
                          <span className="text-xs font-normal text-slate-400">
                            {" "}
                            / night
                          </span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Users className="h-3.5 w-3.5" />
                          Up to {room.capacity} guest
                          {room.capacity === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(room)}
                          aria-label={`Edit room ${room.number}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleting(room)}
                          aria-label={`Delete room ${room.number}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {formOpen && (
        <RoomFormModal
          key={editing?.id ?? "new"}
          room={editing}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
      {deleting && (
        <ConfirmDialog
          room={deleting}
          busy={deleteBusy}
          onCancel={cancelDelete}
          onConfirm={handleDelete}
        />
      )}
      <Toasts
        toasts={toasts}
        onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />
    </div>
  );
}

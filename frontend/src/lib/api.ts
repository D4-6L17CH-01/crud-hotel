import type { Room, RoomInput } from "@/types/room";

const BASE = "/api/rooms";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Postgres numeric columns may arrive as strings; coerce to numbers.
function normalizeRoom(r: Room): Room {
  return {
    ...r,
    pricePerNight: Number(r.pricePerNight),
    capacity: Number(r.capacity),
  };
}

async function request(url: string, init?: RequestInit): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Unable to reach the server. Please try again.", 0);
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      const m = body?.message;
      if (Array.isArray(m)) message = m.join(", ");
      else if (typeof m === "string") message = m;
    } catch {
      // Non-JSON error body; keep the generic message.
    }
    throw new ApiError(message, res.status);
  }
  return res;
}

export const roomsApi = {
  async list(): Promise<Room[]> {
    const res = await request(BASE);
    return ((await res.json()) as Room[]).map(normalizeRoom);
  },
  async get(id: string): Promise<Room> {
    const res = await request(`${BASE}/${id}`);
    return normalizeRoom((await res.json()) as Room);
  },
  async create(input: RoomInput): Promise<Room> {
    const res = await request(BASE, {
      method: "POST",
      body: JSON.stringify(input),
    });
    return normalizeRoom((await res.json()) as Room);
  },
  async update(id: string, input: Partial<RoomInput>): Promise<Room> {
    const res = await request(`${BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return normalizeRoom((await res.json()) as Room);
  },
  async remove(id: string): Promise<void> {
    await request(`${BASE}/${id}`, { method: "DELETE" });
  },
};

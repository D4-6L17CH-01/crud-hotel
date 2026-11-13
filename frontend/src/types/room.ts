export const ROOM_TYPES = ["single", "double", "suite"] as const;
export const ROOM_STATUSES = ["available", "occupied", "maintenance"] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  status: RoomStatus;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RoomInput {
  number: string;
  type: RoomType;
  pricePerNight: number;
  capacity: number;
  status: RoomStatus;
  description?: string;
}

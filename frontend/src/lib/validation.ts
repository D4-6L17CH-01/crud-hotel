import type { RoomInput, RoomStatus, RoomType } from "@/types/room";
import { ROOM_STATUSES, ROOM_TYPES } from "@/types/room";

export interface RoomFormValues {
  number: string;
  type: RoomType;
  pricePerNight: string;
  capacity: string;
  status: RoomStatus;
  description: string;
}

export type RoomFormErrors = Partial<Record<keyof RoomFormValues, string>>;

export const emptyForm: RoomFormValues = {
  number: "",
  type: "single",
  pricePerNight: "",
  capacity: "1",
  status: "available",
  description: "",
};

/** Mirrors the backend contract constraints. */
export function validateRoom(v: RoomFormValues): RoomFormErrors {
  const errors: RoomFormErrors = {};
  const number = v.number.trim();
  if (!number) errors.number = "Room number is required.";
  else if (number.length > 10) errors.number = "Max 10 characters.";

  if (!ROOM_TYPES.includes(v.type)) errors.type = "Select a valid type.";

  const priceText = v.pricePerNight.trim();
  const price = Number(priceText);
  if (priceText === "" || Number.isNaN(price))
    errors.pricePerNight = "Price is required.";
  else if (price <= 0) errors.pricePerNight = "Price must be greater than 0.";
  else if (!/^\d+(\.\d{1,2})?$/.test(priceText))
    errors.pricePerNight = "Use at most 2 decimals.";

  const capText = v.capacity.trim();
  const cap = Number(capText);
  if (capText === "" || !Number.isInteger(cap))
    errors.capacity = "Capacity must be a whole number.";
  else if (cap < 1 || cap > 10) errors.capacity = "Capacity must be 1-10.";

  if (!ROOM_STATUSES.includes(v.status))
    errors.status = "Select a valid status.";

  if (v.description.length > 300) errors.description = "Max 300 characters.";
  return errors;
}

export function toRoomInput(v: RoomFormValues): RoomInput {
  const description = v.description.trim();
  return {
    number: v.number.trim(),
    type: v.type,
    pricePerNight: Math.round(Number(v.pricePerNight) * 100) / 100,
    capacity: Number(v.capacity),
    status: v.status,
    ...(description ? { description } : {}),
  };
}

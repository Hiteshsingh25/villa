import { z } from "zod";

// Shared by the form (client) and the server action.
export const roomKeys = ["suite", "deluxe", "garden", "imperial"] as const;

export const bookingSchema = z.object({
  checkIn: z.iso.date(),
  checkOut: z.iso.date(),
  adults: z.coerce.number().int().min(1).max(6),
  children: z.coerce.number().int().min(0).max(4),
  room: z.enum(roomKeys),
  name: z.string().trim().min(2).max(120),
  email: z.email().max(200),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,20}$/),
  requests: z.string().trim().max(2000),
});

export type BookingRequest = z.infer<typeof bookingSchema>;
export type BookingField = keyof BookingRequest;

// ---- Demo availability -------------------------------------------------
// The original has no booking backend: it derives a stable, date-seeded room
// count so the calendar can show open, limited and sold-out nights. Replace
// `roomsLeft` with a real inventory lookup.
const TOTAL_ROOMS = 12;

const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const hash = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

export function roomsLeft(date: Date) {
  const weekend = date.getDay() === 5 || date.getDay() === 6;
  const highSeason = date.getMonth() >= 5 && date.getMonth() <= 8;
  let left = hash(dayKey(date)) % (TOTAL_ROOMS + 1);
  if (weekend) left = Math.floor(left * 0.55);
  if (highSeason) left = Math.floor(left * 0.7);
  return Math.max(0, Math.min(TOTAL_ROOMS, left));
}

export type Availability = "open" | "limited" | "full";

export function availability(date: Date): Availability {
  const left = roomsLeft(date);
  return left === 0 ? "full" : left <= 3 ? "limited" : "open";
}

export const isFull = (date: Date) => roomsLeft(date) === 0;

/** The nights of a stay: every date from check-in up to, not including, check-out. */
export function nightsBetween(from: Date, to: Date) {
  const nights: Date[] = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cursor < end) {
    nights.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
}

export const toIsoDate = dayKey;

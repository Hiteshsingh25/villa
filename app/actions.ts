"use server";

import { bookingSchema, type BookingField } from "@/lib/booking";

export type BookingResult = { ok: true } | { ok: false; fields: BookingField[] };

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

/**
 * Receives a reservation request. The original site has no backend; this one
 * validates again on the server and, when RESEND_API_KEY and BOOKING_TO are
 * set, emails the request through Resend. Without them it only logs, so the
 * form still works in development.
 */
export async function requestReservation(input: unknown): Promise<BookingResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path[0] as BookingField))];
    return { ok: false, fields };
  }
  const booking = parsed.data;
  if (booking.checkOut <= booking.checkIn) return { ok: false, fields: ["checkOut"] };

  const { RESEND_API_KEY, BOOKING_TO, BOOKING_FROM } = process.env;
  if (!RESEND_API_KEY || !BOOKING_TO) {
    console.info("[booking] reservation request (no mail transport configured)", booking);
    return { ok: true };
  }

  const rows = Object.entries(booking)
    .map(([key, value]) => `<tr><th align="left">${key}</th><td>${escapeHtml(String(value))}</td></tr>`)
    .join("");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: BOOKING_FROM || "Villa Aurelia <onboarding@resend.dev>",
      to: BOOKING_TO.split(",").map((address) => address.trim()),
      reply_to: booking.email,
      subject: `Reservation request — ${booking.name} (${booking.checkIn} → ${booking.checkOut})`,
      html: `<table cellpadding="6">${rows}</table>`,
    }),
  });
  if (!response.ok) {
    console.error("[booking] Resend rejected the request", response.status, await response.text());
    return { ok: false, fields: [] };
  }
  return { ok: true };
}

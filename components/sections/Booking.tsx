"use client";

import { format } from "date-fns";
import { enUS, tr as trLocale } from "date-fns/locale";
import { AlertCircle, CalendarDays, Check, Clock } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { toast } from "sonner";
import { requestReservation } from "@/app/actions";
import { availability, bookingSchema, isFull, nightsBetween, roomsLeft, toIsoDate } from "@/lib/booking";
import { rooms } from "@/lib/content";
import type { Key } from "@/lib/i18n/tr";
import { useSite } from "../SiteProvider";
import { SplitHeading } from "../Split";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const labelClass = "aurelia-display text-[11px] font-bold uppercase tracking-[0.35em] text-[#8a6b3f]";
const fieldClass =
  "aurelia-body w-full border-b border-[#2a2118]/30 bg-transparent pb-3 pt-1 text-[#2a2118] transition-colors placeholder:text-[#2a2118]/50 focus:border-[#9e7c4f] focus:outline-none aria-[invalid=true]:border-[#a3563f]";
const triggerClass =
  "aurelia-body h-auto w-full rounded-none border-0 border-b border-[#2a2118]/30 bg-transparent px-0 pb-3 pt-1 text-[#2a2118] focus-visible:border-[#9e7c4f] aria-[invalid=true]:border-[#a3563f] [&>svg]:text-[#9e7c4f]";
const menuClass = "rounded-sm border border-[#2a2118]/10 bg-white text-[#2a2118]";
const itemClass = "text-[15px] focus:bg-[#9e7c4f]/10";
const fieldStyle = { fontSize: 15, fontWeight: 400 } as const;
const statusColor = { open: "#7d9a76", limited: "#c08a3e", full: "#a3563f" } as const;

type ErrorField = "dates" | "room" | "name" | "email" | "phone";
const emptyForm = { adults: "2", children: "0", room: "", name: "", email: "", phone: "", requests: "" };

export function Booking() {
  const { t, lang, bookingRoom, setBookingRoom } = useSite();
  const locale = lang === "tr" ? trLocale : enUS;
  const [range, setRange] = useState<DateRange | undefined>();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<ErrorField, Key>>>({});
  const [twoMonths, setTwoMonths] = useState(false);
  const [pending, startTransition] = useTransition();

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setTwoMonths(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // A room picked in the rooms slider arrives here preselected.
  useEffect(() => {
    if (!bookingRoom) return;
    setForm((current) => ({ ...current, room: bookingRoom }));
    setErrors((current) => ({ ...current, room: undefined }));
    setBookingRoom("");
  }, [bookingRoom, setBookingRoom]);

  const nights = useMemo(() => (range?.from && range?.to ? nightsBetween(range.from, range.to) : []), [range]);
  const fullNights = nights.filter(isFull);
  const limitedNights = nights.filter((night) => availability(night) === "limited");
  const fewest = nights.length ? Math.min(...nights.map(roomsLeft)) : null;

  const set = (field: keyof typeof emptyForm) => (value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      checkIn: range?.from ? toIsoDate(range.from) : "",
      checkOut: range?.to ? toIsoDate(range.to) : "",
    };
    const parsed = bookingSchema.safeParse(payload);
    const next: Partial<Record<ErrorField, Key>> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "checkIn" || field === "checkOut") next.dates = "book.err.dates";
        else if (field === "room") next.room = "book.err.room";
        else if (field === "name") next.name = "book.err.name";
        else if (field === "email") next.email = "book.err.email";
        else if (field === "phone") next.phone = "book.err.phone";
      }
    }
    if (!next.dates && (nights.length === 0 || fullNights.length > 0)) {
      next.dates = nights.length === 0 ? "book.err.dates" : "book.err.full";
    }
    setErrors(next);
    const first = (["dates", "room", "name", "email", "phone"] as const).find((field) => next[field]);
    if (first || !parsed.success) {
      if (first) document.getElementById(`book-${first}`)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await requestReservation(parsed.data).catch(() => null);
      if (result?.ok) {
        toast.success(t("book.success"), { description: t("book.successBody") });
        setForm(emptyForm);
        setRange(undefined);
      } else {
        toast.error(t("book.fail"));
      }
    });
  };

  const error = (field: ErrorField) =>
    errors[field] ? (
      <p id={`book-${field}-error`} role="alert" className="aurelia-body text-[12px] text-[#a3563f]">
        {t(errors[field])}
      </p>
    ) : null;
  const invalid = (field: ErrorField) => ({
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? `book-${field}-error` : undefined,
  });

  return (
    <section id="book" className="relative scroll-mt-24 overflow-hidden bg-[#f8f7f4] py-20 pt-10 text-[#2a2118] md:py-24 md:pt-12">
      <span className="au-filament" aria-hidden />
      <div className="mx-auto max-w-[1200px] px-6 md:px-10">
        <div className="mb-16 text-center md:mb-20">
          <div
            className="aurelia-display flex items-center justify-center gap-3 text-[#9e7c4f]"
            style={{ fontSize: 12, letterSpacing: "0.45em", fontWeight: 600 }}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-[#9e7c4f]" />
            {t("book.eyebrow")}
          </div>
          <SplitHeading className="aurelia-serif mt-6 leading-[1.02]" style={{ fontSize: "clamp(34px, 4.6vw, 76px)", fontWeight: 500 }}>
            {(words) => (
              <>
                {words(t("book.title1"))}
                <span className="aurelia-garamond-italic block font-normal" style={{ fontSize: "clamp(30px, 4vw, 68px)" }}>
                  {words(t("book.title2"))}
                </span>
              </>
            )}
          </SplitHeading>
          <p
            className="aurelia-body mx-auto mt-7 text-[#6b5638]"
            style={{ fontSize: 16, lineHeight: 1.85, fontWeight: 400, maxWidth: "52ch" }}
          >
            {t("book.intro")}
          </p>
        </div>

        <form onSubmit={submit} noValidate data-no-magnet className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="book-dates" className={labelClass}>
              {t("book.dates")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  id="book-dates"
                  type="button"
                  {...invalid("dates")}
                  className={`${fieldClass} flex items-center justify-between text-left hover:border-[#9e7c4f]`}
                  style={fieldStyle}
                >
                  <span className={range?.from ? "" : "text-[#2a2118]/55"}>
                    {range?.from
                      ? `${format(range.from, "d MMM yyyy", { locale })} — ${range.to ? format(range.to, "d MMM yyyy", { locale }) : "…"}`
                      : t("book.datesPh")}
                  </span>
                  <CalendarDays size={16} color="#9e7c4f" aria-hidden />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto rounded-sm border border-[#2a2118]/10 bg-white p-0">
                <DayPicker
                  mode="range"
                  numberOfMonths={twoMonths ? 2 : 1}
                  selected={range}
                  onSelect={(next) => {
                    setRange(next);
                    setErrors((current) => ({ ...current, dates: undefined }));
                  }}
                  locale={locale}
                  defaultMonth={range?.from ?? today}
                  startMonth={today}
                  disabled={(date) => date < today || isFull(date)}
                  modifiers={{ limited: (date) => date >= today && availability(date) === "limited" }}
                  modifiersClassNames={{ limited: "au-day-limited" }}
                  autoFocus
                  className="au-calendar p-3"
                />
                <div className="aurelia-body flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-4 pt-1 text-[11px] text-[#2a2118]/75">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#7d9a76]" />
                    {t("book.legendOpen")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#c08a3e]" />
                    {t("book.legendLimited")}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#2a2118]/25" />
                    {t("book.legendFull")}
                  </span>
                </div>
              </PopoverContent>
            </Popover>
            {error("dates")}

            {nights.length > 0 && (
              <div className="mt-5 border border-[#2a2118]/10 bg-white/70 px-5 py-4" data-reveal-skip>
                <div className="flex items-start gap-3">
                  {fullNights.length > 0 ? (
                    <AlertCircle size={16} className="mt-[3px] shrink-0 text-[#a3563f]" aria-hidden />
                  ) : limitedNights.length > 0 ? (
                    <Clock size={16} className="mt-[3px] shrink-0 text-[#c08a3e]" aria-hidden />
                  ) : (
                    <Check size={16} className="mt-[3px] shrink-0 text-[#7d9a76]" aria-hidden />
                  )}
                  <div className="aurelia-body text-[14px] leading-[1.7] text-[#2a2118]/90" style={{ fontWeight: 400 }}>
                    <span className="block">
                      {nights.length} {t("book.nights")}
                      {range?.from && range.to
                        ? ` · ${format(range.from, "d MMM", { locale })} – ${format(range.to, "d MMM", { locale })}`
                        : ""}
                    </span>
                    <span className="mt-1 block">
                      {fullNights.length > 0
                        ? t("book.availFull")
                        : `${t(limitedNights.length > 0 ? "book.availLimited" : "book.availOpen")} ${fewest} ${t("book.roomsLeft")}`}
                    </span>
                  </div>
                </div>
                <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                  {nights.slice(0, 10).map((night) => {
                    const status = availability(night);
                    return (
                      <li
                        key={night.toISOString()}
                        className="aurelia-body flex items-center justify-between border-b border-[#2a2118]/8 py-1.5 text-[13px] text-[#2a2118]/85"
                        style={{ fontWeight: 400 }}
                      >
                        <span>{format(night, "d MMM EEE", { locale })}</span>
                        <span
                          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em]"
                          style={{ color: statusColor[status] }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusColor[status] }} />
                          {status === "full" ? t("book.legendFull") : `${roomsLeft(night)} ${t("book.roomsShort")}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                {nights.length > 10 && (
                  <p className="aurelia-body mt-2 text-[12px] text-[#2a2118]/45">+{nights.length - 10}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="book-adults" className={labelClass}>
              {t("book.adults")}
            </label>
            <Select value={form.adults} onValueChange={set("adults")}>
              <SelectTrigger id="book-adults" className={triggerClass} style={fieldStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={menuClass}>
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <SelectItem key={count} value={String(count)} className={itemClass}>
                    {String(count)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="book-children" className={labelClass}>
              {t("book.children")}
            </label>
            <Select value={form.children} onValueChange={set("children")}>
              <SelectTrigger id="book-children" className={triggerClass} style={fieldStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={menuClass}>
                {[0, 1, 2, 3, 4].map((count) => (
                  <SelectItem key={count} value={String(count)} className={itemClass}>
                    {String(count)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="book-room" className={labelClass}>
              {t("book.roomPref")}
            </label>
            <Select value={form.room} onValueChange={set("room")}>
              <SelectTrigger id="book-room" className={triggerClass} style={fieldStyle} {...invalid("room")}>
                <SelectValue placeholder={t("book.selectRoom")} />
              </SelectTrigger>
              <SelectContent className={menuClass}>
                {rooms.map((room) => (
                  <SelectItem key={room.key} value={room.key} className={itemClass}>
                    {t(room.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error("room")}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="book-name" className={labelClass}>
              {t("book.name")}
            </label>
            <input
              id="book-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(event) => set("name")(event.target.value)}
              placeholder={t("book.namePh")}
              className={fieldClass}
              style={fieldStyle}
              {...invalid("name")}
            />
            {error("name")}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="book-email" className={labelClass}>
              {t("book.email")}
            </label>
            <input
              id="book-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => set("email")(event.target.value)}
              placeholder="your@email.com"
              className={fieldClass}
              style={fieldStyle}
              {...invalid("email")}
            />
            {error("email")}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="book-phone" className={labelClass}>
              {t("book.phone")}
            </label>
            <input
              id="book-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => set("phone")(event.target.value)}
              placeholder="+90 5XX XXX XXXX"
              className={fieldClass}
              style={fieldStyle}
              {...invalid("phone")}
            />
            {error("phone")}
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label htmlFor="book-requests" className={labelClass}>
              {t("book.requests")}
            </label>
            <textarea
              id="book-requests"
              value={form.requests}
              onChange={(event) => set("requests")(event.target.value)}
              placeholder={t("book.requestsPh")}
              rows={3}
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
            />
          </div>

          <div className="mt-4 flex justify-center md:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="aurelia-display border border-[#9e7c4f] px-12 py-4 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#9e7c4f] transition-all duration-500 hover:bg-[#9e7c4f] hover:text-white disabled:opacity-60"
            >
              {pending ? t("book.sending") : t("book.submit")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

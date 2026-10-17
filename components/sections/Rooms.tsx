"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { rooms } from "@/lib/content";
import { scrollToTarget } from "@/lib/scroll";
import { upper, useSite } from "../SiteProvider";
import { SplitHeading } from "../Split";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const glass = "blur(14px) saturate(140%)";

export function Rooms() {
  const { t, lang, isWinter, setBookingRoom } = useSite();
  const [roomIndex, setRoomIndex] = useState(0);
  const [slide, setSlide] = useState(0);
  const [chipsOpen, setChipsOpen] = useState(false);
  const [hovering, setHovering] = useState(false); // pointer over the image area
  const [paused, setPaused] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const room = rooms[roomIndex];
  const count = room.gallery.length;

  useEffect(() => setSlide(0), [roomIndex]);

  // Auto-advance, held while the pointer or keyboard focus is inside.
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setSlide((i) => (i + 1) % count), 3500);
    return () => window.clearInterval(timer);
  }, [count, roomIndex, paused]);

  const next = () => setSlide((i) => (i + 1) % count);
  const prev = () => setSlide((i) => (i - 1 + count) % count);

  const book = () => {
    setBookingRoom(room.key);
    scrollToTarget("#book");
  };

  // Controls sit above the clickable image: they keep the normal cursor and
  // must not trigger the booking jump.
  const control = {
    onMouseEnter: () => setHovering(false),
    onMouseMove: (event: React.MouseEvent) => {
      event.stopPropagation();
      setHovering(false);
    },
    onClick: (event: React.MouseEvent) => event.stopPropagation(),
  };

  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const target = (roomIndex + step + rooms.length) % rooms.length;
    setRoomIndex(target);
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus();
  };

  return (
    <section id="stay" className="relative w-full bg-night text-bone">
      <span className="au-filament z-30" aria-hidden />
      <div
        ref={stage}
        onMouseEnter={() => {
          setHovering(true);
          setPaused(true);
        }}
        onMouseLeave={() => {
          setHovering(false);
          setPaused(false);
        }}
        onMouseMove={(event) => {
          const rect = stage.current?.getBoundingClientRect();
          if (!rect) return;
          setHovering(true);
          setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top });
        }}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={(event) => (touchStart.current = event.touches[0].clientX)}
        onTouchEnd={(event) => {
          if (touchStart.current === null) return;
          const dx = event.changedTouches[0].clientX - touchStart.current;
          touchStart.current = null;
          if (Math.abs(dx) > 48) (dx < 0 ? next : prev)();
        }}
        onClick={book}
        className="relative h-[100svh] min-h-[680px] w-full overflow-hidden"
        style={{ cursor: hovering ? "none" : "auto" }}
      >
        {room.gallery.map((image, i) => (
          <Image
            key={`${room.key}-${i}`}
            src={image.src}
            alt={i === slide ? `${t(room.labelKey)} — ${t("rooms.image")} ${i + 1}` : ""}
            fill
            sizes="100vw"
            priority={false}
            data-standin={image.standIn || isWinter ? "" : undefined}
            className="object-cover"
            style={{
              opacity: i === slide ? 1 : 0,
              transform: i === slide ? "scale(1.02)" : "scale(1.08)",
              transition: "opacity 1100ms ease, transform 6000ms ease",
            }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/55" />

        <div
          className="aurelia-display absolute left-6 top-[14%] z-20 hidden items-center gap-3 text-[11px] font-semibold text-bone md:left-12 md:flex"
          style={{ letterSpacing: "0.45em" }}
        >
          <span className="block h-1.5 w-1.5 rounded-full bg-dot-bright" />
          {t("rooms.eyebrow")}
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[18%] z-20 w-full max-w-[1100px] -translate-x-1/2 px-6 text-center">
          <SplitHeading
            key={`${room.key}-title`}
            className="aurelia-serif leading-[1.02] text-bone"
            style={{
              fontSize: "clamp(34px, 4.6vw, 76px)",
              fontWeight: 500,
              textShadow: "0 4px 26px rgba(0,0,0,0.55)",
              animation: "auFadeUp 800ms cubic-bezier(.16,1,.3,1) both",
            }}
          >
            {(words) => (
              <>
                {words(t(room.titleKey))}
                <span className="aurelia-garamond-italic block font-normal" style={{ fontSize: "clamp(30px, 4vw, 68px)" }}>
                  {words(t(room.subtitleKey))}
                </span>
              </>
            )}
          </SplitHeading>
        </div>

        {/* Room picker: a Select on mobile, tabs from md up. */}
        <div
          className="absolute left-1/2 top-[34%] z-20 w-[min(320px,calc(100%-3rem))] -translate-x-1/2 md:hidden"
          style={{ cursor: "auto" }}
          {...control}
        >
          <Select value={String(roomIndex)} onValueChange={(value) => setRoomIndex(Number(value))}>
            <SelectTrigger
              aria-label={t("rooms.selectRoom")}
              className="aurelia-display h-12 w-full rounded-full border border-bone/30 bg-[rgba(20,17,14,0.45)] text-bone backdrop-blur-[14px] focus-visible:ring-1 focus-visible:ring-bone/40"
              style={{ fontSize: 13, letterSpacing: "0.25em", fontWeight: 600, padding: "0 22px" }}
            >
              <SelectValue placeholder={t("rooms.selectRoom")} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-bone/20 bg-[rgba(20,17,14,0.92)] text-bone backdrop-blur-[18px]">
              {rooms.map((item, i) => (
                <SelectItem
                  key={item.key}
                  value={String(i)}
                  className="aurelia-display rounded-lg text-bone/90 focus:bg-bone/15 focus:text-bone"
                  style={{ fontSize: 13, letterSpacing: "0.2em", fontWeight: 600 }}
                >
                  {upper(t(item.labelKey), lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div
          role="tablist"
          aria-label={t("rooms.eyebrow")}
          onKeyDown={onTabKey}
          className="absolute left-1/2 top-[34%] z-20 hidden -translate-x-1/2 flex-wrap justify-center gap-2 px-6 md:top-[36%] md:flex md:w-max md:max-w-full md:gap-3"
          style={{ cursor: "auto" }}
          {...control}
        >
          {rooms.map((item, i) => {
            const active = i === roomIndex;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`room-tab-${item.key}`}
                aria-selected={active}
                aria-controls="room-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setRoomIndex(i)}
                className="aurelia-display transition-all duration-300"
                style={{
                  fontSize: 14,
                  letterSpacing: "0.28em",
                  padding: "12px 26px",
                  borderRadius: 999,
                  background: active ? "rgba(245,240,228,0.92)" : "rgba(20,17,14,0.35)",
                  color: active ? "#1a1612" : "#f5f0e4",
                  border: `1px solid ${active ? "rgba(245,240,228,0.95)" : "rgba(245,240,228,0.3)"}`,
                  backdropFilter: glass,
                  WebkitBackdropFilter: glass,
                  fontWeight: 600,
                }}
              >
                {upper(t(item.labelKey), lang)}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={t("rooms.prevImage")}
          className="group absolute left-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-3 text-bone/85 transition hover:text-bone md:left-8"
          {...control}
          onClick={(event) => {
            event.stopPropagation();
            prev();
          }}
        >
          <span className="aurelia-display hidden text-[10px] md:inline" style={{ letterSpacing: "0.35em" }}>
            {t("rooms.prev")}
          </span>
          <ChevronLeft size={28} strokeWidth={1} aria-hidden />
          <span className="hidden h-px w-16 bg-bone/40 transition-all duration-500 group-hover:w-24 group-hover:bg-bone md:block" />
        </button>
        <button
          type="button"
          aria-label={t("rooms.nextImage")}
          className="group absolute right-4 top-1/2 z-20 flex -translate-y-1/2 items-center gap-3 text-bone/85 transition hover:text-bone md:right-8"
          {...control}
          onClick={(event) => {
            event.stopPropagation();
            next();
          }}
        >
          <span className="hidden h-px w-16 bg-bone/40 transition-all duration-500 group-hover:w-24 group-hover:bg-bone md:block" />
          <ChevronRight size={28} strokeWidth={1} aria-hidden />
          <span className="aurelia-display hidden text-[10px] md:inline" style={{ letterSpacing: "0.35em" }}>
            {t("rooms.next")}
          </span>
        </button>

        <div
          key={`${room.key}-card`}
          id="room-panel"
          role="tabpanel"
          aria-labelledby={`room-tab-${room.key}`}
          className="absolute bottom-10 left-4 z-20 w-[min(420px,calc(100%-2rem))] p-5 md:bottom-16 md:left-12 md:p-7"
          style={{
            background: "rgba(20,17,14,0.32)",
            backdropFilter: "blur(22px) saturate(140%)",
            WebkitBackdropFilter: "blur(22px) saturate(140%)",
            border: "1px solid rgba(245,240,228,0.18)",
            borderRadius: 18,
            color: "#f5f0e4",
            animation: "auFadeUp 700ms cubic-bezier(.16,1,.3,1) both",
          }}
        >
          <h3 className="aurelia-serif text-[22px] md:text-[28px]" style={{ fontWeight: 500, letterSpacing: "0.01em" }}>
            {t(room.labelKey)}
          </h3>
          <div className="aurelia-body mt-1.5 text-xs text-bone/85 md:mt-2 md:text-[13px]" style={{ lineHeight: 1.7 }}>
            {t("rooms.sleeping")} — {room.sleep}
            <br />
            {t("rooms.bathroom")} — {room.bath}
          </div>
          <div
            className="aurelia-display mt-4 hidden text-bone/70 md:block"
            style={{ fontSize: 10, letterSpacing: "0.32em", fontWeight: 600 }}
          >
            {t("rooms.included")}
          </div>
          <div className="mt-3 hidden flex-wrap gap-1.5 md:flex">
            {room.included.map((amenity) => (
              <span
                key={amenity}
                className="aurelia-body text-sm"
                style={{
                  padding: "7px 13px",
                  borderRadius: 999,
                  background: "rgba(245,240,228,0.12)",
                  border: "1px solid rgba(245,240,228,0.2)",
                }}
              >
                {t(amenity)}
              </span>
            ))}
          </div>
          <button
            type="button"
            aria-expanded={chipsOpen}
            onClick={(event) => {
              event.stopPropagation();
              setChipsOpen((open) => !open);
            }}
            className="aurelia-display mt-3 flex items-center gap-2 text-bone/80 md:hidden"
            style={{ fontSize: 10, letterSpacing: "0.28em", fontWeight: 600 }}
          >
            {t("rooms.included")}
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className={`transition-transform duration-300 ${chipsOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 md:hidden ${chipsOpen ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="flex flex-wrap gap-1.5">
              {room.included.map((amenity) => (
                <span
                  key={amenity}
                  className="aurelia-body text-xs"
                  style={{
                    padding: "5px 10px",
                    borderRadius: 999,
                    background: "rgba(245,240,228,0.12)",
                    border: "1px solid rgba(245,240,228,0.2)",
                  }}
                >
                  {t(amenity)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="aurelia-serif absolute bottom-14 right-12 z-20 hidden text-bone/85 md:block"
          style={{ fontSize: 42, fontWeight: 400, textShadow: "0 4px 22px rgba(0,0,0,0.55)" }}
          aria-hidden
        >
          0{slide + 1}
          <span className="text-bone/45">/0{count}</span>
        </div>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2" {...control}>
          {room.gallery.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${t("rooms.image")} ${i + 1}`}
              aria-current={i === slide}
              onClick={() => setSlide(i)}
              className="relative h-[2px] rounded-full transition-all before:absolute before:-inset-y-3 before:inset-x-0"
              style={{ width: i === slide ? 56 : 22, background: i === slide ? "#f5f0e4" : "rgba(245,240,228,0.35)" }}
            />
          ))}
        </div>

        {/* The "book a room" label that rides the cursor over the image. */}
        <div
          aria-hidden
          className="aurelia-garamond-italic pointer-events-none absolute z-30 hidden select-none text-bone md:block"
          style={{
            left: pointer.x,
            top: pointer.y,
            transform: `translate(-50%, -50%) scale(${hovering ? 1 : 0.6})`,
            opacity: hovering ? 1 : 0,
            transition: "opacity 250ms ease, transform 320ms cubic-bezier(.16,1,.3,1)",
            fontSize: 30,
            textShadow: "0 4px 22px rgba(0,0,0,0.7)",
            whiteSpace: "nowrap",
            padding: "16px 28px",
            borderRadius: 999,
            background: "rgba(20,17,14,0.32)",
            backdropFilter: glass,
            WebkitBackdropFilter: glass,
            border: "1px solid rgba(245,240,228,0.35)",
            letterSpacing: "0.02em",
          }}
        >
          {t("rooms.bookARoom")}
        </div>

        {/* Keyboard and touch route to the same booking jump. */}
        <button
          type="button"
          className="sr-only"
          onClick={(event) => {
            event.stopPropagation();
            book();
          }}
        >
          {t("rooms.bookARoom")} — {t(room.labelKey)}
        </button>
      </div>
    </section>
  );
}

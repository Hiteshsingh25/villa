"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { media, venues } from "@/lib/content";
import type { Key } from "@/lib/i18n/tr";
import { useSite } from "../SiteProvider";

export function Dine() {
  const { t, season } = useSite();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % venues.length), 4000);
    return () => window.clearInterval(timer);
  }, [paused]);

  // The chef clip loads and plays only while it is on screen.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const venue = venues[index];
  const copy = (part: "eyebrow" | "body") => t(`dine.${season}.${venue.key}.${part}` as Key);

  return (
    <section id="dine" className="relative flex min-h-[100svh] flex-col lg:flex-row">
      <span className="au-filament z-10" aria-hidden />
      <div className="relative h-[55vh] overflow-hidden lg:h-auto lg:w-1/2">
        <video
          ref={video}
          src={media.dineVideo.src}
          poster={media.dineVideo.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={t("dine.videoLabel")}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div
        className="flex flex-col items-center justify-center bg-panel px-8 py-20 text-center md:px-16 lg:w-1/2 lg:py-24"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div aria-live="polite" className="flex flex-col items-center">
          <div
            key={`eb-${index}`}
            className="aurelia-display aurelia-fade text-white/60"
            style={{ fontSize: 11, letterSpacing: "0.45em", fontWeight: 600 }}
          >
            {copy("eyebrow")}
          </div>
          <h2
            key={`tt-${index}`}
            className="aurelia-serif aurelia-fade mt-5 leading-[1.02] text-white"
            style={{ fontSize: "clamp(34px, 4.6vw, 76px)", fontWeight: 500 }}
          >
            {t(venue.titleKey)}
          </h2>
        </div>

        <div className="relative mt-10 aspect-[3/4] w-[220px] overflow-hidden md:w-[280px]">
          {venues.map((item, i) => (
            <Image
              key={item.key}
              src={item.image}
              alt={i === index ? t(item.titleKey) : ""}
              fill
              sizes="280px"
              data-standin={season === "winter" ? "" : undefined}
              className="object-cover"
              style={{ opacity: i === index ? 1 : 0, transition: "opacity 900ms cubic-bezier(.16,1,.3,1)" }}
            />
          ))}
        </div>

        <p
          key={`bd-${index}`}
          className="aurelia-body aurelia-fade mx-auto mt-10 text-white/80"
          style={{ fontSize: 16, lineHeight: 1.85, fontWeight: 300, maxWidth: "52ch" }}
        >
          {copy("body")}
        </p>

        <div className="mt-8 flex items-center gap-2">
          {venues.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${t("dine.venue")} ${i + 1}: ${t(item.titleKey)}`}
              aria-current={i === index}
              className="relative rounded-full transition-all duration-500 before:absolute before:-inset-3"
              style={{ width: i === index ? 28 : 8, height: 6, background: i === index ? "#fff" : "rgba(255,255,255,0.25)" }}
            />
          ))}
        </div>

        <a
          href="#book"
          className="aurelia-display mt-10 text-white transition-colors hover:text-white/70"
          style={{ fontSize: 11, letterSpacing: "0.35em", fontWeight: 600, borderBottom: "1px solid currentColor", paddingBottom: 4 }}
        >
          {t("dine.discover")}
        </a>
      </div>
    </section>
  );
}

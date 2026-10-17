"use client";

import { Snowflake, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/content";
import { prefersReducedMotion, scrollToTarget } from "@/lib/scroll";
import { Crest } from "../Crest";
import { useSite, type Season } from "../SiteProvider";
import { SplitChars } from "../Split";

const TITLE = "La\u00a0\u00a0dolce vita";

function HeroVideo({ season, active, settled }: { season: Season; active: boolean; settled: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { src, mobile, poster } = media.hero[season];

  // Only the visible season plays, and only while the hero is on screen.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!active) {
      const stop = window.setTimeout(() => video.pause(), 900);
      return () => window.clearTimeout(stop);
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, [active]);

  return (
    <video
      ref={ref}
      muted
      loop
      playsInline
      autoPlay={active}
      preload={active ? "auto" : "metadata"}
      poster={poster}
      aria-hidden
      data-reveal-skip
      className="absolute inset-0 h-full w-full object-cover"
      style={{
        transform: settled ? "scale(1)" : "scale(1.12)",
        transition: "transform 4.5s cubic-bezier(.16,1,.3,1), opacity 900ms ease",
        opacity: active ? 1 : 0,
      }}
    >
      <source src={mobile} type="video/mp4" media="(max-width: 767px)" />
      <source src={src} type="video/mp4" />
    </video>
  );
}

export function Hero() {
  const { t, isWinter, setSeason } = useSite();
  const [opened, setOpened] = useState(false); // curtain halves apart
  const [settled, setSettled] = useState(false); // video, birds and title in
  const [written, setWritten] = useState(false); // title characters

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOpened(true);
      setSettled(true);
      setWritten(true);
      return;
    }
    const timers = [
      window.setTimeout(() => setOpened(true), 350),
      window.setTimeout(() => setSettled(true), 1600),
      window.setTimeout(() => setWritten(true), 2300),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const pick = (season: Season) => () => setSeason(season);
  // Arrow keys move between the two seasons, as in a native radio group.
  const onSeasonKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    setSeason(isWinter ? "summer" : "winter");
    const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons[isWinter ? 0 : 1]?.focus();
  };

  const tooltip =
    "pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-[200px] -translate-x-1/2 translate-y-1 rounded-md px-3 py-1.5 text-[10px] font-medium leading-snug opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100";
  const pill =
    "aurelia-display group relative flex items-center gap-2 rounded-full px-5 py-2 text-[11px] font-semibold uppercase transition-all duration-500";

  return (
    <section id="top" className="relative h-screen w-full overflow-hidden">
      <HeroVideo season="summer" active={!isWinter} settled={settled} />
      <HeroVideo season="winter" active={isWinter} settled={settled} />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-black/5 to-black/35" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.35) 100%)" }}
      />
      <div className="pointer-events-none absolute inset-6 border border-bone/15 md:inset-10" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center" data-reveal-skip>
        <div className="aurelia-birds-wrap pointer-events-none -mb-4 select-none md:-mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.birds}
            alt=""
            width={700}
            height={700}
            className="aurelia-birds h-auto w-[140px] md:w-[190px] lg:w-[220px]"
            style={{ opacity: settled ? 1 : 0, transition: "opacity 1.6s ease 500ms" }}
          />
        </div>

        <h1
          aria-label="La dolce vita"
          className="aurelia-script leading-[0.95] text-bone"
          style={{
            fontSize: "clamp(72px, 13vw, 200px)",
            textShadow: "0 6px 30px rgba(0,0,0,0.55)",
            opacity: settled ? 1 : 0,
            transform: settled ? "translateY(0)" : "translateY(40px)",
            transition: "opacity 2s ease 700ms, transform 2.2s cubic-bezier(.16,1,.3,1) 700ms",
          }}
        >
          <SplitChars text={TITLE} shown={written} />
        </h1>

        <div
          className="mt-10 flex flex-col items-center gap-4"
          style={{
            opacity: settled ? 1 : 0,
            transform: settled ? "translateY(0)" : "translateY(14px)",
            transition: "opacity 1.4s ease 1400ms, transform 1.4s ease 1400ms",
          }}
        >
          <span
            id="season-label"
            className="aurelia-display text-[12px] font-bold uppercase text-bone md:text-[14px]"
            style={{ letterSpacing: "0.32em", textShadow: "0 2px 14px rgba(0,0,0,0.55)" }}
          >
            {t("hero.seasonLabel")}
          </span>
          <div
            role="radiogroup"
            aria-labelledby="season-label"
            onKeyDown={onSeasonKey}
            className="inline-flex items-center gap-1 rounded-full border border-bone/30 bg-black/25 p-1 backdrop-blur-md"
          >
            <button
              type="button"
              role="radio"
              aria-checked={!isWinter}
              tabIndex={isWinter ? -1 : 0}
              onClick={pick("summer")}
              className={pill}
              style={{
                letterSpacing: "0.3em",
                background: isWinter ? "transparent" : "rgba(255,245,210,0.95)",
                color: isWinter ? "rgba(245,240,228,0.75)" : "#5c3d12",
                boxShadow: isWinter ? "none" : "0 0 18px rgba(255,200,90,0.25)",
              }}
            >
              <Sun size={16} strokeWidth={1.8} style={{ color: isWinter ? "rgba(245,240,228,0.55)" : "#d4a02b" }} aria-hidden />
              <span className="hidden md:inline">{t("hero.summerSeason")}</span>
              <span className="md:hidden">{t("hero.summerShort")}</span>
              <span
                className={tooltip}
                style={{ background: "rgba(20,18,12,0.92)", color: "#f5f0e4", letterSpacing: "0.02em", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
              >
                {t("hero.summerTooltip")}
              </span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={isWinter}
              tabIndex={isWinter ? 0 : -1}
              onClick={pick("winter")}
              className={pill}
              style={{
                letterSpacing: "0.3em",
                background: isWinter ? "rgba(220,240,255,0.95)" : "transparent",
                color: isWinter ? "#173042" : "rgba(245,240,228,0.75)",
                boxShadow: isWinter ? "0 0 18px rgba(140,200,240,0.25)" : "none",
              }}
            >
              <Snowflake size={16} strokeWidth={1.8} style={{ color: isWinter ? "#5aa4d4" : "rgba(245,240,228,0.55)" }} aria-hidden />
              <span className="hidden md:inline">{t("hero.winterSeason")}</span>
              <span className="md:hidden">{t("hero.winterShort")}</span>
              <span
                className={tooltip}
                style={{ background: "rgba(12,18,26,0.92)", color: "#e8f4ff", letterSpacing: "0.02em", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
              >
                {t("hero.winterTooltip")}
              </span>
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollToTarget("#our-story")}
        data-no-magnet
        className="aurelia-display absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase text-bone"
        style={{ letterSpacing: "0.5em", opacity: settled ? 1 : 0, transition: "opacity 1.4s ease 1.6s" }}
      >
        {t("hero.discover")}
        <span className="block h-10 w-px animate-pulse bg-bone/60 motion-reduce:animate-none" />
      </button>

      {/* Intro curtain: two halves and a gold seam, parting over the video. */}
      <div className="pointer-events-none absolute inset-0 z-40" aria-hidden data-reveal-skip>
        <div
          className="absolute left-0 top-0 h-full w-1/2 bg-night"
          style={{
            transform: opened ? "translateX(-101%)" : "translateX(0)",
            transition: "transform 1800ms cubic-bezier(.77,0,.18,1)",
            boxShadow: "8px 0 40px rgba(0,0,0,0.6)",
          }}
        />
        <div
          className="absolute right-0 top-0 h-full w-1/2 bg-night"
          style={{
            transform: opened ? "translateX(101%)" : "translateX(0)",
            transition: "transform 1800ms cubic-bezier(.77,0,.18,1)",
            boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-dot-bright to-transparent"
          style={{ opacity: opened ? 0 : 0.9, transition: "opacity 600ms ease" }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-bone"
          style={{ opacity: opened ? 0 : 1, transition: "opacity 700ms ease" }}
        >
          <Crest size={110} />
        </div>
      </div>
    </section>
  );
}

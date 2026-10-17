"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { experiences } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/scroll";
import { useSite } from "../SiteProvider";
import { SplitHeading } from "../Split";

const noise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function Experiences() {
  const { t, season, isWinter } = useSite();
  const cards = experiences[season];
  const track = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);

  // Each frame: tilt the cards by their distance from the strip's centre,
  // slide the images against the scroll, and skew the strip by its velocity.
  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let frame = 0;
    let visible = false;
    let last = el.scrollLeft;
    let velocity = 0;
    const tick = () => {
      const now = el.scrollLeft;
      velocity += (now - last - velocity) * 0.12;
      last = now;
      const bounds = el.getBoundingClientRect();
      const centre = bounds.left + bounds.width / 2;
      cardRefs.current.forEach((card) => {
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const reach = bounds.width / 2 + rect.width / 2;
        const k = Math.max(-1, Math.min(1, (rect.left + rect.width / 2 - centre) / Math.max(1, reach)));
        card.style.transform = `perspective(1100px) translateZ(${-Math.abs(k) * 80}px) rotateY(${k * -14}deg) scale(${1 - Math.abs(k) * 0.1})`;
        const image = card.querySelector<HTMLElement>("[data-exp-img]");
        if (image) image.style.translate = `${k * -28}px 0`;
      });
      el.style.transform = `skewX(${Math.max(-6, Math.min(6, velocity * 0.12))}deg)`;
      if (visible) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      visible = false;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [season]);

  // Drag to scroll with the mouse; touch and trackpads scroll natively.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let startX = 0;
    let startLeft = 0;
    let dragging = false;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      startX = event.clientX;
      startLeft = el.scrollLeft;
    };
    const move = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 4) el.classList.add("is-dragging");
      el.scrollLeft = startLeft - dx;
    };
    const up = () => {
      dragging = false;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <section id="experiences" className="relative scroll-mt-10 overflow-hidden bg-paper py-24 text-umber md:py-36">
      <span className="au-filament" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: noise, backgroundSize: "128px 128px" }}
      />
      <div className="relative flex flex-col items-center">
        <div className="z-10 max-w-3xl px-6 text-center md:px-12">
          <div
            className="aurelia-display flex items-center justify-center gap-3 text-sepia"
            style={{ fontSize: 12, letterSpacing: "0.45em", fontWeight: 600 }}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-dot" />
            {t("exp.eyebrow")}
          </div>
          <SplitHeading
            className="aurelia-serif mt-6 leading-[1.02] text-umber"
            style={{ fontSize: "clamp(34px, 4.6vw, 76px)", fontWeight: 500 }}
          >
            {(words) => (
              <>
                {words(t(isWinter ? "exp.titleWinter" : "exp.titleSummer"))}
                <span className="aurelia-garamond-italic block font-normal" style={{ fontSize: "clamp(30px, 4vw, 68px)" }}>
                  {words(t("exp.titleSub"))}
                </span>
              </>
            )}
          </SplitHeading>
          <p
            className="aurelia-body mx-auto mt-7 text-taupe"
            style={{ fontSize: 16, lineHeight: 1.85, fontWeight: 300, maxWidth: "52ch" }}
          >
            {t(isWinter ? "exp.introWinter" : "exp.introSummer")}
          </p>
        </div>

        <div className="mt-16 w-full md:mt-20" style={{ perspective: "1200px" }}>
          <div
            ref={track}
            data-exp-track
            data-lenis-prevent-touch
            role="group"
            aria-label={t("exp.stripLabel")}
            tabIndex={0}
            className="flex cursor-grab snap-x snap-mandatory gap-7 overflow-x-auto scroll-smooth px-2 pb-10 pt-4 outline-none focus-visible:ring-1 focus-visible:ring-dot"
          >
            {cards.map((card, i) => {
              const open = active === i;
              const tall = i % 2 === 0;
              const number = String(i + 1).padStart(2, "0");
              return (
                <article
                  key={card.key}
                  ref={(node) => {
                    cardRefs.current[i] = node;
                  }}
                  tabIndex={0}
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive((current) => (current === i ? null : i))}
                  className="group relative shrink-0 snap-center overflow-hidden bg-(--au-card) outline-none"
                  style={{
                    width: "clamp(300px, 36vw, 500px)",
                    aspectRatio: tall ? "3 / 4" : "4 / 5",
                    marginTop: tall ? 0 : 60,
                    transformOrigin: "center center",
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={card.image.src}
                      alt={t(card.titleKey)}
                      fill
                      sizes="(min-width: 1400px) 500px, (min-width: 834px) 36vw, 300px"
                      draggable={false}
                      data-exp-img
                      data-standin={card.image.standIn ? "" : undefined}
                      className="object-cover"
                      style={{
                        transform: open ? "scale(1.22)" : "scale(1.18)",
                        opacity: open ? 1 : 0.92,
                        transition: "opacity 900ms ease, transform 1800ms cubic-bezier(.16,1,.3,1)",
                      }}
                    />
                  </div>
                  <div
                    className="aurelia-serif pointer-events-none absolute -bottom-6 -right-2 select-none"
                    style={{
                      fontSize: "clamp(140px, 16vw, 220px)",
                      fontWeight: 600,
                      color: "rgba(245,240,228,0.06)",
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                    }}
                    aria-hidden
                  >
                    {number}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 transition-opacity duration-700"
                    style={{
                      background: "linear-gradient(to top, rgba(12,11,9,0.9) 0%, rgba(12,11,9,0.4) 50%, transparent 100%)",
                      opacity: open ? 1 : 0.88,
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-700"
                    style={{ background: "rgba(12,11,9,0.35)", opacity: open ? 1 : 0 }}
                  />
                  <div
                    className="aurelia-display absolute left-6 top-6 text-bone/70"
                    style={{ fontSize: 11, letterSpacing: "0.45em", fontWeight: 600 }}
                  >
                    {number} / {String(cards.length).padStart(2, "0")}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <h3
                      className="aurelia-serif leading-[1.05] text-bone"
                      style={{
                        fontSize: "clamp(26px, 2.4vw, 38px)",
                        fontWeight: 500,
                        textShadow: "0 3px 18px rgba(0,0,0,0.55)",
                        transform: open ? "translateY(-10px)" : "translateY(0)",
                        transition: "transform 700ms cubic-bezier(.16,1,.3,1)",
                      }}
                    >
                      {t(card.titleKey)}
                    </h3>
                    <p
                      className="aurelia-body mt-3 overflow-hidden text-bone/90"
                      style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        fontWeight: 300,
                        maxHeight: open ? 220 : 0,
                        opacity: open ? 1 : 0,
                        transform: open ? "translateY(0)" : "translateY(10px)",
                        transition: "max-height 700ms ease, opacity 500ms ease 100ms, transform 700ms ease",
                      }}
                    >
                      {t(card.descKey)}
                    </p>
                    <div className="mt-4 h-px bg-bone/60 transition-all duration-700" style={{ width: open ? 80 : 32 }} />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

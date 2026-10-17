"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { collage } from "@/lib/content";
import { prefersReducedMotion } from "@/lib/scroll";
import { useSite } from "../SiteProvider";
import { SplitHeading } from "../Split";

const TRAVEL_VH = 95;

// Four photos fly in from above and below as the section crosses the viewport
// and meet in the corners around the closing line; they leave the same way.
export function FinalCta() {
  const { t, lang, isWinter } = useSite();
  const section = useRef<HTMLElement>(null);
  // -1 when the section is a viewport below centre, 0 centred, +1 above.
  const [progress, setProgress] = useState(-1);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(0);
      return;
    }
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = section.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const value = (vh / 2 - (rect.top + rect.height / 2)) / ((vh + rect.height) / 2);
        setProgress(Math.max(-1.2, Math.min(1.2, value)));
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(frame);
    };
  }, []);

  const textOpacity = Math.max(0, 1 - Math.abs(progress) * 1.6);

  return (
    <section ref={section} className="relative overflow-hidden bg-linen" style={{ minHeight: "120vh" }}>
      <span className="au-filament" aria-hidden />
      <div className="relative w-full" style={{ minHeight: "100vh" }}>
        {collage.map((photo) => {
          const top = photo.side === "tl" || photo.side === "tr";
          const right = photo.side === "tr" || photo.side === "br";
          const offset = top ? progress * TRAVEL_VH : -progress * TRAVEL_VH;
          return (
            <div
              key={photo.src}
              data-reveal-skip
              className={`absolute will-change-transform ${top ? "top-[8vh] md:top-[10vh]" : "bottom-[8vh] md:bottom-[10vh]"} ${right ? "right-[4vw] md:right-[6vw]" : "left-[4vw] md:left-[6vw]"}`}
              style={{
                width: "min(26vw, 360px)",
                height: "min(26vw, 360px)",
                transform: `translate3d(0, ${offset}vh, 0) rotate(${photo.rot}deg)`,
                transition: "transform 0.1s linear",
                boxShadow: "0 30px 70px -25px rgba(26,20,16,0.18)",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt[lang]}
                width={720}
                height={720}
                sizes="(min-width: 1400px) 360px, 26vw"
                data-parallax
                data-standin={isWinter ? "" : undefined}
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}

        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
          style={{ opacity: textOpacity, transition: "opacity 0.3s ease-out" }}
          data-reveal-skip
        >
          <div className="pointer-events-auto max-w-[36rem] text-center">
            <SplitHeading
              className="aurelia-serif leading-[1.02] text-umber-deep"
              style={{ fontSize: "clamp(40px, 5.4vw, 88px)", fontWeight: 500, letterSpacing: "-0.005em" }}
            >
              {(words) => (
                <>
                  {words(t("ready.title"))}{" "}
                  <span
                    className="aurelia-garamond-italic mt-2 block font-normal text-champagne"
                    style={{ fontSize: "clamp(36px, 4.8vw, 80px)", lineHeight: 0.95 }}
                  >
                    {words(t("ready.title2"))}
                  </span>
                </>
              )}
            </SplitHeading>
            <p
              className="aurelia-body mx-auto mt-8 text-umber-deep/60"
              style={{ fontSize: 16, lineHeight: 1.85, fontWeight: 300, maxWidth: "52ch" }}
            >
              {t(isWinter ? "ready.bodyWinter" : "ready.bodySummer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { media } from "@/lib/content";
import type { Key } from "@/lib/i18n/tr";
import { useSite } from "../SiteProvider";
import { SplitHeading } from "../Split";

// Summer: weddings. Winter: the same section becomes the candlelight concerts.
export function Weddings() {
  const { t, lang, season } = useSite();
  const k = (name: string) => t(`wed.${season}.${name}` as Key);
  const image = media.wedding[season];
  const alt =
    season === "winter"
      ? lang === "tr"
        ? "Villa Aurelia'da mum ışığında konser"
        : "Candlelight concert at Villa Aurelia"
      : lang === "tr"
        ? "Villa Aurelia'da gelin ve damat"
        : "Bride and groom at Villa Aurelia";

  return (
    <>
      <div className="h-20 bg-linen md:h-28" />
      <section id="weddings" className="scroll-mt-24 bg-paper text-umber">
        <span className="au-filament" aria-hidden />
        <div className="mx-auto max-w-[1400px] px-6 pt-8 md:px-10 md:pt-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm md:aspect-[21/9]">
            <Image
              src={image.src}
              alt={alt}
              width={1905}
              height={825}
              sizes="(min-width: 1480px) 1320px, 100vw"
              data-parallax
              data-standin={image.standIn ? "" : undefined}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
        <div className="mx-auto max-w-[980px] px-6 py-16 text-center md:px-10 md:py-24">
          <div
            className="aurelia-display flex items-center justify-center gap-3 text-sepia"
            style={{ fontSize: 12, letterSpacing: "0.45em", fontWeight: 600 }}
          >
            <span className="block h-1.5 w-1.5 rounded-full bg-dot" />
            {k("eyebrow")}
          </div>
          <SplitHeading
            className="aurelia-serif mt-6 leading-[1.02] text-umber"
            style={{ fontSize: "clamp(34px, 4.6vw, 76px)", fontWeight: 500 }}
          >
            {(words) => (
              <>
                {words(k("titleTop"))}
                <span className="aurelia-garamond-italic block font-normal" style={{ fontSize: "clamp(30px, 4vw, 68px)" }}>
                  {words(k("titleBottom"))}
                </span>
              </>
            )}
          </SplitHeading>
          <p
            className="aurelia-body mx-auto mt-8 text-taupe"
            style={{ fontSize: 16, lineHeight: 1.9, fontWeight: 300, maxWidth: "72ch" }}
          >
            {k("body")}
          </p>
          <div className="mx-auto mt-10 h-px w-24 bg-umber/20" />
          <div className="mt-8">
            <h4 className="aurelia-serif italic text-umber" style={{ fontSize: 18, fontWeight: 500 }}>
              {t("wed.glance")}
            </h4>
            <div className="aurelia-body mt-4 space-y-2 text-taupe" style={{ fontSize: 14, lineHeight: 1.8, fontWeight: 300 }}>
              <p>{k("g1")}</p>
              <p>{k("g2")}</p>
              <p>{k("g3")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

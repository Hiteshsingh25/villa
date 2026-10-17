"use client";

import Image from "next/image";
import { media } from "@/lib/content";
import { useSite } from "../SiteProvider";
import { SplitHeading } from "../Split";

export function About() {
  const { t, lang, isWinter } = useSite();
  const sizes = "(min-width: 1500px) 360px, 24vw";

  return (
    <>
      <section
        id="our-story"
        data-reveal-section="about"
        className="au-about-reveal relative overflow-hidden bg-paper text-umber"
      >
        <span className="au-filament" aria-hidden />
        <div className="au-about-img-l absolute bottom-10 left-0 hidden w-[24vw] max-w-[360px] md:block">
          <Image
            src={media.about.left}
            alt={lang === "tr" ? "Kemerler arasında klasik bir mermer heykel" : "A classical marble statue among arches"}
            width={896}
            height={1152}
            sizes={sizes}
            data-parallax
            data-standin={isWinter ? "" : undefined}
            className="block h-auto w-full object-cover"
          />
        </div>
        <div className="au-about-img-r absolute bottom-10 right-0 hidden w-[24vw] max-w-[360px] md:block">
          <Image
            src={media.about.right}
            alt={lang === "tr" ? "Yamaçtaki teras ve denize bakan havuz" : "The cliffside terrace and pool above the sea"}
            width={896}
            height={1152}
            sizes={sizes}
            data-parallax
            data-standin={isWinter ? "" : undefined}
            className="block h-auto w-full object-cover"
          />
        </div>

        <div className="au-about-text relative mx-auto max-w-[720px] px-6 pb-36 pt-36 text-center md:px-16 md:pb-52 md:pt-52">
          <SplitHeading
            className="aurelia-serif flex flex-col items-center text-center leading-[1.02] text-umber"
            style={{ fontSize: "clamp(40px, 5.4vw, 92px)", fontWeight: 500 }}
          >
            {(words) => (
              <>
                <span className="md:whitespace-nowrap">{words(t("about.title1"))}</span>
                <span className="aurelia-garamond-italic font-normal" style={{ fontSize: "clamp(34px, 4.6vw, 78px)" }}>
                  {words(t("about.title2"))}
                </span>
              </>
            )}
          </SplitHeading>
          <p
            className="aurelia-body mx-auto mt-12 text-taupe"
            style={{ fontSize: 17, lineHeight: 2, letterSpacing: "0.01em", maxWidth: "62ch", fontWeight: 300 }}
          >
            {t(isWinter ? "about.bodyWinter" : "about.bodySummer")}
          </p>
        </div>
      </section>
      <div className="h-16 bg-paper md:h-24" />
    </>
  );
}

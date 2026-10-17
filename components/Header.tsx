"use client";

import { Snowflake, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Crest } from "./Crest";
import { MobileMenu } from "./MobileMenu";
import { upper, useSite } from "./SiteProvider";

export function Header() {
  const { t, lang, toggleLang, isWinter, setSeason } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tone = scrolled ? "text-ink" : "text-bone";
  const hover = scrolled ? "hover:text-gold" : "hover:text-bone/65";
  const weddings = t(isWinter ? "nav.weddingsWinter" : "nav.weddings");
  const langTone = (code: "tr" | "en") => (lang === code ? tone : "opacity-45");
  const seasonLabel = upper(t(isWinter ? "hero.winter" : "hero.summer"), lang);

  const links = [
    { label: t("nav.stay"), href: "#stay" },
    { label: t("nav.dine"), href: "#dine" },
    { label: t("nav.experiences"), href: "#experiences" },
    { label: weddings, href: "#weddings" },
    { label: "Journal", href: "/journal" },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "au-header-scrolled" : "backdrop-blur-[2px]"}`}
      >
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 md:grid-cols-[1fr_auto_1fr] lg:gap-10 lg:px-12">
          <nav
            aria-label={lang === "tr" ? "Ana menü" : "Main"}
            className={`aurelia-display hidden items-center justify-end gap-5 text-[12px] font-semibold transition-colors duration-500 md:flex lg:gap-8 ${tone}`}
            style={{ letterSpacing: "0.2em" }}
          >
            <a href="#stay" className={`${hover} transition`}>{t("nav.stay")}</a>
            <a href="#dine" className={`${hover} transition`}>{t("nav.dine")}</a>
            <a href="#experiences" className={`${hover} transition`}>{t("nav.experiences")}</a>
            <a href="/journal" className={`${hover} hidden transition lg:inline`}>JOURNAL</a>
          </nav>

          <a
            href="#top"
            aria-label={t("nav.home")}
            className="group col-start-1 justify-self-start text-bone md:col-start-auto md:justify-self-center"
          >
            <span className={`block opacity-95 transition group-hover:opacity-100 md:hidden ${scrolled ? "au-header-logo-scrolled" : ""}`}>
              <Crest size={64} />
            </span>
            <span className={`hidden opacity-95 transition group-hover:opacity-100 md:block ${scrolled ? "au-header-logo-scrolled" : ""}`}>
              <Crest size={96} />
            </span>
          </a>

          <nav
            aria-label={lang === "tr" ? "Rezervasyon ve ayarlar" : "Booking and settings"}
            className={`aurelia-display hidden items-center justify-start gap-5 text-[12px] font-semibold transition-colors duration-500 md:flex lg:gap-8 ${tone}`}
            style={{ letterSpacing: "0.2em" }}
          >
            <a href="#weddings" className={`${hover} transition`}>{weddings}</a>
            <a href="#book" className={`${hover} transition`}>{t("nav.bookNow")}</a>
            <button
              type="button"
              onClick={toggleLang}
              aria-label={t("nav.toggleLang")}
              className={`${hover} flex items-center gap-1 border-l pl-5 transition lg:pl-8 ${scrolled ? "border-ink/20" : "border-bone/20"}`}
              style={{ letterSpacing: "0.2em" }}
            >
              <span className={langTone("tr")}>TR</span>
              <span className="opacity-30">/</span>
              <span className={langTone("en")}>EN</span>
            </button>
            <button
              type="button"
              onClick={() => setSeason(isWinter ? "summer" : "winter")}
              aria-label={`${t("nav.seasonToggle")} — ${seasonLabel}`}
              className={`aurelia-display group relative hidden items-center gap-1.5 border-l pl-5 text-[11px] font-semibold transition lg:flex lg:pl-8 ${tone} ${scrolled ? "border-ink/20 hover:text-gold" : "border-bone/20 hover:opacity-70"}`}
              style={{ letterSpacing: "0.2em" }}
            >
              {isWinter ? (
                <Snowflake size={12} strokeWidth={1.5} style={{ color: "hsl(200 85% 82%)" }} />
              ) : (
                <Sun size={12} strokeWidth={1.5} style={{ color: "hsl(42 90% 65%)" }} />
              )}
              <span>{seasonLabel}</span>
              <span
                className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-md px-3 py-1.5 text-[10px] font-medium leading-snug opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                style={{
                  background: "rgba(20,18,12,0.92)",
                  color: "#f5f0e4",
                  letterSpacing: "0.02em",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                }}
              >
                {t(isWinter ? "hero.winterTooltip" : "hero.summerTooltip")}
              </span>
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t("nav.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={`relative z-[70] col-start-3 -mr-2 flex min-h-12 min-w-12 touch-manipulation items-center justify-center justify-self-end transition-colors duration-500 md:hidden ${tone}`}
          >
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" className="pointer-events-none block" aria-hidden>
              <path d="M1 1H21" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 7H21" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 13H21" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} links={links} />
    </>
  );
}

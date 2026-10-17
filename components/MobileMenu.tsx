"use client";

import { Snowflake, Sun } from "lucide-react";
import { useEffect, type CSSProperties } from "react";
import { lockScroll, scrollToTarget } from "@/lib/scroll";
import { upper, useSite } from "./SiteProvider";

export function MobileMenu({
  open,
  onClose,
  links,
}: {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string }[];
}) {
  const { t, lang, setLang, isWinter, setSeason } = useSite();

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lockScroll(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Close first (which unlocks scrolling), then travel to the section.
  const go = (href: string) => (event: React.MouseEvent) => {
    onClose();
    if (!href.startsWith("#")) return;
    event.preventDefault();
    window.setTimeout(() => scrollToTarget(href), 80);
  };

  const langButton = (code: "tr" | "en") => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-pressed={lang === code}
      className={`min-h-11 min-w-11 transition ${lang === code ? "au-mobile-menu-accent font-semibold" : "opacity-55"}`}
    >
      {code.toUpperCase()}
    </button>
  );

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menuTitle")}
      aria-hidden={!open}
      inert={!open}
      className={`au-mobile-menu fixed inset-0 z-[60] flex flex-col transition-opacity duration-500 md:hidden ${open ? "is-open pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="au-mobile-menu-border relative z-10 flex items-center justify-between border-b px-6 py-5">
        <span className="aurelia-display au-mobile-menu-accent text-[11px] font-semibold uppercase tracking-[0.4em]">
          {t("nav.menuTitle")}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("nav.closeMenu")}
          className="au-mobile-menu-action flex min-h-11 min-w-11 items-center justify-center transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="block" aria-hidden>
            <path d="M2 2L20 20" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 2L2 20" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>

      <nav className="relative z-10 flex flex-1 flex-col justify-center px-8">
        <ul className="space-y-5">
          {links.map((link, i) => (
            <li key={link.href} style={{ "--i": i } as CSSProperties}>
              <a href={link.href} onClick={go(link.href)} className="au-mobile-menu-link flex min-h-11 items-baseline gap-4">
                <span className="aurelia-display au-mobile-menu-accent text-[10px] font-semibold tracking-[0.2em] opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="aurelia-serif text-[clamp(34px,10vw,42px)] leading-[1.05] tracking-normal transition-colors duration-300">
                  {link.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="relative z-10 space-y-8 px-8 pb-10">
        <div className="au-mobile-menu-border grid grid-cols-2 gap-4 border-t pt-6">
          <div className="space-y-3">
            <span className="aurelia-display au-mobile-menu-accent block text-[10px] uppercase tracking-[0.4em]">
              {t("nav.language")}
            </span>
            <div className="flex items-center gap-3 text-xs tracking-[0.15em]">
              {langButton("tr")}
              <span className="opacity-20">|</span>
              {langButton("en")}
            </div>
          </div>
          <div className="space-y-3">
            <span className="aurelia-display au-mobile-menu-accent block text-[10px] uppercase tracking-[0.4em]">
              {t("nav.season")}
            </span>
            <button
              type="button"
              onClick={() => setSeason(isWinter ? "summer" : "winter")}
              aria-label={t("nav.seasonToggle")}
              className="au-mobile-menu-accent flex min-h-11 items-center gap-2 text-xs font-semibold tracking-[0.15em]"
            >
              {isWinter ? (
                <Snowflake size={14} strokeWidth={1.5} style={{ color: "hsl(200 85% 82%)" }} />
              ) : (
                <Sun size={14} strokeWidth={1.5} style={{ color: "hsl(42 90% 65%)" }} />
              )}
              <span>{upper(t(isWinter ? "hero.winter" : "hero.summer"), lang)}</span>
            </button>
          </div>
        </div>
        <a
          href="#book"
          onClick={go("#book")}
          className="au-mobile-menu-cta aurelia-display block w-full py-4 text-center text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors"
        >
          {t("nav.bookNow")}
        </a>
        <div className="flex justify-center">
          <div className="au-mobile-menu-rule h-px w-12" />
        </div>
      </div>
    </div>
  );
}

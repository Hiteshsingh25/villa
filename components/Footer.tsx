"use client";

import { ArrowUp, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { media } from "@/lib/content";
import type { Key } from "@/lib/i18n/tr";
import { prefersReducedMotion, scrollToTarget } from "@/lib/scroll";
import { useSite } from "./SiteProvider";

const WORDMARK = "Aurelia";
const INSTAGRAM = { handle: "@villaaureliahotel", href: "https://www.instagram.com/villaaureliahotel/" };

const gold = (alpha: number) => `color-mix(in srgb, var(--au-gold) ${alpha * 100}%, transparent)`;
const cream = (alpha: number) => `color-mix(in srgb, var(--au-cream) ${alpha * 100}%, transparent)`;

function antalyaTime(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 8);
  }
}

// lucide dropped its brand icons, so the Instagram glyph is drawn here.
function InstagramIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="aurelia-display uppercase tracking-[0.3em]" style={{ fontSize: 10, color: cream(0.5) }}>
        {label}
      </div>
      <div
        className="aurelia-serif mt-1"
        style={{ fontSize: 22, color: "var(--au-cream)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>
    </div>
  );
}

export function Footer() {
  const { t } = useSite();
  const wordmark = useRef<HTMLDivElement>(null);
  // Pointer position relative to the wordmark block (0–1 inside it, beyond when
  // away). The letters hang off this, so they fall into place as the footer
  // scrolls up towards the pointer.
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5 });
  const [still, setStill] = useState(true);
  const [clock, setClock] = useState("");
  const [email, setEmail] = useState("");
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    setClock(antalyaTime(new Date()));
    const timer = window.setInterval(() => setClock(antalyaTime(new Date())), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(pointer: coarse)").matches) return;
    setStill(false);
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = wordmark.current?.getBoundingClientRect();
      if (!rect || rect.top > window.innerHeight * 2.5) return;
      setPointer({ x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const onMove = (event: PointerEvent) => {
      clientX = event.clientX;
      clientY = event.clientY;
      queue();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("scroll", queue, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", queue);
      cancelAnimationFrame(frame);
    };
  }, []);

  const subscribe = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setThanks(true);
    setEmail("");
    window.setTimeout(() => setThanks(false), 2600);
  };

  const columns: { heading: Key; items: { label: string; href: string }[] }[] = [
    {
      heading: "foot.discover",
      items: [
        { label: t("foot.ourStory"), href: "/#our-story" },
        { label: t("foot.roomsSuites"), href: "/#stay" },
        { label: t("foot.dining"), href: "/#dine" },
        { label: t("foot.experiences"), href: "/#experiences" },
        { label: t("foot.weddings"), href: "/#weddings" },
      ],
    },
    {
      heading: "foot.plan",
      items: [
        { label: t("foot.reservations"), href: "/#book" },
        { label: "Journal", href: "/journal" },
      ],
    },
  ];
  const marquee = [
    "La\u00a0\u00a0dolce vita",
    "Antalya · Türkiye",
    t("foot.mq.est"),
    t("foot.mq.seaside"),
    t("foot.mq.soul"),
    t("foot.mq.concierge"),
  ];

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "var(--au-surface-warm)", color: "var(--au-cream)" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 transition-[background] duration-300"
        style={{ background: `radial-gradient(600px circle at ${pointer.x * 100}% ${pointer.y * 100}%, ${gold(0.1)}, transparent 60%)` }}
      />

      <div className="relative overflow-hidden border-y" style={{ borderColor: gold(0.18) }} aria-hidden>
        <div className="au-marquee flex whitespace-nowrap py-5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center gap-10 pr-10">
              {marquee.map((item, i) => (
                <span key={i} className="flex items-center gap-10">
                  <span
                    className={`aurelia-display tracking-[0.32em] ${i === 0 ? "normal-case" : "uppercase"}`}
                    style={{ fontSize: 12, color: "var(--au-gold)" }}
                  >
                    {item}
                  </span>
                  <span style={{ color: "var(--au-gold)", opacity: 0.5 }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1600px] px-6 pb-10 pt-20 md:px-12 md:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="aurelia-display uppercase tracking-[0.4em]" style={{ fontSize: 11, color: "var(--au-gold)" }}>
              {t("foot.stayInTouch")}
            </p>
            <h3
              className="aurelia-serif mt-5 leading-[1.05]"
              style={{ fontSize: "clamp(30px, 3.4vw, 52px)", fontWeight: 500, color: "var(--au-cream)" }}
            >
              {t("foot.lettersTop")}
              <span
                className="aurelia-script mt-2 block italic"
                style={{ fontSize: "clamp(34px, 3.8vw, 60px)", color: "var(--au-gold)" }}
              >
                {t("foot.lettersBottom")}
              </span>
            </h3>
            <p
              className="aurelia-body mt-7"
              style={{ fontSize: 15, lineHeight: 1.85, fontWeight: 300, color: cream(0.62), maxWidth: "44ch" }}
            >
              {t("foot.newsletterBody")}
            </p>

            <form onSubmit={subscribe} className="mt-9 max-w-md" data-no-magnet>
              <div
                className="relative flex items-center border-b transition-colors duration-300"
                style={{ borderColor: email ? "var(--au-gold)" : gold(0.35) }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  aria-label={t("foot.emailLabel")}
                  autoComplete="email"
                  className="au-newsletter-input aurelia-body flex-1 bg-transparent py-4 outline-none"
                  style={{ fontSize: 15, color: "var(--au-cream)" }}
                />
                <button
                  type="submit"
                  className="aurelia-display group relative flex items-center gap-2 py-4 pl-5 uppercase tracking-[0.3em] transition-colors"
                  style={{ fontSize: 11, color: "var(--au-gold)" }}
                >
                  <span>{t("foot.subscribe")}</span>
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                    aria-hidden
                  />
                </button>
              </div>
              <div
                role="status"
                className="aurelia-body mt-3 h-5 transition-opacity duration-300"
                style={{ fontSize: 12, color: "var(--au-gold)", opacity: thanks ? 1 : 0 }}
              >
                {thanks ? t("foot.thanks") : ""}
              </div>
            </form>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-6">
              <Fact label={t("foot.antalyaTime")} value={clock || "--:--:--"} />
              <Fact label={t("foot.currently")} value={t("foot.currentlyValue")} />
              <Fact label={t("foot.frontDesk")} value={t("foot.frontDeskValue")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 md:gap-8 lg:col-span-7">
            {columns.map((column) => (
              <nav key={column.heading} aria-label={t(column.heading)}>
                <p
                  className="aurelia-display mb-5 border-b pb-5 uppercase tracking-[0.4em]"
                  style={{ fontSize: 11, color: "var(--au-gold)", borderColor: gold(0.2) }}
                >
                  {t(column.heading)}
                </p>
                <ul className="space-y-3.5">
                  {column.items.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="au-link aurelia-serif inline-flex items-baseline gap-2"
                        style={{ fontSize: 19, fontWeight: 400, color: "var(--au-cream)" }}
                      >
                        <span className="au-link-text">{item.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div ref={wordmark} className="relative mt-20 select-none md:mt-28" aria-hidden>
          <div
            className="pointer-events-none absolute z-10"
            style={{
              top: "-18%",
              right: "6%",
              width: "clamp(140px, 18vw, 260px)",
              transform: `translateY(${still ? 0 : (pointer.y - 0.5) * -14}px)`,
              transition: "transform 0.6s ease-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={media.birds} alt="" loading="lazy" width={700} height={700} className="au-birds block w-full" />
          </div>
          <div
            className="aurelia-script relative text-center italic leading-none"
            style={{ fontSize: "clamp(96px, 22vw, 360px)", color: "var(--au-gold)", letterSpacing: "-0.02em", lineHeight: 0.85 }}
          >
            {WORDMARK.split("").map((letter, i) => {
              const depth = (i + 1) / WORDMARK.length;
              const x = still ? 0 : (pointer.x - 0.5) * 60 * (0.4 + depth * 1.2);
              const y = still ? 0 : (pointer.y - 0.5) * 24 * (0.6 + depth);
              return (
                <span
                  key={i}
                  className="inline-block transition-transform duration-500 ease-out"
                  style={{ transform: `translate3d(${x}px, ${y}px, 0)`, willChange: "transform" }}
                >
                  {letter}
                </span>
              );
            })}
          </div>
          <div
            className="mx-auto mt-6 h-px"
            style={{ width: "60%", background: `linear-gradient(90deg, transparent, ${gold(0.35)}, transparent)` }}
          />
        </div>

        <div className="mt-14 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-3">
            <li>
              <a
                href={INSTAGRAM.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram ${INSTAGRAM.handle}`}
                className="au-social group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 transition-all duration-500"
                style={{ borderColor: gold(0.3), color: "var(--au-cream)" }}
              >
                <InstagramIcon className="transition-transform duration-500 group-hover:rotate-[-12deg]" />
                <span className="aurelia-display uppercase tracking-[0.28em]" style={{ fontSize: 10 }}>
                  Instagram
                </span>
                <span
                  className="au-social-handle aurelia-body overflow-hidden whitespace-nowrap"
                  style={{ fontSize: 12, color: "var(--au-gold)" }}
                >
                  {INSTAGRAM.handle}
                </span>
              </a>
            </li>
          </ul>
          <button type="button" onClick={() => scrollToTarget(0)} className="group relative flex items-center gap-4">
            <span className="aurelia-display uppercase tracking-[0.32em]" style={{ fontSize: 11, color: "var(--au-gold)" }}>
              {t("foot.backToTop")}
            </span>
            <span
              className="relative flex h-12 w-12 items-center justify-center rounded-full border transition-transform duration-500 group-hover:-translate-y-1"
              style={{ borderColor: gold(0.45) }}
            >
              <span
                className="absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ boxShadow: `0 0 0 1px ${gold(0.6)}, 0 0 40px ${gold(0.25)}` }}
              />
              <ArrowUp size={16} style={{ color: "var(--au-gold)" }} aria-hidden />
            </span>
          </button>
        </div>

        <div className="mt-12 border-t pt-6 text-center" style={{ borderColor: gold(0.15) }}>
          <p className="aurelia-body" style={{ fontSize: 12, color: cream(0.45) }}>
            © 2026 Villa Aurelia. {t("foot.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

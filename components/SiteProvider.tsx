"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { en } from "@/lib/i18n/en";
import { tr, type Key } from "@/lib/i18n/tr";

export type Season = "summer" | "winter";
export type Lang = "tr" | "en";

const dictionaries: Record<Lang, Record<Key, string>> = { tr, en };
const LANG_KEY = "aurelia-lang";
const SEASON_KEY = "aurelia-season";

type Site = {
  season: Season;
  isWinter: boolean;
  setSeason: (season: Season) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: Key) => string;
  /** Room chosen from the rooms slider, picked up by the booking form. */
  bookingRoom: string;
  setBookingRoom: (room: string) => void;
};

const SiteContext = createContext<Site | null>(null);

// Summer runs April to October, winter November to March.
const seasonForDate = (date: Date): Season => {
  const month = date.getMonth();
  return month >= 3 && month <= 9 ? "summer" : "winter";
};

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [season, setSeasonState] = useState<Season>("summer");
  const [lang, setLangState] = useState<Lang>("tr");
  const [switching, setSwitching] = useState(false);
  const [bookingRoom, setBookingRoom] = useState("");
  const timer = useRef(0);

  useEffect(() => {
    let storedSeason: string | null = null;
    let storedLang: string | null = null;
    try {
      storedSeason = localStorage.getItem(SEASON_KEY);
      storedLang = localStorage.getItem(LANG_KEY);
    } catch {}
    setSeasonState(
      storedSeason === "summer" || storedSeason === "winter" ? storedSeason : seasonForDate(new Date()),
    );
    if (storedLang === "tr" || storedLang === "en") setLangState(storedLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setSeason = useCallback((next: Season) => {
    setSeasonState(next);
    try {
      localStorage.setItem(SEASON_KEY, next);
    } catch {}
  }, []);

  // The strings swap while the content is dipped, so the change reads as a fade.
  const setLang = useCallback((next: Lang) => {
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
    window.clearTimeout(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLangState(next);
      return;
    }
    setSwitching(true);
    timer.current = window.setTimeout(() => {
      setLangState(next);
      timer.current = window.setTimeout(() => setSwitching(false), 60);
    }, 180);
  }, []);

  const value = useMemo<Site>(
    () => ({
      season,
      isWinter: season === "winter",
      setSeason,
      lang,
      setLang,
      toggleLang: () => setLang(lang === "tr" ? "en" : "tr"),
      t: (key) => dictionaries[lang][key] ?? dictionaries.en[key] ?? key,
      bookingRoom,
      setBookingRoom,
    }),
    [season, setSeason, lang, setLang, bookingRoom],
  );

  return (
    <SiteContext.Provider value={value}>
      <div
        className={`au-root relative min-h-screen overflow-hidden bg-night text-bone ${season === "winter" ? "au-winter" : "au-summer"}`}
        data-lang-switch={switching ? "" : undefined}
      >
        {children}
      </div>
    </SiteContext.Provider>
  );
}

export function useSite() {
  const site = useContext(SiteContext);
  if (!site) throw new Error("useSite must be used within SiteProvider");
  return site;
}

/** Locale-aware upper-casing: Turkish needs i → İ. */
export const upper = (text: string, lang: Lang) => text.toLocaleUpperCase(lang === "tr" ? "tr-TR" : "en-US");

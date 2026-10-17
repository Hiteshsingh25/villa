"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type WordFn = (text: string) => ReactNode;

/**
 * A heading whose words rise and unblur one after another (70ms apart) when it
 * enters the viewport. `children` receives a `words()` helper; the stagger
 * index runs on across every call, so a two-line heading reads as one sweep.
 */
export function SplitHeading({
  as = "h2",
  className = "",
  style,
  children,
}: {
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  children: (words: WordFn) => ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let index = 0;
  const words: WordFn = (text) =>
    text.split(/(\s+)/).map((part, i) =>
      /^\s*$/.test(part) ? (
        part
      ) : (
        <span key={i} className="au-word" style={{ transitionDelay: `${index++ * 70}ms` }}>
          {part}
        </span>
      ),
    );

  return createElement(as, { ref, className: `au-split ${shown ? "in" : ""} ${className}`, style }, children(words));
}

/** Per-character reveal for the script hero title: 40ms apart, rising from a 6° tilt. */
export function SplitChars({ text, shown }: { text: string; shown: boolean }) {
  return (
    <span className={`au-chars ${shown ? "in" : ""}`} aria-hidden>
      {[...text].map((char, i) => (
        <span key={i} className="au-char" style={{ transitionDelay: `${i * 40}ms` }}>
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
}

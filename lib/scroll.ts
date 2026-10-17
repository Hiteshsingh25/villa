import type Lenis from "lenis";

// One Lenis instance for the page. Components reach it through these helpers
// so they keep working (with native scrolling) when Lenis is off.
let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
  if (lenis && locks > 0) lenis.stop();
}

export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
  if (typeof target === "number") window.scrollTo({ top: target, behavior });
  else document.querySelector(target)?.scrollIntoView({ behavior });
}

// Used by the intro and the mobile menu. Calls nest.
export function lockScroll(locked: boolean) {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  document.body.style.overflow = locks > 0 ? "hidden" : "";
  if (locks > 0) lenis?.stop();
  else lenis?.start();
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

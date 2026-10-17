"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/scroll";

// Page-wide motion, ported from the original's DOM passes: scroll progress,
// pointer spotlight, scroll reveals, filaments, image parallax and magnetic
// links. Everything is skipped under prefers-reduced-motion, where the CSS
// shows all content immediately.
export function PageEffects() {
  const progress = useRef<HTMLDivElement>(null);
  const spotlight = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cleanups: Array<() => void> = [];
    const outsideHeader = (el: Element) => !el.closest("header");

    // Scroll progress bar.
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // Scroll reveal for section content.
    const revealTargets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "section h1, section h2, section h3, section p, section img, section video, section figure, section [data-reveal]",
      ),
    ).filter((el) => outsideHeader(el) && !el.closest("[data-reveal-skip]") && !el.closest("[data-parallax]"));
    revealTargets.forEach((el, i) => {
      el.classList.add("au-reveal");
      el.style.transitionDelay = `${Math.min(220, (i % 6) * 40)}ms`;
    });
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("au-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
    cleanups.push(() => revealObserver.disconnect());

    // Filaments (the hairline at each section top), and the about section's clip reveal.
    const inObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          inObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll(".au-filament").forEach((el) => inObserver.observe(el));
    cleanups.push(() => inObserver.disconnect());
    const about = document.querySelector('[data-reveal-section="about"]');
    if (about) {
      const aboutObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("in");
            aboutObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.12, rootMargin: "-5% 0px -10% 0px" },
      );
      aboutObserver.observe(about);
      cleanups.push(() => aboutObserver.disconnect());
    }

    // Image parallax: scale 1.12 and a translateY scrubbed by scroll position.
    const parallax = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el, i) => {
      el.style.willChange = "transform";
      if (el.parentElement) {
        el.parentElement.style.overflow = "hidden";
        el.parentElement.style.perspective = "1200px";
      }
      // The original's speeds cycle over three values, starting from its third image.
      return { el, speed: 0.08 + ((i + 2) % 3) * 0.025 };
    });
    let frame = 0;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let glowX = pointerX;
    let glowY = pointerY;
    const tick = () => {
      const vh = window.innerHeight;
      for (const { el, speed } of parallax) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) continue;
        const offset = -((rect.top + rect.height / 2 - vh / 2) / vh) * 60 * speed * 6;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0) scale(1.12)`;
      }
      if (finePointer && spotlight.current) {
        glowX += (pointerX - glowX) * 0.08;
        glowY += (pointerY - glowY) * 0.08;
        spotlight.current.style.background = `radial-gradient(420px circle at ${glowX}px ${glowY}px, rgba(184,165,138,0.08), transparent 70%)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    cleanups.push(() => cancelAnimationFrame(frame));

    if (finePointer) {
      const onPointer = (event: PointerEvent) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
      };
      window.addEventListener("pointermove", onPointer);
      cleanups.push(() => window.removeEventListener("pointermove", onPointer));

      // Parallax images gain a little saturation under the pointer.
      parallax.forEach(({ el }) => {
        const parent = el.parentElement;
        if (!parent) return;
        const enter = () => {
          el.style.transition = "filter 400ms ease";
          el.style.filter = "saturate(1.06) contrast(1.02)";
        };
        const leave = () => {
          el.style.filter = "";
        };
        parent.addEventListener("pointerenter", enter);
        parent.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          parent.removeEventListener("pointerenter", enter);
          parent.removeEventListener("pointerleave", leave);
        });
      });

      // Magnetic links and buttons (everything outside the header).
      Array.from(document.querySelectorAll<HTMLElement>("a, button"))
        .filter((el) => outsideHeader(el) && !el.closest("[data-no-magnet]"))
        .forEach((el) => {
          const previous = el.style.transition;
          el.style.transition = `${getComputedStyle(el).transition}, transform 500ms cubic-bezier(.16,1,.3,1)`;
          cleanups.push(() => {
            el.style.transition = previous;
          });
          const move = (event: PointerEvent) => {
            const rect = el.getBoundingClientRect();
            const dx = (event.clientX - (rect.left + rect.width / 2)) * 0.18;
            const dy = (event.clientY - (rect.top + rect.height / 2)) * 0.18;
            el.style.transform = `translate(${dx}px, ${dy}px)`;
          };
          const leave = () => {
            el.style.transform = "translate(0,0)";
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
            el.style.transform = "";
          });
        });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      <div ref={progress} className="au-progress" aria-hidden />
      <div ref={spotlight} className="au-spotlight hidden md:block" aria-hidden />
    </>
  );
}

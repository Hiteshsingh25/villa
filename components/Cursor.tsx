"use client";

import { useEffect, useRef } from "react";

// Gold ring + dot that follow the mouse, with a particle burst on click.
// The native cursor is only hidden once a real mouse has moved.
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const bursts = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let ringX = x;
    let ringY = y;
    let dotX = x;
    let dotY = y;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      root.classList.add("au-mouse-active");
      x = event.clientX;
      y = event.clientY;
    };
    const onOver = (event: MouseEvent) => {
      const hover = !!(event.target as Element).closest?.("a, button, [data-cursor]");
      ring.current?.classList.toggle("au-hover", hover);
    };
    const onClick = (event: MouseEvent) => {
      if (!bursts.current) return;
      const burst = document.createElement("div");
      burst.className = "au-burst";
      burst.style.left = `${event.clientX}px`;
      burst.style.top = `${event.clientY}px`;
      for (let i = 0; i < 10; i++) {
        const particle = document.createElement("span");
        const angle = (i / 10) * Math.PI * 2;
        const reach = 28 + Math.random() * 18;
        particle.style.setProperty("--tx", `${Math.cos(angle) * reach}px`);
        particle.style.setProperty("--ty", `${Math.sin(angle) * reach}px`);
        particle.style.setProperty("--delay", `${Math.random() * 60}ms`);
        burst.appendChild(particle);
      }
      bursts.current.appendChild(burst);
      window.setTimeout(() => burst.remove(), 900);
    };

    let frame = 0;
    const tick = () => {
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      dotX += (x - dotX) * 0.45;
      dotY += (y - dotY) * 0.45;
      if (ring.current) ring.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      if (dot.current) dot.current.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("click", onClick);
      root.classList.remove("au-mouse-active");
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden>
      <div ref={bursts} className="au-burst-layer" />
      <div ref={ring} className="au-cursor-ring" />
      <div ref={dot} className="au-cursor-dot" />
    </div>
  );
}

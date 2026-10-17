"use client";

import { useEffect, useState } from "react";
import { lockScroll, prefersReducedMotion } from "@/lib/scroll";
import { Crest } from "./Crest";

const SEEN_KEY = "aurelia-overture-seen-v3";

// First visit of the session: the crest glows on two dark panels, which then
// part to reveal the hero. Scrolling is locked until they have gone.
export function Overture() {
  const [phase, setPhase] = useState<"draw" | "split" | "done">("draw");
  const [active, setActive] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SEEN_KEY)) return;
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    if (prefersReducedMotion()) return;
    setActive(true);
    lockScroll(true);
    let locked = true;
    const release = () => {
      if (locked) lockScroll(false);
      locked = false;
    };
    const split = window.setTimeout(() => setPhase("split"), 2200);
    const done = window.setTimeout(() => {
      setPhase("done");
      release();
    }, 3400);
    return () => {
      window.clearTimeout(split);
      window.clearTimeout(done);
      release();
    };
  }, []);

  if (!active || phase === "done") return null;
  const split = phase === "split";

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[10001]" style={{ perspective: "1200px" }}>
      <div className="au-ov-panel" style={{ top: 0, transform: split ? "translateY(-101%)" : "translateY(0)" }} />
      <div className="au-ov-panel" style={{ bottom: 0, transform: split ? "translateY(101%)" : "translateY(0)" }} />
      <div className="au-ov-sweep" />
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-8"
        style={{ opacity: split ? 0 : 1, transition: "opacity 500ms ease-out" }}
      >
        <div className="relative flex items-center justify-center">
          <span className="au-ov-ring" />
          <span className="au-ov-ring delay" />
          <div className="au-ov-logo relative">
            <Crest size={200} />
          </div>
        </div>
        <div className="au-ov-word">Villa&nbsp;&nbsp;Aurelia</div>
        <div className="au-ov-sub">A private world · antalya</div>
      </div>
    </div>
  );
}

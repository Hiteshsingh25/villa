"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSite } from "./SiteProvider";

const TRACK = "/audio/ambient.mp3";
const VOLUME = 0.35;
const FADE_MS = 1000;

// Ambient loop. It never starts on its own: the pulsing dot invites a click.
export function MusicToggle() {
  const { t } = useSite();
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef(0);
  const [playing, setPlaying] = useState(false);

  useEffect(
    () => () => {
      cancelAnimationFrame(fade.current);
      audio.current?.pause();
    },
    [],
  );

  const fadeTo = (target: number, then?: () => void) => {
    const el = audio.current;
    if (!el) return;
    cancelAnimationFrame(fade.current);
    const from = el.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / FADE_MS);
      el.volume = from + (target - from) * k;
      if (k < 1) fade.current = requestAnimationFrame(step);
      else then?.();
    };
    fade.current = requestAnimationFrame(step);
  };

  const toggle = () => {
    if (!audio.current) {
      const el = new Audio(TRACK);
      el.loop = true;
      el.volume = 0;
      audio.current = el;
    }
    const el = audio.current;
    if (playing) {
      setPlaying(false);
      fadeTo(0, () => el.pause());
      return;
    }
    el.play()
      .then(() => {
        setPlaying(true);
        fadeTo(VOLUME);
      })
      .catch(() => setPlaying(false));
  };

  const label = t(playing ? "music.pause" : "music.play");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={playing}
      title={label}
      data-no-magnet
      className="fixed bottom-6 right-6 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-champagne/40 bg-black/30 text-[#e8d9b8] backdrop-blur-md transition hover:bg-black/50"
      style={{ boxShadow: "0 6px 24px rgba(0,0,0,0.25)" }}
    >
      {playing ? <Volume2 size={16} /> : <VolumeX size={16} />}
      {playing ? (
        <span
          className="pointer-events-none absolute inset-0 rounded-full border border-champagne/40 motion-reduce:hidden"
          style={{ animation: "auMusicPulse 2.4s ease-out infinite" }}
        />
      ) : (
        <span
          className="pointer-events-none absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-champagne motion-reduce:animate-none"
          style={{ animation: "auMusicPulse 1.6s ease-out infinite" }}
        />
      )}
    </button>
  );
}

"use client";

import { Crest } from "@/components/Crest";
import { useSite } from "@/components/SiteProvider";

// Only the homepage is rebuilt; links such as /journal land here.
export default function NotFound() {
  const { t } = useSite();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-night px-6 text-center text-bone">
      <Crest size={110} />
      <p className="aurelia-garamond-italic" style={{ fontSize: "clamp(26px, 3.4vw, 44px)" }}>
        {t("notFound.title")}
      </p>
      <a
        href="/"
        className="aurelia-display border-b border-current pb-1 text-[11px] font-semibold uppercase text-champagne"
        style={{ letterSpacing: "0.35em" }}
      >
        {t("notFound.back")}
      </a>
    </main>
  );
}

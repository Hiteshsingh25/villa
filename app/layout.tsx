import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Pinyon_Script, Raleway } from "next/font/google";
import { Toaster } from "sonner";
import { Cursor } from "@/components/Cursor";
import { SiteProvider } from "@/components/SiteProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const raleway = Raleway({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-raleway",
  display: "swap",
});
// Free stand-in for La Graziela (commercial), which the original self-hosts.
const script = Pinyon_Script({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description =
  "Villa Aurelia; sakin, sinematik bir kaçamak olarak tasarlanmış butik lüks otel. Odalar, gastronomi, deneyimler, düğünler ve doğrudan rezervasyon.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Villa Aurelia — Butik Lüks Otel & Rezervasyon",
  description,
  alternates: { canonical: "/", languages: { tr: "/", "x-default": "/" } },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    siteName: "Villa Aurelia",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: "/",
    title: "Villa Aurelia — Butik Lüks Otel & Rezervasyon",
    description,
    images: ["/video/hero-summer.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0c0b09" };

const hotelJsonLd = {
  "@context": "https://schema.org",
  "@type": "Hotel",
  "@id": `${SITE_URL}/#hotel`,
  name: "Villa Aurelia",
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/video/hero-summer.jpg`,
  description:
    "Villa Aurelia; sakin, sinematik bir kaçamak olarak tasarlanmış butik lüks otel. Odalar ve süitler, gastronomi, deneyimler, özel etkinlikler ve doğrudan rezervasyon.",
  address: { "@type": "PostalAddress", addressLocality: "Antalya", addressCountry: "TR" },
  availableLanguage: ["tr", "en"],
  sameAs: ["https://www.instagram.com/villaaureliahotel/"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${raleway.variable} ${script.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd) }} />
        <SiteProvider>
          <SmoothScroll />
          <div className="au-grain" aria-hidden />
          <Cursor />
          {children}
        </SiteProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: "var(--font-raleway), system-ui, sans-serif",
              borderRadius: 2,
              border: "1px solid rgba(42,33,24,0.12)",
              background: "#fffdf9",
              color: "#2a2118",
            },
          }}
        />
      </body>
    </html>
  );
}

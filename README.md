# Villa Aurelia — homepage

A Next.js rebuild of the Villa Aurelia boutique-hotel homepage (hotelaurelia.online), ported from the original's Vite + React bundle and the Woblo asset pack.

> **Content note.** The name, crest, imagery, videos and copy belong to the original site's owner. All copy is in `lib/i18n/{tr,en}.ts` and all media in `public/`, so both can be replaced before anything ships under another brand.

## Run

```
npm install
npm run dev        # http://localhost:3000
npm run lint       # tsc --noEmit
npm run build
```

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Lenis · Radix Select and Popover · react-day-picker · sonner · zod.

Differences from the build prompt:

- **Next 15 / npm / Tailwind v4**, to match the other templates in this repo.
- **No GSAP.** The original scrubs its scroll effects with plain `requestAnimationFrame` and scroll listeners; those are ported as they are (`PageEffects.tsx`, `FinalCta.tsx`, `Footer.tsx`).
- **Motion follows the original's source where the prompt disagreed with it**: the header turns to glass after 40px, rooms advance every 3.5s and venues every 4s, the footer letters hang off the pointer (so they fall into place as the footer scrolls up to it), and the grain shifts every 1.2s.
- **Two intros, as in the original.** The first visit of a session plays the crest overture (`Overture.tsx`, about 3.4s, scroll locked). Later loads show the hero's own centre-seam curtain. Reduced motion skips both.

## Structure

```
app/layout.tsx        fonts, metadata, Hotel JSON-LD, SiteProvider, Lenis, grain, cursor, toaster
app/page.tsx          overture, page effects, music, header, the eight sections, footer
app/actions.ts        reservation server action
components/
  SiteProvider.tsx    season + language context; puts .au-summer / .au-winter on the root wrapper
  PageEffects.tsx     progress bar, spotlight, scroll reveals, filaments, parallax, magnetic links
  Split.tsx           word-by-word headings and the per-character hero title
  Header.tsx, MobileMenu.tsx, Cursor.tsx, MusicToggle.tsx, Overture.tsx, Footer.tsx
  sections/           Hero, About, Rooms, Experiences, Dine, Weddings, Booking, FinalCta
  ui/                 shadcn-style Select and Popover
lib/content.ts        rooms, experiences, venues, media paths
lib/booking.ts        zod schema and the demo availability
lib/i18n/             tr.ts, en.ts
scripts/prepare-assets.mjs
```

## Season and language

- **Season** defaults to summer from April to October and winter otherwise, and is remembered in `localStorage`. It swaps the hero video, the copy that differs by season, and the whole palette.
- Every surface and accent colour is a CSS variable (`app/globals.css`, "Season tokens"). The variables are registered with `@property`, so the root wrapper cross-fades them over 900ms.
- **Language** defaults to Turkish and is remembered too. Both dictionaries come from the original site.

## Assets

`npm run assets` rebuilds `public/` from the pack in `_src/assets` (not committed). With `FFMPEG=/path/to/ffmpeg` it also re-encodes the videos (hero 23 MB → 6 MB and 37 MB → 6 MB, plus 960px mobile versions and posters) and renders the ambient loop.

Not in the pack, and how each is covered:

| Missing | Now |
|---|---|
| Room photos for Deluxe, Bahçeli Villa and İmperial Süit | Other pack images, flagged `standIn` in `lib/content.ts` |
| All winter stills, and the winter chef clip | The summer ones, with a cool CSS grade in winter (`img[data-standin]`) |
| La Graziela (commercial script) | Pinyon Script. To use the real font, add an `@font-face` named "La Graziela" and remove `font-size-adjust` from `.aurelia-script` |
| Neue Montreal, Berlingske Serif | Raleway and Cormorant Garamond, as the original itself falls back to |
| Ambient music (the original streams a recording from archive.org) | `public/audio/ambient.mp3`, a synthesised 32s pad. Replace the file to change it |
| Subpages (`/odalar`, `/journal`, …) | Header links scroll to the homepage sections; `/journal` shows the not-found page |

## Booking form

The form validates with zod on the client and again in the server action. The calendar's availability is the original's date-seeded demo (`roomsLeft` in `lib/booking.ts`), not real inventory.

To have requests emailed, set:

```
RESEND_API_KEY=...
BOOKING_TO=reservations@example.com
BOOKING_FROM="Villa Aurelia <bookings@your-domain>"   # optional
```

Without them the action logs the request and reports success, so the form works in development. Set `NEXT_PUBLIC_SITE_URL` for correct canonical and JSON-LD URLs. The footer newsletter and the weather line are static, as in the original.

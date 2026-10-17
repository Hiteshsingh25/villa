import type { Key } from "./i18n/tr";

// Structure and media for the homepage. All copy lives in lib/i18n.
//
// The asset pack only holds the summer stills, and only the Süit gallery.
// Entries marked `standIn` reuse other pack images until the real ones are
// dropped into public/ — replace the path and remove the flag.

export type Still = { src: string; standIn?: boolean };

export const media = {
  crest: "/brand/crest.svg",
  birds: "/img/gold-birds.png",
  hero: {
    summer: { src: "/video/hero-summer.mp4", mobile: "/video/hero-summer-mobile.mp4", poster: "/video/hero-summer.jpg" },
    winter: { src: "/video/hero-winter.mp4", mobile: "/video/hero-winter-mobile.mp4", poster: "/video/hero-winter.jpg" },
  },
  // The original swaps to a second chef clip in winter; the pack has one.
  dineVideo: { src: "/video/dine-chef.mp4", poster: "/video/dine-chef.jpg" },
  about: { left: "/img/about-left.jpg", right: "/img/about-right.jpg" },
  wedding: {
    summer: { src: "/img/wedding.jpg" } as Still,
    winter: { src: "/img/exp/concert.jpg", standIn: true } as Still,
  },
} as const;

export type RoomKey = "suite" | "deluxe" | "garden" | "imperial";

export type Room = {
  key: RoomKey;
  labelKey: Key;
  titleKey: Key;
  subtitleKey: Key;
  gallery: Still[];
  sleep: number;
  bath: number;
  included: Key[];
};

export const rooms: Room[] = [
  {
    key: "suite",
    labelKey: "room.suite.label",
    titleKey: "room.suite.title",
    subtitleKey: "room.suite.subtitle",
    gallery: [{ src: "/img/rooms/suite-1.jpg" }, { src: "/img/rooms/suite-2.jpg" }, { src: "/img/rooms/suite-3.jpg" }],
    sleep: 2,
    bath: 1,
    included: ["amenity.seaView", "amenity.airCon", "amenity.kingBed", "amenity.walkInCloset", "amenity.wifi", "amenity.espresso"],
  },
  {
    key: "deluxe",
    labelKey: "room.deluxe.label",
    titleKey: "room.deluxe.title",
    subtitleKey: "room.deluxe.subtitle",
    gallery: [
      { src: "/img/about-right.jpg", standIn: true },
      { src: "/img/dine/terrace.jpg", standIn: true },
      { src: "/img/exp/yoga.jpg", standIn: true },
    ],
    sleep: 2,
    bath: 1,
    included: ["amenity.privateTerrace", "amenity.seaView", "amenity.rainShower", "amenity.miniBar", "amenity.wifi", "amenity.bathrobes"],
  },
  {
    key: "garden",
    labelKey: "room.garden.label",
    titleKey: "room.garden.title",
    subtitleKey: "room.garden.subtitle",
    gallery: [
      { src: "/img/cta/pool.jpg", standIn: true },
      { src: "/img/exp/pool.jpg", standIn: true },
      { src: "/img/exp/tea.jpg", standIn: true },
    ],
    sleep: 3,
    bath: 2,
    included: ["amenity.plungePool", "amenity.gardenPatio", "amenity.outdoorDaybed", "amenity.livingArea", "amenity.wifi", "amenity.butlerService"],
  },
  {
    key: "imperial",
    labelKey: "room.imperial.label",
    titleKey: "room.imperial.title",
    subtitleKey: "room.imperial.subtitle",
    gallery: [
      { src: "/img/cta/spa.jpg", standIn: true },
      { src: "/img/dine/bar.jpg", standIn: true },
      { src: "/img/rooms/suite-3.jpg", standIn: true },
    ],
    sleep: 4,
    bath: 2,
    included: ["amenity.marbleFireplace", "amenity.panoramicSeaView", "amenity.privateLounge", "amenity.chandelier", "amenity.wifi", "amenity.privateChef"],
  },
];

export type Experience = { key: string; titleKey: Key; descKey: Key; image: Still };

const exp = (name: string, standIn = false): Still => ({ src: `/img/exp/${name}.jpg`, standIn: standIn || undefined });

export const experiences: Record<"summer" | "winter", Experience[]> = {
  summer: [
    { key: "pool", titleKey: "exp.pool.title", descKey: "exp.pool.desc", image: exp("pool") },
    { key: "beach", titleKey: "exp.beach.title", descKey: "exp.beach.desc", image: exp("beach") },
    { key: "golf", titleKey: "exp.golf.title", descKey: "exp.golf.desc", image: exp("golf") },
    { key: "concert", titleKey: "exp.concert.title", descKey: "exp.concert.desc", image: exp("concert") },
    { key: "bar", titleKey: "exp.bar.title", descKey: "exp.bar.desc", image: exp("bar") },
    { key: "tea", titleKey: "exp.tea.title", descKey: "exp.tea.desc", image: exp("tea") },
    { key: "spa", titleKey: "exp.spa.title", descKey: "exp.spa.desc", image: exp("spa") },
    { key: "yacht", titleKey: "exp.yacht.title", descKey: "exp.yacht.desc", image: exp("yacht") },
    { key: "yoga", titleKey: "exp.yoga.title", descKey: "exp.yoga.desc", image: exp("yoga") },
    { key: "dining", titleKey: "exp.dining.title", descKey: "exp.dining.desc", image: exp("dining") },
  ],
  winter: [
    { key: "thermal", titleKey: "exp.thermal.title", descKey: "exp.thermal.desc", image: exp("pool", true) },
    { key: "terrace", titleKey: "exp.terrace.title", descKey: "exp.terrace.desc", image: exp("beach", true) },
    { key: "ski", titleKey: "exp.ski.title", descKey: "exp.ski.desc", image: exp("golf", true) },
    { key: "concert", titleKey: "exp.concertWinter.title", descKey: "exp.concertWinter.desc", image: exp("concert") },
    { key: "bar", titleKey: "exp.barWinter.title", descKey: "exp.barWinter.desc", image: exp("bar") },
    { key: "tea", titleKey: "exp.tea.title", descKey: "exp.teaWinter.desc", image: exp("tea") },
    { key: "spa", titleKey: "exp.spa.title", descKey: "exp.spaWinter.desc", image: exp("spa") },
    { key: "sleigh", titleKey: "exp.sleigh.title", descKey: "exp.sleigh.desc", image: exp("yacht", true) },
    { key: "yoga", titleKey: "exp.yoga.title", descKey: "exp.yogaWinter.desc", image: exp("yoga", true) },
    { key: "dining", titleKey: "exp.diningWinter.title", descKey: "exp.diningWinter.desc", image: exp("dining", true) },
  ],
};

export type Venue = { key: "hall" | "terrace" | "bar"; titleKey: Key; image: string };

export const venues: Venue[] = [
  { key: "hall", titleKey: "dine.hall.title", image: "/img/dine/salon.jpg" },
  { key: "terrace", titleKey: "dine.terrace.title", image: "/img/dine/terrace.jpg" },
  { key: "bar", titleKey: "dine.bar.title", image: "/img/dine/bar.jpg" },
];

export const collage = [
  { src: "/img/cta/pool.jpg", alt: { tr: "Havuz ve palmiyeler", en: "Pool and palms" }, side: "tl", rot: -3 },
  { src: "/img/cta/spa.jpg", alt: { tr: "Dingin kapalı havuz", en: "Serene indoor pool" }, side: "tr", rot: 2 },
  { src: "/img/cta/dining.jpg", alt: { tr: "Açık hava yemek terası", en: "Open-air dining terrace" }, side: "bl", rot: 3 },
  { src: "/img/cta/palms.jpg", alt: { tr: "Gökyüzüne uzanan palmiyeler", en: "Palms against the sky" }, side: "br", rot: -2 },
] as const;

// Copies the Woblo asset pack from _src/assets into public/ under stable names,
// re-encodes the videos and synthesises the ambient loop.
//
//   node scripts/prepare-assets.mjs            images only (needs sharp)
//   FFMPEG=/path/to/ffmpeg node scripts/...    also videos, posters and audio
//
// Without ffmpeg the videos are copied as they are (23 MB + 37 MB).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = (f) => join(root, "_src", "assets", f);
const out = (f) => {
  const p = join(root, "public", f);
  mkdirSync(dirname(p), { recursive: true });
  return p;
};
const ffmpeg = process.env.FFMPEG || "";
const only = process.argv[2] || "all";
const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`;

const images = {
  "about-statue-BcedsHLh.jpg": "img/about-left.jpg",
  "about-right-DCJByTLE.jpg": "img/about-right.jpg",
  "room-suite-7j8DzjHe.jpg": "img/rooms/suite-1.jpg",
  "room-suite-2-_2ghJZTC.jpg": "img/rooms/suite-2.jpg",
  "room-suite-3-Cj2qPVbV.jpg": "img/rooms/suite-3.jpg",
  "exp-pool-D--_eOSh.jpg": "img/exp/pool.jpg",
  "exp-beach-BLUxBcL0.jpg": "img/exp/beach.jpg",
  "exp-golf-Dj-Pc4dt.jpg": "img/exp/golf.jpg",
  "exp-concert-C-WUMX8O.jpg": "img/exp/concert.jpg",
  "exp-bar-nFi0vbEM.jpg": "img/exp/bar.jpg",
  "exp-tea-BcJibo4b.jpg": "img/exp/tea.jpg",
  "exp-spa-CgLGEpDS.jpg": "img/exp/spa.jpg",
  "exp-yacht-CzP2w3mU.jpg": "img/exp/yacht.jpg",
  "exp-yoga-BrOOiUH_.jpg": "img/exp/yoga.jpg",
  "exp-dining-DP-v43ZF.jpg": "img/exp/dining.jpg",
  "dine-tea-detail-BeP3X8Ew.jpg": "img/dine/salon.jpg",
  "dine-terrace-CuCnT2z7.jpg": "img/dine/terrace.jpg",
  "dine-bar-CmeVLShz.jpg": "img/dine/bar.jpg",
  "resort-pool-NhBNm_56.jpg": "img/cta/pool.jpg",
  "resort-spa-CKO-a6wB.jpg": "img/cta/spa.jpg",
  "resort-dining-C6nRt_iY.jpg": "img/cta/dining.jpg",
  "resort-palms-6wCUYnQs.jpg": "img/cta/palms.jpg",
  "gold-birds-trio.png": "img/gold-birds.png",
  "logo-2-BJ2navQv.svg": "brand/crest.svg",
};

async function doImages() {
  for (const [from, to] of Object.entries(images)) copyFileSync(src(from), out(to));
  await sharp(src("wedding-couple.png")).jpeg({ quality: 86, mozjpeg: true }).toFile(out("img/wedding.jpg"));
  console.log("wedding.jpg", kb(out("img/wedding.jpg")));

  // Favicon: the white crest on the espresso surface.
  const crest = await sharp(src("logo-2-BJ2navQv.svg"), { density: 40 })
    .resize(200, 200, { fit: "contain", background: "#0000" })
    .png()
    .toBuffer();
  const icon = join(root, "app", "icon.png");
  await sharp({ create: { width: 256, height: 256, channels: 4, background: "#2a221b" } })
    .composite([{ input: crest, gravity: "centre" }])
    .png()
    .toFile(icon);
  console.log("icon.png", kb(icon));
}

function ff(args) {
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
}

function encode(from, to, width, crf) {
  ff([
    "-i", src(from),
    "-vf", `scale=${width}:-2`,
    "-c:v", "libx264", "-crf", String(crf), "-preset", "slow",
    "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart",
    out(to),
  ]);
  console.log(to, kb(out(to)));
}

function doVideos() {
  const videos = {
    "aurelia-hero-long.mp4": "video/hero-summer.mp4",
    "aurelia-winter-hero.mp4": "video/hero-winter.mp4",
    "dine-chef.mp4": "video/dine-chef.mp4",
  };
  if (!ffmpeg || !existsSync(ffmpeg)) {
    console.warn("FFMPEG not set: copying the videos uncompressed, no mobile versions or posters.");
    for (const [from, to] of Object.entries(videos)) copyFileSync(src(from), out(to));
    return;
  }
  encode("aurelia-hero-long.mp4", "video/hero-summer.mp4", 1920, 28);
  encode("aurelia-hero-long.mp4", "video/hero-summer-mobile.mp4", 960, 28);
  encode("aurelia-winter-hero.mp4", "video/hero-winter.mp4", 1920, 31);
  encode("aurelia-winter-hero.mp4", "video/hero-winter-mobile.mp4", 960, 30);
  encode("dine-chef.mp4", "video/dine-chef.mp4", 720, 27);
  for (const [from, to] of [
    ["aurelia-hero-long.mp4", "video/hero-summer.jpg"],
    ["aurelia-winter-hero.mp4", "video/hero-winter.jpg"],
    ["dine-chef.mp4", "video/dine-chef.jpg"],
  ]) {
    ff(["-ss", "0.2", "-i", src(from), "-frames:v", "1", "-vf", "scale='min(1600,iw)':-2", "-q:v", "4", out(to)]);
    console.log(to, kb(out(to)));
  }
}

// A 32 s seamless pad (D major add9). Every partial and LFO completes a whole
// number of cycles in the loop, so the file repeats without a click.
function doAudio() {
  if (!ffmpeg || !existsSync(ffmpeg)) {
    console.warn("FFMPEG not set: skipping /audio/ambient.mp3.");
    return;
  }
  const rate = 44100;
  const secs = 32;
  const n = rate * secs;
  const snap = (hz) => Math.round(hz * secs) / secs;
  const notes = [73.42, 110, 146.83, 185, 220, 329.63, 369.99, 440];
  const gains = [0.5, 0.45, 0.4, 0.3, 0.28, 0.16, 0.12, 0.07];
  const pcm = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    let l = 0;
    let r = 0;
    notes.forEach((hz, k) => {
      const f = snap(hz);
      const swell = 0.55 + 0.45 * Math.sin((2 * Math.PI * (k + 1) * t) / secs + k * 1.7);
      const a = gains[k] * swell;
      const pan = 0.5 + 0.35 * Math.sin((2 * Math.PI * ((k % 3) + 1) * t) / secs + k);
      const s =
        Math.sin(2 * Math.PI * f * t) +
        0.6 * Math.sin(2 * Math.PI * (f + 2 / secs) * t + k) +
        0.12 * Math.sin(2 * Math.PI * snap(hz * 2) * t);
      l += a * s * (1 - pan);
      r += a * s * pan;
    });
    pcm.writeInt16LE(Math.max(-1, Math.min(1, l * 0.3)) * 32767, i * 4);
    pcm.writeInt16LE(Math.max(-1, Math.min(1, r * 0.3)) * 32767, i * 4 + 2);
  }
  const raw = join(root, "_src", "ambient.pcm");
  writeFileSync(raw, pcm);
  ff(["-f", "s16le", "-ar", String(rate), "-ac", "2", "-i", raw, "-af", "lowpass=f=2400", "-c:a", "libmp3lame", "-b:a", "112k", out("audio/ambient.mp3")]);
  console.log("audio/ambient.mp3", kb(out("audio/ambient.mp3")));
}

if (only === "all" || only === "images") await doImages();
if (only === "all" || only === "audio") doAudio();
if (only === "all" || only === "videos") doVideos();

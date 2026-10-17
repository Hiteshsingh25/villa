import sharp from "sharp";
import { readdirSync } from "node:fs";
const dir = process.argv[2];
const files = readdirSync(dir).filter((f) => /\.(jpg|png)$/.test(f) && !/wedding/.test(f));
const W = 300, H = 220, cols = 6;
const tiles = await Promise.all(files.map(async (f, i) => ({
  input: await sharp(`${dir}/${f}`).resize(W, H, { fit: "cover" }).composite([{ input: Buffer.from(`<svg width="${W}" height="24"><rect width="${W}" height="24" fill="#000a"/><text x="4" y="17" font-size="14" fill="#fff" font-family="Arial">${f.replace(/-[A-Za-z0-9_-]{8}\./, ".")}</text></svg>`), gravity: "south" }]).jpeg().toBuffer(),
  left: (i % cols) * W, top: Math.floor(i / cols) * H,
})));
await sharp({ create: { width: cols * W, height: Math.ceil(files.length / cols) * H, channels: 3, background: "#222" } }).composite(tiles).jpeg({ quality: 80 }).toFile(process.argv[3]);

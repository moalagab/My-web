// Encodes rendered hero frames (scripts/hero/scene.py output) for the web:
//   node scripts/hero/encode.mjs <png-dir> desktop|mobile
// Writes public/hero/<target>/001.avif, 001.webp, ... numbered from 1 in render order.
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WIDTH = { desktop: 1600, mobile: 720 };
const [input, target] = process.argv.slice(2);
if (!input || !WIDTH[target]) {
  console.error("usage: node scripts/hero/encode.mjs <png-dir> desktop|mobile");
  process.exit(1);
}

const out = path.resolve("public/hero", target);
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const pngs = (await readdir(input)).filter((f) => f.endsWith(".png")).sort();
let bytes = 0;
for (const [index, file] of pngs.entries()) {
  const name = String(index + 1).padStart(3, "0");
  const frame = sharp(path.join(input, file)).resize({ width: WIDTH[target] });
  const avif = await frame.clone().avif({ quality: 48, effort: 6 }).toFile(path.join(out, `${name}.avif`));
  const webp = await frame.clone().webp({ quality: 70, effort: 6 }).toFile(path.join(out, `${name}.webp`));
  bytes += avif.size;
  if (index === 0) console.log(`first frame: avif ${avif.size} B, webp ${webp.size} B`);
}
console.log(`${target}: ${pngs.length} frames, ${(bytes / 1024).toFixed(0)} KB as AVIF`);

// Writes responsive variants next to every raster image in the client build:
// photo-abc123.webp -> photo-abc123-w640.avif, photo-abc123-w640.webp, ...
// <Picture> (src/components/Picture.tsx) builds srcset from the same names, so
// keep WIDTHS in sync with it.
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const WIDTHS = [640, 1024, 1600];
const DIRS = ["assets", "work"];
const RASTER = /\.(webp|jpe?g|png)$/i;
const VARIANT = /-w\d+\.(avif|webp)$/;

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = await Promise.all(
    entries.map((e) => {
      const full = path.join(dir, e.name);
      return e.isDirectory() ? walk(full) : [full];
    }),
  );
  return files.flat();
};

export async function writeImageVariants(clientDir) {
  const started = Date.now();
  const sources = (
    await Promise.all(DIRS.map((d) => walk(path.join(clientDir, d))))
  )
    .flat()
    .filter((f) => RASTER.test(f) && !VARIANT.test(f));

  let written = 0;
  const queue = [...sources];
  const worker = async () => {
    for (let file = queue.shift(); file; file = queue.shift()) {
      const base = file.replace(RASTER, "");
      for (const width of WIDTHS) {
        const resized = sharp(file).resize({ width, withoutEnlargement: true });
        await resized.clone().avif({ quality: 50, effort: 2 }).toFile(`${base}-w${width}.avif`);
        await resized.clone().webp({ quality: 72 }).toFile(`${base}-w${width}.webp`);
        written += 2;
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(
    `Image variants: ${written} files for ${sources.length} sources in ${((Date.now() - started) / 1000).toFixed(1)}s`,
  );
}

/**
 * One 1200×630 JPEG share card per case study, cropped from its cover, at
 * /og/work/<slug>.jpg (ProjectDetailPage points og:image there). JPEG because
 * not every link preview renders WebP. The cover is read from the prerendered
 * page's CreativeWork image, so it follows whatever projects.ts sets.
 */
export async function writeCaseShareImages(clientDir, slugs) {
  const out = path.join(clientDir, "og", "work");
  await mkdir(out, { recursive: true });
  for (const slug of slugs) {
    const html = await readFile(path.join(clientDir, "work", slug, "index.html"), "utf8");
    const cover = html.match(/"@type":"CreativeWork"[^<]*?"image":"https:\/\/moalagab\.art([^"]+)"/)?.[1];
    if (!cover) throw new Error(`No CreativeWork image for ${slug}`);
    await sharp(path.join(clientDir, decodeURI(cover)))
      .resize(1200, 630, { fit: "cover", position: "attention" })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(out, `${slug}.jpg`));
  }
}

import type { ImgHTMLAttributes } from "react";

// Must match WIDTHS in scripts/image-variants.mjs, which writes the files at build time.
const WIDTHS = [640, 1024, 1600];
const RASTER = /\.(webp|jpe?g|png)$/i;

const srcSet = (src: string, format: "avif" | "webp") =>
  WIDTHS.map((w) => `${src.replace(RASTER, "")}-w${w}.${format} ${w}w`).join(", ");

type PictureProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  /** How wide the image renders, e.g. "(min-width: 1024px) 50vw, 100vw". */
  sizes: string;
};

/**
 * Responsive <picture>: AVIF, then WebP, at three widths. Development and
 * external (http) images render a plain <img>.
 */
export default function Picture({ src, sizes, ...img }: PictureProps) {
  // Variants exist only for local images in production builds.
  if (import.meta.env.DEV || !src.startsWith("/") || !RASTER.test(src)) {
    return <img src={src} {...img} />;
  }
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(src, "avif")} sizes={sizes} />
      <img src={src} srcSet={srcSet(src, "webp")} sizes={sizes} {...img} />
    </picture>
  );
}

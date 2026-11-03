import type { ReactNode } from "react";
import Picture from "@/components/Picture";

type Meta = { label: string; value: ReactNode };

/**
 * Inner-page hero in the home hero's system (after Folioblox): an image from
 * Mo's work behind a navy fade, a light-blue label, a huge title, a short
 * side line, and optional details or actions along the bottom. Without an
 * image it is plain navy.
 */
export default function PageHero({
  eyebrow,
  title,
  side,
  image,
  meta,
  actions,
  focus,
  compact = false,
  mediaName,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  side?: ReactNode;
  image?: string;
  meta?: Meta[];
  actions?: ReactNode;
  /** CSS object-position for the image, e.g. "40% 25%" to keep a face in frame. */
  focus?: string;
  /** Shorter hero for pages whose content should come quickly (forms, FAQ, legal). */
  compact?: boolean;
  /** Shared view-transition name, so a project cover can grow into this image. */
  mediaName?: string;
}) {
  return (
    <section
      className={`folio-hero folio-hero--page ${image ? "" : "folio-hero--plain"} ${compact ? "folio-hero--compact" : ""}`}
      data-no-reveal
    >
      {image && (
        <div
          className="folio-hero-media folio-hero-media--work"
          aria-hidden="true"
          style={{ ...(focus ? { "--focus": focus } : {}), ...(mediaName ? { viewTransitionName: mediaName } : {}) } as React.CSSProperties}
        >
          <Picture src={image} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
        </div>
      )}
      <div className="studio-container folio-hero-inner">
        <div className="folio-page-head">
          <div>
            <p className="folio-eyebrow">{eyebrow}</p>
            <h1 className="folio-title">{title}</h1>
          </div>
          {side && <div className="folio-hero-side">{side}</div>}
        </div>
        {(meta || actions) && (
          <div className="folio-page-meta">
            {meta && (
              <dl>
                {meta.map((m) => (
                  <div key={m.label}>
                    <dt>
                      <span aria-hidden="true">#</span> {m.label}
                    </dt>
                    <dd>{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

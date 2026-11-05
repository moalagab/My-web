import type { ReactNode } from "react";
import Picture from "@/components/Picture";

type Meta = { label: string; value: ReactNode };

/**
 * Inner-page hero, editorial: a small label, the title set large in the
 * display serif, a short side line and optional details or actions; when the
 * page has an image it sits beside the words in a rounded frame.
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
      className={`folio-hero--page mono-page-hero ${image ? "mono-page-hero--media" : ""} ${mediaName ? "mono-page-hero--wide" : ""} ${compact ? "folio-hero--compact" : ""}`}
      data-no-reveal
    >
      <div className="studio-container mono-page-grid">
        <div className="mono-page-head">
          <p className="folio-eyebrow">{eyebrow}</p>
          <h1 className="folio-title">{title}</h1>
          {side && <div className="folio-hero-side">{side}</div>}
          {(meta || actions) && (
            <div className="folio-page-meta">
              {meta && (
                <dl>
                  {meta.map((m) => (
                    <div key={m.label}>
                      <dt>{m.label}</dt>
                      <dd>{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {actions}
            </div>
          )}
        </div>
        {image && (
          <div
            className="mono-page-media"
            aria-hidden="true"
            style={{ ...(focus ? { "--focus": focus } : {}), ...(mediaName ? { viewTransitionName: mediaName } : {}) } as React.CSSProperties}
          >
            <Picture src={image} sizes="(min-width: 1000px) 42vw, 100vw" alt="" fetchPriority="high" decoding="async" />
          </div>
        )}
      </div>
    </section>
  );
}

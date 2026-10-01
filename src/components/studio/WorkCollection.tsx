import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/content/projects";

/** Shared editorial rhythm for the home selection and full portfolio. */
export default function WorkCollection({ items }: { items: Project[] }) {
  const { lang, isRtl, dictionary } = useLanguage();
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  return (
    <div className="portfolio-collection">
      {items.map((p, i) => {
        const title = ar ? p.title_ar : p.title_en;
        const wide =
          i === 0 || (i === items.length - 1 && items.length % 2 === 0);
        const preview =
          p.preview ?? p.gallery.find((image) => image.src !== p.cover)?.src;
        return (
          <article
            className={`portfolio-piece ${wide ? "portfolio-piece--wide" : ""}`}
            key={p.slug}
          >
            <Link
              className="portfolio-card"
              to={`${prefix}/work/${p.slug}`}
              aria-label={`${ar ? "استكشف مشروع" : "Explore project"}: ${title}`}
            >
              <div className="portfolio-card-header">
                <span className="portfolio-number" dir="ltr">
                  {String(i + 1).padStart(2, "0")} /
                </span>
                <h3>{title}</h3>
                <span className="portfolio-discipline">
                  {p.discipline?.[lang] ??
                    dictionary.workPage.filters[p.serviceLine]}
                </span>
                <span className="portfolio-arrow">
                  <ArrowUpRight
                    size={22}
                    className={isRtl ? "-scale-x-100" : ""}
                  />
                </span>
              </div>
              <div className="portfolio-stage">
                <div className="portfolio-main-image">
                  <img
                    src={p.cover}
                    alt={title}
                    loading="lazy"
                    width={1400}
                    height={900}
                    decoding="async"
                  />
                </div>
                {wide && preview && (
                  <div className="portfolio-detail-image">
                    <img
                      src={preview}
                      alt={
                        ar
                          ? `تطبيقات هوية ${title}`
                          : `${title} identity applications`
                      }
                      loading="lazy"
                      width={1400}
                      height={900}
                      decoding="async"
                    />
                    <span>
                      {ar ? "الهوية، في الاستخدام." : "Identity, in use."}
                    </span>
                  </div>
                )}
                <span className="portfolio-view">
                  {ar ? "استكشف المشروع" : "Explore project"}
                  <ArrowUpRight
                    size={16}
                    className={isRtl ? "-scale-x-100" : ""}
                  />
                </span>
              </div>
              <div className="portfolio-card-foot">
                <p>
                  {p.system?.[lang] ??
                    p.context?.[lang] ??
                    (ar
                      ? "شاهد تفاصيل المشروع وتطبيقاته."
                      : "Explore the project and its applications.")}
                </p>
                <span dir="ltr">
                  {p.pdfUrl ? "EDITORIAL DESIGN" : "BRAND IDENTITY"}
                </span>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

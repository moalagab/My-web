import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/content/projects";
import Picture from "@/components/Picture";

/**
 * Projects as large Folioblox cards: a rounded image that rises in, then the
 * name, the discipline and a "see the project" pill. The first card spans
 * the full width.
 */
export default function ProjectCards({ items }: { items: Project[] }) {
  const { lang, isRtl, dictionary } = useLanguage();
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  return (
    <ul className="project-cards">
      {items.map((p, i) => {
        const title = ar ? p.title_ar : p.title_en;
        return (
          <li key={p.slug} className={i === 0 ? "project-card project-card--wide" : "project-card"} data-reveal>
            <Link to={`${prefix}/work/${p.slug}`} className="project-card-media" tabIndex={-1} aria-hidden="true">
              <Picture
                src={p.cover}
                sizes={i === 0 ? "100vw" : "(min-width: 900px) 50vw, 100vw"}
                alt=""
                loading="lazy"
                width={1400}
                height={900}
                decoding="async"
              />
            </Link>
            <div className="project-card-body">
              <div>
                <h3>{title}</h3>
                <p>{p.discipline?.[lang] ?? dictionary.workPage.filters[p.serviceLine]}</p>
              </div>
              <Link to={`${prefix}/work/${p.slug}`} className="studio-text-link">
                {dictionary.servicesPage.caseCta}
                <span className="sr-only">: {title}</span>
                <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

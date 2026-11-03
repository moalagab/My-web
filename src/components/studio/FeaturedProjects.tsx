import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Project } from "@/content/projects";
import Picture from "@/components/Picture";
import ProjectMediaLink from "@/components/studio/ProjectMediaLink";

/**
 * Featured projects as Folioblox rows: a large rounded image beside a narrow
 * column with an accent rule, the name, a short description and a pill.
 * Rows alternate sides; each rises in as it reaches the screen.
 */
export default function FeaturedProjects({ items }: { items: Project[] }) {
  const { lang, isRtl, dictionary } = useLanguage();
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  return (
    <ul className="featured-rows">
      {items.map((p) => {
        const title = ar ? p.title_ar : p.title_en;
        const description = p.context?.[lang] ?? p.discipline?.[lang] ?? dictionary.workPage.filters[p.serviceLine];
        return (
          <li key={p.slug} className="featured-row" data-reveal>
            <ProjectMediaLink to={`${prefix}/work/${p.slug}`} className="featured-row-media">
              <Picture
                src={p.cover}
                sizes="(min-width: 900px) 62vw, 100vw"
                alt=""
                loading="lazy"
                width={1400}
                height={900}
                decoding="async"
              />
            </ProjectMediaLink>
            <div className="featured-row-body">
              <h3>{title}</h3>
              <p>{description}</p>
              <Link to={`${prefix}/work/${p.slug}`} viewTransition className="studio-text-link">
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

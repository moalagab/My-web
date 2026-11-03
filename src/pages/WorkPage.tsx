import { useState } from "react";
import PageMeta from "@/components/PageMeta";
import { Link } from "react-router";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ProjectCards from "@/components/studio/ProjectCards";
import PageHero from "@/components/studio/PageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import { orderedProjects, selectedIdentityProjects } from "@/content/projects";

type Filter = "selected" | "all" | "identities" | "profiles" | "marks";
export default function WorkPage() {
  const { lang, dictionary } = useLanguage();
  const ar = lang === "ar";
  const copy = dictionary.workPage;
  const prefix = ar ? "" : "/en";
  const [filter, setFilter] = useState<Filter>("selected");
  const filters: { id: Filter; ar: string; en: string }[] = [
    { id: "selected", ar: "مختارات الهويات", en: "Selected identities" },
    { id: "all", ar: "كل الأعمال", en: "All work" },
    { id: "identities", ar: "أنظمة الهوية", en: "Identity systems" },
    { id: "profiles", ar: "البروفايلات", en: "Company profiles" },
    { id: "marks", ar: "الشعارات", en: "Logofolio" },
  ];
  const visible =
    filter === "selected"
      ? selectedIdentityProjects
      : orderedProjects.filter(
          (p) =>
            filter === "all" ||
            (filter === "profiles"
              ? !!p.pdfUrl
              : filter === "marks"
                ? p.slug.startsWith("logofolio")
                : !p.pdfUrl && !p.slug.startsWith("logofolio")),
        );
  return (
    <>
      <PageMeta title={copy.metaTitle} description={copy.body} />
      <Navigation />
      <main className="work-page" id="main-content">
        <PageHero
          image={orderedProjects.find((p) => p.slug === "talia-bakery")?.cover}
          eyebrow="SELECTED WORK / THE IDENTITY COLLECTION"
          title={ar ? <>هويات تُرى.<br />وتُتذكّر.</> : <>Seen.<br />Remembered.</>}
          side={
            <>
              <p>
                {ar
                  ? "من الفكرة إلى الشعار، ومن الشعار إلى كل نقطة تواصل. مجموعة منتقاة تُظهر كيف تتحول العلامة إلى نظام بصري متماسك."
                  : "From idea to mark, from mark to every touchpoint. A curated collection showing how brands become coherent visual systems."}
              </p>
              <a
                href="https://www.behance.net/ma_alagab"
                target="_blank"
                rel="noreferrer"
                className="nav-pill folio-pill"
              >
                {ar ? "المعرض على Behance" : "Portfolio on Behance"}
                <ArrowUpRight size={16} />
              </a>
            </>
          }
        />
        <section className="portfolio-filter-section">
          <div className="studio-container">
            <div
              className="portfolio-filters"
              role="group"
              aria-label={ar ? "تصفية الأعمال" : "Filter work"}
            >
              {filters.map((f) => (
                <button
                  type="button"
                  key={f.id}
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {ar ? f.ar : f.en}
                </button>
              ))}
              <span role="status" aria-live="polite">
                {String(visible.length).padStart(2, "0")}{" "}
                {ar ? "مشاريع" : "projects"}
              </span>
            </div>
          </div>
        </section>
        <section
          className="studio-section portfolio-gallery"
          aria-labelledby="work-gallery-heading"
        >
          <div className="studio-container">
            <h2 id="work-gallery-heading" className="sr-only">
              {ar ? "معرض الأعمال" : "Work gallery"}
            </h2>
            <ProjectCards items={visible} />
          </div>
        </section>
        <section className="studio-cta">
          <div className="studio-container">
            <p className="studio-eyebrow">YOUR BRAND / NEXT CHAPTER</p>
            <h2>{copy.ctaTitle}</h2>
            <div>
              <p>{copy.ctaBody}</p>
              <Link to={`${prefix}/start?service=brand`} className="nav-pill nav-pill--solid">
                <span>{copy.ctaButton}</span>
                <span className="nav-pill-dot" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

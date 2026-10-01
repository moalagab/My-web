import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import WorkCollection from "@/components/studio/WorkCollection";
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
      <Helmet>
        <title>{copy.metaTitle}</title>
        <meta name="description" content={copy.body} />
        <link rel="canonical" href={`https://moalagab.art${prefix}/work`} />
        <link rel="alternate" hrefLang="ar" href="https://moalagab.art/work" />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://moalagab.art/en/work"
        />
      </Helmet>
      <Navigation />
      <main className="pt-20 work-page" id="main-content">
        <section className="portfolio-intro">
          <div className="studio-container">
            <p className="studio-eyebrow">
              SELECTED WORK / THE IDENTITY COLLECTION
            </p>
            <div className="portfolio-intro-grid">
              <h1>
                {ar ? (
                  <>
                    هويات تُرى.
                    <br />
                    <span>وتُتذكّر.</span>
                  </>
                ) : (
                  <>
                    Seen.
                    <br />
                    <span>Remembered.</span>
                  </>
                )}
              </h1>
              <div>
                <p>
                  {ar
                    ? "من الفكرة إلى الشعار، ومن الشعار إلى كل نقطة تواصل. مجموعة منتقاة تُظهر كيف تتحول العلامة إلى نظام بصري متماسك."
                    : "From idea to mark, from mark to every touchpoint. A curated collection showing how brands become coherent visual systems."}
                </p>
                <a
                  href="https://www.behance.net/ma_alagab"
                  target="_blank"
                  rel="noreferrer"
                  className="studio-text-link"
                >
                  {ar ? "المعرض على Behance" : "Portfolio on Behance"}
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
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
          aria-label={ar ? "معرض الأعمال" : "Work gallery"}
        >
          <div className="studio-container">
            <WorkCollection items={visible} />
          </div>
        </section>
        <section className="studio-cta">
          <div className="studio-container">
            <p className="studio-eyebrow">YOUR BRAND / NEXT CHAPTER</p>
            <h2>{copy.ctaTitle}</h2>
            <div>
              <p>{copy.ctaBody}</p>
              <Link
                className="studio-button studio-button-light"
                to={`${prefix}/start?service=brand`}
              >
                {copy.ctaButton}
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

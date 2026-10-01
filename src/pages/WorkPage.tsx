import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Eyebrow } from "@/components/system/Eyebrow";
import { Pill } from "@/components/system/Pill";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { projects, type ServiceLine } from "@/content/projects";

type Filter = "all" | ServiceLine;

const WorkPage = () => {
  const { lang, dictionary, isRtl } = useLanguage();
  const copy = dictionary.workPage;
  const prefix = lang === "en" ? "/en" : "";
  const arrowClass = isRtl ? "-scale-x-100" : "";
  const [filter, setFilter] = useState<Filter>("all");

  const availableLines = (
    ["brand", "digital", "ai", "experiential"] as ServiceLine[]
  ).filter((line) => projects.some((project) => project.serviceLine === line));
  const filters: Filter[] = ["all", ...availableLines];
  const visible =
    filter === "all"
      ? projects
      : projects.filter((project) => project.serviceLine === filter);

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
      <main className="pt-20 work-page">
        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="container max-w-content px-6">
            <Eyebrow className="text-primary-foreground/70">
              {copy.eyebrow}
            </Eyebrow>
            <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.15] md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/80">
              {copy.body}
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-background py-6">
          <div className="container max-w-content px-6">
            <h2 className="sr-only">{copy.filtersLabel}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                role="status"
                className="me-4 text-xs text-muted-foreground"
              >
                {visible.length} {lang === "ar" ? "مشاريع" : "projects"}
              </span>
              {filters.map((item) => {
                const active = filter === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setFilter(item)}
                    className={`eyebrow min-h-11 rounded-full border px-4 text-xs transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-secondary text-secondary-foreground hover:border-accent"
                    }`}
                  >
                    {copy.filters[item]}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <Section className="bg-background">
          <SectionInner>
            {visible.length === 0 ? (
              <p className="text-muted-foreground">{copy.empty}</p>
            ) : (
              <div data-reveal-stagger className="grid work-editorial-grid">
                {visible.map((project) => (
                  <Link
                    key={project.slug}
                    to={`${prefix}/work/${project.slug}`}
                    className="group block"
                  >
                    <div className="work-image overflow-hidden border border-border bg-secondary">
                      <img
                        src={project.cover}
                        alt={
                          lang === "ar" ? project.title_ar : project.title_en
                        }
                        loading="lazy"
                        width={800}
                        height={1000}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                      <div>
                        <Pill>{copy.filters[project.serviceLine]}</Pill>
                        <h3 className="mt-3 font-display text-xl font-bold">
                          {lang === "ar" ? project.title_ar : project.title_en}
                        </h3>
                      </div>
                      <ArrowUpRight
                        className={`mt-1 h-5 w-5 shrink-0 text-accent ${arrowClass}`}
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </SectionInner>
        </Section>

        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="container max-w-content px-6 text-center">
            <h2 className="mx-auto max-w-3xl text-balance font-display text-3xl font-bold md:text-5xl">
              {copy.ctaTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/75">
              {copy.ctaBody}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to={`${prefix}/start`}>
                {copy.ctaButton}
                <ArrowUpRight className={arrowClass} />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default WorkPage;

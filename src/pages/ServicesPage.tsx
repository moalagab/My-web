import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Eyebrow } from "@/components/system/Eyebrow";
import { Pill } from "@/components/system/Pill";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { projects, type ServiceLine } from "@/content/projects";

const ServicesPage = () => {
  const { lang, dictionary, isRtl } = useLanguage();
  const copy = dictionary.servicesPage;
  const prefix = lang === "en" ? "/en" : "";
  const arrowClass = isRtl ? "-scale-x-100" : "";

  return (
    <>
      <Helmet>
        <title>{copy.metaTitle}</title>
        <meta name="description" content={copy.metaDescription} />
        <link rel="canonical" href={`https://moalagab.art${prefix}/services`} />
        <link
          rel="alternate"
          hrefLang="ar"
          href="https://moalagab.art/services"
        />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://moalagab.art/en/services"
        />
      </Helmet>
      <Navigation />
      <main className="pt-20 services-page">
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
            <nav
              aria-label={copy.packagesLabel}
              className="mt-10 flex flex-wrap gap-2"
            >
              {copy.lines.map((line) => (
                <a
                  key={line.slug}
                  href={`#${line.slug}`}
                  className="eyebrow inline-flex min-h-11 items-center rounded-full border border-primary-foreground/30 px-4 text-xs text-primary-foreground/85 transition-colors hover:border-primary-foreground"
                  dir="ltr"
                >
                  {line.title}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {copy.lines.map((line, index) => {
          const caseStudy = projects.find(
            (project) => project.serviceLine === (line.slug as ServiceLine),
          );
          return (
            <Section
              key={line.slug}
              id={line.slug}
              className={`scroll-mt-24 border-b border-border ${index % 2 === 1 ? "bg-card" : "bg-background"}`}
            >
              <SectionInner>
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
                  <div className="service-info">
                    <Eyebrow>{`0${index + 1} / ${line.role}`}</Eyebrow>
                    <h2
                      className="mt-5 font-display text-3xl font-bold md:text-5xl"
                      dir="ltr"
                    >
                      {line.title}
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                      {line.what}
                    </p>
                    <div className="mt-8">
                      <Eyebrow className="text-muted-foreground">
                        {copy.whoLabel}
                      </Eyebrow>
                      <p className="mt-3 leading-7">{line.who}</p>
                    </div>
                    <div className="mt-8">
                      <Eyebrow className="text-muted-foreground">
                        {copy.deliverablesLabel}
                      </Eyebrow>
                      <ul className="mt-4 space-y-3">
                        {line.deliverables.map((item) => (
                          <li key={item} className="flex gap-3 leading-7">
                            <Check
                              className="mt-1.5 h-4 w-4 shrink-0 text-accent"
                              aria-hidden="true"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-8 border-s-2 border-border ps-4">
                      <Eyebrow className="text-muted-foreground">
                        {copy.notIncludedLabel}
                      </Eyebrow>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {line.notIncluded}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Eyebrow className="text-muted-foreground">
                      {copy.packagesLabel}
                    </Eyebrow>
                    <div
                      data-reveal-stagger
                      className="mt-5 grid gap-4 sm:grid-cols-2"
                    >
                      {line.packages.map((pack) => (
                        <article key={pack.name} className="package-card">
                          <h3
                            className="font-display text-xl font-bold"
                            dir="ltr"
                          >
                            {pack.name}
                          </h3>
                          <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            {pack.scope}
                          </p>
                          <dl className="mt-5 space-y-3 text-sm">
                            <div>
                              <dt className="eyebrow text-xs text-muted-foreground">
                                {copy.timelineLabel}
                              </dt>
                              <dd
                                className="mt-1 font-mono text-accent"
                                dir="ltr"
                              >
                                {pack.timeline}
                              </dd>
                            </div>
                            <div>
                              <dt className="eyebrow text-xs text-muted-foreground">
                                {copy.fitLabel}
                              </dt>
                              <dd className="mt-1 leading-6">{pack.fit}</dd>
                            </div>
                          </dl>
                          <Button
                            asChild
                            variant="outline"
                            className="mt-6 w-full"
                          >
                            <Link
                              to={`${prefix}/start?service=${line.slug}&package=${encodeURIComponent(pack.name)}`}
                            >
                              {copy.packageCta}
                              <ArrowUpRight className={arrowClass} />
                            </Link>
                          </Button>
                        </article>
                      ))}
                    </div>

                    {caseStudy ? (
                      <div className="mt-10">
                        <Eyebrow className="text-muted-foreground">
                          {copy.caseEyebrow}
                        </Eyebrow>
                        <Link
                          to={`${prefix}/work/${caseStudy.slug}`}
                          className="group mt-4 flex flex-col gap-5 border border-border bg-background p-5 sm:flex-row sm:items-center"
                        >
                          <div className="aspect-[4/3] w-full shrink-0 overflow-hidden border border-border bg-secondary sm:w-40">
                            <img
                              src={caseStudy.cover}
                              alt={
                                lang === "ar"
                                  ? caseStudy.title_ar
                                  : caseStudy.title_en
                              }
                              loading="lazy"
                              width={800}
                              height={1000}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="min-w-0">
                            <Pill>{copy.caseLabel}</Pill>
                            <h3 className="mt-3 font-display text-xl font-bold">
                              {lang === "ar"
                                ? caseStudy.title_ar
                                : caseStudy.title_en}
                            </h3>
                            <span className="eyebrow mt-3 inline-flex items-center gap-2 text-xs text-accent">
                              {copy.caseCta}
                              <ArrowUpRight
                                className={`h-4 w-4 ${arrowClass}`}
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </SectionInner>
            </Section>
          );
        })}

        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="container max-w-content px-6 text-center">
            <h2 className="mx-auto max-w-3xl text-balance font-display text-3xl font-bold md:text-5xl">
              {dictionary.home.finalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/75">
              {dictionary.home.finalCta.body}
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to={`${prefix}/start`}>
                {dictionary.home.finalCta.button}
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

export default ServicesPage;

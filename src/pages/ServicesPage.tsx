import PageMeta from "@/components/PageMeta";
import { Link } from "react-router";
import { ArrowUpRight, Check } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { projects, type ServiceLine } from "@/content/projects";
import PageHero from "@/components/studio/PageHero";
import FeaturedProjects from "@/components/studio/FeaturedProjects";

const ServicesPage = () => {
  const { lang, dictionary, isRtl } = useLanguage();
  const copy = dictionary.servicesPage;
  const prefix = lang === "en" ? "/en" : "";
  const arrowClass = isRtl ? "-scale-x-100" : "";

  return (
    <>
      <PageMeta title={copy.metaTitle} description={copy.metaDescription} />
      <Navigation />
      <main className="services-page">
        <PageHero
          image={projects.find((p) => p.slug === "gyptech-brand")?.cover}
          eyebrow={copy.eyebrow}
          title={<span dir="ltr">{copy.title}</span>}
          side={<p>{copy.body}</p>}
          actions={
            <nav aria-label={copy.packagesLabel} className="folio-chips">
              {copy.lines.map((line) => (
                <a key={line.slug} href={`#${line.slug}`} dir="ltr">
                  {line.title}
                </a>
              ))}
            </nav>
          }
        />

        {copy.lines.map((line, index) => {
          const caseStudy = projects.find(
            (project) => project.serviceLine === (line.slug as ServiceLine),
          );
          return (
            <section
              key={line.slug}
              id={line.slug}
              className={`studio-section service-line scroll-mt-24 ${index % 2 === 1 ? "service-line--tint" : ""}`}
            >
              <div className="studio-container">
                <div className="section-heading">
                  <div>
                    <p className="studio-eyebrow" dir="ltr">{`0${index + 1} / ${line.role}`}</p>
                    <h2>
                      <span dir="ltr">{line.title}</span>
                    </h2>
                  </div>
                  <div className="section-side">
                    <p className="section-intro">{line.tagline}</p>
                    <p className="service-line-what">{line.what}</p>
                    <Link to={`${prefix}/services/${line.slug}`} className="studio-text-link">
                      {copy.detailCta}
                      <ArrowUpRight size={18} className={arrowClass} />
                    </Link>
                  </div>
                </div>

                <div className="service-line-facts" data-reveal>
                  <div>
                    <h3>{copy.whoLabel}</h3>
                    <p>{line.who}</p>
                  </div>
                  <div>
                    <h3>{copy.deliverablesLabel}</h3>
                    <ul>
                      {line.deliverables.map((item) => (
                        <li key={item}>
                          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>{copy.notIncludedLabel}</h3>
                    <p>{line.notIncluded}</p>
                  </div>
                </div>

                <h3 className="service-line-subhead">{copy.packagesLabel}</h3>
                <ul className="pkg-cards">
                  {line.packages.map((pack) => (
                    <li key={pack.name} className="pkg-card" data-reveal>
                      <h4>
                        <span dir="ltr">{pack.name}</span>
                      </h4>
                      <p>{pack.scope}</p>
                      <dl>
                        <div>
                          <dt>{copy.timelineLabel}</dt>
                          <dd dir="ltr">{pack.timeline}</dd>
                        </div>
                        <div>
                          <dt>{copy.fitLabel}</dt>
                          <dd>{pack.fit}</dd>
                        </div>
                      </dl>
                      <Link
                        to={`${prefix}/start?service=${line.slug}&package=${encodeURIComponent(pack.name)}`}
                        className="studio-text-link"
                      >
                        {copy.packageCta}
                        <ArrowUpRight size={18} className={arrowClass} />
                      </Link>
                    </li>
                  ))}
                </ul>

                {caseStudy ? (
                  <div className="service-line-case">
                    <p className="studio-eyebrow">{copy.caseEyebrow}</p>
                    <FeaturedProjects items={[caseStudy]} />
                  </div>
                ) : null}
              </div>
            </section>
          );
        })}

        <section className="studio-section">
          <div className="studio-container">
            <div className="folio-cta" data-reveal>
              <h2>{dictionary.home.finalCta.title}</h2>
              <p>{dictionary.home.finalCta.body}</p>
              <Link to={`${prefix}/start`} className="nav-pill nav-pill--solid">
                <span>{dictionary.home.finalCta.button}</span>
                <span className="nav-pill-dot" aria-hidden="true">
                  <ArrowUpRight size={18} className={arrowClass} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default ServicesPage;

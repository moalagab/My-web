import PageMeta from "@/components/PageMeta";
import { Link } from "react-router";
import { ArrowUpRight, Check } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { projects, type ServiceLine } from "@/content/projects";
import PageHero from "@/components/studio/PageHero";
import FeaturedProjects from "@/components/studio/FeaturedProjects";
import Picture from "@/components/Picture";

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
          image="/work/media/mono-spheres.webp"
          eyebrow={copy.eyebrow}
          title={<span dir="ltr">{copy.title}</span>}
          side={<p>{copy.body}</p>}
        />

        {/* The four lines as a picture index; each tile jumps to its section below. */}
        <section className="studio-section svc-index-section" aria-label={copy.packagesLabel}>
          <div className="studio-container">
            <ul className="svc-index">
              {copy.lines.map((line, index) => (
                <li key={line.slug} data-reveal>
                  <a href={`#${line.slug}`} className="svc-tile">
                    <span className="svc-tile-media" aria-hidden="true">
                      <Picture src={`/work/media/service-${line.slug}.webp`} sizes="(min-width: 900px) 25vw, 50vw" alt="" loading="lazy" decoding="async" width={1600} height={1200} />
                    </span>
                    <span className="svc-tile-number" dir="ltr">0{index + 1}</span>
                    <span className="svc-tile-title" dir="ltr">{line.title}</span>
                    <span className="svc-tile-role" dir="ltr">{line.role}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {copy.lines.map((line, index) => {
          const caseStudy = projects.find(
            (project) => project.serviceLine === (line.slug as ServiceLine),
          );
          return (
            <section
              key={line.slug}
              id={line.slug}
              className={`studio-section svc-line scroll-mt-24 ${index % 2 === 1 ? "service-line--tint" : ""}`}
            >
              <div className="studio-container svc-line-grid">
                <div className="svc-line-media" aria-hidden="true">
                  <Picture src={`/work/media/service-${line.slug}.webp`} sizes="(min-width: 900px) 45vw, 100vw" alt="" loading="lazy" decoding="async" width={1600} height={1200} />
                  <span className="svc-line-index" dir="ltr">0{index + 1}</span>
                </div>
                <div className="svc-line-body">
                  <p className="studio-eyebrow" dir="ltr">{line.role}</p>
                  <h2>
                    <span dir="ltr">{line.title}</span>
                  </h2>
                  <p className="svc-line-tagline">{line.tagline}</p>
                  <p className="svc-line-what">{line.what}</p>
                  <dl className="svc-facts">
                    <div>
                      <dt>{copy.whoLabel}</dt>
                      <dd>{line.who}</dd>
                    </div>
                    <div>
                      <dt>{copy.deliverablesLabel}</dt>
                      <dd>
                        <ul>
                          {line.deliverables.map((item) => (
                            <li key={item}>
                              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div>
                      <dt>{copy.notIncludedLabel}</dt>
                      <dd>{line.notIncluded}</dd>
                    </div>
                  </dl>
                  <Link to={`${prefix}/services/${line.slug}`} viewTransition className="studio-text-link">
                    {copy.detailCta}
                    <ArrowUpRight size={18} className={arrowClass} />
                  </Link>
                </div>
              </div>

              <div className="studio-container">
                <h3 className="service-line-subhead">{copy.packagesLabel}</h3>
                <ul className="pkg-cards">
                  {line.packages.map((pack, p) => (
                    <li key={pack.name} className="pkg-card" data-reveal>
                      <span className="pkg-card-index" dir="ltr">{`0${index + 1}.${p + 1}`}</span>
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
              <Link to={`${prefix}/start`} viewTransition className="nav-pill nav-pill--solid">
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

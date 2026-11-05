import { Link, Navigate, useParams } from "react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import BuyerQuestions from "@/components/studio/BuyerQuestions";
import PageHero from "@/components/studio/PageHero";
import FeaturedProjects from "@/components/studio/FeaturedProjects";
import { useLanguage } from "@/contexts/LanguageContext";
import { showcaseFor, type ServiceLine } from "@/content/projects";
import { faqJsonLd, serviceAnswers, serviceJsonLd } from "@/lib/answers";
import { useWhatsapp } from "@/lib/whatsapp";

const SITE = "https://moalagab.art";

/** One service line, written as answers to the questions a buyer asks first. */
export default function ServiceLinePage() {
  const { slug } = useParams();
  const { lang, dictionary: d, isRtl } = useLanguage();
  const whatsapp = useWhatsapp();
  const copy = d.servicesPage;
  const line = copy.lines.find((item) => item.slug === slug);
  const prefix = lang === "en" ? "/en" : "";
  const arrowClass = isRtl ? "-scale-x-100" : "";

  if (!line) return <Navigate to={`${prefix}/services`} replace />;

  const seo = copy.lineSeo[line.slug as keyof typeof copy.lineSeo];
  const answers = serviceAnswers(line, d);
  const work = showcaseFor(line.slug as ServiceLine);
  const url = `${SITE}${prefix}/services/${line.slug}`;

  return (
    <>
      <PageMeta title={seo.seoTitle} description={seo.description} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            serviceJsonLd(line, seo.heading, url, lang),
            faqJsonLd(answers),
          ]),
        }}
      />
      <Navigation />
      <main>
        <PageHero
          image={`/work/media/service-${line.slug}.webp`}
          eyebrow={<span dir="ltr">{line.title}</span>}
          title={seo.heading}
          side={<p>{line.what}</p>}
          actions={
            <div className="folio-actions">
              <Link to={`${prefix}/start?service=${line.slug}`} className="nav-pill folio-pill">
                {d.home.finalCta.button}
                <ArrowUpRight size={16} className={arrowClass} />
              </Link>
              <a
                href={whatsapp.href}
                target="_blank"
                rel="noreferrer"
                onClick={() => whatsapp.onClick("service_hero")}
                className="nav-pill nav-pill--outline"
              >
                <MessageCircle size={16} aria-hidden="true" />
                {d.ui.whatsapp.button}
              </a>
            </div>
          }
        />

        <div className="container max-w-content px-6 pt-8">
          <Breadcrumbs
            customItems={[
              { key: "services", path: "/services" },
              { label: line.title, path: `/services/${line.slug}` },
            ]}
          />
        </div>

        <section className="studio-section">
          <BuyerQuestions
            answers={answers}
            aside={
              <>
                <p className="studio-eyebrow">{copy.askEyebrow}</p>
                <h2>
                  <span dir="ltr">{line.title}</span>
                </h2>
                <p className="section-intro">{line.tagline}</p>
              </>
            }
          />
        </section>

        {work.length > 0 && (
          <section className="studio-section service-line--tint">
            <div className="studio-container">
              <div className="section-heading">
                <div>
                  <p className="studio-eyebrow">{copy.relatedWork}</p>
                </div>
              </div>
              <FeaturedProjects items={work} />
            </div>
          </section>
        )}

        <section className="studio-section">
          <div className="studio-container">
            <div className="folio-cta" data-reveal>
              <h2>{d.home.finalCta.title}</h2>
              <p>{d.home.finalCta.body}</p>
              <div className="folio-actions">
                <Link to={`${prefix}/start?service=${line.slug}`} className="nav-pill nav-pill--solid">
                  <span>{d.home.finalCta.button}</span>
                  <span className="nav-pill-dot" aria-hidden="true">
                    <ArrowUpRight size={18} className={arrowClass} />
                  </span>
                </Link>
                <Link to={`${prefix}/services`} className="nav-pill nav-pill--outline">
                  {copy.allServices}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

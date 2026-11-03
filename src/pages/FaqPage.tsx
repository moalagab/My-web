import { Link } from "react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import PageHero from "@/components/studio/PageHero";
import { useLanguage } from "@/contexts/LanguageContext";
import { faqGroups, faqJsonLd } from "@/lib/answers";
import { useWhatsapp } from "@/lib/whatsapp";

export default function FaqPage() {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const whatsapp = useWhatsapp();
  const copy = d.faqPage;
  const groups = faqGroups(d);
  const prefix = lang === "en" ? "/en" : "";
  let n = 0;

  return (
    <>
      <PageMeta title={copy.metaTitle} description={copy.metaDescription} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(groups.flatMap((g) => g.items))),
        }}
      />
      <Navigation />
      <main>
        <PageHero compact eyebrow={copy.eyebrow} title={copy.title} side={<p>{copy.intro}</p>} />

        {groups.map((group, g) => (
          <section key={group.label} className={`studio-section ${g % 2 === 1 ? "service-line--tint" : ""}`} aria-labelledby={`group-${g}`}>
            <div className="studio-container">
              <div className="section-heading">
                <div>
                  <h2 id={`group-${g}`}>{group.label}</h2>
                </div>
              </div>
              <div className="case-rows">
                {group.items.map((qa) => {
                  n += 1;
                  return (
                    <section key={qa.q} className="case-row" aria-labelledby={`faq-${n}`} data-reveal>
                      <h3 id={`faq-${n}`}>{qa.q}</h3>
                      <div>
                        {qa.a && <p>{qa.a}</p>}
                        {qa.list && (
                          <ul className="case-row-list">
                            {qa.list.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          </section>
        ))}

        <section className="studio-section">
          <div className="studio-container">
            <div className="folio-cta" data-reveal>
              <h2>{copy.ctaTitle}</h2>
              <p>{copy.ctaBody}</p>
              <div className="folio-actions">
                <Link to={`${prefix}/start`} className="nav-pill nav-pill--solid">
                  <span>{d.home.finalCta.button}</span>
                  <span className="nav-pill-dot" aria-hidden="true">
                    <ArrowUpRight size={18} className={isRtl ? "-scale-x-100" : ""} />
                  </span>
                </Link>
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => whatsapp.onClick("faq")}
                  className="nav-pill nav-pill--outline"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  {d.ui.whatsapp.button}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

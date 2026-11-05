import PageMeta from "@/components/PageMeta";
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { track } from '@/lib/analytics';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import PageHero from '@/components/studio/PageHero';
import { useLanguage } from '@/contexts/LanguageContext';
import { siteSettings } from '@/lib/site-content';

const PrivacyPage = () => {
  const { lang, dictionary } = useLanguage();
  const copy = dictionary.privacyPage;
  const prefix = lang === 'en' ? '/en' : '';

  return (
    <>
      <PageMeta title={copy.metaTitle} description={copy.metaDescription} />
      <Navigation />
      <main>
        <PageHero compact eyebrow={copy.eyebrow} title={copy.title} side={<p>{copy.intro}</p>} />

        <section className="studio-section">
          <div className="studio-container">
            <div className="case-rows">
              {copy.sections.map((section) => (
                <article key={section.title} className="case-row" data-reveal>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="studio-section">
          <div className="studio-container">
            <div className="folio-cta" data-reveal>
              <h2>{copy.contactLabel}</h2>
              <a href={`mailto:${siteSettings.email}`} className="folio-cta-mail" dir="ltr">
                {siteSettings.email}
              </a>
              <p>{copy.updated}</p>
              <Link
                to={lang === 'en' ? '/en/start' : '/start'}
                className="nav-pill nav-pill--solid"
                onClick={() => track('cta_start_click', { location: 'privacy' })}
              >
                <span>{dictionary.home.finalCta.button}</span>
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
};

export default PrivacyPage;

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { Eyebrow } from '@/components/system/Eyebrow';
import { Section, SectionInner } from '@/components/system/Section';
import { useLanguage } from '@/contexts/LanguageContext';
import { siteSettings } from '@/lib/site-content';

const PrivacyPage = () => {
  const { lang, dictionary } = useLanguage();
  const copy = dictionary.privacyPage;
  const prefix = lang === 'en' ? '/en' : '';

  return (
    <>
      <Helmet>
        <title>{copy.metaTitle}</title>
        <meta name="description" content={copy.metaDescription} />
        <link rel="canonical" href={`https://moalagab.art${prefix}/privacy`} />
        <link rel="alternate" hrefLang="ar" href="https://moalagab.art/privacy" />
        <link rel="alternate" hrefLang="en" href="https://moalagab.art/en/privacy" />
      </Helmet>
      <Navigation />
      <main className="pt-20">
        <section className="bg-primary py-14 text-primary-foreground md:py-20">
          <SectionInner>
            <Eyebrow className="text-primary-foreground/70">{copy.eyebrow}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-primary-foreground/80">{copy.intro}</p>
          </SectionInner>
        </section>

        <Section className="bg-background">
          <SectionInner className="max-w-3xl">
            <div className="space-y-10">
              {copy.sections.map((section) => (
                <article key={section.title}>
                  <h2 className="font-display text-2xl">{section.title}</h2>
                  <p className="mt-3 leading-8 text-muted-foreground">{section.body}</p>
                </article>
              ))}
            </div>

            <div className="mt-12 border-t border-border pt-8">
              <Eyebrow>{copy.contactLabel}</Eyebrow>
              <a href={`mailto:${siteSettings.email}`} className="mt-3 inline-block text-lg text-accent underline underline-offset-4" dir="ltr">
                {siteSettings.email}
              </a>
              <p className="eyebrow mt-6 text-xs text-muted-foreground">{copy.updated}</p>
              <Button asChild className="mt-8" onClick={() => track('cta_start_click', { location: 'privacy' })}>
                <Link to={lang === 'en' ? '/en/start' : '/start'}>{dictionary.home.finalCta.button}</Link>
              </Button>
            </div>
          </SectionInner>
        </Section>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPage;

import PageMeta from "@/components/PageMeta";
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import PageHero from '@/components/studio/PageHero';
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
      <PageMeta title={copy.metaTitle} description={copy.metaDescription} />
      <Navigation />
      <main>
        <PageHero compact eyebrow={copy.eyebrow} title={copy.title} side={<p>{copy.intro}</p>} />

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

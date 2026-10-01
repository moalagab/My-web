import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Footer from '@/components/Footer';
import Navigation from '@/components/Navigation';
import { Eyebrow } from '@/components/system/Eyebrow';
import { Pill } from '@/components/system/Pill';
import { Section, SectionInner } from '@/components/system/Section';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import portraitImage from '@/assets/portrait-mo.webp';

const AboutPage = () => {
  const { lang, dictionary, isRtl } = useLanguage();
  const copy = dictionary.aboutPage;
  const prefix = lang === 'en' ? '/en' : '';
  const arrowClass = isRtl ? '-scale-x-100' : '';

  return (
    <>
      <Helmet>
        <title>{copy.metaTitle}</title>
        <meta name="description" content={copy.metaDescription} />
        <link rel="canonical" href={`https://moalagab.art${prefix}/about`} />
        <link rel="alternate" hrefLang="ar" href="https://moalagab.art/about" />
        <link rel="alternate" hrefLang="en" href="https://moalagab.art/en/about" />
      </Helmet>
      <Navigation />
      <main className="pt-20">
        {/* Hero — portrait + H1 */}
        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <SectionInner className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <Eyebrow className="text-primary-foreground/70">{copy.eyebrow}</Eyebrow>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] md:text-6xl">
                {copy.name}
                <span className="mt-3 block font-display text-xl font-normal text-primary-foreground/75 md:text-2xl">
                  {copy.descriptor}
                </span>
              </h1>
            </div>
            <div className="aspect-[4/5] w-full max-w-sm overflow-hidden border border-primary-foreground/20 bg-primary-foreground/5">
              <img
                src={portraitImage}
                alt={copy.portraitAlt}
                width={800}
                height={1000}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </SectionInner>
        </section>

        {/* Story — 4 short paragraphs */}
        <Section className="bg-background">
          <SectionInner className="max-w-2xl">
            <Eyebrow>{copy.storyEyebrow}</Eyebrow>
            <div className="mt-8 space-y-6">
              {copy.story.map((para, i) => (
                <p
                  key={i}
                  className={
                    i === 2
                      ? 'border-s-2 border-accent ps-5 text-lg font-medium leading-9 text-foreground'
                      : 'text-lg leading-9 text-muted-foreground'
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </SectionInner>
        </Section>

        {/* Principles — 4 cards */}
        <Section className="border-t border-border bg-card">
          <SectionInner>
            <Eyebrow>{copy.principlesEyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">{copy.principlesTitle}</h2>
            <div data-reveal-stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {copy.principles.map((p, i) => (
                <article key={i} className="flex flex-col border border-border bg-background p-6">
                  <span className="font-mono text-xs text-accent">{`0${i + 1}`}</span>
                  <h3 className="mt-3 font-display text-lg font-bold leading-snug">{p.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{p.body}</p>
                </article>
              ))}
            </div>
          </SectionInner>
        </Section>

        {/* Timeline — vertical, mono years */}
        <Section className="border-t border-border bg-background">
          <SectionInner>
            <Eyebrow>{copy.timelineEyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">{copy.timelineTitle}</h2>
            <ol className="mt-10 border-s border-border ps-8">
              {copy.timeline.map((item, i) => (
                <li key={i} className="relative pb-10 last:pb-0">
                  <span
                    className="absolute -start-[2.1rem] top-1 h-3 w-3 rounded-full border-2 border-accent bg-background"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-mono text-sm text-accent" dir="ltr">
                      {item.year}
                    </span>
                    <h3 className="font-display text-lg font-bold" dir="ltr">
                      {item.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span dir="ltr">{item.role}</span>
                    {item.place !== '—' && item.place !== '—' && (
                      <>
                        <span className="mx-2 text-border">·</span>
                        {item.place}
                      </>
                    )}
                  </p>
                  <p className="mt-2 max-w-xl leading-7 text-muted-foreground">{item.body}</p>
                </li>
              ))}
            </ol>
          </SectionInner>
        </Section>

        {/* Tools strip — mono pills */}
        <Section className="border-t border-border bg-card">
          <SectionInner>
            <Eyebrow>{copy.toolsEyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold md:text-4xl">{copy.toolsTitle}</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {copy.tools.map((tool) => (
                <Pill key={tool} className="font-mono">
                  {tool}
                </Pill>
              ))}
            </div>
          </SectionInner>
        </Section>

        {/* Final CTA */}
        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <SectionInner className="text-center">
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
          </SectionInner>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AboutPage;

import { Link, Navigate, useParams } from "react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Picture from "@/components/Picture";
import { Eyebrow } from "@/components/system/Eyebrow";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { projects, type ServiceLine } from "@/content/projects";
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
  const work = projects.filter((p) => p.serviceLine === (line.slug as ServiceLine)).slice(0, 3);
  const url = `${SITE}${prefix}/services/${line.slug}`;

  return (
    <>
      <PageMeta title={seo.seoTitle} description={line.what} />
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
      <main className="pt-20">
        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="container max-w-content px-6">
            <Eyebrow className="text-primary-foreground/80">
              <span dir="ltr">{line.title}</span>
            </Eyebrow>
            <h1 className="mt-6 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.15] md:text-6xl">
              {seo.heading}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/85">
              {line.what}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to={`${prefix}/start?service=${line.slug}`}>
                  {d.home.finalCta.button}
                  <ArrowUpRight className={arrowClass} />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => whatsapp.onClick("service_hero")}
                >
                  <MessageCircle aria-hidden="true" />
                  {d.ui.whatsapp.button}
                </a>
              </Button>
            </div>
          </div>
        </section>

        <div className="container max-w-content px-6 pt-8">
          <Breadcrumbs
            customItems={[
              { key: "services", path: "/services" },
              { label: line.title, path: `/services/${line.slug}` },
            ]}
          />
        </div>

        <Section className="bg-background">
          <SectionInner className="max-w-3xl">
            <Eyebrow>{copy.askEyebrow}</Eyebrow>
            <div className="mt-8 space-y-12">
              {answers.map((qa, i) => (
                <section key={qa.q} aria-labelledby={`q-${i}`}>
                  <h2
                    id={`q-${i}`}
                    className="font-display text-2xl font-bold md:text-3xl"
                  >
                    {qa.q}
                  </h2>
                  {qa.a && <p className="mt-4 text-lg leading-8 text-muted-foreground">{qa.a}</p>}
                  {qa.list && (
                    <ul className="mt-4 space-y-3 text-lg leading-8 text-muted-foreground">
                      {qa.list.map((item) => (
                        <li key={item} className="border-s-2 border-border ps-4">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </SectionInner>
        </Section>

        {work.length > 0 && (
          <Section className="border-t border-border bg-card">
            <SectionInner>
              <Eyebrow>{copy.relatedWork}</Eyebrow>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {work.map((p) => {
                  const title = lang === "ar" ? p.title_ar : p.title_en;
                  return (
                    <Link
                      key={p.slug}
                      to={`${prefix}/work/${p.slug}`}
                      className="group block border border-border bg-background"
                    >
                      <div className="aspect-[4/3] overflow-hidden bg-secondary">
                        <Picture
                          src={p.cover}
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          alt=""
                          loading="lazy"
                          width={800}
                          height={600}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                      <h3 className="flex items-center justify-between gap-3 p-5 font-display text-xl font-bold">
                        {title}
                        <ArrowUpRight className={`h-5 w-5 shrink-0 ${arrowClass}`} aria-hidden="true" />
                      </h3>
                    </Link>
                  );
                })}
              </div>
            </SectionInner>
          </Section>
        )}

        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="container max-w-content px-6 text-center">
            <h2 className="mx-auto max-w-3xl text-balance font-display text-3xl font-bold md:text-5xl">
              {d.home.finalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/85">
              {d.home.finalCta.body}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to={`${prefix}/start?service=${line.slug}`}>
                  {d.home.finalCta.button}
                  <ArrowUpRight className={arrowClass} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to={`${prefix}/services`}>{copy.allServices}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

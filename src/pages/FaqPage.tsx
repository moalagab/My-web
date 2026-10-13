import { Link } from "react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import PageMeta from "@/components/PageMeta";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Eyebrow } from "@/components/system/Eyebrow";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
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
      <main className="pt-20">
        <section className="bg-primary py-14 text-primary-foreground md:py-20">
          <SectionInner>
            <Eyebrow className="text-primary-foreground/80">{copy.eyebrow}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl md:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-primary-foreground/85">
              {copy.intro}
            </p>
          </SectionInner>
        </section>

        <Section className="bg-background">
          <SectionInner className="max-w-3xl space-y-16">
            {groups.map((group, g) => (
              <section key={group.label} aria-labelledby={`group-${g}`}>
                <h2 id={`group-${g}`} className="eyebrow text-sm text-accent">
                  {group.label}
                </h2>
                <div className="mt-6 space-y-10">
                  {group.items.map((qa) => {
                    n += 1;
                    return (
                      <section key={qa.q} aria-labelledby={`faq-${n}`}>
                        <h3 id={`faq-${n}`} className="font-display text-2xl font-bold">
                          {qa.q}
                        </h3>
                        {qa.a && <p className="mt-3 leading-8 text-muted-foreground">{qa.a}</p>}
                        {qa.list && (
                          <ul className="mt-3 space-y-2 leading-8 text-muted-foreground">
                            {qa.list.map((item) => (
                              <li key={item} className="border-s-2 border-border ps-4">
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    );
                  })}
                </div>
              </section>
            ))}

            <div className="border-t border-border pt-10">
              <h2 className="font-display text-2xl font-bold">{copy.ctaTitle}</h2>
              <p className="mt-3 leading-8 text-muted-foreground">{copy.ctaBody}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to={`${prefix}/start`}>
                    {d.home.finalCta.button}
                    <ArrowUpRight className={isRtl ? "-scale-x-100" : ""} />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={whatsapp.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => whatsapp.onClick("faq")}
                  >
                    <MessageCircle aria-hidden="true" />
                    {d.ui.whatsapp.button}
                  </a>
                </Button>
              </div>
            </div>
          </SectionInner>
        </Section>
      </main>
      <Footer />
    </>
  );
}

import {
  ArrowUpRight,
  Quote,
} from "lucide-react";
import PageMeta from "@/components/PageMeta";
import { Link } from "react-router";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroPortrait from "@/assets/portrait-mo-unified.webp";
import ProductVisual from "@/components/studio/ProductVisual";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { orderedProjects, selectedIdentityProjects } from "@/content/projects";
import FeaturedProjects from "@/components/studio/FeaturedProjects";
import ProofStrip from "@/components/studio/ProofStrip";
import StepRows from "@/components/studio/StepRows";
import CurvedGallery from "@/components/studio/CurvedGallery";
import ClientMarquee from "@/components/studio/ClientMarquee";
import { track } from "@/lib/analytics";
import portrait from "@/assets/portrait-mo.webp";
import Picture from "@/components/Picture";

export default function HomePage() {
  const { lang, dictionary, isRtl } = useLanguage();
  const h = dictionary.home;
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  const title = ar
    ? ["أصمّم ما يُرى.", "وأبني ما يعمل."]
    : ["I design what’s seen.", "I build what works."];
  const selected = selectedIdentityProjects.slice(0, 6);
  const aboutWork = ["ekka-rebranding", "sabaa-construction"]
    .map((slug) => orderedProjects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const arrow = isRtl ? "-scale-x-100" : "";
  return (
    <>
      <PageMeta
        title={
          ar
            ? "محمد العجب — تصميم العلامات وبناء المنتجات"
            : "Mo Alagab — Brand Design & Digital Products"
        }
        description={h.hero.body}
      />
      <Navigation />
      <main id="main-content" className="studio-home">
        <section className="folio-hero">
          <div className="folio-hero-media" aria-hidden="true">
            <Picture src={heroPortrait} sizes="100vw" alt="" fetchPriority="high" decoding="async" />
          </div>
          {/* The construction grid behind the page: it draws once on arrival, then stays as a faint guide. */}
          <div className="hero-grid studio-container" aria-hidden="true">
            {Array.from({ length: 13 }, (_, i) => (
              <span key={i} style={{ "--i": i } as React.CSSProperties} />
            ))}
            <i />
            <i />
            <i />
          </div>
          <div className="studio-container folio-hero-inner">
            <div className="folio-hero-head">
              <div>
                <p className="folio-eyebrow">{ar ? "محمد العجب —" : "Mohammed Alagab —"}</p>
                <h1 className="folio-title">
                  {title.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </h1>
              </div>
              <div className="folio-hero-side">
                <p>{h.hero.body}</p>
                <Link
                  to={`${prefix}/start`}
                  className="nav-pill folio-pill"
                  onClick={() => track("cta_start_click", { location: "hero" })}
                >
                  {h.hero.primary}
                  <ArrowUpRight className={arrow} size={16} />
                </Link>
              </div>
            </div>
            <ol className="folio-disciplines">
              {h.services.items.map((s, i) => (
                <li key={s.slug}>
                  <Link viewTransition to={`${prefix}/services/${s.slug}`}>
                    <span dir="ltr">#0{i + 1}</span>
                    <span dir="ltr">{h.hero.pills[i]}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <ClientMarquee />
        <ProofStrip
          label={h.proof.label}
          facts={h.proof.facts}
          intro={
            ar
              ? "خبرة تصنع الوضوح.\nوأعمال تثبت الفكرة."
              : "Experience brings clarity.\nThe work makes it tangible."
          }
        />
        <section className="studio-section studio-work" id="work">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.work.eyebrow}</p>
                <h2>
                  {ar ? "الفكرة، حين تصبح واقعًا." : "Ideas, made tangible."}
                </h2>
              </div>
              <Link to={`${prefix}/work`} className="studio-text-link">
                {h.work.all}
                <ArrowUpRight className={arrow} size={20} />
              </Link>
            </div>
            <FeaturedProjects items={selected} />
          </div>
        </section>
        <CurvedGallery />
        <section className="studio-section studio-services" id="services">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.services.eyebrow}</p>
                <h2>{ar ? "تفكير إبداعي.\nأنظمة ذكية.\nتنفيذ حقيقي." : "Creative thinking.\nSmart systems.\nReal execution."}</h2>
              </div>
              <div className="section-side">
                <p className="section-intro">
                  {ar
                    ? "أجمع بين الإبداع والتقنية والخبرة التشغيلية لتطوير حلول وتجارب تساعد الشركات على تحويل أفكارها إلى مشاريع وأنظمة تعمل على أرض الواقع."
                    : "I bring together creativity, technology, and operational experience to build solutions and experiences that help companies turn their ideas into projects and systems that work in the real world."}
                </p>
                <Link to={`${prefix}/services`} className="studio-text-link">
                  {dictionary.servicesPage.allServices}
                  <ArrowUpRight className={arrow} size={18} />
                </Link>
              </div>
            </div>
            <ul className="svc-rows">
              {h.services.items.map((s) => (
                <li key={s.slug}>
                  <Link viewTransition to={`${prefix}/services/${s.slug}`} className="svc-row">
                    <span className="svc-row-media" aria-hidden="true">
                      <Picture src={`/work/media/service-${s.slug}.webp`} sizes="(min-width: 900px) 240px, 100vw" alt="" loading="lazy" decoding="async" width={1600} height={1200} />
                    </span>
                    <span className="svc-row-name">
                      <h3>{s.title}</h3>
                      {ar && <span className="latin" dir="ltr">{s.latin}</span>}
                    </span>
                    <span className="svc-row-copy">
                      <strong>{dictionary.servicesPage.lines.find((l) => l.slug === s.slug)?.tagline}</strong>
                      <span>{s.value}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="studio-section studio-products">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.products.eyebrow}</p>
                <h2>{h.products.title}</h2>
              </div>
              <div className="section-side">
                <p className="section-intro">{h.products.caption}</p>
                <Link to={`${prefix}/products`} className="studio-text-link">
                  {ar ? "استكشف المنتجات" : "Explore the products"}
                  <ArrowUpRight className={arrow} size={18} />
                </Link>
              </div>
            </div>
            <ul className="bento">
              {h.products.items.map((p, i) => (
                <li key={p.name} className={i === 0 ? "bento-card bento-card--image" : "bento-card bento-card--accent"}>
                  {i === 0 && (
                    <div className="bento-media" aria-hidden="true">
                      <ProductVisual kind="life" />
                    </div>
                  )}
                  <div className="bento-body">
                    <h3 dir="ltr">{p.name}</h3>
                    <p>{p.body}</p>
                    <a href={p.url} target="_blank" rel="noreferrer" className="bento-link">
                      {h.products.visit}
                      <span className="sr-only">: {p.name}</span>
                      <ArrowUpRight className={arrow} size={16} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="studio-section studio-process">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.process.eyebrow}</p>
                <h2>{ar ? "وضوح من أول خطوة." : "Clarity. From day one."}</h2>
              </div>
              <p className="section-intro">
                {ar
                  ? "أنت تعرف أين نحن، وماذا يأتي بعد. نطاق محدد، تسليم على مراحل، وقرارات نفهم أسبابها."
                  : "Know where we are and what comes next. A defined scope, staged delivery, and decisions with a clear rationale."}
              </p>
            </div>
            <StepRows steps={h.process.steps} />
          </div>
        </section>
        <section className="studio-section studio-about">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.about.eyebrow}</p>
                <h2>
                  {ar
                    ? "شريك في الفكرة.\nودقيق في التنفيذ."
                    : "A partner in thinking.\nA craftsman in execution."}
                </h2>
              </div>
              <div className="section-side">
                <p className="section-intro">{h.about.paragraphs[0]}</p>
                {h.about.paragraphs.slice(1).map((p) => (
                  <p key={p} className="service-line-what">{p}</p>
                ))}
                <Link to={`${prefix}/about`} className="studio-text-link">
                  {h.about.link}
                  <ArrowUpRight className={arrow} size={19} />
                </Link>
              </div>
            </div>
            <ul className="about-gallery">
              <li>
                <Picture src={portrait} sizes="(min-width: 900px) 33vw, 100vw" alt={h.about.portraitAlt} width={800} height={1000} loading="lazy" />
              </li>
              {aboutWork.map((p) => (
                <li key={p.slug}>
                  <Picture src={p.cover} sizes="(min-width: 900px) 33vw, 100vw" alt={ar ? p.title_ar : p.title_en} width={800} height={1000} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="studio-section studio-testimonials">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.testimonials.eyebrow}</p>
                <h2>{h.testimonials.title}</h2>
              </div>
              <div className="section-side">
                <p className="section-intro">{h.testimonials.intro}</p>
                <a href={h.testimonials.url} target="_blank" rel="noopener noreferrer" className="studio-text-link">
                  {h.testimonials.link}
                  <ArrowUpRight className={arrow} size={18} />
                </a>
              </div>
            </div>
            <div className="testimonial-grid">
              {h.testimonials.items.map((t) => (
                <figure key={t.name}>
                  <Quote aria-hidden="true" size={28} className={isRtl ? "-scale-x-100" : ""} />
                  <blockquote>
                    <p>{t.quote}</p>
                  </blockquote>
                  <figcaption>
                    <strong>{t.name}</strong>
                    <span>{t.relation}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
        <section className="studio-section studio-faq">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">{h.faq.eyebrow}</p>
                <h2>{h.faq.title}</h2>
              </div>
              <p className="section-intro">
                {ar
                  ? "التفاصيل التي تساعدك على اتخاذ الخطوة التالية بثقة."
                  : "The details that help you take the next step with confidence."}
              </p>
            </div>
            <Accordion type="single" collapsible className="faq-rows">
              {h.faq.items.map((f, i) => (
                <AccordionItem key={f.question} value={`faq-${i}`}>
                  <AccordionTrigger className="py-6 text-start text-base hover:no-underline">
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-base leading-8">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
        <section className="studio-cta">
          <div className="studio-container">
            <h2>
              {ar
                ? "لنصنع شيئًا\nيستحق أن يُرى."
                : "Let’s make something\nworth seeing."}
            </h2>
            <div>
              <p>{h.finalCta.body}</p>
              <Link
                to={`${prefix}/start`}
                className="nav-pill nav-pill--solid"
                onClick={() =>
                  track("cta_start_click", { location: "final_cta" })
                }
              >
                <span>{h.finalCta.button}</span>
                <span className="nav-pill-dot" aria-hidden="true">
                  <ArrowUpRight className={arrow} size={18} />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

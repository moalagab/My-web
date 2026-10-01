import {
  ArrowDown,
  ArrowUpRight,
  Boxes,
  Bot,
  Palette,
  PanelsTopLeft,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import heroPortrait from "@/assets/portrait-mo-final-shadow.webp";
import ProductVisual from "@/components/studio/ProductVisual";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { selectedIdentityProjects } from "@/content/projects";
import WorkCollection from "@/components/studio/WorkCollection";
import { track } from "@/lib/analytics";
import portrait from "@/assets/portrait-mo.webp";

export default function HomePage() {
  const { lang, dictionary, isRtl } = useLanguage();
  const h = dictionary.home;
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  const title = ar
    ? ["فكرة واضحة.", "علامة مؤثرة.", "نظام يعمل."]
    : ["Clear thinking.", "Distinct brands.", "Working systems."];
  const selected = selectedIdentityProjects.slice(0, 6);
  const icons = [Palette, PanelsTopLeft, Bot, Boxes];
  const arrow = isRtl ? "-scale-x-100" : "";
  return (
    <>
      <Helmet>
        <title>
          {ar
            ? "محمد العجب — تصميم العلامات وبناء المنتجات"
            : "Mo Alagab — Brand Design & Digital Products"}
        </title>
        <meta name="description" content={h.hero.body} />
        <link rel="canonical" href={`https://moalagab.art${prefix || "/"}`} />
        <link rel="alternate" hrefLang="ar" href="https://moalagab.art/" />
        <link rel="alternate" hrefLang="en" href="https://moalagab.art/en" />
      </Helmet>
      <Navigation />
      <main id="main-content" className="studio-home">
        <section className="studio-hero cinematic-hero" data-no-reveal>
          <div className="cinematic-portrait" aria-hidden="true">
            <img src={heroPortrait} alt="" fetchPriority="high" decoding="async" />
          </div>
          <div className="cinematic-side-note" dir="ltr" aria-hidden="true">MO ALAGAB / INDEPENDENT PRACTICE</div>
          <div className="studio-container hero-grid">
            <div className="hero-copy">
              <p className="hero-profile-index" dir="ltr"><span>01 / PROFILE</span><span>DESIGN × SYSTEMS</span></p>
              <p className="studio-eyebrow">
                <span className="identity-dot" />
                {h.hero.eyebrow}
              </p>
              <h1 className="hero-title">
                {title.map((line, i) => (
                  <span key={line} className={i === 1 ? "hero-title-soft" : ""}>
                    {line}
                  </span>
                ))}
              </h1>
              <p className="hero-description">{h.hero.body}</p>
              <div className="hero-actions">
                <Link
                  to={`${prefix}/start`}
                  className="studio-button studio-button-light"
                  onClick={() => track("cta_start_click", { location: "hero" })}
                >
                  {h.hero.primary}
                  <ArrowUpRight className={arrow} size={19} />
                </Link>
                <a href="#work" className="studio-text-link">
                  {h.hero.secondary}
                  <ArrowDown size={17} />
                </a>
              </div>
            </div>
            <Link to={`${prefix}/about`} className="hero-profile-link">
              <span dir="ltr">MO<br />ALAGAB</span>
              <span>{ar ? "تعرّف على Mo" : "ABOUT MO"}<ArrowUpRight size={18} className={arrow} /></span>
            </Link>
          </div>
          <div className="studio-container hero-baseline">
            <span>
              {ar
                ? "الرياض · نعمل عبر الحدود"
                : "RIYADH · WORKING ACROSS BORDERS"}
            </span>
            <span dir="ltr">STRATEGY → DESIGN → BUILD</span>
            <a href="#work" aria-label={h.hero.secondary}>
              <ArrowDown size={18} />
            </a>
          </div>
        </section>
        <section
          className="studio-proof"
          aria-label={h.proof.label}
          data-no-reveal
        >
          <div className="studio-container proof-grid">
            <p>
              {ar
                ? "خبرة تصنع الوضوح.\nوأعمال تثبت الفكرة."
                : "Experience brings clarity.\nThe work makes it tangible."}
            </p>
            {h.proof.facts.map((f) => (
              <div key={f.number}>
                <strong dir="ltr">{f.number}</strong>
                <span>{f.label}</span>
                {"detail" in f && f.detail ? <small>{f.detail}</small> : null}
              </div>
            ))}
          </div>
        </section>
        <section className="studio-section studio-work" id="work">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">01 / SELECTED WORK</p>
                <h2>
                  {ar ? "الفكرة، حين تصبح واقعًا." : "Ideas, made tangible."}
                </h2>
              </div>
              <Link to={`${prefix}/work`} className="studio-text-link">
                {h.work.all}
                <ArrowUpRight className={arrow} size={20} />
              </Link>
            </div>
            <WorkCollection items={selected} />
          </div>
        </section>
        <section className="studio-section studio-services" id="services">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">02 / WHAT I DO</p>
                <h2>
                  {ar
                    ? "من الصورة الكبيرة،\nإلى أدق التفاصيل."
                    : "The bigger picture.\nEvery last detail."}
                </h2>
              </div>
              <p className="section-intro">
                {ar
                  ? "أربط ما يراه العميل بما يحتاجه فريقك ليشغّل العمل. أربعة مسارات، وتجربة واحدة متماسكة."
                  : "Connecting what your customers see with what your team needs to operate. Four disciplines. One coherent experience."}
              </p>
            </div>
            <div className="service-editorial">
              {h.services.items.map((s, i) => {
                const Icon = icons[i];
                return (
                  <Link
                    to={`${prefix}/services#${s.slug}`}
                    className="service-editorial-row"
                    key={s.slug}
                    data-reveal
                  >
                    <span className="service-number" dir="ltr">
                      0{i + 1}
                    </span>
                    <div>
                      <Icon strokeWidth={1.2} size={28} />
                      <h3 dir="ltr">{s.title}</h3>
                    </div>
                    <p>{s.value}</p>
                    <span className="service-link">
                      <ArrowUpRight className={arrow} size={25} />
                      <span className="sr-only">
                        {h.services.details}: {s.title}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        <section className="studio-section studio-products">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">03 / DESIGN MEETS TECHNOLOGY</p>
                <h2>{h.products.title}</h2>
              </div>
              <p className="section-intro">{h.products.caption}</p>
            </div>
            <div className="product-grid">
              {h.products.items.map((p, i) => (
                <article key={p.name} data-reveal>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${h.products.visit}: ${p.name}`}
                  >
                    <ProductVisual kind={i === 0 ? "life" : "agent"} />
                  </a>
                  <div className="product-caption">
                    <h3 dir="ltr">{p.name}</h3>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="round-link"
                      aria-label={`${h.products.visit}: ${p.name}`}
                    >
                      <ArrowUpRight className={arrow} size={22} />
                    </a>
                  </div>
                  <p>{p.body}</p>
                  {i === 0 && (
                    <Link
                      className="studio-text-link lt-home-link"
                      to={`${prefix}/products#lifetent`}
                    >
                      {ar
                        ? "استكشف نظام LifeTent"
                        : "Explore the LifeTent system"}
                      <ArrowUpRight size={17} className={arrow} />
                    </Link>
                  )}
                </article>
              ))}
            </div>
            <Link
              to={`${prefix}/products`}
              className="studio-text-link products-all"
            >
              {ar ? "استكشف المنتجات" : "Explore the products"}
              <ArrowUpRight className={arrow} size={18} />
            </Link>
          </div>
        </section>
        <section className="studio-section studio-process">
          <div className="studio-container">
            <div className="section-heading">
              <div>
                <p className="studio-eyebrow">04 / THE WAY FORWARD</p>
                <h2>{ar ? "وضوح من أول خطوة." : "Clarity. From day one."}</h2>
              </div>
              <p className="section-intro">
                {ar
                  ? "أنت تعرف أين نحن، وماذا يأتي بعد. نطاق محدد، تسليم على مراحل، وقرارات نفهم أسبابها."
                  : "Know where we are and what comes next. A defined scope, staged delivery, and decisions with a clear rationale."}
              </p>
            </div>
            <div className="process-grid">
              {h.process.steps.map((s, i) => (
                <article key={s.title} data-reveal>
                  <span className="process-number" dir="ltr">
                    0{i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <span className="studio-eyebrow" dir="ltr">
                    {s.english}
                  </span>
                  <p>{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="studio-section studio-about">
          <div className="studio-container about-grid">
            <div className="about-portrait" data-reveal>
              <img
                src={portrait}
                alt={h.about.portraitAlt}
                width={800}
                height={1000}
                loading="lazy"
              />
              <span dir="ltr">MO ALAGAB / RIYADH</span>
            </div>
            <div className="about-copy">
              <p className="studio-eyebrow">05 / THE PERSON BEHIND THE WORK</p>
              <h2>
                {ar
                  ? "شريك في الفكرة.\nودقيق في التنفيذ."
                  : "A partner in thinking.\nA craftsman in execution."}
              </h2>
              {h.about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              <Link to={`${prefix}/about`} className="studio-text-link">
                {h.about.link}
                <ArrowUpRight className={arrow} size={19} />
              </Link>
            </div>
          </div>
        </section>
        <section className="studio-section studio-faq">
          <div className="studio-container faq-grid">
            <div>
              <p className="studio-eyebrow">06 / BEFORE WE START</p>
              <h2>{h.faq.title}</h2>
              <p className="faq-intro">
                {ar
                  ? "التفاصيل التي تساعدك على اتخاذ الخطوة التالية بثقة."
                  : "The details that help you take the next step with confidence."}
              </p>
            </div>
            <Accordion type="single" collapsible>
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
            <p className="studio-eyebrow">YOUR NEXT CHAPTER /</p>
            <h2>
              {ar
                ? "لنصنع شيئًا\nيستحق أن يُرى."
                : "Let’s make something\nworth seeing."}
            </h2>
            <div>
              <p>{h.finalCta.body}</p>
              <Link
                to={`${prefix}/start`}
                className="studio-button studio-button-light"
                onClick={() =>
                  track("cta_start_click", { location: "final_cta" })
                }
              >
                {h.finalCta.button}
                <ArrowUpRight className={arrow} size={20} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

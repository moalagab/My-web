import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import portraitImage from "@/assets/portrait-mo.webp";

const paragraphs = (text: string) =>
  text.split("\n").map((p, i) => <p key={i}>{p}</p>);

export default function AboutPage() {
  const { lang, dictionary, isRtl } = useLanguage();
  const c = dictionary.aboutPage;
  const ar = lang === "ar";
  const prefix = ar ? "" : "/en";
  const arrow = isRtl ? "-scale-x-100" : "";
  const anchors = ["story", "principles", "timeline"];
  return (
    <>
      <Helmet>
        <title>{c.metaTitle}</title>
        <meta name="description" content={c.metaDescription} />
        <link rel="canonical" href={`https://moalagab.art${prefix}/about`} />
        <link rel="alternate" hrefLang="ar" href="https://moalagab.art/about" />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://moalagab.art/en/about"
        />
      </Helmet>
      <Navigation />
      <main className="pt-20 about-page" id="main-content">
        <section className="about-hero">
          <div className="studio-container about-hero-grid">
            <div className="about-hero-copy">
              <p className="studio-eyebrow">{c.eyebrow}</p>
              <h1>{c.name}</h1>
              <p className="about-descriptor" dir="ltr">
                {c.descriptor}
              </p>
              <p className="about-hero-statement">{c.heroStatement}</p>
              <nav
                className="about-section-nav"
                aria-label={ar ? "أقسام صفحة عن Mo" : "About page sections"}
              >
                {anchors.map((anchor, i) => (
                  <Link key={anchor} to={`${prefix}/about#${anchor}`}>
                    {c.sectionLabels[i]}
                    <ArrowUpRight size={16} className={arrow} />
                  </Link>
                ))}
              </nav>
            </div>
            <figure className="about-portrait">
              <img
                src={portraitImage}
                alt={c.portraitAlt}
                width={800}
                height={1000}
                loading="eager"
              />
              <figcaption dir="ltr">
                MO ALAGAB / FROM VISION TO SYSTEMS
              </figcaption>
            </figure>
          </div>
        </section>
        <section
          className="studio-section about-story"
          id="story"
          aria-labelledby="story-title"
        >
          <div className="studio-container about-editorial-grid">
            <div className="about-section-heading">
              <p className="studio-eyebrow">01 / {c.storyEyebrow}</p>
              <h2 id="story-title">{c.storyTitle}</h2>
              <div className="about-experience">
                <span>
                  <b dir="ltr">12+</b>
                  {ar ? "سنة عبر ثلاثة أسواق" : "Years across three markets"}
                </span>
                <span>
                  <b dir="ltr">40+</b>
                  {ar ? "نظام هوية" : "Identity systems"}
                </span>
              </div>
            </div>
            <div className="about-story-copy">
              <div className="about-paragraphs">
                {c.story.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="about-observation">{c.storyObservation}</p>
              <blockquote className="about-turning-point">
                {c.storyQuote.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </blockquote>
              <p className="about-shift">{c.storyShift}</p>
              <div className="about-questions">
                <div>
                  <span>{c.oldQuestionLabel}</span>
                  <p>{c.oldQuestion}</p>
                </div>
                <div>
                  <span>{c.newQuestionLabel}</span>
                  <ul>
                    {c.newQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="about-paragraphs">
                {c.storyBridge.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <aside className="about-impact" aria-labelledby="impact-title">
                <div className="about-impact-number">
                  <strong dir="ltr">1,100+</strong>
                  <span>{c.impactLabel}</span>
                </div>
                <div>
                  <h3 id="impact-title">{c.impactTitle}</h3>
                  <p>{c.impactBody}</p>
                  <span className="about-impact-stack" dir="ltr">
                    CRM / AI AGENTS / n8n
                  </span>
                </div>
              </aside>
              <div className="about-paragraphs about-today">
                {c.storyToday.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="about-flow-label">{c.storyFlowLabel}</p>
              <ol className="about-flow">
                {c.storyFlow.map((step, i) => (
                  <li key={step}>
                    <span>{step}</span>
                    {i < c.storyFlow.length - 1 && (
                      <ArrowRight
                        size={19}
                        className={arrow}
                        aria-hidden="true"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
        <section
          className="studio-section about-principles"
          id="principles"
          aria-labelledby="principles-title"
        >
          <div className="studio-container about-editorial-grid">
            <div className="about-section-heading">
              <p className="studio-eyebrow">02 / {c.principlesEyebrow}</p>
              <h2 id="principles-title">{c.principlesTitle}</h2>
            </div>
            <ol className="about-principles-list">
              {c.principles.map((p, i) => (
                <li key={p.title}>
                  <span className="about-principle-number" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{p.title}</h3>
                    <div className="about-principle-body">
                      {paragraphs(p.body)}
                      {"questions" in p && p.questions && (
                        <ul>
                          {p.questions.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          className="studio-section about-timeline"
          id="timeline"
          aria-labelledby="timeline-title"
        >
          <div className="studio-container about-editorial-grid">
            <div className="about-section-heading">
              <p className="studio-eyebrow">03 / {c.timelineEyebrow}</p>
              <h2 id="timeline-title">{c.timelineTitle}</h2>
              <p className="about-timeline-caption" dir="ltr">
                DESIGN → OPERATIONS → APPLIED AI
              </p>
            </div>
            <div>
              <ol className="about-timeline-list">
                {c.timeline.map((item, i) => (
                  <li
                    key={`${item.year}-${item.title}`}
                    className={
                      i === c.timeline.length - 1
                        ? "about-timeline-current"
                        : ""
                    }
                  >
                    <div className="about-timeline-period">
                      <span dir="ltr">{item.year}</span>
                      <span className="about-timeline-dot" aria-hidden="true" />
                    </div>
                    <div className="about-timeline-entry">
                      <h3 dir="auto">{item.title}</h3>
                      <p className="about-timeline-role" dir="ltr">
                        {item.role}
                      </p>
                      <div className="about-timeline-body">
                        {paragraphs(item.body)}
                      </div>
                      {i === c.timeline.length - 1 && (
                        <Link
                          className="studio-text-link"
                          to={`${prefix}/products`}
                        >
                          {c.productsLink}
                          <ArrowUpRight size={17} className={arrow} />
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
              <div className="about-method">
                <p className="studio-eyebrow">{c.methodLabel}</p>
                <ol>
                  {c.methodSteps.map((step, i) => (
                    <li key={step}>
                      <span dir="ltr">0{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="about-closing">
          <div className="studio-container">
            <p className="studio-eyebrow">04 / {c.closingEyebrow}</p>
            <div className="about-closing-grid">
              <h2>{c.closingTitle}</h2>
              <div className="about-closing-body">
                {c.closingBody.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <Link
                  to={`${prefix}/start`}
                  className="studio-button studio-button-light"
                >
                  {dictionary.navigation.start}
                  <ArrowUpRight size={19} className={arrow} />
                </Link>
              </div>
            </div>
            <div className="about-signature" dir="ltr">
              <p>{c.closingSignature}</p>
              <p>{c.closingLine}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

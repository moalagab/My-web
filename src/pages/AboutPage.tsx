import PageMeta from "@/components/PageMeta";
import { Link } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import portraitImage from "@/assets/portrait-mo.webp";
import Picture from "@/components/Picture";
import PageHero from "@/components/studio/PageHero";

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
      <PageMeta title={c.metaTitle} description={c.metaDescription} />
      <Navigation />
      <main className="about-page" id="main-content">
        <PageHero
          image={portraitImage}
          focus="30% 22%"
          eyebrow={c.eyebrow}
          title={c.name}
          side={
            <>
              <strong dir="ltr">{c.descriptor}</strong>
              <p>{c.heroStatement}</p>
            </>
          }
          actions={
            <nav className="folio-chips" aria-label={ar ? "أقسام صفحة عن Mo" : "About page sections"}>
              {anchors.map((anchor, i) => (
                <Link key={anchor} to={`${prefix}/about#${anchor}`}>
                  {c.sectionLabels[i]}
                </Link>
              ))}
            </nav>
          }
        />
        <section
          className="studio-section about-story"
          id="story"
          aria-labelledby="story-title"
        >
          <div className="studio-container">
            <div className="about-section-heading">
              <p className="studio-eyebrow">01 / {c.storyEyebrow}</p>
              <h2 id="story-title">{c.storyTitle}</h2>
            </div>
          </div>
          <div className="studio-container about-split">
            <aside className="about-aside">
              <div className="about-aside-media" aria-hidden="true">
                <Picture src="/work/media/about-studio.webp" sizes="(min-width: 1000px) 36vw, 100vw" alt="" loading="lazy" decoding="async" width={1200} height={1600} />
              </div>
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
            </aside>
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
                  className="nav-pill nav-pill--solid"
                >
                  <span>{dictionary.navigation.start}</span>
                  <span className="nav-pill-dot" aria-hidden="true">
                    <ArrowUpRight size={18} className={arrow} />
                  </span>
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

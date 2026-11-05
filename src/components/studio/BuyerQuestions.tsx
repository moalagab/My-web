import { useEffect, useRef, useState } from "react";
import { Check, Minus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { QA } from "@/lib/answers";

/** Splits "Name: detail" into its two parts; lines without a colon keep the whole text as the name. */
const split = (item: string) => {
  const at = item.indexOf(":");
  return at < 0 ? [item, ""] : [item.slice(0, at).trim(), item.slice(at + 1).trim()];
};

/**
 * A service's buyer questions in the order a buyer asks them: what it is and
 * who it suits, what they receive, then time, cost and the first steps. A held
 * index on the side follows the reading position; each answer takes the form
 * its content needs (a checklist, a note, a duration table, a cost callout,
 * numbered steps).
 */
export default function BuyerQuestions({ answers, aside }: { answers: QA[]; aside: React.ReactNode }) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const chapters = [
    { label: ar ? "الفكرة" : "The idea", items: [0, 1] },
    { label: ar ? "ما تحصل عليه" : "What you get", items: [2, 3] },
    { label: ar ? "المدة والتكلفة والبداية" : "Time, cost and first steps", items: [4, 5, 6] },
  ].map((c) => ({ ...c, items: c.items.filter((i) => i < answers.length) }));

  // Follow the reading position: the question crossing the middle of the screen is the current one.
  useEffect(() => {
    const blocks = Array.from(listRef.current?.querySelectorAll<HTMLElement>(".bq-item") ?? []);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, [answers.length]);

  const body = (qa: QA) => {
    switch (qa.kind) {
      case "checklist":
        return (
          <ul className="bq-checklist">
            {qa.list?.map((item) => (
              <li key={item}>
                <Check size={16} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      case "note":
        return (
          <p className="bq-note">
            <Minus size={16} aria-hidden="true" />
            <span>{qa.a}</span>
          </p>
        );
      case "durations":
        return (
          <dl className="bq-durations">
            {qa.list?.map((item) => {
              const [name, time] = split(item);
              return (
                <div key={item}>
                  <dt dir="ltr">{name}</dt>
                  <dd dir="ltr">{time}</dd>
                </div>
              );
            })}
          </dl>
        );
      case "cost":
        return <p className="bq-cost">{qa.a}</p>;
      case "steps":
        return (
          <ol className="bq-steps">
            {qa.list?.map((item) => {
              const [name, detail] = split(item);
              return (
                <li key={item}>
                  <strong>{name}</strong>
                  <span>{detail}</span>
                </li>
              );
            })}
          </ol>
        );
      default:
        return <p className="bq-plain">{qa.a}</p>;
    }
  };

  return (
    <div className="studio-container bq">
      <aside className="bq-aside">
        {aside}
        <nav className="bq-index" aria-label={ar ? "أسئلة هذه الخدمة" : "Questions on this service"}>
          {chapters.map((c) => (
            <div key={c.label} className="bq-chapter">
              <p>{c.label}</p>
              <ol>
                {c.items.map((i) => (
                  <li key={i}>
                    <a href={`#q-${i}`} aria-current={i === active ? "true" : undefined}>
                      <span dir="ltr">{String(i + 1).padStart(2, "0")}</span>
                      {answers[i].q}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </nav>
      </aside>
      <div className="bq-list" ref={listRef}>
        {chapters.map((c) => (
          <div key={c.label} className="bq-group">
            <p className="bq-group-label">{c.label}</p>
            {c.items.map((i) => (
              <section key={i} id={`q-${i}`} data-index={i} className={`bq-item ${i === active ? "is-active" : ""}`} aria-labelledby={`q-${i}-title`}>
                <span className="bq-num" dir="ltr" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <h2 id={`q-${i}-title`}>{answers[i].q}</h2>
                {body(answers[i])}
              </section>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

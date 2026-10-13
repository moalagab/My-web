import type { SystemDictionary } from "@/lib/dictionary";

export type QA = { q: string; a: string; list?: string[] };
export type ServiceLineCopy = SystemDictionary["servicesPage"]["lines"][number];

const SITE = "https://moalagab.art";

/** Buyer questions for one service line, answered only from existing site copy. */
export const serviceAnswers = (line: ServiceLineCopy, d: SystemDictionary): QA[] => {
  const s = d.servicesPage;
  const steps = d.home.process.steps;
  return [
    { q: s.qa.what.replace("{title}", line.title), a: line.what },
    { q: s.qa.who, a: line.who },
    { q: s.qa.deliverables, a: "", list: line.deliverables },
    { q: s.qa.notIncluded, a: line.notIncluded },
    {
      q: s.qa.timeline,
      a: "",
      list: line.packages.map((p) => `${p.name}: ${p.timeline}`),
    },
    { q: s.qa.cost, a: s.costAnswer },
    {
      q: s.qa.process,
      a: "",
      list: steps.map((step) => `${step.title}: ${step.body}`),
    },
  ];
};

/** FAQ page groups: the home FAQ plus answers assembled from services and the brief flow. */
export const faqGroups = (d: SystemDictionary) => {
  const f = d.faqPage;
  return [
    {
      label: f.generalLabel,
      items: d.home.faq.items.map((item) => ({ q: item.question, a: item.answer })) as QA[],
    },
    {
      label: f.processLabel,
      items: [
        {
          q: f.servicesQ,
          a: "",
          list: d.servicesPage.lines.map((line) => `${line.title}: ${line.what}`),
        },
        {
          q: f.nextQ,
          a: "",
          list: d.startPage.next.steps.map((step) => `${step.title}: ${step.body}`),
        },
        { q: f.replyQ, a: f.replyA },
        { q: f.regionQ, a: f.regionA },
      ] as QA[],
    },
  ];
};

const answerText = (qa: QA) => [qa.a, ...(qa.list ?? [])].filter(Boolean).join(" ");

export const faqJsonLd = (items: QA[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((qa) => ({
    "@type": "Question",
    name: qa.q,
    acceptedAnswer: { "@type": "Answer", text: answerText(qa) },
  })),
});

export const serviceJsonLd = (
  line: ServiceLineCopy,
  name: string,
  url: string,
  lang: "ar" | "en",
) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  name,
  alternateName: line.title,
  serviceType: line.title,
  description: line.what,
  url,
  inLanguage: lang,
  provider: { "@id": `${SITE}/#person` },
  areaServed: ["Saudi Arabia", "GCC", "Oman", "Sudan"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: line.title,
    itemListElement: line.packages.map((p) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: p.name, description: p.scope },
    })),
  },
});

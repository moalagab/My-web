// Unit economics for a solo studio: the unit is a won client. Pure functions,
// no imports, so they run under Deno tests (src/lib/unitEconomics.test.ts).
//
// Method (services adaptation of SaaS unit economics):
// - Gross profit per project = value before VAT - delivery costs - hours x Mo's hourly cost.
// - LTV = average gross profit per project x projects per client (realized, all time).
// - LTV:CAC and CAC payback use gross profit, not revenue, so they are not flattered.
// - Payback is counted in projects: below 1 means the first project repays its CAC.

export interface UnitLead {
  email: string;
  created_at: string;
  status: string;
  won_at: string | null;
  deal_value_sar: number | null;
  delivery_cost_sar: number | null;
  delivery_hours: number | null;
}

export interface Window {
  /** Inclusive start (null = all time) to exclusive end. */
  from: Date | null;
  to: Date;
}

export type Rating = "good" | "ok" | "low";

/**
 * Benchmarks with sources. Most published figures are agency or SaaS figures;
 * the notes say how each is adapted to a one-person studio.
 */
export const BENCHMARKS = {
  ltvToCac: {
    good: 3,
    ok: 1,
    label: "3:1 أو أكثر",
    note: "قاعدة David Skok (SaaS Metrics 2.0)، محسوبة هنا على الربح الإجمالي لا الإيراد.",
    source: "https://www.forentrepreneurs.com/saas-metrics-2/",
  },
  paybackProjects: {
    good: 1,
    ok: 2,
    label: "المشروع الأول يغطي CAC",
    note: "تكييف لمدة الاسترداد في SaaS (12 شهرًا أو أقل) على الخدمات: يُسترد CAC من ربح المشروع الأول.",
    source: "https://www.forentrepreneurs.com/saas-metrics-2/",
  },
  deliveryMargin: {
    good: 0.6,
    ok: 0.5,
    label: "50% مقبول، 60% ممتاز",
    note: "متوسط الهامش الإجمالي لوكالات العلامات والإبداع نحو 50%، و60%+ ممتاز. يشمل وقتك بتكلفة ساعتك.",
    source: "https://pitchsite.io/guides/agency-profit-margins",
  },
  winRate: {
    good: 0.3,
    ok: 0.2,
    label: "25–30% في الخدمات المهنية",
    note: "نسبة الفوز من الطلبات المحسومة (فوز ÷ فوز + خسارة). مصادر الخدمات المهنية تضعها بين 25% و30%.",
    source: "https://salesmotion.io/blog/sales-win-rate-benchmarks-2026",
  },
  salesCycleDays: {
    reference: 51,
    label: "نحو 51 يومًا في الخدمات المهنية",
    note: "مرجع فقط بلا تقييم: يختلف كثيرًا بحجم المشروع.",
    source: "https://thedigitalbloom.com/learn/pipeline-performance-benchmarks-2025/",
  },
  vat: {
    rate: 0.15,
    voluntary: 187_500,
    mandatory: 375_000,
    label: "15%؛ التسجيل اختياري من 187,500 وإلزامي من 375,000 ر.س سنويًا",
    note: "حسب هيئة الزكاة والضريبة والجمارك، على إيرادات 12 شهرًا متجددة. سجّل قيم الصفقات قبل الضريبة.",
    source: "https://zatca.gov.sa/ar/RulesRegulations/Taxes/Pages/default.aspx",
  },
} as const;

const DAY = 86_400_000;

const within = (iso: string | null, w: Window) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return (w.from === null || t >= w.from.getTime()) && t < w.to.getTime();
};

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

const median = (values: number[]) => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Higher is better unless `lowerIsBetter`. */
export const rate = (
  value: number | null,
  bench: { good: number; ok: number },
  lowerIsBetter = false,
): Rating | null => {
  if (value === null) return null;
  if (lowerIsBetter) return value <= bench.good ? "good" : value <= bench.ok ? "ok" : "low";
  return value >= bench.good ? "good" : value >= bench.ok ? "ok" : "low";
};

export interface UnitEconomics {
  /** Won website deals in the period, and those with value, cost and hours entered. */
  wins: number;
  costed: number;
  revenue: number;
  deliveryCost: number;
  hours: number;
  /** Hours x Mo's hourly cost; null until that cost is set. */
  timeCost: number | null;
  grossProfit: number | null;
  deliveryMargin: number | null;
  /** (Value - delivery costs) / hours: what an hour of Mo's work actually earned. */
  effectiveHourlyRate: number | null;
  avgGrossProfit: number | null;
  /** All time: distinct won clients (by email) and how many projects each brings. */
  clients: number;
  projectsPerClient: number | null;
  repeatRate: number | null;
  ltv: number | null;
  ltvToCac: number | null;
  paybackProjects: number | null;
  winRate: number | null;
  salesCycleDays: number | null;
  /** Revenue recorded over the trailing 12 months, for the VAT thresholds. */
  trailingRevenue: number;
}

export const unitEconomics = (input: {
  leads: UnitLead[];
  period: Window;
  /** Website CAC for the same period (acquisition.summarize). */
  cac: number | null;
  ownerHourCost: number | null;
  /** Valued outbound wins over the trailing 12 months, from the agents snapshot. */
  outboundTrailingRevenue: number;
  now?: Date;
}): UnitEconomics => {
  const { leads, period, cac, ownerHourCost, outboundTrailingRevenue } = input;
  const now = input.now ?? new Date();

  const wins = leads.filter((l) => l.status === "won" && within(l.won_at, period));
  const costed = wins.filter(
    (l) => l.deal_value_sar !== null && l.delivery_cost_sar !== null && l.delivery_hours !== null,
  );
  const revenue = costed.reduce((sum, l) => sum + Number(l.deal_value_sar), 0);
  const deliveryCost = costed.reduce((sum, l) => sum + Number(l.delivery_cost_sar), 0);
  const hours = costed.reduce((sum, l) => sum + Number(l.delivery_hours), 0);
  const timeCost = ownerHourCost ? hours * ownerHourCost : null;
  const grossProfit = costed.length > 0 && timeCost !== null ? revenue - deliveryCost - timeCost : null;
  const avgGrossProfit = grossProfit !== null ? grossProfit / costed.length : null;

  // Repeat business is a lifetime property, so it uses every won brief.
  const allWins = leads.filter((l) => l.status === "won");
  const perClient = new Map<string, number>();
  for (const l of allWins) {
    const key = l.email.trim().toLowerCase();
    perClient.set(key, (perClient.get(key) ?? 0) + 1);
  }
  const clients = perClient.size;
  const projectsPerClient = ratio(allWins.length, clients);
  const repeatRate = ratio([...perClient.values()].filter((n) => n > 1).length, clients);
  const ltv = avgGrossProfit !== null && projectsPerClient !== null ? avgGrossProfit * projectsPerClient : null;

  const decided = leads.filter((l) => within(l.created_at, period) && (l.status === "won" || l.status === "lost"));
  const winRate = ratio(decided.filter((l) => l.status === "won").length, decided.length);

  const cycles = wins.map((l) => (new Date(l.won_at!).getTime() - new Date(l.created_at).getTime()) / DAY);

  const year: Window = { from: new Date(now.getTime() - 365 * DAY), to: now };
  const trailingRevenue =
    leads
      .filter((l) => l.status === "won" && within(l.won_at, year))
      .reduce((sum, l) => sum + (Number(l.deal_value_sar) || 0), 0) + outboundTrailingRevenue;

  return {
    wins: wins.length,
    costed: costed.length,
    revenue,
    deliveryCost,
    hours,
    timeCost,
    grossProfit,
    deliveryMargin: grossProfit !== null ? ratio(grossProfit, revenue) : null,
    effectiveHourlyRate: ratio(revenue - deliveryCost, hours),
    avgGrossProfit,
    clients,
    projectsPerClient,
    repeatRate,
    ltv,
    ltvToCac: ltv !== null && cac ? ltv / cac : null,
    paybackProjects: cac !== null && avgGrossProfit && avgGrossProfit > 0 ? cac / avgGrossProfit : null,
    winRate,
    salesCycleDays: median(cycles),
    trailingRevenue,
  };
};

/** Where the trailing revenue sits against the VAT thresholds. */
export const vatStatus = (trailingRevenue: number) =>
  trailingRevenue >= BENCHMARKS.vat.mandatory ? "mandatory" : trailingRevenue >= BENCHMARKS.vat.voluntary ? "voluntary" : "below";

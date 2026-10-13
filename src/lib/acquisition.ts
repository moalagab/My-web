// Costs and returns for the /admin tab: pure functions, no imports, so they run
// under Deno tests (src/lib/acquisition.test.ts) as well as in the browser.

/** The riyal is pegged to the dollar; agent spend arrives in USD. */
export const USD_TO_SAR = 3.75;

export type CostChannel = "shared" | "website" | "outbound";

export interface LeadRow {
  created_at: string;
  status: string;
  won_at: string | null;
  deal_value_sar: number | null;
  heard_from: string | null;
}

export interface CostRow {
  month: string; // YYYY-MM-01
  channel: CostChannel;
  amount_sar: number;
}

export interface SnapshotRow {
  generated_at: string;
  payload: { daily_cost?: { date: string; cost_usd: number }[] };
}

/** Inclusive start (null = all time) to exclusive end. */
export interface Period {
  from: Date | null;
  to: Date;
}

const inPeriod = (iso: string | null, period: Period) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return (period.from === null || t >= period.from.getTime()) && t < period.to.getTime();
};

/** Monthly entries count when their month overlaps the period. */
const monthOverlaps = (month: string, period: Period) => {
  const start = new Date(`${month.slice(0, 7)}-01T00:00:00Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return (period.from === null || end > period.from) && start < period.to;
};

/**
 * Each snapshot carries the last 7 days of agent spend. Merge them, keeping
 * the value from the newest snapshot that reports a day.
 */
export const agentDailyCostUsd = (snapshots: SnapshotRow[]) => {
  const byDay = new Map<string, { at: number; usd: number }>();
  for (const snap of snapshots) {
    const at = new Date(snap.generated_at).getTime();
    for (const day of snap.payload?.daily_cost ?? []) {
      const seen = byDay.get(day.date);
      if (!seen || at > seen.at) byDay.set(day.date, { at, usd: Number(day.cost_usd) || 0 });
    }
  }
  return new Map([...byDay].map(([date, v]) => [date, v.usd]));
};

const ratio = (a: number, b: number) => (b > 0 ? a / b : null);

export interface SourceStats {
  source: string;
  briefs: number;
  wins: number;
  revenue: number;
}

export interface Summary {
  cost: { shared: number; website: number; outbound: number; agents: number; total: number };
  website: {
    briefs: number;
    wins: number;
    revenue: number;
    /** Wins marked without a deal value; they count as customers but add no revenue. */
    unvaluedWins: number;
    /** Website direct costs plus all shared costs. */
    cost: number;
    cac: number | null;
    avgDeal: number | null;
    returnPerRiyal: number | null;
    /** Average deal value / CAC; 3 or more is the usual healthy mark. */
    dealToCac: number | null;
    conversion: number | null;
  };
  outbound: { cost: number };
  bySource: SourceStats[];
}

export const summarize = (input: {
  leads: LeadRow[];
  costs: CostRow[];
  snapshots: SnapshotRow[];
  period: Period;
}): Summary => {
  const { leads, costs, snapshots, period } = input;

  const manual = { shared: 0, website: 0, outbound: 0 };
  for (const c of costs) {
    if (monthOverlaps(c.month, period)) manual[c.channel] += Number(c.amount_sar) || 0;
  }

  let agentsUsd = 0;
  for (const [date, usd] of agentDailyCostUsd(snapshots)) {
    if (inPeriod(`${date}T12:00:00Z`, period)) agentsUsd += usd;
  }
  const agents = agentsUsd * USD_TO_SAR;

  const briefs = leads.filter((l) => inPeriod(l.created_at, period));
  const wins = leads.filter((l) => l.status === "won" && inPeriod(l.won_at, period));
  const revenue = wins.reduce((sum, l) => sum + (Number(l.deal_value_sar) || 0), 0);
  const valued = wins.filter((l) => l.deal_value_sar !== null);

  const websiteCost = manual.website + manual.shared;
  const cac = ratio(websiteCost, wins.length);
  const avgDeal = ratio(revenue, valued.length);

  const sources = new Map<string, SourceStats>();
  const bucket = (source: string | null) => {
    const key = source ?? "unknown";
    if (!sources.has(key)) sources.set(key, { source: key, briefs: 0, wins: 0, revenue: 0 });
    return sources.get(key)!;
  };
  for (const l of briefs) bucket(l.heard_from).briefs += 1;
  for (const l of wins) {
    const s = bucket(l.heard_from);
    s.wins += 1;
    s.revenue += Number(l.deal_value_sar) || 0;
  }

  return {
    cost: {
      shared: manual.shared,
      website: manual.website,
      outbound: manual.outbound + agents,
      agents,
      total: manual.shared + manual.website + manual.outbound + agents,
    },
    website: {
      briefs: briefs.length,
      wins: wins.length,
      revenue,
      unvaluedWins: wins.length - valued.length,
      cost: websiteCost,
      cac,
      avgDeal,
      returnPerRiyal: ratio(revenue, websiteCost),
      dealToCac: avgDeal !== null && cac ? avgDeal / cac : null,
      conversion: ratio(wins.length, briefs.length),
    },
    outbound: { cost: manual.outbound + agents },
    bySource: [...sources.values()].sort((a, b) => b.wins - a.wins || b.briefs - a.briefs),
  };
};

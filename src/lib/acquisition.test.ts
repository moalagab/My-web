/// <reference lib="deno.ns" />
import { assertAlmostEquals, assertEquals } from "jsr:@std/assert@1";
import { agentDailyCostUsd, summarize, USD_TO_SAR, type CostRow, type LeadRow, type SnapshotRow } from "./acquisition.ts";

const october = { from: new Date("2026-10-01T00:00:00Z"), to: new Date("2026-11-01T00:00:00Z") };

const lead = (patch: Partial<LeadRow>): LeadRow => ({
  created_at: "2026-10-05T10:00:00Z",
  status: "new",
  won_at: null,
  deal_value_sar: null,
  heard_from: "google",
  ...patch,
});

Deno.test("merges overlapping snapshots, newest value wins per day", () => {
  const snaps: SnapshotRow[] = [
    { generated_at: "2026-10-10T08:00:00Z", payload: { daily_cost: [{ date: "2026-10-09", cost_usd: 1 }, { date: "2026-10-10", cost_usd: 0.5 }] } },
    { generated_at: "2026-10-10T20:00:00Z", payload: { daily_cost: [{ date: "2026-10-10", cost_usd: 2 }] } },
    { generated_at: "2026-10-09T08:00:00Z", payload: {} },
  ];
  const days = agentDailyCostUsd(snaps);
  assertEquals(days.get("2026-10-09"), 1);
  assertEquals(days.get("2026-10-10"), 2);
});

Deno.test("website CAC uses website plus shared costs over website wins", () => {
  const costs: CostRow[] = [
    { month: "2026-10-01", channel: "shared", amount_sar: 300 },
    { month: "2026-10-01", channel: "website", amount_sar: 200 },
    { month: "2026-10-01", channel: "outbound", amount_sar: 1000 },
    { month: "2026-09-01", channel: "shared", amount_sar: 999 }, // outside the period
  ];
  const leads = [
    lead({ status: "won", won_at: "2026-10-20T00:00:00Z", deal_value_sar: 6000 }),
    lead({ status: "won", won_at: "2026-10-21T00:00:00Z", deal_value_sar: 4000, heard_from: "referral" }),
    lead({}),
    lead({ status: "lost" }),
  ];
  const s = summarize({ leads, costs, snapshots: [], period: october });
  assertEquals(s.website.cost, 500);
  assertEquals(s.website.wins, 2);
  assertEquals(s.website.cac, 250);
  assertEquals(s.website.revenue, 10000);
  assertEquals(s.website.avgDeal, 5000);
  assertEquals(s.website.returnPerRiyal, 20);
  assertEquals(s.website.dealToCac, 20);
  assertEquals(s.website.conversion, 0.5);
  assertEquals(s.cost.total, 1500);
  assertEquals(s.outbound.cost, 1000);
});

Deno.test("agent spend converts to riyals and counts as outbound", () => {
  const snaps: SnapshotRow[] = [
    { generated_at: "2026-10-31T23:00:00Z", payload: { daily_cost: [{ date: "2026-10-31", cost_usd: 4 }, { date: "2026-11-01", cost_usd: 9 }] } },
  ];
  const s = summarize({ leads: [], costs: [], snapshots: snaps, period: october });
  assertAlmostEquals(s.cost.agents, 4 * USD_TO_SAR);
  assertAlmostEquals(s.outbound.cost, 15);
  assertEquals(s.website.cac, null);
});

Deno.test("wins count by won_at, not by when the brief arrived", () => {
  const leads = [
    lead({ created_at: "2026-09-20T00:00:00Z", status: "won", won_at: "2026-10-02T00:00:00Z", deal_value_sar: 3000 }),
    lead({ created_at: "2026-10-03T00:00:00Z", status: "won", won_at: "2026-11-02T00:00:00Z", deal_value_sar: 3000 }),
  ];
  const s = summarize({ leads, costs: [], snapshots: [], period: october });
  assertEquals(s.website.wins, 1);
  assertEquals(s.website.briefs, 1);
});

Deno.test("wins without a value count as customers but not in the average deal", () => {
  const leads = [
    lead({ status: "won", won_at: "2026-10-10T00:00:00Z", deal_value_sar: 8000 }),
    lead({ status: "won", won_at: "2026-10-11T00:00:00Z", deal_value_sar: null }),
  ];
  const costs: CostRow[] = [{ month: "2026-10-01", channel: "shared", amount_sar: 1000 }];
  const s = summarize({ leads, costs, snapshots: [], period: october });
  assertEquals(s.website.wins, 2);
  assertEquals(s.website.unvaluedWins, 1);
  assertEquals(s.website.cac, 500);
  assertEquals(s.website.avgDeal, 8000);
});

Deno.test("no costs or no wins gives null ratios instead of Infinity", () => {
  const s = summarize({ leads: [lead({})], costs: [], snapshots: [], period: october });
  assertEquals(s.website.cac, null);
  assertEquals(s.website.avgDeal, null);
  assertEquals(s.website.returnPerRiyal, null);
  assertEquals(s.website.dealToCac, null);
});

Deno.test("all-time period includes every month and groups unknown sources", () => {
  const leads = [lead({ heard_from: null, created_at: "2024-01-01T00:00:00Z" })];
  const costs: CostRow[] = [{ month: "2024-01-01", channel: "website", amount_sar: 50 }];
  const s = summarize({ leads, costs, snapshots: [], period: { from: null, to: new Date("2030-01-01T00:00:00Z") } });
  assertEquals(s.website.cost, 50);
  assertEquals(s.bySource, [{ source: "unknown", briefs: 1, wins: 0, revenue: 0 }]);
});

Deno.test("outbound wins come from the newest snapshot and skip website deals", () => {
  const snaps: SnapshotRow[] = [
    { generated_at: "2026-10-20T10:00:00Z", payload: { outcomes: { days: 90, deals: [{ source: "manual", stage: "WON", date: "2026-10-01", value: 1 }] } } },
    {
      generated_at: "2026-10-25T10:00:00Z",
      payload: {
        daily_cost: [{ date: "2026-10-25", cost_usd: 40 }], // 150 SAR
        outcomes: {
          days: 90,
          deals: [
            { source: "serpapi_prospecting", stage: "WON", date: "2026-10-22", value: 12000 },
            { source: "manual", stage: "WON", date: "2026-10-23", value: null },
            { source: "website", stage: "WON", date: "2026-10-23", value: 7000 }, // counted from public.leads
            { source: "manual", stage: "LOST", date: "2026-10-24", value: 3000 },
            { source: "manual", stage: "WON", date: "2026-09-30", value: 5000 }, // before the period
          ],
        },
      },
    },
  ];
  const leads = [lead({ status: "won", won_at: "2026-10-23T00:00:00Z", deal_value_sar: 7000 })];
  const costs: CostRow[] = [{ month: "2026-10-01", channel: "shared", amount_sar: 150 }];
  const s = summarize({ leads, costs, snapshots: snaps, period: october });
  assertEquals(s.outbound.available, true);
  assertEquals(s.outbound.days, 90);
  assertEquals(s.outbound.wins, 2);
  assertEquals(s.outbound.revenue, 12000);
  assertEquals(s.outbound.unvaluedWins, 1);
  assertEquals(s.outbound.cac, 75);
  assertEquals(s.overall.wins, 3);
  assertEquals(s.overall.revenue, 19000);
  assertEquals(s.overall.cac, 100);
  assertEquals(s.overall.avgDeal, 9500);
  assertEquals(s.overall.dealToCac, 95);
});

Deno.test("outbound is marked unavailable until a snapshot carries outcomes", () => {
  const s = summarize({ leads: [], costs: [], snapshots: [{ generated_at: "2026-10-10T00:00:00Z", payload: {} }], period: october });
  assertEquals(s.outbound.available, false);
  assertEquals(s.outbound.wins, 0);
  assertEquals(s.overall.cac, null);
});

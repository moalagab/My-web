/// <reference lib="deno.ns" />
import { assertAlmostEquals, assertEquals } from "jsr:@std/assert@1";
import { rate, unitEconomics, vatStatus, BENCHMARKS, type UnitLead } from "./unitEconomics.ts";

const october = { from: new Date("2026-10-01T00:00:00Z"), to: new Date("2026-11-01T00:00:00Z") };
const now = new Date("2026-10-31T00:00:00Z");

const lead = (patch: Partial<UnitLead>): UnitLead => ({
  email: "a@client.sa",
  created_at: "2026-10-01T00:00:00Z",
  status: "new",
  won_at: null,
  deal_value_sar: null,
  delivery_cost_sar: null,
  delivery_hours: null,
  ...patch,
});

const won = (patch: Partial<UnitLead>) =>
  lead({ status: "won", won_at: "2026-10-21T00:00:00Z", deal_value_sar: 10000, delivery_cost_sar: 1000, delivery_hours: 40, ...patch });

Deno.test("gross profit takes delivery costs and Mo's time off the value", () => {
  const u = unitEconomics({ leads: [won({})], period: october, cac: 1500, ownerHourCost: 100, outboundTrailingRevenue: 0, now });
  assertEquals(u.timeCost, 4000);
  assertEquals(u.grossProfit, 5000);
  assertEquals(u.deliveryMargin, 0.5);
  assertEquals(u.effectiveHourlyRate, 225);
  assertEquals(u.ltv, 5000);
  assertAlmostEquals(u.ltvToCac!, 5000 / 1500);
  assertEquals(u.paybackProjects, 0.3);
});

Deno.test("without an hourly cost there is no gross profit, but the hourly rate still shows", () => {
  const u = unitEconomics({ leads: [won({})], period: october, cac: 1500, ownerHourCost: null, outboundTrailingRevenue: 0, now });
  assertEquals(u.grossProfit, null);
  assertEquals(u.ltvToCac, null);
  assertEquals(u.effectiveHourlyRate, 225);
});

Deno.test("wins missing value, cost or hours are counted but not costed", () => {
  const leads = [won({}), won({ email: "b@x.sa", delivery_hours: null }), won({ email: "c@x.sa", deal_value_sar: null })];
  const u = unitEconomics({ leads, period: october, cac: null, ownerHourCost: 100, outboundTrailingRevenue: 0, now });
  assertEquals(u.wins, 3);
  assertEquals(u.costed, 1);
  assertEquals(u.revenue, 10000);
});

Deno.test("repeat clients raise LTV; email case does not split a client", () => {
  const leads = [
    won({ email: "A@Client.sa", won_at: "2026-03-01T00:00:00Z", created_at: "2026-02-01T00:00:00Z" }),
    won({}),
    won({ email: "b@x.sa" }),
  ];
  const u = unitEconomics({ leads, period: october, cac: 2000, ownerHourCost: 100, outboundTrailingRevenue: 0, now });
  assertEquals(u.clients, 2);
  assertEquals(u.projectsPerClient, 1.5);
  assertEquals(u.repeatRate, 0.5);
  assertEquals(u.avgGrossProfit, 5000);
  assertEquals(u.ltv, 7500);
  assertAlmostEquals(u.ltvToCac!, 3.75);
});

Deno.test("win rate counts decided briefs only; sales cycle is the median", () => {
  const leads = [
    won({ created_at: "2026-10-01T00:00:00Z", won_at: "2026-10-11T00:00:00Z" }),
    won({ email: "b@x.sa", created_at: "2026-10-01T00:00:00Z", won_at: "2026-10-31T00:00:00Z" }),
    lead({ status: "lost" }),
    lead({ status: "lost" }),
    lead({ status: "proposal" }),
  ];
  const u = unitEconomics({ leads, period: october, cac: null, ownerHourCost: null, outboundTrailingRevenue: 0, now });
  assertEquals(u.winRate, 0.5);
  assertEquals(u.salesCycleDays, 20);
});

Deno.test("loss-making projects give no payback instead of a negative one", () => {
  const leads = [won({ deal_value_sar: 3000, delivery_cost_sar: 1000, delivery_hours: 40 })];
  const u = unitEconomics({ leads, period: october, cac: 500, ownerHourCost: 100, outboundTrailingRevenue: 0, now });
  assertEquals(u.grossProfit, -2000);
  assertEquals(u.paybackProjects, null);
});

Deno.test("trailing 12-month revenue adds outbound and drives the VAT status", () => {
  const leads = [
    won({ deal_value_sar: 200000, won_at: "2026-01-15T00:00:00Z" }),
    won({ deal_value_sar: 999999, won_at: "2025-10-01T00:00:00Z" }), // older than 12 months
  ];
  const u = unitEconomics({ leads, period: october, cac: null, ownerHourCost: null, outboundTrailingRevenue: 180000, now });
  assertEquals(u.trailingRevenue, 380000);
  assertEquals(vatStatus(u.trailingRevenue), "mandatory");
  assertEquals(vatStatus(190000), "voluntary");
  assertEquals(vatStatus(100000), "below");
});

Deno.test("ratings follow the benchmark direction", () => {
  assertEquals(rate(3.2, BENCHMARKS.ltvToCac), "good");
  assertEquals(rate(1.5, BENCHMARKS.ltvToCac), "ok");
  assertEquals(rate(0.8, BENCHMARKS.ltvToCac), "low");
  assertEquals(rate(0.4, BENCHMARKS.paybackProjects, true), "good");
  assertEquals(rate(2.5, BENCHMARKS.paybackProjects, true), "low");
  assertEquals(rate(null, BENCHMARKS.winRate), null);
});

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  outboundWins,
  summarize,
  USD_TO_SAR,
  type CostChannel,
  type CostRow,
  type LeadRow,
  type Period,
  type SnapshotRow,
} from "@/lib/acquisition";
import { BENCHMARKS, rate, unitEconomics, vatStatus, type Rating, type UnitLead } from "@/lib/unitEconomics";

interface CostEntry extends CostRow {
  id: string;
  category: string;
  note: string | null;
}

type PeriodKey = "this_month" | "last_month" | "last_90" | "all";

const PERIODS: { value: PeriodKey; label: string }[] = [
  { value: "this_month", label: "هذا الشهر" },
  { value: "last_month", label: "الشهر الماضي" },
  { value: "last_90", label: "آخر 90 يومًا" },
  { value: "all", label: "منذ البداية" },
];

const CATEGORIES: Record<string, string> = {
  hosting: "استضافة وخدمات",
  tools: "أدوات واشتراكات",
  ads: "إعلانات",
  time: "وقتك (تقديري)",
  other: "أخرى",
};

const CHANNELS: Record<CostChannel, string> = {
  shared: "مشتركة",
  website: "الموقع",
  outbound: "التواصل الصادر",
};

const SOURCES: Record<string, string> = {
  google: "بحث Google",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  behance: "Behance",
  referral: "ترشيح",
  returning: "عميل سابق",
  other: "أخرى",
  unknown: "غير محدد",
};

const periodFor = (key: PeriodKey, now = new Date()): Period => {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const tomorrow = new Date(Date.UTC(y, m, now.getUTCDate() + 1));
  if (key === "this_month") return { from: new Date(Date.UTC(y, m, 1)), to: tomorrow };
  if (key === "last_month") return { from: new Date(Date.UTC(y, m - 1, 1)), to: new Date(Date.UTC(y, m, 1)) };
  if (key === "last_90") return { from: new Date(tomorrow.getTime() - 91 * 86_400_000), to: tomorrow };
  return { from: null, to: tomorrow };
};

const sar = (value: number | null) =>
  value === null ? "—" : `${Math.round(value).toLocaleString("en-US")} ر.س`;
const pct = (value: number | null) => (value === null ? "—" : `${Math.round(value * 100)}%`);
const times = (value: number | null) => (value === null ? "—" : `${value.toFixed(1)}×`);

// Typed as string so the client skips parsing the JSON path in the select.
const SNAPSHOT_COLUMNS: string = "generated_at, daily_cost:payload->daily_cost";
const OUTCOME_COLUMNS: string = "generated_at, outcomes:payload->outcomes";

const thisMonth = () => new Date().toISOString().slice(0, 7);

const RATINGS: Record<Rating, { label: string; className: string }> = {
  good: { label: "ضمن المعيار", className: "bg-primary/10 text-primary" },
  ok: { label: "مقبول", className: "bg-muted text-foreground" },
  low: { label: "دون المعيار", className: "bg-destructive/10 text-destructive" },
};

const VAT_STATUS = {
  below: "دون حد التسجيل الاختياري.",
  voluntary: "تجاوزت حد التسجيل الاختياري (187,500 ر.س): التسجيل متاح لك.",
  mandatory: "تجاوزت حد التسجيل الإلزامي (375,000 ر.س): يلزمك التسجيل في ضريبة القيمة المضافة.",
};

export default function CostsPanel() {
  const [periodKey, setPeriodKey] = useState<PeriodKey>("this_month");
  const [leads, setLeads] = useState<(LeadRow & UnitLead)[]>([]);
  const [hourCost, setHourCost] = useState<number | null>(null);
  const [hourCostInput, setHourCostInput] = useState("");
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ month: thisMonth(), category: "tools", channel: "shared" as CostChannel, amount: "", note: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [leadsRes, costsRes, snapsRes, outcomesRes, settingsRes] = await Promise.all([
      supabase
        .from("leads")
        .select("email, created_at, status, won_at, deal_value_sar, delivery_cost_sar, delivery_hours, heard_from"),
      supabase.from("acquisition_costs").select("id, month, category, channel, amount_sar, note").order("month", { ascending: false }),
      // Only the small daily_cost array, not the whole snapshot payload.
      supabase
        .from("agent_snapshots")
        .select(SNAPSHOT_COLUMNS)
        .order("generated_at", { ascending: false })
        .limit(3000)
        .returns<{ generated_at: string; daily_cost: SnapshotRow["payload"]["daily_cost"] | null }[]>(),
      // Outbound wins: the newest snapshot already lists 90 days of deals.
      supabase
        .from("agent_snapshots")
        .select(OUTCOME_COLUMNS)
        .order("generated_at", { ascending: false })
        .limit(1)
        .returns<{ generated_at: string; outcomes: SnapshotRow["payload"]["outcomes"] | null }[]>(),
      supabase.from("unit_economics_settings").select("owner_hour_cost_sar").maybeSingle(),
    ]);
    const failed = leadsRes.error || costsRes.error || snapsRes.error || outcomesRes.error || settingsRes.error;
    if (failed) {
      console.error("costs panel load failed", failed);
      setError("تعذّر تحميل البيانات. حدّث الصفحة أو أعد تسجيل الدخول.");
    } else {
      setLeads((leadsRes.data ?? []) as (LeadRow & UnitLead)[]);
      const cost = settingsRes.data?.owner_hour_cost_sar ?? null;
      setHourCost(cost);
      setHourCostInput(cost !== null ? String(cost) : "");
      setCosts((costsRes.data ?? []) as CostEntry[]);
      setSnapshots([
        ...(snapsRes.data ?? []).map((row) => ({
          generated_at: row.generated_at,
          payload: { daily_cost: row.daily_cost ?? [] },
        })),
        ...(outcomesRes.data ?? [])
          .filter((row) => row.outcomes)
          .map((row) => ({ generated_at: row.generated_at, payload: { outcomes: row.outcomes ?? undefined } })),
      ]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const s = useMemo(
    () => summarize({ leads, costs, snapshots, period: periodFor(periodKey) }),
    [leads, costs, snapshots, periodKey],
  );

  const u = useMemo(() => {
    const now = new Date();
    const year = { from: new Date(now.getTime() - 365 * 86_400_000), to: now };
    const outboundTrailingRevenue = outboundWins(snapshots, year).wins.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
    return unitEconomics({
      leads,
      period: periodFor(periodKey, now),
      cac: s.website.cac,
      ownerHourCost: hourCost,
      outboundTrailingRevenue,
      now,
    });
  }, [leads, snapshots, periodKey, s.website.cac, hourCost]);

  const saveHourCost = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(hourCostInput);
    if (!(value > 0)) {
      setError("أدخل تكلفة ساعة أكبر من صفر.");
      return;
    }
    const { error: err } = await supabase
      .from("unit_economics_settings")
      .update({ owner_hour_cost_sar: value, updated_at: new Date().toISOString() })
      .eq("id", true);
    if (err) {
      console.error("save hour cost failed", err);
      setError("تعذّر حفظ تكلفة الساعة.");
      return;
    }
    setError("");
    setHourCost(value);
  };

  const addCost = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!(amount > 0)) {
      setError("أدخل مبلغًا أكبر من صفر.");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("acquisition_costs").insert({
      month: `${form.month}-01`,
      category: form.category,
      channel: form.channel,
      amount_sar: amount,
      note: form.note.trim() || null,
    });
    setSaving(false);
    if (err) {
      console.error("add cost failed", err);
      setError("تعذّر حفظ التكلفة. حاول مرة أخرى.");
      return;
    }
    setForm((f) => ({ ...f, amount: "", note: "" }));
    load();
  };

  const removeCost = async (id: string) => {
    const { error: err } = await supabase.from("acquisition_costs").delete().eq("id", id);
    if (err) {
      console.error("delete cost failed", err);
      setError("تعذّر حذف التكلفة.");
      return;
    }
    setCosts((items) => items.filter((c) => c.id !== id));
  };

  const kpis = [
    { label: "إجمالي التكاليف", value: sar(s.cost.total), hint: "كل القنوات، ومنها الوكلاء" },
    {
      label: "عملاء جدد",
      value: String(s.overall.wins),
      hint: `الموقع ${s.website.wins} · الصادر ${s.outbound.available ? s.outbound.wins : "—"}`,
    },
    { label: "تكلفة اكتساب العميل (CAC)", value: sar(s.overall.cac), hint: "كل التكاليف ÷ كل العملاء" },
    { label: "الإيرادات", value: sar(s.overall.revenue), hint: "قيم الصفقات الرابحة من القناتين" },
    { label: "العائد لكل ريال", value: times(s.overall.returnPerRiyal), hint: "الإيرادات ÷ كل التكاليف" },
    { label: "متوسط الصفقة ÷ CAC", value: times(s.overall.dealToCac), hint: "إيراد لا ربح؛ انظر LTV:CAC أدناه" },
  ];

  const units: { label: string; value: string; hint: string; rating: Rating | null; bench: string }[] = [
    {
      label: "LTV:CAC",
      value: times(u.ltvToCac),
      hint: `قيمة العميل ${sar(u.ltv)} (ربح إجمالي) ÷ CAC الموقع ${sar(s.website.cac)}`,
      rating: rate(u.ltvToCac, BENCHMARKS.ltvToCac),
      bench: BENCHMARKS.ltvToCac.label,
    },
    {
      label: "استرداد CAC (بالمشاريع)",
      value: u.paybackProjects === null ? "—" : u.paybackProjects.toFixed(2),
      hint: `CAC ÷ متوسط ربح المشروع ${sar(u.avgGrossProfit)}`,
      rating: rate(u.paybackProjects, BENCHMARKS.paybackProjects, true),
      bench: BENCHMARKS.paybackProjects.label,
    },
    {
      label: "هامش التسليم",
      value: pct(u.deliveryMargin),
      hint: `الربح الإجمالي ${sar(u.grossProfit)} بعد تكاليف التنفيذ ووقتك`,
      rating: rate(u.deliveryMargin, BENCHMARKS.deliveryMargin),
      bench: BENCHMARKS.deliveryMargin.label,
    },
    {
      label: "دخل ساعتك الفعلي",
      value: sar(u.effectiveHourlyRate),
      hint: `(القيمة − تكاليف التنفيذ) ÷ ${u.hours} ساعة`,
      rating: hourCost === null ? null : rate(u.effectiveHourlyRate, { good: hourCost, ok: hourCost }),
      bench: hourCost === null ? "حدّد تكلفة ساعتك" : `أعلى من تكلفة ساعتك (${sar(hourCost)})`,
    },
    {
      label: "نسبة الفوز",
      value: pct(u.winRate),
      hint: "فوز ÷ (فوز + خسارة) من طلبات الفترة",
      rating: rate(u.winRate, BENCHMARKS.winRate),
      bench: BENCHMARKS.winRate.label,
    },
    {
      label: "مدة البيع (الوسيط)",
      value: u.salesCycleDays === null ? "—" : `${Math.round(u.salesCycleDays)} يومًا`,
      hint: "من وصول الطلب إلى الفوز",
      rating: null,
      bench: BENCHMARKS.salesCycleDays.label,
    },
    {
      label: "العملاء المتكررون",
      value: pct(u.repeatRate),
      hint: `${u.clients} عميل · ${u.projectsPerClient === null ? "—" : u.projectsPerClient.toFixed(2)} مشروع لكل عميل (منذ البداية)`,
      rating: null,
      bench: "يرفع LTV مباشرة",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="الفترة" className="inline-flex rounded-md border bg-card p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              role="tab"
              aria-selected={periodKey === p.value}
              onClick={() => setPeriodKey(p.value)}
              className={`rounded px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                periodKey === p.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`ml-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold tabular-nums text-primary">{k.value}</div>
              <p className="mt-1 font-medium">{k.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {s.website.unvaluedWins > 0 && (
        <p className="rounded-md border border-border bg-muted p-4 text-sm">
          {s.website.unvaluedWins} صفقة رابحة من الموقع بلا قيمة، فلا تدخل في الإيرادات ومتوسط الصفقة. أضف قيمتها من تفاصيل الطلب في تبويب «طلبات الموقع».
        </p>
      )}
      {s.outbound.unvaluedWins > 0 && (
        <p className="rounded-md border border-border bg-muted p-4 text-sm">
          {s.outbound.unvaluedWins} صفقة رابحة من التواصل الصادر بلا قيمة. أضف القيمة المتوقعة للصفقة في نظام الوكلاء.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>اقتصاديات الوحدة: عميل الموقع</CardTitle>
          <p className="text-sm text-muted-foreground">
            محسوبة على الربح الإجمالي لا الإيراد: قيمة الصفقة قبل الضريبة − تكاليف التنفيذ − ساعاتك × تكلفة ساعتك.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={saveHourCost} className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">تكلفة ساعتك (ر.س)</span>
              <Input
                type="number"
                min="1"
                step="1"
                dir="ltr"
                className="w-40"
                value={hourCostInput}
                onChange={(e) => setHourCostInput(e.target.value)}
              />
            </label>
            <Button type="submit" variant="outline">حفظ</Button>
            <p className="basis-full text-xs text-muted-foreground">
              ما يكلّفه أن توظّف من ينفّذ عملك، أو الدخل الذي تريده لكل ساعة. لا يوجد مرجع سعودي حديث وموثوق لها، فحدّدها أنت.
            </p>
          </form>

          {u.wins > u.costed && (
            <p className="rounded-md border border-border bg-muted p-4 text-sm">
              {u.wins - u.costed} من {u.wins} صفقة رابحة في الفترة تنقصها القيمة أو تكاليف التنفيذ أو الساعات، فلا تدخل في الهامش وLTV.
              أكملها من تفاصيل الطلب في تبويب «طلبات الموقع».
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((k) => (
              <div key={k.label} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-2xl font-bold tabular-nums text-primary">{k.value}</div>
                  {k.rating && (
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${RATINGS[k.rating].className}`}>
                      {RATINGS[k.rating].label}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-medium">{k.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
                <p className="mt-2 text-xs">المعيار: {k.bench}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border p-4">
            <p className="font-medium">ضريبة القيمة المضافة: إيراد آخر 12 شهرًا {sar(u.trailingRevenue)}</p>
            <div className="mt-3 h-2 overflow-hidden rounded bg-muted" aria-hidden="true">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(100, (u.trailingRevenue / BENCHMARKS.vat.mandatory) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-sm">{VAT_STATUS[vatStatus(u.trailingRevenue)]}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              يشمل الصفقات المسجّلة هنا فقط، وصفقات الصادر لآخر 90 يومًا. ليس استشارة ضريبية؛ تحقّق من الهيئة.
            </p>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer font-medium">المنهجية والمصادر</summary>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {Object.values(BENCHMARKS).map((b) => (
                <li key={b.source + b.label}>
                  {b.label}: {b.note}{" "}
                  <a href={b.source} target="_blank" rel="noreferrer" className="underline" dir="ltr">
                    المصدر
                  </a>
                </li>
              ))}
              <li>
                LTV فعلي لا متوقع: متوسط ربح المشروع × مشاريع كل عميل منذ البداية. صفقات التواصل الصادر لا تدخل هنا حتى تحمل تكاليفها وساعاتها.
              </li>
            </ul>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>حسب القناة</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>القناة</TableHead>
                <TableHead>الطلبات</TableHead>
                <TableHead>العملاء</TableHead>
                <TableHead>التحويل</TableHead>
                <TableHead>الإيرادات</TableHead>
                <TableHead>التكلفة</TableHead>
                <TableHead>CAC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">الموقع</TableCell>
                <TableCell className="tabular-nums">{s.website.briefs}</TableCell>
                <TableCell className="tabular-nums">{s.website.wins}</TableCell>
                <TableCell className="tabular-nums">{pct(s.website.conversion)}</TableCell>
                <TableCell className="tabular-nums">{sar(s.website.revenue)}</TableCell>
                <TableCell className="tabular-nums">{sar(s.website.cost)}</TableCell>
                <TableCell className="tabular-nums">{sar(s.website.cac)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">التواصل الصادر (الوكلاء)</TableCell>
                {s.outbound.available ? (
                  <>
                    <TableCell>—</TableCell>
                    <TableCell className="tabular-nums">{s.outbound.wins}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell className="tabular-nums">{sar(s.outbound.revenue)}</TableCell>
                  </>
                ) : (
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    بانتظار أول لقطة من نظام الوكلاء تحمل نتائج الصفقات.
                  </TableCell>
                )}
                <TableCell className="tabular-nums">{sar(s.outbound.cost)}</TableCell>
                <TableCell className="tabular-nums">{sar(s.outbound.cac)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-4 text-xs text-muted-foreground">
            التكلفة: مشتركة {sar(s.cost.shared)} · الموقع {sar(s.cost.website)} · الصادر يدويًا {sar(s.cost.outbound - s.cost.agents)} ·
            الوكلاء تلقائيًا {sar(s.cost.agents)} (بسعر {USD_TO_SAR} ر.س للدولار). التكاليف الشهرية تُحسب كاملة إذا تقاطع شهرها مع الفترة.
            CAC الموقع يحمّل التكاليف المشتركة، وCAC الصادر تكاليفه المباشرة فقط.
            {s.outbound.days ? ` صفقات الصادر متاحة لآخر ${s.outbound.days} يومًا فقط.` : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>عملاء الموقع حسب «كيف عرفت عنّا؟»</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {s.bySource.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">لا طلبات في هذه الفترة.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المصدر</TableHead>
                  <TableHead>الطلبات</TableHead>
                  <TableHead>العملاء</TableHead>
                  <TableHead>الإيرادات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.bySource.map((row) => (
                  <TableRow key={row.source}>
                    <TableCell>{SOURCES[row.source] ?? row.source}</TableCell>
                    <TableCell className="tabular-nums">{row.briefs}</TableCell>
                    <TableCell className="tabular-nums">{row.wins}</TableCell>
                    <TableCell className="tabular-nums">{sar(row.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التكاليف الشهرية</CardTitle>
          <p className="text-sm text-muted-foreground">
            تكلفة الوكلاء تُسحب تلقائيًا، فلا تُدخلها هنا. أدخل الاستضافة والأدوات والإعلانات، ووقتك تقديريًا إن أردت.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={addCost} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">الشهر</span>
              <Input type="month" required value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} dir="ltr" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">البند</span>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {Object.entries(CATEGORIES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">القناة</span>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3"
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value as CostChannel }))}
              >
                {Object.entries(CHANNELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted-foreground">المبلغ (ر.س)</span>
              <Input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} dir="ltr" />
            </label>
            <label className="text-sm lg:col-span-1">
              <span className="mb-1 block text-muted-foreground">ملاحظة</span>
              <Input maxLength={300} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </label>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                <Plus className="ml-2 h-4 w-4" />
                إضافة
              </Button>
            </div>
          </form>

          {costs.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">لم تُسجَّل تكاليف بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الشهر</TableHead>
                    <TableHead>البند</TableHead>
                    <TableHead>القناة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>ملاحظة</TableHead>
                    <TableHead><span className="sr-only">حذف</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {costs.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell dir="ltr" className="tabular-nums">{c.month.slice(0, 7)}</TableCell>
                      <TableCell>{CATEGORIES[c.category] ?? c.category}</TableCell>
                      <TableCell>{CHANNELS[c.channel] ?? c.channel}</TableCell>
                      <TableCell className="tabular-nums">{sar(Number(c.amount_sar))}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.note ?? ""}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCost(c.id)}
                          aria-label={`حذف ${CATEGORIES[c.category] ?? c.category} ${c.month.slice(0, 7)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

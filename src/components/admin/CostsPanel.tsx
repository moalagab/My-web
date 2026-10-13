import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  summarize,
  USD_TO_SAR,
  type CostChannel,
  type CostRow,
  type LeadRow,
  type Period,
  type SnapshotRow,
} from "@/lib/acquisition";

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

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function CostsPanel() {
  const [periodKey, setPeriodKey] = useState<PeriodKey>("this_month");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [costs, setCosts] = useState<CostEntry[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ month: thisMonth(), category: "tools", channel: "shared" as CostChannel, amount: "", note: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [leadsRes, costsRes, snapsRes] = await Promise.all([
      supabase.from("leads").select("created_at, status, won_at, deal_value_sar, heard_from"),
      supabase.from("acquisition_costs").select("id, month, category, channel, amount_sar, note").order("month", { ascending: false }),
      // Only the small daily_cost array, not the whole snapshot payload.
      supabase
        .from("agent_snapshots")
        .select(SNAPSHOT_COLUMNS)
        .order("generated_at", { ascending: false })
        .limit(3000)
        .returns<{ generated_at: string; daily_cost: SnapshotRow["payload"]["daily_cost"] | null }[]>(),
    ]);
    const failed = leadsRes.error || costsRes.error || snapsRes.error;
    if (failed) {
      console.error("costs panel load failed", failed);
      setError("تعذّر تحميل البيانات. حدّث الصفحة أو أعد تسجيل الدخول.");
    } else {
      setLeads((leadsRes.data ?? []) as LeadRow[]);
      setCosts((costsRes.data ?? []) as CostEntry[]);
      setSnapshots(
        (snapsRes.data ?? []).map((row) => ({
          generated_at: row.generated_at,
          payload: { daily_cost: row.daily_cost ?? [] },
        })),
      );
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
    { label: "عملاء جدد من الموقع", value: String(s.website.wins), hint: `من ${s.website.briefs} طلب في الفترة` },
    { label: "تكلفة اكتساب العميل (CAC)", value: sar(s.website.cac), hint: "تكاليف الموقع + المشتركة ÷ عملاء الموقع" },
    { label: "الإيرادات", value: sar(s.website.revenue), hint: "قيم الصفقات الرابحة" },
    { label: "العائد لكل ريال", value: times(s.website.returnPerRiyal), hint: "الإيرادات ÷ تكلفة الموقع" },
    { label: "متوسط الصفقة ÷ CAC", value: times(s.website.dealToCac), hint: "الصحي 3× أو أكثر" },
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
          {s.website.unvaluedWins} صفقة رابحة بلا قيمة، فلا تدخل في الإيرادات ومتوسط الصفقة. أضف قيمتها من تفاصيل الطلب في تبويب «طلبات الموقع».
        </p>
      )}

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
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  نتائج الصفقات الصادرة تُسجَّل في نظام الوكلاء، ولقطته لا ترسلها للموقع بعد.
                </TableCell>
                <TableCell className="tabular-nums">{sar(s.outbound.cost)}</TableCell>
                <TableCell>—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-4 text-xs text-muted-foreground">
            التكلفة: مشتركة {sar(s.cost.shared)} · الموقع {sar(s.cost.website)} · الصادر يدويًا {sar(s.cost.outbound - s.cost.agents)} ·
            الوكلاء تلقائيًا {sar(s.cost.agents)} (بسعر {USD_TO_SAR} ر.س للدولار). التكاليف الشهرية تُحسب كاملة إذا تقاطع شهرها مع الفترة.
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

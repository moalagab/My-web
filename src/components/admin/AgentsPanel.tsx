import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import { AlertCircle, AlertTriangle, ExternalLink, Power, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Shape written by processors/site_mirror.py in the mo-agents repo (schema 1).
interface AgentSnapshot {
  schema: number;
  tenant: string;
  brand?: string;
  generated_at: string;
  console_url?: string | null;
  kpis?: Record<string, number>;
  targets?: Record<string, number>;
  alarms?: { positive_share_min?: number; positive_share_healthy?: [number, number] };
  funnel?: { state: string; count: number }[];
  pending?: { approvals?: number; human_replies?: number; handoffs_due?: number };
  budget?: { spent_today_usd?: number; cap_usd?: number };
  switches?: { kill_switch?: boolean; whatsapp_paused?: boolean };
  alerts?: { level?: string; text?: string }[];
  agents?: {
    agent: string;
    label?: string;
    runs?: number;
    cost_usd?: number;
    errors?: number;
    avg_duration_ms?: number;
    last_run_at?: string | null;
    last_error?: string | null;
  }[];
  jobs?: { id: string; label?: string; next_run_at?: string | null }[];
  daily_cost?: { date: string; cost_usd: number }[];
  drafts?: { total?: number; auto?: number; human?: number; edited_rate?: number; avg_voice?: number };
  intents?: { intent: string; count: number }[];
  meetings?: { lead_name?: string; meeting_at?: string; recommended_tier?: string; delivered?: boolean; outcome?: string | null }[];
  top_accounts?: {
    name?: string;
    sector_cluster?: string;
    tier?: string;
    fit_score?: number;
    state?: string;
    next_action_at?: string | null;
  }[];
  tiers?: Record<string, number>;
  clusters?: Record<string, number>;
  accounts_total?: number;
}

const STALE_AFTER_MS = 2 * 60 * 60 * 1000;

const KPI_ROWS: { key: string; label: string }[] = [
  { key: "new_qualified_accounts", label: "حسابات مؤهلة جديدة" },
  { key: "first_touches", label: "لمسات أولى" },
  { key: "positive_replies", label: "ردود إيجابية" },
  { key: "discovery_meetings", label: "مكالمات اكتشاف" },
];

const STATE_LABELS: Record<string, string> = {
  NEW: "جديد",
  ENRICHED: "مُثرى",
  QUALIFIED_FIT: "مطابق للـICP",
  QUEUED: "في الطابور",
  CONTACTED: "تم التواصل",
  ENGAGED: "تفاعل",
  QUALIFYING: "قيد التأهيل",
  MEETING_SET: "موعد محجوز",
  HANDED_OFF: "سُلّم لك",
  NURTURE: "رعاية",
  STALLED: "متوقف",
  DO_NOT_CONTACT: "لا تواصل",
  DISQUALIFIED: "مستبعد",
};

const INTENT_LABELS: Record<string, string> = {
  INTERESTED: "مهتم",
  INFO_QUESTION: "سؤال",
  PRICING: "سعر",
  OBJECTION: "اعتراض",
  NOT_NOW: "ليس الآن",
  WRONG_PERSON: "شخص آخر",
  OPT_OUT: "إيقاف",
  UNCLEAR: "غير واضح",
};

const CLUSTER_LABELS: Record<string, string> = {
  logistics: "لوجستيات",
  contracting_fm: "مقاولات ومرافق",
  b2b_supply: "توريد B2B",
  professional_services: "خدمات مهنية",
  funded_startup: "مؤسس ممول",
  partner: "شريك",
};

const pct = (value: number) => `${Math.round(value * 100)}%`;
const usd = (value?: number) => `$${(value ?? 0).toFixed(2)}`;
const when = (iso?: string | null) =>
  iso ? formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ar }) : "—";
const at = (iso?: string | null) => (iso ? format(new Date(iso), "dd MMM HH:mm", { locale: ar }) : "—");

function Meter({ value, max, tone = "primary" }: { value: number; max: number; tone?: "primary" | "warn" | "bad" }) {
  const width = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const color = tone === "bad" ? "bg-destructive" : tone === "warn" ? "bg-accent" : "bg-primary";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-md border bg-card p-4">
      <div className="text-2xl font-bold tabular-nums text-primary">{value}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function BarList({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">لا بيانات بعد.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[8rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="truncate">{row.label}</span>
          <Meter value={row.count} max={max} />
          <span className="text-end tabular-nums text-muted-foreground">{row.count}</span>
        </li>
      ))}
    </ul>
  );
}

export default function AgentsPanel() {
  const [snap, setSnap] = useState<AgentSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("agent_snapshots")
      .select("payload, generated_at")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (err) {
      console.error("agent snapshot load failed", err);
      setError("تعذّر تحميل بيانات الوكلاء. حدّث الصفحة أو أعد تسجيل الدخول.");
    } else {
      setSnap((data?.payload as unknown as AgentSnapshot) ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !snap) {
    return <p className="py-12 text-center text-muted-foreground">جارٍ تحميل بيانات الوكلاء…</p>;
  }

  if (error) {
    return (
      <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </p>
    );
  }

  if (!snap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">لم تصل بيانات من الوكلاء بعد</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>تظهر هنا كل ساعة لقطة من خادم الوكلاء: مؤشرات الأسبوع، القمع، الردود، المواعيد، وصحة كل وكيل.</p>
          <ol className="list-decimal space-y-1 ps-5">
            <li>
              طبّق مخطط الوكلاء <code dir="ltr">deploy/agents_schema.sql</code> من مستودع mo-agents على هذا المشروع،
              وأضف <code dir="ltr">agents</code> إلى Exposed schemas.
            </li>
            <li>
              شغّل خدمة <code dir="ltr">mo-agents</code> على الخادم بمفتاح هذا المشروع.
            </li>
            <li>أول لقطة تصل عند الدقيقة ٢٥ من الساعة التالية.</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  const generated = new Date(snap.generated_at);
  const stale = Date.now() - generated.getTime() > STALE_AFTER_MS;
  const kpis = snap.kpis ?? {};
  const targets = snap.targets ?? {};
  const share = kpis.positive_share_of_replies ?? 0;
  const shareMin = snap.alarms?.positive_share_min ?? 0.2;
  const replies = kpis.total_replies ?? 0;
  const funnel = (snap.funnel ?? []).filter((row) => row.count > 0);
  const budget = snap.budget ?? {};
  const spentShare = budget.cap_usd ? (budget.spent_today_usd ?? 0) / budget.cap_usd : 0;
  const maxDaily = Math.max(0.01, ...(snap.daily_cost ?? []).map((d) => d.cost_usd));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          آخر تحديث {when(snap.generated_at)} <span className="tabular-nums">({at(snap.generated_at)})</span>
        </p>
        {stale && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" /> البيانات أقدم من ساعتين
          </Badge>
        )}
        {snap.switches?.kill_switch && (
          <Badge variant="destructive" className="gap-1">
            <Power className="h-3 w-3" /> مفتاح الإيقاف مفعّل
          </Badge>
        )}
        {snap.switches?.whatsapp_paused && <Badge variant="secondary">واتساب متوقف</Badge>}
        <div className="ms-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          {snap.console_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={`${snap.console_url}/console`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="ml-2 h-4 w-4" />
                لوحة الوكلاء الكاملة
              </a>
            </Button>
          )}
        </div>
      </div>

      {(snap.alerts ?? []).length > 0 && (
        <ul className="space-y-2">
          {(snap.alerts ?? []).map((alert, index) => (
            <li
              key={index}
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              {alert.text}
            </li>
          ))}
        </ul>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="مسودات تنتظر اعتمادك" value={snap.pending?.approvals ?? 0} hint="تُعتمد من تيليجرام أو اللوحة الكاملة" />
        <Stat label="ردود تحتاج ردك أنت" value={snap.pending?.human_replies ?? 0} hint="سعر، اعتراض، أو رد غير واضح" />
        <Stat label="حزم تسليم مستحقة" value={snap.pending?.handoffs_due ?? 0} hint="قبل الموعد بـ٢٤ ساعة" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">هذا الأسبوع مقابل الهدف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {KPI_ROWS.map(({ key, label }) => {
              const value = kpis[key] ?? 0;
              const target = targets[key] ?? 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {value} / {target || "—"}
                    </span>
                  </div>
                  <Meter value={value} max={target || value || 1} />
                </div>
              );
            })}
            <div className="space-y-1 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>نسبة الردود الإيجابية</span>
                <span className="tabular-nums text-muted-foreground">
                  {replies ? `${pct(share)} من ${replies} رد` : "لا ردود بعد"}
                </span>
              </div>
              <Meter value={share} max={1} tone={replies && share < shareMin ? "bad" : "primary"} />
              {replies > 0 && share < shareMin && (
                <p className="text-xs text-destructive">
                  أقل من {pct(shareMin)}: الرسائل تصل لكنها تزعج. راجع الملاحظات الافتتاحية قبل زيادة الحجم.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              القمع <span className="text-sm font-normal text-muted-foreground">({snap.accounts_total ?? 0} حساب)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarList rows={funnel.map((row) => ({ label: STATE_LABELS[row.state] ?? row.state, count: row.count }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">نتائج التواصل (آخر ٣٠ يوماً)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold tabular-nums text-primary">{snap.drafts?.total ?? 0}</div>
                <p className="text-xs text-muted-foreground">رسالة أُرسلت</p>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums text-primary">{pct(snap.drafts?.edited_rate ?? 0)}</div>
                <p className="text-xs text-muted-foreground">عدّلتها قبل الإرسال</p>
              </div>
              <div>
                <div className="text-xl font-bold tabular-nums text-primary">{(snap.drafts?.avg_voice ?? 0).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">جودة الصوت (من ١)</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">نوايا الردود</p>
              <BarList rows={(snap.intents ?? []).map((row) => ({ label: INTENT_LABELS[row.intent] ?? row.intent, count: row.count }))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المواعيد القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            {(snap.meetings ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">لا مواعيد خلال الأسبوعين القادمين.</p>
            ) : (
              <ul className="divide-y">
                {(snap.meetings ?? []).map((meeting, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="font-medium">{meeting.lead_name ?? "—"}</span>
                    <span className="tabular-nums text-muted-foreground">{at(meeting.meeting_at)}</span>
                    <Badge variant={meeting.delivered ? "secondary" : "outline"}>
                      {meeting.delivered ? "الحزمة جاهزة" : "الحزمة لم تُرسل"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">أعلى الحسابات ملاءمة</CardTitle>
        </CardHeader>
        <CardContent>
          {(snap.top_accounts ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">لا حسابات بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنشأة</TableHead>
                    <TableHead>القطاع</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الدرجة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراء التالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(snap.top_accounts ?? []).map((account, index) => (
                    <TableRow key={`${account.name}-${index}`}>
                      <TableCell className="font-medium">{account.name ?? "—"}</TableCell>
                      <TableCell>{CLUSTER_LABELS[account.sector_cluster ?? ""] ?? account.sector_cluster ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={account.tier === "A" ? "default" : "outline"}>{account.tier ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="tabular-nums">{account.fit_score ?? "—"}</TableCell>
                      <TableCell>{STATE_LABELS[account.state ?? ""] ?? account.state ?? "—"}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground">
                        {at(account.next_action_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">صحة الوكلاء (آخر ٧ أيام)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوكيل</TableHead>
                  <TableHead>تشغيلات</TableHead>
                  <TableHead>أخطاء</TableHead>
                  <TableHead>التكلفة</TableHead>
                  <TableHead>آخر تشغيل</TableHead>
                  <TableHead>آخر خطأ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(snap.agents ?? []).map((agent) => (
                  <TableRow key={agent.agent}>
                    <TableCell className="font-medium">{agent.label ?? agent.agent}</TableCell>
                    <TableCell className="tabular-nums">{agent.runs ?? 0}</TableCell>
                    <TableCell>
                      {agent.errors ? <Badge variant="destructive">{agent.errors}</Badge> : <span className="text-muted-foreground">0</span>}
                    </TableCell>
                    <TableCell className="tabular-nums">{usd(agent.cost_usd)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{when(agent.last_run_at)}</TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground" title={agent.last_error ?? ""}>
                      {agent.last_error ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>إنفاق اليوم</span>
                <span className="tabular-nums text-muted-foreground">
                  {usd(budget.spent_today_usd)} / {usd(budget.cap_usd)}
                </span>
              </div>
              <Meter value={budget.spent_today_usd ?? 0} max={budget.cap_usd || 1} tone={spentShare > 0.85 ? "warn" : "primary"} />
            </div>
            <div>
              <p className="mb-2 text-sm">الإنفاق اليومي</p>
              <div className="flex h-16 items-end gap-1" role="img" aria-label="الإنفاق اليومي لآخر ٧ أيام">
                {(snap.daily_cost ?? []).map((day) => (
                  <div
                    key={day.date}
                    title={`${day.date}: ${usd(day.cost_usd)}`}
                    className="flex-1 rounded-t bg-primary/70"
                    style={{ height: `${Math.max(4, (day.cost_usd / maxDaily) * 100)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {(snap.jobs ?? []).length > 0 && (
            <div>
              <p className="mb-2 text-sm">المهام المجدولة القادمة</p>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {(snap.jobs ?? []).map((job) => (
                  <li key={job.id} className="flex justify-between gap-3">
                    <span>{job.label ?? job.id}</span>
                    <span className="tabular-nums text-muted-foreground">{at(job.next_run_at)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ContactClick {
  id: string;
  channel: string;
  page: string;
  location: string | null;
  locale: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

const LOCATIONS: Record<string, string> = {
  footer: "الفوتر",
  home_floating: "زر الرئيسية العائم",
  start_page: "صفحة النموذج",
  service_hero: "أعلى صفحة الخدمة",
  case_study: "نهاية دراسة الحالة",
  faq: "الأسئلة الشائعة",
};

const sourceOf = (c: ContactClick) => {
  if (c.utm_source) return [c.utm_source, c.utm_medium, c.utm_campaign].filter(Boolean).join(" / ");
  if (!c.referrer) return "مباشر";
  try {
    return new URL(c.referrer).hostname.replace(/^www\./, "");
  } catch {
    return c.referrer;
  }
};

/** WhatsApp clicks recorded by log_contact_click (no personal data). */
export default function ContactClicksPanel() {
  const [clicks, setClicks] = useState<ContactClick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("contact_clicks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) setError("تعذّر تحميل نقرات واتساب.");
    else setClicks((data as ContactClick[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const topPages = useMemo(() => {
    const counts = new Map<string, number>();
    clicks.forEach((c) => counts.set(c.page, (counts.get(c.page) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [clicks]);

  const last7 = clicks.filter((c) => Date.now() - new Date(c.created_at).getTime() < 7 * 864e5).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          كل نقرة على زر واتساب: الصفحة والمكان والمصدر، بدون أي بيانات شخصية.
        </p>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{clicks.length}</div>
            <p className="text-muted-foreground">كل النقرات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-primary">{last7}</div>
            <p className="text-muted-foreground">آخر 7 أيام</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="mb-2 text-muted-foreground">أكثر الصفحات</p>
            {topPages.length === 0 ? (
              <p className="text-sm">—</p>
            ) : (
              <ul className="space-y-1 text-sm" dir="ltr">
                {topPages.map(([page, n]) => (
                  <li key={page} className="flex justify-between gap-4">
                    <span className="truncate">{page}</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نقرات واتساب</CardTitle>
        </CardHeader>
        <CardContent>
          {clicks.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {loading ? "جارٍ التحميل..." : "لا توجد نقرات حتى الآن"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الصفحة</TableHead>
                    <TableHead>المكان</TableHead>
                    <TableHead>اللغة</TableHead>
                    <TableHead>المصدر</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clicks.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(c.created_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                      </TableCell>
                      <TableCell dir="ltr" className="text-left">{c.page}</TableCell>
                      <TableCell>{(c.location && LOCATIONS[c.location]) || c.location || "—"}</TableCell>
                      <TableCell>{c.locale === "en" ? "EN" : "AR"}</TableCell>
                      <TableCell dir="ltr" className="text-left">{sourceOf(c)}</TableCell>
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

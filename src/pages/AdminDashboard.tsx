import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { supabase } from "@/integrations/supabase/client";
import AgentsPanel from "@/components/admin/AgentsPanel";
import ContactClicksPanel from "@/components/admin/ContactClicksPanel";
import CostsPanel from "@/components/admin/CostsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Lock, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Wallet,
  Megaphone,
  Layers,
  Link as LinkIcon,
  MessageSquare,
  RefreshCw,
  LogOut,
  Eye,
  AlertCircle,
  Bot
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

type LeadStatus = "new" | "contacted" | "proposal" | "won" | "lost";

interface Lead {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  whatsapp: string | null;
  service_line: string;
  package: string | null;
  budget: string;
  timeline: string;
  description: string;
  links: string | null;
  locale: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  page_referrer: string | null;
  status: string;
  heard_from: string | null;
  agent_lead_id: string | null;
  deal_value_sar: number | null;
  delivery_cost_sar: number | null;
  delivery_hours: number | null;
}

const STATUSES: { value: LeadStatus; label: string; className: string }[] = [
  { value: "new", label: "جديد", className: "bg-primary text-primary-foreground" },
  { value: "contacted", label: "تم التواصل", className: "bg-accent text-accent-foreground" },
  { value: "proposal", label: "عرض سعر", className: "bg-secondary text-secondary-foreground" },
  { value: "won", label: "تم الفوز", className: "bg-accent text-accent-foreground" },
  { value: "lost", label: "خسارة", className: "bg-muted text-foreground" },
];

const HEARD_FROM: Record<string, string> = {
  google: "بحث Google",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  behance: "Behance",
  referral: "توصية",
  returning: "عميل سابق",
  other: "أخرى",
};
const heardFromLabel = (value: string | null) => (value && HEARD_FROM[value]) || "—";

const statusMeta = (status: string) =>
  STATUSES.find((item) => item.value === status) ?? STATUSES[0];

export const meta = () => [
  { title: "لوحة التحكم — Mo Alagab" },
  { name: "robots", content: "noindex, nofollow" },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<"leads" | "contacts" | "agents" | "costs">("leads");
  const [deal, setDeal] = useState({ value: "", cost: "", hours: "" });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // This callback runs under the auth lock; a Supabase query awaited here
        // deadlocks the client (the page hangs on the spinner). Run it after.
        const userId = session.user.id;
        setTimeout(() => checkAdminRole(userId), 0);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        await checkAdminRole(session.user.id);
      }
    } catch (err) {
      console.error("Auth check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      if (data && !error) {
        setIsAdmin(true);
        fetchLeads();
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error("Role check error:", err);
      setIsAdmin(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        setIsAuthenticated(true);
        await checkAdminRole(data.user.id);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError((err as Error)?.message === "Invalid login credentials" 
        ? "بيانات الدخول غير صحيحة" 
        : "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setEmail("");
    setPassword("");
  };

  const fetchLeads = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setLoadError("تعذّر تحميل الطلبات. حدّث الصفحة أو أعد تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (lead: Lead, status: LeadStatus) => {
    const previous = lead.status;
    const apply = (value: string) => {
      setLeads((items) =>
        items.map((item) => (item.id === lead.id ? { ...item, status: value } : item)),
      );
      setSelectedLead((item) => (item?.id === lead.id ? { ...item, status: value } : item));
    };
    apply(status);
    const { error } = await supabase.from("leads").update({ status }).eq("id", lead.id);
    if (error) {
      console.error("Error updating status:", error);
      apply(previous);
      setLoadError("تعذّر تحديث الحالة. حاول مرة أخرى.");
    }
  };

  const saveDeal = async (lead: Lead) => {
    const parse = (text: string) => (text.trim() === "" ? null : Number(text));
    const update = {
      deal_value_sar: parse(deal.value),
      delivery_cost_sar: parse(deal.cost),
      delivery_hours: parse(deal.hours),
    };
    if (Object.values(update).some((value) => value !== null && !(value >= 0))) {
      setLoadError("أدخل أرقامًا صحيحة للصفقة.");
      return;
    }
    const { error } = await supabase.from("leads").update(update).eq("id", lead.id);
    if (error) {
      console.error("Error saving deal:", error);
      setLoadError("تعذّر حفظ بيانات الصفقة. حاول مرة أخرى.");
      return;
    }
    setLeads((items) => items.map((item) => (item.id === lead.id ? { ...item, ...update } : item)));
    setSelectedLead((item) => (item?.id === lead.id ? { ...item, ...update } : item));
  };

  useEffect(() => {
    const text = (value: number | null | undefined) => (value != null ? String(value) : "");
    setDeal({
      value: text(selectedLead?.deal_value_sar),
      cost: text(selectedLead?.delivery_cost_sar),
      hours: text(selectedLead?.delivery_hours),
    });
  }, [selectedLead?.id, selectedLead?.deal_value_sar, selectedLead?.delivery_cost_sar, selectedLead?.delivery_hours]);

  const visibleLeads = filter === "all" ? leads : leads.filter((lead) => lead.status === filter);
  const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, "")}`;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">لوحة التحكم</CardTitle>
              <p className="text-muted-foreground">سجل دخولك للوصول</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center"
                  dir="ltr"
                  required
                />
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                  dir="ltr"
                  required
                />
                {error && (
                  <p className="text-destructive text-sm text-center">{error}</p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "جاري الدخول..." : "دخول"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  العودة للموقع
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-destructive/20">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">غير مصرح</CardTitle>
              <p className="text-muted-foreground">ليس لديك صلاحية الوصول لهذه الصفحة</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/")}
              >
                العودة للموقع
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Authenticated and is admin - show dashboard
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">لوحة التحكم</h1>
          <div className="flex items-center gap-4">
            {view === "leads" && (
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLeads}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${loading ? "animate-spin" : ""}`} />
                تحديث
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 ml-2" />
              خروج
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div role="tablist" aria-label="أقسام لوحة التحكم" className="mb-8 inline-flex rounded-md border bg-card p-1">
          {([
            { value: "leads", label: "طلبات الموقع" },
            { value: "contacts", label: "نقرات واتساب" },
            { value: "agents", label: "الوكلاء ونتائجهم" },
            { value: "costs", label: "التكاليف والعوائد" },
          ] as const).map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={view === tab.value}
              onClick={() => setView(tab.value)}
              className={`rounded px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                view === tab.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === "costs" ? (
          <CostsPanel />
        ) : view === "agents" ? (
          <AgentsPanel />
        ) : view === "contacts" ? (
          <ContactClicksPanel />
        ) : (
        <>
        {/* Stats double as status filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[{ value: "all" as const, label: "كل الطلبات", count: leads.length }, ...STATUSES.map((item) => ({
            value: item.value,
            label: item.label,
            count: leads.filter((lead) => lead.status === item.value).length,
          }))].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded-lg border bg-card p-6 text-start transition-colors ${
                filter === item.value ? "border-primary" : "border-border hover:border-accent"
              }`}
            >
              <div className="text-3xl font-bold text-primary">{item.count}</div>
              <p className="text-muted-foreground">{item.label}</p>
            </button>
          ))}
        </div>

        {loadError && (
          <p role="alert" className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {loadError}
          </p>
        )}

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            {visibleLeads.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {loading ? "جارٍ التحميل..." : "لا توجد طلبات هنا حتى الآن"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الخدمة</TableHead>
                      <TableHead>الميزانية</TableHead>
                      <TableHead>كيف عرفك</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>التفاصيل</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(lead.created_at), "dd MMM yyyy", { locale: ar })}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{lead.name}</p>
                          {lead.company && (
                            <p className="text-xs text-muted-foreground">{lead.company}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p>{lead.service_line}</p>
                          {lead.package && (
                            <p className="text-xs text-muted-foreground">{lead.package}</p>
                          )}
                        </TableCell>
                        <TableCell>{lead.budget}</TableCell>
                        <TableCell>{heardFromLabel(lead.heard_from)}</TableCell>
                        <TableCell>
                          <select
                            aria-label={`حالة طلب ${lead.name}`}
                            value={statusMeta(lead.status).value}
                            onChange={(event) => updateStatus(lead, event.target.value as LeadStatus)}
                            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                          >
                            {STATUSES.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label={`تفاصيل طلب ${lead.name}`}
                            onClick={() => setSelectedLead(lead)}
                          >
                            <Eye className="w-4 h-4" />
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
        </>
        )}
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {selectedLead.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{selectedLead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedLead.created_at), "dd MMM yyyy - HH:mm", { locale: ar })}
                    </p>
                  </div>
                </div>
                <Badge className={`${statusMeta(selectedLead.status).className} w-fit h-fit`}>
                  {statusMeta(selectedLead.status).label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span dir="ltr">{selectedLead.email}</span>
                </div>
                {selectedLead.whatsapp && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span dir="ltr">{selectedLead.whatsapp}</span>
                  </div>
                )}
                {selectedLead.company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedLead.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.timeline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.budget}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-muted-foreground" />
                  <span>{heardFromLabel(selectedLead.heard_from)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {selectedLead.service_line}
                    {selectedLead.package ? ` — ${selectedLead.package}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {selectedLead.agent_lead_id
                      ? "مسجّل في نظام الوكلاء (ENGAGED)"
                      : "غير مسجّل في نظام الوكلاء"}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  وصف المشروع
                </h4>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap">
                  {selectedLead.description}
                </div>
              </div>

              {selectedLead.links && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    روابط
                  </h4>
                  <p dir="ltr" className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                    {selectedLead.links}
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground" dir="ltr">
                {[
                  `locale: ${selectedLead.locale}`,
                  selectedLead.utm_source && `utm_source: ${selectedLead.utm_source}`,
                  selectedLead.utm_medium && `utm_medium: ${selectedLead.utm_medium}`,
                  selectedLead.utm_campaign && `utm_campaign: ${selectedLead.utm_campaign}`,
                  selectedLead.page_referrer && `referrer: ${selectedLead.page_referrer}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                <Button asChild className="flex-1">
                  <a href={`mailto:${selectedLead.email}`}>
                    <Mail className="w-4 h-4 ml-2" />
                    إرسال بريد
                  </a>
                </Button>
                {selectedLead.whatsapp && (
                  <Button variant="outline" asChild className="flex-1">
                    <a
                      href={whatsappHref(selectedLead.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="w-4 h-4 ml-2" />
                      واتساب
                    </a>
                  </Button>
                )}
                <select
                  aria-label="تغيير الحالة"
                  value={statusMeta(selectedLead.status).value}
                  onChange={(event) => updateStatus(selectedLead, event.target.value as LeadStatus)}
                  className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {STATUSES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLead.status === "won" && (
                <form
                  className="space-y-3 rounded-md border border-border p-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveDeal(selectedLead);
                  }}
                >
                  <p className="text-sm text-muted-foreground">
                    تُستخدم في تبويب «التكاليف والعوائد». المبالغ قبل ضريبة القيمة المضافة.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(
                      [
                        ["value", "قيمة الصفقة (ر.س)", "1"],
                        ["cost", "تكاليف التنفيذ (ر.س)", "1"],
                        ["hours", "ساعات عملك", "0.5"],
                      ] as const
                    ).map(([key, label, step]) => (
                      <label key={key} className="text-sm">
                        <span className="mb-1 block text-muted-foreground">{label}</span>
                        <Input
                          type="number"
                          min="0"
                          step={step}
                          dir="ltr"
                          value={deal[key]}
                          onChange={(event) => setDeal((d) => ({ ...d, [key]: event.target.value }))}
                        />
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    تكاليف التنفيذ: متعاونون، صور ومواد، طباعة، أدوات خاصة بالمشروع. لا تُدخل وقتك هنا؛ يُحسب من الساعات.
                  </p>
                  <Button type="submit">حفظ بيانات الصفقة</Button>
                </form>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

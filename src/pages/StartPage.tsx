import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Linkedin,
  Mail,
  MessageCircle,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Eyebrow } from "@/components/system/Eyebrow";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";
import { siteSettings } from "@/lib/site-content";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type ServiceKey = "brand" | "digital" | "ai" | "experiential" | "unsure";
type BudgetKey = "lt5k" | "5to10k" | "10to25k" | "gt25k" | "undecided";
type TimelineKey = "month" | "1to3" | "flexible";

const SERVICE_KEYS: ServiceKey[] = [
  "brand",
  "digital",
  "ai",
  "experiential",
  "unsure",
];
const BUDGET_KEYS: BudgetKey[] = [
  "lt5k",
  "5to10k",
  "10to25k",
  "gt25k",
  "undecided",
];
const TIMELINE_KEYS: TimelineKey[] = ["month", "1to3", "flexible"];
const TOTAL_STEPS = 3;
const MIN_DESCRIPTION = 30;
const MAX_DESCRIPTION = 1500;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\+?[\d\s-]{8,18}$/;

const StartPage = () => {
  const { lang, dictionary, isRtl } = useLanguage();
  const copy = dictionary.startPage;
  const form = copy.form;
  const serviceLines = dictionary.servicesPage.lines;
  const prefix = lang === "en" ? "/en" : "";
  const [params] = useSearchParams();
  const mountedAt = useRef(Date.now());

  const initialService =
    SERVICE_KEYS.find((key) => key === params.get("service")) ?? "";
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    whatsapp: "",
    service: initialService as ServiceKey | "",
    package: params.get("package") ?? "",
    budget: "" as BudgetKey | "",
    timeline: "" as TimelineKey | "",
    description: "",
    links: "",
    consent: false,
    website: "", // honeypot
  });

  const set = <K extends keyof typeof values>(
    key: K,
    value: (typeof values)[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key as string]) return prev;
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const packagesForService = useMemo(() => {
    const line = serviceLines.find((item) => item.slug === values.service);
    return line ? line.packages.map((item) => item.name) : [];
  }, [serviceLines, values.service]);

  const validate = (target: number) => {
    const next: Record<string, string> = {};
    if (target >= 1) {
      if (values.name.trim().length < 2) next.name = form.errors.name;
      if (!emailPattern.test(values.email.trim()))
        next.email = form.errors.email;
      if (values.whatsapp.trim() && !phonePattern.test(values.whatsapp.trim()))
        next.whatsapp = form.errors.whatsapp;
    }
    if (target >= 2) {
      if (!values.service) next.service = form.errors.service;
      if (!values.budget) next.budget = form.errors.budget;
      if (!values.timeline) next.timeline = form.errors.timeline;
    }
    if (target >= 3) {
      const length = values.description.trim().length;
      if (length < MIN_DESCRIPTION)
        next.description = form.errors.descriptionShort;
      else if (length > MAX_DESCRIPTION)
        next.description = form.errors.descriptionLong;
      if (!values.consent) next.consent = form.errors.consent;
    }
    return next;
  };

  const focusError = (issues: Record<string, string>) => {
    const key = Object.keys(issues)[0];
    requestAnimationFrame(() => document.getElementById(key)?.focus());
  };

  useEffect(() => {
    if (step > 1) {
      const progress = document.getElementById("form-progress");
      progress?.focus({ preventScroll: true });
      progress?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [step]);

  const goNext = (event?: React.MouseEvent) => {
    event?.preventDefault();
    const stepErrors = validate(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      focusError(stepErrors);
      return;
    }
    track("form_step_complete", { step });
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (step < TOTAL_STEPS) {
      goNext();
      return;
    }
    const allErrors = validate(TOTAL_STEPS);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstBadStep =
        allErrors.name || allErrors.email || allErrors.whatsapp
          ? 1
          : allErrors.service || allErrors.budget || allErrors.timeline
            ? 2
            : 3;
      setStep(firstBadStep);
      focusError(allErrors);
      return;
    }
    // Spam guards: honeypot + minimum time on page.
    if (values.website.trim() || Date.now() - mountedAt.current < 3000) {
      setDone(true);
      return;
    }

    setSubmitting(true);
    const payload = {
      name: values.name.trim(),
      company: values.company.trim() || null,
      email: values.email.trim(),
      whatsapp: values.whatsapp.trim() || null,
      service_line: form.options.service[values.service as ServiceKey],
      package: values.package.trim() || null,
      budget: form.options.budget[values.budget as BudgetKey],
      timeline: form.options.timeline[values.timeline as TimelineKey],
      description: values.description.trim(),
      links: values.links.trim() || null,
      consent: true,
      locale: lang,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      page_referrer:
        typeof document !== "undefined" ? document.referrer || null : null,
    };

    try {
      const { error } = await supabase.from("leads").insert(payload);
      if (error) throw error;
      void supabase.functions.invoke("notify-lead", { body: payload });
      track("form_step_complete", { step: TOTAL_STEPS });
      track("form_submit", { service: values.service });
      setDone(true);
    } catch (error) {
      const message = String((error as { message?: string })?.message ?? "");
      setErrors({
        submit: message.includes("rate_limit_exceeded")
          ? form.errors.rateLimit
          : form.errors.generic,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} role="alert" className="text-sm text-destructive">
        {errors[key]}
      </p>
    ) : null;

  const labelClass = "block text-sm font-medium text-foreground";
  const optionClass = (active: boolean) =>
    cn(
      "cursor-pointer rounded-md border px-4 py-3 text-start text-sm transition-colors",
      active
        ? "border-primary bg-secondary text-foreground"
        : "border-border bg-card text-muted-foreground hover:border-accent",
    );
  const NextIcon = isRtl ? ArrowLeft : ArrowRight;
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <>
      <Helmet>
        <title>{copy.metaTitle}</title>
        <meta name="description" content={copy.metaDescription} />
        <link rel="canonical" href={`https://moalagab.art${prefix}/start`} />
        <link rel="alternate" hrefLang="ar" href="https://moalagab.art/start" />
        <link
          rel="alternate"
          hrefLang="en"
          href="https://moalagab.art/en/start"
        />
      </Helmet>
      <Navigation />
      <main className="pt-20 start-page">
        <section className="bg-primary py-14 text-primary-foreground md:py-20">
          <SectionInner>
            <Eyebrow className="text-primary-foreground/70">
              {copy.eyebrow}
            </Eyebrow>
            <h1 className="mt-4 font-display text-4xl md:text-6xl">
              {copy.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-primary-foreground/80 md:text-lg">
              {copy.sub}
            </p>
          </SectionInner>
        </section>

        <Section className="bg-background">
          <SectionInner className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
            {/* Form column */}
            <div>
              {done ? (
                <div className="rounded-md border border-border bg-card p-8 text-center md:p-12">
                  <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-accent text-accent">
                    <Check className="h-5 w-5" />
                  </span>
                  <h2 className="font-display text-3xl">
                    {copy.success.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    {copy.success.body}
                  </p>
                </div>
              ) : (
                <form onSubmit={submit} noValidate aria-busy={submitting}>
                  {/* progress */}
                  <div
                    id="form-progress"
                    tabIndex={-1}
                    className="mb-8 scroll-mt-28"
                    role="group"
                    aria-label={form.progress
                      .replace("{current}", String(step))
                      .replace("{total}", String(TOTAL_STEPS))}
                  >
                    <p
                      className="eyebrow text-xs text-accent"
                      dir="ltr"
                      aria-live="polite"
                    >
                      {form.progress
                        .replace("{current}", String(step))
                        .replace("{total}", String(TOTAL_STEPS))}
                    </p>
                    <div className="mt-3 flex gap-2">
                      {form.steps.map((title, index) => (
                        <div key={title} className="flex-1">
                          <div
                            className={cn(
                              "h-1 rounded-full",
                              index < step ? "bg-accent" : "bg-border",
                            )}
                          />
                          <p
                            className={cn(
                              "mt-2 text-xs",
                              index + 1 === step
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* honeypot */}
                  <div
                    className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    <label>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={values.website}
                        onChange={(event) => set("website", event.target.value)}
                      />
                    </label>
                  </div>

                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="name">
                          {form.fields.name} *
                        </label>
                        <Input
                          autoComplete="name"
                          required
                          id="name"
                          value={values.name}
                          onChange={(event) => set("name", event.target.value)}
                          aria-invalid={!!errors.name}
                          aria-describedby={
                            errors.name ? "name-error" : undefined
                          }
                        />
                        {fieldError("name")}
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="company">
                          {form.fields.company}
                        </label>
                        <Input
                          autoComplete="organization"
                          id="company"
                          value={values.company}
                          onChange={(event) =>
                            set("company", event.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="email">
                          {form.fields.email} *
                        </label>
                        <Input
                          autoComplete="email"
                          required
                          id="email"
                          type="email"
                          dir="ltr"
                          value={values.email}
                          onChange={(event) => set("email", event.target.value)}
                          aria-invalid={!!errors.email}
                          aria-describedby={
                            errors.email ? "email-error" : undefined
                          }
                        />
                        {fieldError("email")}
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="whatsapp">
                          {form.fields.whatsapp}
                        </label>
                        <Input
                          id="whatsapp"
                          type="tel"
                          dir="ltr"
                          placeholder="+966"
                          value={values.whatsapp}
                          autoComplete="tel"
                          onChange={(event) =>
                            set("whatsapp", event.target.value)
                          }
                          aria-invalid={!!errors.whatsapp}
                          aria-describedby={
                            errors.whatsapp ? "whatsapp-error" : undefined
                          }
                        />
                        {fieldError("whatsapp")}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-8">
                      <fieldset
                        id="service"
                        tabIndex={-1}
                        aria-describedby={
                          errors.service ? "service-error" : undefined
                        }
                        className="space-y-3"
                      >
                        <legend className={labelClass}>
                          {form.fields.service} *
                        </legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {SERVICE_KEYS.map((key) => (
                            <label
                              key={key}
                              className={optionClass(values.service === key)}
                            >
                              <input
                                type="radio"
                                name="service"
                                className="sr-only"
                                checked={values.service === key}
                                onChange={() => {
                                  set("service", key);
                                  setValues((prev) => ({
                                    ...prev,
                                    package: "",
                                  }));
                                }}
                              />
                              <span dir={key === "unsure" ? undefined : "ltr"}>
                                {form.options.service[key]}
                              </span>
                            </label>
                          ))}
                        </div>
                        {fieldError("service")}
                      </fieldset>

                      {packagesForService.length > 0 && (
                        <fieldset className="space-y-3">
                          <legend className={labelClass}>
                            {form.fields.package}
                          </legend>
                          <div className="flex flex-wrap gap-2">
                            {packagesForService.map((name) => (
                              <label
                                key={name}
                                className={cn(
                                  optionClass(values.package === name),
                                  "py-2",
                                )}
                              >
                                <input
                                  type="radio"
                                  name="package"
                                  className="sr-only"
                                  checked={values.package === name}
                                  onChange={() => set("package", name)}
                                />
                                <span dir="ltr">{name}</span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      )}

                      <fieldset
                        id="budget"
                        tabIndex={-1}
                        aria-describedby={
                          errors.budget ? "budget-error" : undefined
                        }
                        className="space-y-3"
                      >
                        <legend className={labelClass}>
                          {form.fields.budget} *
                        </legend>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {BUDGET_KEYS.map((key) => (
                            <label
                              key={key}
                              className={optionClass(values.budget === key)}
                            >
                              <input
                                type="radio"
                                name="budget"
                                className="sr-only"
                                checked={values.budget === key}
                                onChange={() => set("budget", key)}
                              />
                              <span>{form.options.budget[key]}</span>
                            </label>
                          ))}
                        </div>
                        {fieldError("budget")}
                      </fieldset>

                      <fieldset
                        id="timeline"
                        tabIndex={-1}
                        aria-describedby={
                          errors.timeline ? "timeline-error" : undefined
                        }
                        className="space-y-3"
                      >
                        <legend className={labelClass}>
                          {form.fields.timeline} *
                        </legend>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {TIMELINE_KEYS.map((key) => (
                            <label
                              key={key}
                              className={optionClass(values.timeline === key)}
                            >
                              <input
                                type="radio"
                                name="timeline"
                                className="sr-only"
                                checked={values.timeline === key}
                                onChange={() => set("timeline", key)}
                              />
                              <span>{form.options.timeline[key]}</span>
                            </label>
                          ))}
                        </div>
                        {fieldError("timeline")}
                      </fieldset>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="description">
                          {form.fields.description} *
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {form.fields.descriptionHelper}
                        </p>
                        <Textarea
                          id="description"
                          rows={8}
                          maxLength={MAX_DESCRIPTION}
                          value={values.description}
                          onChange={(event) =>
                            set("description", event.target.value)
                          }
                          aria-invalid={!!errors.description}
                          aria-describedby={
                            errors.description ? "description-error" : undefined
                          }
                        />
                        <p
                          className="eyebrow text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          {form.counter.replace(
                            "{count}",
                            String(values.description.trim().length),
                          )}
                        </p>
                        {fieldError("description")}
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass} htmlFor="links">
                          {form.fields.links}
                        </label>
                        <Input
                          id="links"
                          dir="ltr"
                          placeholder={form.fields.linksPlaceholder}
                          value={values.links}
                          onChange={(event) => set("links", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-start gap-3 text-sm leading-7 text-muted-foreground">
                          <input
                            id="consent"
                            type="checkbox"
                            className="mt-1.5 h-4 w-4 shrink-0 accent-primary"
                            checked={values.consent}
                            onChange={(event) =>
                              set("consent", event.target.checked)
                            }
                            aria-invalid={!!errors.consent}
                            aria-describedby={
                              errors.consent ? "consent-error" : undefined
                            }
                          />
                          <span>
                            {form.consent.text}{" "}
                            <Link
                              to={`${prefix}/privacy`}
                              className="text-accent underline underline-offset-4"
                            >
                              {form.consent.linkLabel}
                            </Link>
                          </span>
                        </label>
                        {fieldError("consent")}
                      </div>
                      {errors.submit && (
                        <p
                          role="alert"
                          className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
                        >
                          {errors.submit}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-10 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    {step > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep((prev) => prev - 1)}
                      >
                        <BackIcon className="h-4 w-4" />
                        {form.buttons.back}
                      </Button>
                    ) : (
                      <span className="hidden sm:block" />
                    )}
                    {step < TOTAL_STEPS ? (
                      <Button key="next-step" type="button" onClick={goNext}>
                        {form.buttons.next}
                        <NextIcon className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        key="submit-brief"
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting
                          ? form.buttons.submitting
                          : form.buttons.submit}
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* What happens next + direct contact */}
            <aside className="space-y-10">
              <div>
                <Eyebrow>{copy.next.eyebrow}</Eyebrow>
                <h2 className="mt-3 font-display text-2xl">
                  {copy.next.title}
                </h2>
                <ol className="mt-6 space-y-6">
                  {copy.next.steps.map((item, index) => (
                    <li key={item.title} className="flex gap-4">
                      <span
                        className="eyebrow mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-accent"
                        dir="ltr"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-md border border-border bg-card p-6">
                <h2 className="font-display text-xl">{copy.contact.title}</h2>
                <div className="mt-5 space-y-4">
                  <a
                    href={`mailto:${siteSettings.email}`}
                    className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="h-4 w-4 text-accent" />
                    <span dir="ltr">{siteSettings.email}</span>
                  </a>
                  <a
                    href={siteSettings.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Linkedin className="h-4 w-4 text-accent" />
                    <span>{copy.contact.linkedinLabel}</span>
                  </a>
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={siteSettings.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        track("whatsapp_click", { location: "start_page" })
                      }
                    >
                      <MessageCircle className="h-4 w-4" />
                      {copy.contact.whatsappLabel}
                    </a>
                  </Button>
                </div>
              </div>
            </aside>
          </SectionInner>
        </Section>
      </main>
      <Footer />
    </>
  );
};

export default StartPage;

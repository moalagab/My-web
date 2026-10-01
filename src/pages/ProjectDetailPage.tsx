import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  X,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
const PDFViewer = lazy(() => import("@/components/PDFViewer"));
import { Eyebrow } from "@/components/system/Eyebrow";
import { Pill } from "@/components/system/Pill";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  findProject,
  localizedField,
  projects,
  type Project,
} from "@/content/projects";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, dictionary, isRtl } = useLanguage();
  const copy = dictionary.caseStudy;
  const workCopy = dictionary.workPage;
  const prefix = lang === "en" ? "/en" : "";
  const arrowClass = isRtl ? "-scale-x-100" : "";

  const project = findProject(slug);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const galleryLength = project?.gallery.length ?? 0;
  const step = useCallback(
    (direction: number) => {
      setLightboxIndex((current) =>
        current === null || galleryLength === 0
          ? current
          : (current + direction + galleryLength) % galleryLength,
      );
    },
    [galleryLength],
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, step]);

  if (!project) return <Navigate to={`${prefix}/work`} replace />;

  const title = lang === "ar" ? project.title_ar : project.title_en;
  const lineLabel = workCopy.filters[project.serviceLine];
  const index = projects.findIndex(
    (candidate) => candidate.slug === project.slug,
  );
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  const line = dictionary.servicesPage.lines.find(
    (item) => item.slug === project.serviceLine,
  );
  const matchedPackage = line?.packages.find(
    (item) => item.name === project.nextService,
  );

  const sections: {
    key: keyof typeof copy.sections;
    value?: { ar: string; en: string };
  }[] = [
    { key: "context", value: project.context },
    { key: "problem", value: project.problem },
    { key: "role", value: project.role },
    { key: "decision", value: project.decision },
    { key: "system", value: project.system },
    { key: "result", value: project.result },
  ];

  const summaryItems = [
    {
      label: copy.summary.client,
      value: project.hideClient
        ? copy.summary.hiddenClient
        : localizedField(project.client, lang),
    },
    { label: copy.summary.year, value: project.year ?? null },
    { label: copy.summary.role, value: localizedField(project.role, lang) },
    {
      label: copy.summary.deliverables,
      value: localizedField(project.system, lang),
    },
  ].filter((item) => Boolean(item.value));

  const description = project.context ? project.context[lang] : title;

  const cardTitle = (candidate: Project) =>
    lang === "ar" ? candidate.title_ar : candidate.title_en;

  return (
    <>
      <Helmet>
        <title>{`${title} — ${lineLabel} | Mo Alagab`}</title>
        <meta name="description" content={description} />
        <link
          rel="canonical"
          href={`https://moalagab.art${prefix}/work/${project.slug}`}
        />
        <meta property="og:title" content={`${title} | Mo Alagab`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
      </Helmet>
      <Navigation />

      <main className="pt-20 case-page">
        <section className="bg-primary pt-10 text-primary-foreground">
          <div className="container max-w-content px-6">
            <Link
              to={`${prefix}/work`}
              className="inline-flex items-center gap-2 font-mono text-xs text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              {isRtl ? (
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              ) : (
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              )}
              {copy.back}
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Pill className="border-primary-foreground/30 bg-transparent text-primary-foreground">
                {lineLabel}
              </Pill>
              {project.year ? (
                <span
                  dir="ltr"
                  className="font-mono text-xs text-primary-foreground/70"
                >
                  {project.year}
                </span>
              ) : null}
            </div>
            <h1 className="mt-5 max-w-4xl text-balance pb-12 font-display text-4xl font-bold leading-[1.15] md:text-6xl">
              {title}
            </h1>
          </div>
          <div className="case-cover w-full overflow-hidden bg-secondary">
            <img
              src={project.cover}
              alt={title}
              className="h-full w-full object-cover"
              width={1200}
              height={1500}
            />
          </div>
        </section>

        {summaryItems.length > 0 ? (
          <section className="border-b border-border bg-background py-8">
            <div className="container max-w-content px-6">
              <dl
                data-reveal-stagger
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                {summaryItems.map((item) => (
                  <div key={item.label}>
                    <dt
                      className="eyebrow text-xs text-muted-foreground"
                      dir="ltr"
                    >
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-6">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        ) : null}

        <div className="container max-w-content px-6 pt-8">
          <Breadcrumbs
            customItems={[
              { key: "work", path: "/work" },
              { label: title, path: `/work/${project.slug}` },
            ]}
          />
        </div>

        <Section className="bg-background">
          <SectionInner>
            <div className="grid gap-10 md:grid-cols-2 md:gap-x-12 md:gap-y-14">
              {sections.map(({ key, value }) => {
                const text = localizedField(value, lang);
                if (!text) return null;
                return (
                  <article key={key}>
                    <Eyebrow>{copy.sections[key]}</Eyebrow>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                      {text}
                    </p>
                  </article>
                );
              })}
            </div>

            {(project.proof && project.proof.length > 0) || project.pdfUrl ? (
              <div className="mt-14 border-t border-border pt-10">
                <Eyebrow>{copy.sections.proof}</Eyebrow>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {project.proof?.map((item) =>
                    item.url ? (
                      <a
                        key={item.label.en}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 border border-border bg-card px-4 py-3 text-sm transition-colors hover:border-accent"
                      >
                        {item.label[lang]}
                        <ExternalLink
                          className="h-4 w-4 text-accent"
                          aria-hidden="true"
                        />
                      </a>
                    ) : (
                      <span
                        key={item.label.en}
                        className="text-sm text-muted-foreground"
                      >
                        {item.label[lang]}
                      </span>
                    ),
                  )}
                  {project.pdfUrl ? (
                    <Button
                      variant="outline"
                      onClick={(event) => {
                        openerRef.current = event.currentTarget;
                        setPdfOpen(true);
                      }}
                    >
                      <FileText className="h-4 w-4" aria-hidden="true" />
                      {copy.pdfButton}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </SectionInner>
        </Section>

        {project.gallery.length > 0 ? (
          <Section className="bg-card">
            <SectionInner>
              <Eyebrow>{copy.gallery}</Eyebrow>
              <div data-reveal-stagger className="case-gallery mt-8 grid">
                {project.gallery.map((image, galleryIndex) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={(event) => {
                      openerRef.current = event.currentTarget;
                      setLightboxIndex(galleryIndex);
                    }}
                    className="group relative aspect-square overflow-hidden border border-border bg-background"
                    aria-label={`${copy.openImage}: ${image.alt[lang]}`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt[lang]}
                      loading="lazy"
                      width={1200}
                      height={900}
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            </SectionInner>
          </Section>
        ) : null}

        <Section className="bg-background">
          <SectionInner>
            <div className="border border-border bg-card p-8 md:p-12">
              <Eyebrow>{copy.similar.eyebrow}</Eyebrow>
              <h2 className="mt-4 font-display text-3xl font-bold md:text-4xl">
                {copy.similar.title}
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-muted-foreground">
                {matchedPackage
                  ? copy.similar.body
                  : lang === "ar"
                    ? "شارك سياق مشروعك والنتيجة المطلوبة، ونحدد النطاق الأنسب قبل البدء."
                    : "Share your project context and the outcome you need. We will define the right scope before we start."}
              </p>
              {matchedPackage ? (
                <div className="mt-8 border-t border-border pt-6">
                  <p className="eyebrow text-xs text-muted-foreground">
                    {copy.similar.packageLabel}
                  </p>
                  <p className="mt-3 font-display text-xl font-bold" dir="ltr">
                    {project.nextService}
                  </p>
                  {matchedPackage ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                      {matchedPackage.scope}{" "}
                      <span dir="ltr">({matchedPackage.timeline})</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link
                    to={`${prefix}/start?service=${project.serviceLine}${matchedPackage ? `&package=${encodeURIComponent(matchedPackage.name)}` : ""}`}
                  >
                    {copy.similar.cta}
                    <ArrowUpRight className={arrowClass} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to={`${prefix}/services#${project.serviceLine}`}>
                    {copy.similar.details}
                  </Link>
                </Button>
              </div>
            </div>

            <nav className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-10">
              {prev ? (
                <Link
                  to={`${prefix}/work/${prev.slug}`}
                  className="group flex items-center gap-4"
                >
                  {isRtl ? (
                    <ArrowRight
                      className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowLeft
                      className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                      aria-hidden="true"
                    />
                  )}
                  <span className="block">
                    <span className="eyebrow block text-xs text-muted-foreground">
                      {copy.nav.prev}
                    </span>
                    <span className="mt-1 block transition-colors group-hover:text-primary">
                      {cardTitle(prev)}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  to={`${prefix}/work/${next.slug}`}
                  className="group flex items-center gap-4 text-end"
                >
                  <span className="block">
                    <span className="eyebrow block text-xs text-muted-foreground">
                      {copy.nav.next}
                    </span>
                    <span className="mt-1 block transition-colors group-hover:text-primary">
                      {cardTitle(next)}
                    </span>
                  </span>
                  {isRtl ? (
                    <ArrowLeft
                      className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                      aria-hidden="true"
                    />
                  ) : (
                    <ArrowRight
                      className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              ) : (
                <span />
              )}
            </nav>
          </SectionInner>
        </Section>
      </main>

      <Footer />

      <Dialog
        open={lightboxIndex !== null}
        onOpenChange={(open) => !open && setLightboxIndex(null)}
      >
        <DialogContent
          className="case-lightbox"
          aria-describedby={undefined}
          closeLabel={copy.closeImage}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            openerRef.current?.focus();
          }}
        >
          <DialogTitle className="sr-only">{copy.gallery}</DialogTitle>
          {lightboxIndex !== null && (
            <>
              <img
                src={project.gallery[lightboxIndex].src}
                alt={project.gallery[lightboxIndex].alt[lang]}
              />
              <div className="case-lightbox-controls">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={copy.prevImage}
                >
                  <ChevronLeft size={20} />
                </button>
                <span dir="ltr" aria-live="polite">
                  {lightboxIndex + 1} / {galleryLength}
                </span>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={copy.nextImage}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <p className="case-lightbox-caption">
                {project.gallery[lightboxIndex].alt[lang]}
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>

      {project.pdfUrl ? (
        pdfOpen ? (
          <Suspense fallback={null}>
            <PDFViewer
              returnFocusRef={openerRef}
              pdfUrl={project.pdfUrl}
              isOpen={pdfOpen}
              onClose={() => setPdfOpen(false)}
              title={title}
            />
          </Suspense>
        ) : null
      ) : null}
    </>
  );
};

export default ProjectDetailPage;

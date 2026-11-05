import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import PageMeta from "@/components/PageMeta";
import { Link, Navigate, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  X, MessageCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
const PDFViewer = lazy(() => import("@/components/PDFViewer"));
import { Eyebrow } from "@/components/system/Eyebrow";
import { Section, SectionInner } from "@/components/system/Section";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  findProject,
  localizedField,
  projects,
  type Project,
} from "@/content/projects";
import Picture from "@/components/Picture";
import PageHero from "@/components/studio/PageHero";
import { useWhatsapp } from "@/lib/whatsapp";

const ProjectDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, dictionary, isRtl } = useLanguage();
  const whatsapp = useWhatsapp();
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

  // Search snippet: the project's context, then what was decided and built, cut at a word under 158 characters.
  const fullDescription = [project.context?.[lang], project.decision?.[lang], project.system?.[lang]]
    .filter(Boolean)
    .join(" ") || title;
  const description =
    fullDescription.length <= 158
      ? fullDescription
      : `${fullDescription.slice(0, 157).replace(/\s+\S*$/, "")}…`;

  // "Name: discipline | Mo Alagab", dropping the discipline when the title would pass 62 characters.
  const brand = lang === "ar" ? "محمد العجب" : "Mo Alagab";
  const discipline = project.discipline?.[lang].split(" · ")[0];
  const withDiscipline = discipline ? `${title}: ${discipline} | ${brand}` : "";
  const metaTitle = withDiscipline && withDiscipline.length <= 62 ? withDiscipline : `${title} | ${brand}`;

  const cardTitle = (candidate: Project) =>
    lang === "ar" ? candidate.title_ar : candidate.title_en;

  return (
    <>
      <PageMeta
        title={metaTitle}
        description={description}
        type="article"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: title,
            description,
            url: `https://moalagab.art${prefix}/work/${project.slug}`,
            image: new URL(project.cover, "https://moalagab.art").href,
            inLanguage: lang,
            genre: lineLabel,
            ...(project.year ? { dateCreated: project.year } : {}),
            creator: { "@id": "https://moalagab.art/#person" },
          }),
        }}
      />
      <Navigation />

      <main className="case-page">
        <PageHero
          mediaName="project-cover"
          image={project.cover}
          eyebrow={<span dir="ltr">{project.year ?? lineLabel}</span>}
          title={title}
          meta={[
            {
              label: copy.summary.client,
              value: project.hideClient ? copy.summary.hiddenClient : localizedField(project.client, lang) ?? title,
            },
            { label: lang === "ar" ? "المجال" : "Category", value: project.discipline?.[lang] ?? lineLabel },
            ...(project.year ? [{ label: copy.summary.year, value: <span dir="ltr">{project.year}</span> }] : []),
          ]}
          actions={
            <Link to={`${prefix}/work`} className="nav-pill nav-pill--outline">
              {isRtl ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : <ArrowLeft className="h-4 w-4" aria-hidden="true" />}
              {copy.back}
            </Link>
          }
        />

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
            <div className="case-rows">
              {sections.map(({ key, value }) => {
                const text = localizedField(value, lang);
                if (!text) return null;
                return (
                  <article key={key} className="case-row" data-reveal>
                    <h2>{copy.sections[key]}</h2>
                    <p>{text}</p>
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
                    <Picture
                      src={image.src}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
            <div className="folio-cta" data-reveal>
              <p className="studio-eyebrow">{copy.similar.eyebrow}</p>
              <h2>{copy.similar.title}</h2>
              <p>
                {matchedPackage
                  ? copy.similar.body
                  : lang === "ar"
                    ? "شارك سياق مشروعك والنتيجة المطلوبة، ونحدد النطاق الأنسب قبل البدء."
                    : "Share your project context and the outcome you need. We will define the right scope before we start."}
              </p>
              {matchedPackage ? (
                <div className="folio-cta-package">
                  <p>{copy.similar.packageLabel}</p>
                  <strong dir="ltr">{project.nextService}</strong>
                  {matchedPackage ? (
                    <p>
                      {matchedPackage.scope}{" "}
                      <span dir="ltr">({matchedPackage.timeline})</span>
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="folio-actions">
                <Link
                  to={`${prefix}/start?service=${project.serviceLine}${matchedPackage ? `&package=${encodeURIComponent(matchedPackage.name)}` : ""}`}
                  className="nav-pill nav-pill--solid"
                >
                  <span>{copy.similar.cta}</span>
                  <span className="nav-pill-dot" aria-hidden="true">
                    <ArrowUpRight size={18} className={arrowClass} />
                  </span>
                </Link>
                <Link to={`${prefix}/services/${project.serviceLine}`} className="nav-pill nav-pill--outline">
                  {copy.similar.details}
                </Link>
                <a
                  href={whatsapp.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => whatsapp.onClick("case_study")}
                  className="nav-pill nav-pill--outline"
                >
                  <MessageCircle size={16} aria-hidden="true" />
                  {dictionary.ui.whatsapp.button}
                </a>
              </div>
            </div>

            <nav className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-border pt-10">
              {prev ? (
                <Link
                  viewTransition
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
                  viewTransition
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
              <Picture
                src={project.gallery[lightboxIndex].src}
                sizes="100vw"
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

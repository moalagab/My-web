import { useEffect, useRef, useState, type RefObject } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { ChevronLeft, ChevronRight, Download, Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
interface Props {
  pdfUrl: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  returnFocusRef?: RefObject<HTMLButtonElement>;
}
export default function PDFViewer({
  pdfUrl,
  isOpen,
  onClose,
  title,
  returnFocusRef,
}: Props) {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const ar = lang === "ar";
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(700);
  const [error, setError] = useState(false);
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      if (!area.current) return;
      const resize = new ResizeObserver((entries) =>
        setWidth(Math.min(800, entries[0].contentRect.width - 32)),
      );
      resize.observe(area.current);
      observer = resize;
    });
    let observer: ResizeObserver;
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [isOpen]);
  useEffect(() => {
    setPage(1);
    setTotal(0);
    setError(false);
  }, [pdfUrl]);
  const previous = ar ? "الصفحة السابقة" : "Previous page";
  const next = ar ? "الصفحة التالية" : "Next page";
  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="pdf-dialog"
        aria-describedby={undefined}
        closeLabel={ar ? "إغلاق" : "Close"}
        onCloseAutoFocus={(event) => {
          if (returnFocusRef) {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }
        }}
      >
        <DialogTitle className="pdf-title">
          {title || d.ui.viewer.title}
        </DialogTitle>
        <div className="pdf-toolbar">
          <button
            aria-label={ar ? "تصغير" : "Zoom out"}
            disabled={zoom <= 0.75}
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.25))}
          >
            <Minus size={18} />
          </button>
          <span dir="ltr">{Math.round(zoom * 100)}%</span>
          <button
            aria-label={ar ? "تكبير" : "Zoom in"}
            disabled={zoom >= 2}
            onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
          >
            <Plus size={18} />
          </button>
          <a href={pdfUrl} download aria-label={d.ui.viewer.download}>
            <Download size={18} />
            <span>{d.ui.viewer.download}</span>
          </a>
        </div>
        <div className="pdf-area" ref={area}>
          <Document
            file={pdfUrl}
            onLoadSuccess={({ numPages }) => setTotal(numPages)}
            onLoadError={() => setError(true)}
            loading={<p role="status">{d.ui.viewer.loading}</p>}
            error={
              <div role="alert">
                <p>
                  {ar
                    ? "تعذر عرض المستند. يمكنك فتحه مباشرة."
                    : "The document could not be displayed. Open the original file."}
                </p>
                <a href={pdfUrl} target="_blank" rel="noreferrer">
                  {d.ui.viewer.download}
                </a>
              </div>
            }
          >
            <Page
              pageNumber={page}
              width={Math.max(220, width)}
              scale={zoom}
              renderTextLayer
              renderAnnotationLayer
              loading={<p role="status">{d.ui.viewer.loading}</p>}
            />
          </Document>
        </div>
        {!error && total > 0 && (
          <div className="pdf-pagination">
            <button
              aria-label={previous}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            <span dir="ltr" aria-live="polite">
              {page} / {total}
            </span>
            <button
              aria-label={next}
              disabled={page >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              {isRtl ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

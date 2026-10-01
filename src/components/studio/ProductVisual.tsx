import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  Sparkles,
  Target,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/** Editorial illustrations of each product's purpose; not screenshots or live data. */
export default function ProductVisual({ kind }: { kind: "life" | "agent" }) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  return (
    <div
      className={`product-visual product-visual--${kind}`}
      aria-hidden="true"
    >
      <div className="product-visual-top">
        <span dir="ltr">
          {kind === "life" ? "LifeTent /" : "Smart Field /"}
        </span>
        <span>{ar ? "تصوّر بصري للمنتج" : "Product illustration"}</span>
      </div>
      {kind === "life" ? (
        <div className="life-visual">
          <div className="life-orbit">
            <Target size={32} strokeWidth={1} />
            <span>{ar ? "حياتك، في مكان واحد." : "Your life. Connected."}</span>
          </div>
          <div className="life-tiles">
            {[
              { icon: Target, ar: "8 أقسام", en: "8 modules" },
              {
                icon: CalendarDays,
                ar: "هجري + ميلادي",
                en: "Hijri + Gregorian",
              },
              { icon: Sparkles, ar: "مساعد ذكي", en: "AI assistant" },
            ].map((item) => (
              <div key={item.en}>
                <item.icon size={18} strokeWidth={1.5} />
                <span>{ar ? item.ar : item.en}</span>
                <div className="visual-track">
                  <i />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="agent-visual">
          <span className="workflow-node">
            {ar ? "طلب العميل" : "Customer request"}
            <ArrowUpRight size={16} />
          </span>
          <span className="workflow-line" />
          <div className="agent-core">
            <Bot size={35} strokeWidth={1.2} />
            <span dir="ltr">AI AGENT</span>
          </div>
          <span className="workflow-line" />
          <div className="workflow-end">
            <span>{ar ? "معرفة" : "Knowledge"}</span>
            <span>{ar ? "إجراء" : "Action"}</span>
            <span>{ar ? "مراجعة بشرية" : "Human review"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

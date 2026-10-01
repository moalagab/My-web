import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { siteSettings } from "@/lib/site-content";
export default function Footer() {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const prefix = lang === "en" ? "/en" : "";
  const to = (p = "") => `${prefix}${p}` || "/";
  const links = [
    [d.navigation.work, "/work"],
    [d.navigation.services, "/services"],
    [d.navigation.products, "/products"],
    [d.navigation.about, "/about"],
  ];
  return (
    <footer className="studio-footer">
      <div className="studio-container">
        <div className="footer-top">
          <div>
            <p className="studio-eyebrow">
              {lang === "ar" ? "ابدأ بمحادثة." : "START A CONVERSATION."}
            </p>
            <a
              className="footer-email"
              dir="ltr"
              href={`mailto:${siteSettings.email}`}
            >
              {siteSettings.email}
              <ArrowUpRight size={28} />
            </a>
          </div>
          <Link
            className="footer-wordmark"
            to={to()}
            aria-label={d.brand.name}
            dir="ltr"
          >
            mo.
          </Link>
        </div>
        <div className="footer-middle">
          <p>{d.footer.statement}</p>
          <nav aria-label={d.navigation.label}>
            {links.map(([l, p]) => (
              <Link key={p} to={to(p)}>
                {l}
              </Link>
            ))}
          </nav>
          <div className="footer-social">
            <a href={siteSettings.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
              <ArrowUpRight size={13} />
            </a>
            <a
              href={siteSettings.whatsappLink}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
              <ArrowUpRight size={13} />
            </a>
            <Link to={to("/start")}>
              {d.navigation.start}
              <ArrowUpRight size={13} className={isRtl ? "-scale-x-100" : ""} />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{d.footer.rights}</span>
          <span>{d.footer.location}</span>
          <div className="footer-legal">
            <Link to={to("/privacy")}>{d.privacyPage.title}</Link>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new Event("ma-consent-settings"))
              }
            >
              {lang === "ar" ? "تفضيلات القياس" : "Analytics preferences"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

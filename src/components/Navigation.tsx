import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";

/**
 * Fixed light bar: wordmark, centred links with a services dropdown, a
 * language pill and a filled start pill. On phones the bar expands downward
 * into large links.
 */
export default function Navigation() {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef(0);
  const panelId = useId();
  const menuId = useId();
  const prefix = lang === "en" ? "/en" : "";
  const to = (p = "") => `${prefix}${p}` || "/";
  const otherLang = lang === "ar" ? "en" : "ar";
  const switchPath =
    lang === "ar"
      ? `/en${location.pathname === "/" ? "" : location.pathname}`
      : location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const languageHref = `${switchPath}${location.search}${location.hash}`;
  const services = d.home.services.items;
  const items = [
    { label: d.navigation.work, path: "/work" },
    { label: d.navigation.services, path: "/services" },
    { label: d.navigation.products, path: "/products" },
    { label: d.navigation.about, path: "/about" },
  ];
  const current = (path: string) => location.pathname.startsWith(to(path));
  const arrow = isRtl ? "-scale-x-100" : "";

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  // Escape closes whichever menu is open; a click outside closes the dropdown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setServicesOpen(false);
      setMenuOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, []);

  const openServices = () => {
    window.clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeServicesSoon = () => {
    closeTimer.current = window.setTimeout(() => setServicesOpen(false), 120);
  };

  const languagePill = (
    <Link
      to={languageHref}
      className="nav-pill nav-pill--outline"
      lang={otherLang}
      aria-label={`${d.navigation.language}: ${otherLang === "ar" ? d.navigation.arabic : d.navigation.english}`}
      onClick={() => track("lang_switch", { to: otherLang })}
    >
      {otherLang === "ar" ? d.navigation.arabic : d.navigation.english}
    </Link>
  );
  const startPill = (
    <Link
      to={to("/start")}
      className="nav-pill nav-pill--solid"
      onClick={() => track("cta_start_click", { location: "header" })}
    >
      {d.navigation.start}
      <ArrowUpRight size={16} className={arrow} />
    </Link>
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        {d.navigation.skip}
      </a>
      <header className={`studio-header ${menuOpen ? "is-open" : ""}`}>
        <nav className="header-inner" aria-label={d.navigation.label}>
          <Link to={to()} className="studio-wordmark">
            <span dir="ltr">
              mo<span className="wordmark-dot">.</span>
            </span>
            <span className="wordmark-name" dir="ltr">
              ALAGAB
              <br />
              <small>DESIGN & BUILD</small>
            </span>
            <span className="sr-only">{` — ${d.navigation.home}`}</span>
          </Link>

          <ul className="nav-links">
            {items.map((i) =>
              i.path === "/services" ? (
                <li
                  key={i.path}
                  ref={servicesRef}
                  className="nav-services"
                  onPointerEnter={(e) => e.pointerType === "mouse" && openServices()}
                  onPointerLeave={(e) => e.pointerType === "mouse" && closeServicesSoon()}
                >
                  <button
                    type="button"
                    className="nav-link"
                    aria-expanded={servicesOpen}
                    aria-controls={panelId}
                    onClick={() => setServicesOpen((o) => !o)}
                  >
                    {i.label}
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                  <div id={panelId} className={`nav-dropdown ${servicesOpen ? "is-open" : ""}`}>
                    <ul>
                      {services.map((s) => (
                        <li key={s.slug}>
                          <Link to={to(`/services/${s.slug}`)} tabIndex={servicesOpen ? undefined : -1}>
                            <span dir="ltr">{s.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link to={to("/services")} className="nav-dropdown-all" tabIndex={servicesOpen ? undefined : -1}>
                      {d.servicesPage.allServices}
                      <ArrowUpRight size={14} className={arrow} />
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={i.path}>
                  <Link to={to(i.path)} className="nav-link" aria-current={current(i.path) ? "page" : undefined}>
                    {i.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="nav-actions">
            {languagePill}
            {startPill}
          </div>

          <button
            type="button"
            className="nav-burger"
            aria-label={menuOpen ? d.navigation.closeMenu : d.navigation.openMenu}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </nav>

        <div id={menuId} className="nav-mobile" hidden={!menuOpen}>
          <ul>
            {items.map((i) => (
              <li key={i.path}>
                <Link to={to(i.path)} aria-current={current(i.path) ? "page" : undefined}>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="nav-mobile-actions">
            {languagePill}
            {startPill}
          </div>
        </div>
      </header>
    </>
  );
}

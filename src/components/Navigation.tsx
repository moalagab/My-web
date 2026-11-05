import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";

/**
 * Navy bar that opens the page, as on Folioblox: wordmark, links grouped at
 * the end with a services dropdown, a language pill and the start pill with
 * its sliding arrow, laid out with the wordmark at the end. It stays fixed
 * and transparent; each item turns navy over light sections and light over
 * navy ones. On phones it expands downward into large links.
 */
export default function Navigation() {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tucked, setTucked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
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
    { label: d.navigation.about, path: "/about" },
    { label: d.navigation.services, path: "/services" },
    { label: d.navigation.work, path: "/work" },
    { label: d.navigation.products, path: "/products" },
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

  // Each item in the bar reads the background right behind it, so a link over a light band turns
  // navy while its neighbour over a navy band stays light.
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    const isLightAt = (x: number, y: number, bar: HTMLElement) => {
      let el = document.elementsFromPoint(x, y).find((node) => !bar.contains(node)) as HTMLElement | undefined;
      while (el) {
        const [r, g, b, a = 1] = (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
        if (a > 0.5) return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
        el = el.parentElement ?? undefined;
      }
      return true;
    };
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
      // Phones: the bar slips away while reading down and returns on the way up.
      const y = window.scrollY;
      if (window.matchMedia("(max-width: 800px)").matches) {
        if (Math.abs(y - lastY) > 6) setTucked(y > lastY && y > 160);
      } else setTucked(false);
      lastY = y;
      const bar = headerRef.current;
      if (!bar) return;
      bar.querySelectorAll<HTMLElement>(".studio-wordmark > span:not(.sr-only), .nav-link, .nav-pill, .nav-burger").forEach((item) => {
        const box = item.getBoundingClientRect();
        if (!box.width) return;
        item.dataset.tone = isLightAt(box.left + box.width / 2, box.top + box.height / 2, bar) ? "light" : "dark";
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    // Read again once a page transition has finished painting the new page.
    const settle = window.setTimeout(update, 750);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location.pathname]);

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
      viewTransition
      to={to("/start")}
      className="nav-pill nav-pill--solid"
      onClick={() => track("cta_start_click", { location: "header" })}
    >
      <span>{d.navigation.start}</span>
      <span className="nav-pill-dot" aria-hidden="true">
        <ArrowUpRight size={18} className={arrow} />
      </span>
    </Link>
  );

  return (
    <>
      <a href="#main-content" className="skip-link">
        {d.navigation.skip}
      </a>
      <header
        ref={headerRef}
        className={`studio-header ${menuOpen ? "is-open" : ""} ${scrolled ? "is-scrolled" : ""} ${tucked && !menuOpen ? "is-tucked" : ""}`}
      >
        <nav className="header-inner" aria-label={d.navigation.label}>
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
                          <Link viewTransition to={to(`/services/${s.slug}`)} tabIndex={servicesOpen ? undefined : -1}>
                            <span dir="ltr">{s.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link viewTransition to={to("/services")} className="nav-dropdown-all" tabIndex={servicesOpen ? undefined : -1}>
                      {d.servicesPage.allServices}
                      <ArrowUpRight size={14} className={arrow} />
                    </Link>
                  </div>
                </li>
              ) : (
                <li key={i.path}>
                  <Link viewTransition to={to(i.path)} className="nav-link" aria-current={current(i.path) ? "page" : undefined}>
                    {i.label}
                  </Link>
                </li>
              ),
            )}
          </ul>

          <div className="nav-actions">
            {startPill}
            {languagePill}
          </div>

          <Link viewTransition to={to()} className="studio-wordmark">
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
        </nav>

        <div id={menuId} className="nav-mobile" hidden={!menuOpen}>
          <ul>
            {items.map((i) => (
              <li key={i.path}>
                <Link viewTransition to={to(i.path)} aria-current={current(i.path) ? "page" : undefined}>
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

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { ArrowUpRight, Menu } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { track } from "@/lib/analytics";

const loadMobileMenu = () => import("@/components/MobileMenu");
const MobileMenu = lazy(loadMobileMenu);

export default function Navigation() {
  const { lang, dictionary: d, isRtl } = useLanguage();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const prefix = lang === "en" ? "/en" : "";
  const to = (p = "") => `${prefix}${p}` || "/";
  const home =
    location.pathname === "/" ||
    location.pathname === "/en" ||
    location.pathname === "/en/";
  const switchPath =
    lang === "ar"
      ? `/en${location.pathname === "/" ? "" : location.pathname}`
      : location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const languageHref = (target: string) =>
    `${lang === target ? location.pathname : switchPath}${location.search}${location.hash}`;
  const items = [
    { label: d.navigation.work, path: "/work" },
    { label: d.navigation.services, path: "/services" },
    { label: d.navigation.products, path: "/products" },
    { label: d.navigation.about, path: "/about" },
  ];
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <a href="#main-content" className="skip-link">
        {d.navigation.skip}
      </a>
      <header
        className={`studio-header ${home && !scrolled ? "studio-header-dark" : ""} ${scrolled ? "is-scrolled" : ""}`}
      >
        <nav
          className="studio-container header-inner"
          aria-label={d.navigation.label}
        >
          <Link
            to={to()}
            className="studio-wordmark"
            aria-label={`${d.brand.name} — ${d.navigation.home}`}
          >
            <span dir="ltr">
              mo<span className="wordmark-dot">.</span>
            </span>
            <span className="wordmark-name" dir="ltr">
              ALAGAB
              <br />
              <small>DESIGN & BUILD</small>
            </span>
          </Link>
          <div className="desktop-navigation">
            {items.map((i) => (
              <Link
                key={i.path}
                to={to(i.path)}
                aria-current={
                  location.pathname.startsWith(to(i.path)) ? "page" : undefined
                }
              >
                {i.label}
              </Link>
            ))}
          </div>
          <div className="header-tools">
            <div
              className="language-switch"
              dir="ltr"
              aria-label={d.navigation.language}
            >
              {["ar", "en"].map((l) => (
                <Link
                  key={l}
                  to={languageHref(l)}
                  aria-current={lang === l ? "page" : undefined}
                  onClick={() => lang !== l && track("lang_switch", { to: l })}
                >
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
            <Link
              to={to("/start")}
              className="header-cta"
              onClick={() => track("cta_start_click", { location: "header" })}
            >
              {d.navigation.start}
              <ArrowUpRight size={16} className={isRtl ? "-scale-x-100" : ""} />
            </Link>
            <button
              ref={menuTrigger}
              type="button"
              className="mobile-menu-trigger"
              aria-label={d.navigation.openMenu}
              aria-haspopup="dialog"
              aria-expanded={open}
              onPointerEnter={loadMobileMenu}
              onTouchStart={loadMobileMenu}
              onFocus={loadMobileMenu}
              onClick={() => setOpen(true)}
            >
              <Menu size={24} />
            </button>
            {open && (
              <Suspense fallback={null}>
                <MobileMenu
                  open={open}
                  onOpenChange={setOpen}
                  items={items}
                  to={to}
                  d={d}
                  isRtl={isRtl}
                  triggerRef={menuTrigger}
                />
              </Suspense>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}

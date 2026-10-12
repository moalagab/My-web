import { Outlet, useLocation } from "react-router";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PageTransition from "@/components/PageTransition";

export default function LanguageLayout() {
  const { pathname } = useLocation();
  const lang = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ar";
  return (
    <LanguageProvider initialLang={lang}>
      {/* Keyed so each page remounts, replaying the enter animation and scroll reveal. */}
      <PageTransition key={pathname}>
        <Outlet />
      </PageTransition>
    </LanguageProvider>
  );
}

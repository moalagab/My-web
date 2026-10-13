import { Outlet, useLocation } from "react-router";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PageTransition from "@/components/PageTransition";
import type { Language } from "@/lib/i18n";
import type { SystemDictionary } from "@/lib/dictionary";

export default function LanguageShell({
  lang,
  dictionary,
}: {
  lang: Language;
  dictionary: SystemDictionary;
}) {
  const { pathname } = useLocation();
  return (
    <LanguageProvider initialLang={lang} dictionary={dictionary}>
      {/* Keyed so each page remounts, replaying the enter animation and scroll reveal. */}
      <PageTransition key={pathname}>
        <Outlet />
      </PageTransition>
    </LanguageProvider>
  );
}

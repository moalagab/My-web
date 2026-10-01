import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { dictionaries } from "@/lib/dictionary";
import { getConsent, setConsent } from "@/lib/analytics";

const ConsentBanner = () => {
  const { pathname } = useLocation();
  const lang = pathname.startsWith("/en") ? "en" : "ar";
  const t = dictionaries[lang].ui.consent;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getConsent() === null);
    const show = () => setVisible(true);
    window.addEventListener("ma-consent-settings", show);
    return () => window.removeEventListener("ma-consent-settings", show);
  }, []);

  if (!visible) return null;

  const decide = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label={t.privacy}
      dir={lang === "en" ? "ltr" : "rtl"}
      className="consent-card"
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          {t.text}{" "}
          <Link
            to={lang === "en" ? "/en/privacy" : "/privacy"}
            className="text-foreground underline"
          >
            {t.privacy}
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <Button
            variant="outline"
            size="sm"
            className="min-h-11"
            onClick={() => decide("denied")}
          >
            {t.reject}
          </Button>
          <Button
            size="sm"
            className="min-h-11"
            onClick={() => decide("granted")}
          >
            {t.accept}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;

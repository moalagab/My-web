import { useLocation } from "react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { findProject } from "@/content/projects";
import { siteSettings } from "@/lib/site-content";
import { track } from "@/lib/analytics";

/**
 * WhatsApp link whose opening message names the page the visitor came from,
 * so the first message already says which project or service they mean.
 */
export function useWhatsapp() {
  const { lang, dictionary: d } = useLanguage();
  const { pathname, search } = useLocation();
  const page = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const t = d.ui.whatsapp;

  const project = page.startsWith("/work/") ? findProject(page.split("/")[2]) : undefined;
  const service = page.startsWith("/services/")
    ? d.servicesPage.lines.find((line) => line.slug === page.split("/")[2])
    : undefined;

  const message = project
    ? t.project.replace("{title}", lang === "ar" ? project.title_ar : project.title_en)
    : service
      ? t.service.replace("{title}", service.title)
      : t.generic;

  const href = `${siteSettings.whatsappLink}?text=${encodeURIComponent(message)}`;

  const onClick = (location: string) => {
    track("whatsapp_click", { location });
    logContactClick({ channel: "whatsapp", page: pathname, locale: lang, search, location });
  };

  return { href, onClick };
}

/**
 * Records the click in Supabase (public.contact_clicks via an RPC) so it shows
 * in /admin next to the briefs. Uses fetch instead of supabase-js to keep the
 * client library off every page; keepalive lets it finish while WhatsApp opens.
 */
function logContactClick(input: {
  channel: "whatsapp";
  page: string;
  locale: string;
  search: string;
  location: string;
}) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return;
  const params = new URLSearchParams(input.search);
  fetch(`${url}/rest/v1/rpc/log_contact_click`, {
    method: "POST",
    keepalive: true,
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_channel: input.channel,
      p_page: input.page,
      p_location: input.location,
      p_locale: input.locale,
      p_referrer: document.referrer || null,
      p_utm_source: params.get("utm_source"),
      p_utm_medium: params.get("utm_medium"),
      p_utm_campaign: params.get("utm_campaign"),
    }),
  }).catch(() => undefined);
}

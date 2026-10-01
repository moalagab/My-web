type AnalyticsEvent =
  | "cta_start_click"
  | "form_step_complete"
  | "form_submit"
  | "whatsapp_click"
  | "lang_switch";
export const CONSENT_KEY = "ma-analytics-consent";
const MEASUREMENT_ID = "G-BL828HVE4C";
let initialized = false;
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
export const getConsent = (): "granted" | "denied" | null => {
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
};
const initialize = () => {
  if (
    initialized ||
    getConsent() !== "granted" ||
    ["localhost", "127.0.0.1", "::1"].includes(location.hostname)
  )
    return false;
  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer?.push(arguments);
  };
  window.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  return true;
};
export const trackPageView = () => {
  if (getConsent() !== "granted") return;
  initialize();
  window.gtag?.("event", "page_view", {
    page_path: location.pathname,
    page_location: location.href,
    page_title: document.title,
  });
};
export const setConsent = (value: "granted" | "denied") => {
  (window as unknown as Record<string, unknown>)[
    `ga-disable-${MEASUREMENT_ID}`
  ] = value !== "granted";
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* Browsers may disable storage. */
  }
  window.gtag?.("consent", "update", {
    analytics_storage: value,
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  if (value === "granted") trackPageView();
};
export const track = (
  event: AnalyticsEvent,
  params: Record<string, string | number> = {},
) => {
  if (getConsent() !== "granted") return;
  initialize();
  window.gtag?.("event", event, params);
};

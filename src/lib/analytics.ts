type AnalyticsEvent =
  | "cta_start_click"
  | "form_step_complete"
  | "form_submit"
  | "whatsapp_click"
  | "lang_switch";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

// Umami is cookieless and anonymous, so no consent prompt is needed. The script
// is added in root.tsx and records page views on its own; this sends events.
export const track = (
  event: AnalyticsEvent,
  params: Record<string, string | number> = {},
) => {
  window.umami?.track(event, params);
};

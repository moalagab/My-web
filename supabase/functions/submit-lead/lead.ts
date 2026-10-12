import { z } from "npm:zod@3.25.76";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: optionalText(160),
  email: z.string().trim().toLowerCase().email().max(254),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{8,18}$/)
    .nullish()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  service_line: z.string().trim().min(1).max(120),
  package: optionalText(120),
  budget: z.string().trim().min(1).max(120),
  timeline: z.string().trim().min(1).max(120),
  description: z.string().trim().min(30).max(1500),
  links: optionalText(1000),
  consent: z.literal(true),
  locale: z.enum(["ar", "en"]),
  utm_source: optionalText(300),
  utm_medium: optionalText(300),
  utm_campaign: optionalText(300),
  page_referrer: optionalText(300),
  website: z.string().max(300).optional().default(""),
  turnstileToken: z.string().min(1).max(2048),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type ParseResult =
  | { kind: "invalid" }
  | { kind: "spam" }
  | { kind: "ok"; lead: Omit<LeadInput, "website" | "turnstileToken">; token: string };

export const parseLead = (body: unknown): ParseResult => {
  const result = leadSchema.safeParse(body);
  if (!result.success) return { kind: "invalid" };
  const { website, turnstileToken, ...lead } = result.data;
  if (website.trim()) return { kind: "spam" };
  return { kind: "ok", lead, token: turnstileToken };
};

export const escapeHtml = (value: unknown) =>
  String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const allowedOrigin = (origin: string | null, allowList: string) => {
  if (!origin) return null;
  const allowed = allowList
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.includes(origin) ? origin : null;
};

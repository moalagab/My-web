import { z } from "npm:zod@3.25.76";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value ? value : null));

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: optionalText(120),
  role: optionalText(160),
  consent: z.literal(true),
  utm_source: optionalText(300),
  utm_medium: optionalText(300),
  utm_campaign: optionalText(300),
  page_referrer: optionalText(300),
  website: z.string().max(300).optional().default(""),
  turnstileToken: z.string().min(1).max(2048),
});

export type SignupInput = z.infer<typeof signupSchema>;

export type ParseResult =
  | { kind: "invalid" }
  | { kind: "spam" }
  | { kind: "ok"; signup: Omit<SignupInput, "website" | "turnstileToken">; token: string };

export const parseSignup = (body: unknown): ParseResult => {
  const result = signupSchema.safeParse(body);
  if (!result.success) return { kind: "invalid" };
  const { website, turnstileToken, ...signup } = result.data;
  // Honeypot: a hidden field only bots fill in.
  if (website.trim()) return { kind: "spam" };
  return { kind: "ok", signup, token: turnstileToken };
};

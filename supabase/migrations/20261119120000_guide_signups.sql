-- People who ask for updates to the Claude Code guide (/claude-guide).
-- Kept apart from public.leads: these are not project briefs and must not reach the agents CRM.
CREATE TABLE public.guide_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL CHECK (char_length(email) <= 254),
  name text CHECK (char_length(name) <= 120),
  role text CHECK (char_length(role) <= 160),
  consent boolean NOT NULL CHECK (consent),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  page_referrer text
);

-- One row per address; the edge function ignores repeats.
CREATE UNIQUE INDEX guide_signups_email_key ON public.guide_signups (lower(email));
CREATE INDEX guide_signups_created_at_idx ON public.guide_signups (created_at DESC);

-- Written only by the guide-signup edge function (service role). Admins read.
ALTER TABLE public.guide_signups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.guide_signups FROM anon, authenticated;
GRANT SELECT ON public.guide_signups TO authenticated;

CREATE POLICY "Admins can read guide signups"
ON public.guide_signups FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

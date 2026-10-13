-- Where a brief's sender heard about the site (optional for older rows).
ALTER TABLE public.leads
  ADD COLUMN heard_from text
  CHECK (heard_from IN ('google', 'linkedin', 'instagram', 'behance', 'referral', 'returning', 'other'));

-- WhatsApp (and future contact channel) clicks, shown in /admin next to briefs.
CREATE TABLE public.contact_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL CHECK (channel IN ('whatsapp')),
  page text NOT NULL,
  location text,
  locale text NOT NULL CHECK (locale IN ('ar', 'en')),
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_clicks_created_idx ON public.contact_clicks (created_at DESC);

ALTER TABLE public.contact_clicks ENABLE ROW LEVEL SECURITY;

-- No direct access for visitors; they can only call log_contact_click below.
REVOKE ALL ON public.contact_clicks FROM anon, authenticated;
GRANT SELECT, DELETE ON public.contact_clicks TO authenticated;

CREATE POLICY "Admins can read contact clicks"
  ON public.contact_clicks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete contact clicks"
  ON public.contact_clicks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- The only write path: validates and truncates input, and caps volume so a
-- script cannot flood the admin view.
CREATE OR REPLACE FUNCTION public.log_contact_click(
  p_channel text,
  p_page text,
  p_location text DEFAULT NULL,
  p_locale text DEFAULT 'ar',
  p_referrer text DEFAULT NULL,
  p_utm_source text DEFAULT NULL,
  p_utm_medium text DEFAULT NULL,
  p_utm_campaign text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_channel IS DISTINCT FROM 'whatsapp'
     OR p_page IS NULL OR left(p_page, 1) <> '/'
     OR p_locale NOT IN ('ar', 'en') THEN
    RETURN;
  END IF;

  IF (SELECT count(*) FROM public.contact_clicks WHERE created_at > now() - interval '1 minute') >= 30 THEN
    RETURN;
  END IF;

  INSERT INTO public.contact_clicks
    (channel, page, location, locale, referrer, utm_source, utm_medium, utm_campaign)
  VALUES (
    p_channel,
    left(p_page, 200),
    left(p_location, 50),
    p_locale,
    left(p_referrer, 300),
    left(p_utm_source, 100),
    left(p_utm_medium, 100),
    left(p_utm_campaign, 100)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.log_contact_click(text, text, text, text, text, text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.log_contact_click(text, text, text, text, text, text, text, text) TO anon, authenticated;

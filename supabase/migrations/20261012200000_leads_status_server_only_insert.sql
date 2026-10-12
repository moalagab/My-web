-- Pipeline status for the admin dashboard.
ALTER TABLE public.leads
  ADD COLUMN status text NOT NULL DEFAULT 'new'
  CHECK (status IN ('new', 'contacted', 'proposal', 'closed'));

CREATE INDEX leads_status_created_idx ON public.leads (status, created_at DESC);

-- New leads are written only by the submit-lead edge function (service role).
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
REVOKE INSERT ON public.leads FROM anon;
REVOKE INSERT ON public.leads FROM authenticated;

-- Costs and returns: what each customer costs to acquire (CAC) and what they bring in.

-- 1. A brief ends as won or lost, not just "closed", so wins can be counted.
UPDATE public.leads SET status = 'lost' WHERE status = 'closed';
ALTER TABLE public.leads DROP CONSTRAINT leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'contacted', 'proposal', 'won', 'lost'));

ALTER TABLE public.leads
  ADD COLUMN deal_value_sar numeric(12, 2) CHECK (deal_value_sar >= 0),
  ADD COLUMN won_at timestamptz;

-- 2. won_at follows the status; a won/lost outcome is mirrored to the agents
--    CRM (deal_stage WON/LOST and the deal value) so its attribution agrees.
--    CRM errors never block the update.
CREATE OR REPLACE FUNCTION public.leads_track_outcome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'won' AND OLD.status IS DISTINCT FROM 'won' THEN
    NEW.won_at := now();
  ELSIF NEW.status <> 'won' THEN
    NEW.won_at := NULL;
  END IF;

  IF NEW.agent_lead_id IS NOT NULL
     AND NEW.status IN ('won', 'lost')
     AND (NEW.status IS DISTINCT FROM OLD.status OR NEW.deal_value_sar IS DISTINCT FROM OLD.deal_value_sar) THEN
    BEGIN
      UPDATE agents.leads SET
        deal_stage = upper(NEW.status),
        deal_stage_updated_at = now(),
        status = NEW.status,
        expected_deal_value = coalesce(NEW.deal_value_sar, expected_deal_value),
        updated_at = now()
      WHERE id = NEW.agent_lead_id;

      INSERT INTO agents.lead_events (lead_id, event_type, data)
      VALUES (NEW.agent_lead_id, 'website_outcome',
              jsonb_build_object('site_lead_id', NEW.id, 'status', NEW.status, 'deal_value_sar', NEW.deal_value_sar));
    EXCEPTION WHEN others THEN
      RAISE WARNING 'leads_track_outcome CRM sync failed for %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.leads_track_outcome() FROM public, anon, authenticated;

CREATE TRIGGER leads_track_outcome
  BEFORE UPDATE OF status, deal_value_sar ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.leads_track_outcome();

-- 3. Monthly acquisition costs entered by Mo in /admin. Agent spend is read
--    from agent_snapshots instead, so it is not entered here.
CREATE TABLE public.acquisition_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL CHECK (extract(day FROM month) = 1),
  category text NOT NULL CHECK (category IN ('hosting', 'tools', 'ads', 'time', 'other')),
  channel text NOT NULL DEFAULT 'shared' CHECK (channel IN ('shared', 'website', 'outbound')),
  amount_sar numeric(12, 2) NOT NULL CHECK (amount_sar > 0),
  note text CHECK (char_length(note) <= 300),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX acquisition_costs_month_idx ON public.acquisition_costs (month DESC);

ALTER TABLE public.acquisition_costs ENABLE ROW LEVEL SECURITY;

-- Supabase auto-grants new tables to the API roles; keep only admin CRUD under RLS.
REVOKE ALL ON public.acquisition_costs FROM anon;
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.acquisition_costs FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.acquisition_costs TO authenticated;

CREATE POLICY "Admins manage acquisition costs"
  ON public.acquisition_costs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

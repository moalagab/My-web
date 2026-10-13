-- Unit economics: what a won project really earns after its delivery costs and
-- Mo's own time, so LTV:CAC and CAC payback use gross profit, not revenue.

-- 1. Delivery inputs per won brief. deal_value_sar is recorded before VAT.
ALTER TABLE public.leads
  ADD COLUMN delivery_cost_sar numeric(12, 2) CHECK (delivery_cost_sar >= 0),
  ADD COLUMN delivery_hours numeric(7, 1) CHECK (delivery_hours >= 0);

COMMENT ON COLUMN public.leads.deal_value_sar IS 'Won deal value in SAR, excluding VAT.';
COMMENT ON COLUMN public.leads.delivery_cost_sar IS 'Direct delivery costs (subcontractors, stock, printing, project tools), excluding VAT.';
COMMENT ON COLUMN public.leads.delivery_hours IS 'Hours Mo spent delivering the project.';

-- 2. One settings row: what an hour of Mo's time costs, used to value delivery hours.
CREATE TABLE public.unit_economics_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  owner_hour_cost_sar numeric(10, 2) CHECK (owner_hour_cost_sar > 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.unit_economics_settings (id) VALUES (true);

ALTER TABLE public.unit_economics_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.unit_economics_settings FROM anon;
REVOKE TRUNCATE, TRIGGER, REFERENCES, INSERT, DELETE ON public.unit_economics_settings FROM authenticated;
GRANT SELECT, UPDATE ON public.unit_economics_settings TO authenticated;

CREATE POLICY "Admins manage unit economics settings"
  ON public.unit_economics_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

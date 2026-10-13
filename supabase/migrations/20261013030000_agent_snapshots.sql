-- Hourly snapshots from the acquisition agents (mo-agents repo, processors/site_mirror.py).
-- The agents live in this same project under their own `agents` schema (applied from mo-agents,
-- deploy/agents_schema.sql). They write here with the service role; admins read via RLS.
-- Payload is aggregated: business names and counts, never phones, emails or message text.
CREATE TABLE public.agent_snapshots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tenant text NOT NULL,
  generated_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL
);

CREATE INDEX agent_snapshots_tenant_generated_idx
  ON public.agent_snapshots (tenant, generated_at DESC);

ALTER TABLE public.agent_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read agent snapshots"
ON public.agent_snapshots
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Supabase auto-grants new tables to the API roles; keep only what the admin tab needs (SELECT, under RLS).
REVOKE ALL ON public.agent_snapshots FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES ON public.agent_snapshots FROM authenticated;

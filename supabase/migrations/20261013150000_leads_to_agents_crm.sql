-- Every website brief also lands in the agents CRM (moalagab/moagent, schema
-- `agents`) as an inbound, engaged lead. The agents state machine sends nothing
-- on its own for ENGAGED leads; on timeout it only reminds Mo (human_reminder).
--
-- Rules:
-- - Same email already in the CRM (tenant 'mo'): update that lead instead of
--   creating a duplicate, and move it to ENGAGED only from pre-reply states.
-- - The site never depends on the CRM: any error here is logged as a warning
--   and the brief is still saved.

ALTER TABLE public.leads ADD COLUMN agent_lead_id uuid;

CREATE OR REPLACE FUNCTION public.leads_sync_to_agents()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  brief jsonb;
  existing_id uuid;
  existing_state text;
BEGIN
  brief := jsonb_build_object(
    'site_lead_id', NEW.id,
    'service_line', NEW.service_line,
    'package', NEW.package,
    'budget', NEW.budget,
    'timeline', NEW.timeline,
    'description', NEW.description,
    'links', NEW.links,
    'heard_from', NEW.heard_from,
    'locale', NEW.locale,
    'utm_source', NEW.utm_source,
    'utm_medium', NEW.utm_medium,
    'utm_campaign', NEW.utm_campaign,
    'page_referrer', NEW.page_referrer,
    'received_at', now()
  );

  BEGIN
    SELECT id, state INTO existing_id, existing_state
    FROM agents.leads
    WHERE tenant = 'mo' AND email IS NOT NULL AND lower(email) = lower(NEW.email)
    ORDER BY created_at DESC
    LIMIT 1;

    IF existing_id IS NOT NULL THEN
      UPDATE agents.leads SET
        company = coalesce(company, NEW.company),
        phone = coalesce(phone, NEW.whatsapp),
        priority = 'high',
        consent_basis = 'inbound',
        raw_data = coalesce(raw_data, '{}'::jsonb)
          || jsonb_build_object('website_brief', brief)
          || CASE WHEN state IN ('NEW', 'ENRICHED', 'QUALIFIED_FIT', 'QUEUED', 'CONTACTED', 'STALLED', 'NURTURE')
               THEN jsonb_build_object('state_entered_at', now()) ELSE '{}'::jsonb END,
        next_action_at = CASE WHEN state IN ('NEW', 'ENRICHED', 'QUALIFIED_FIT', 'QUEUED', 'CONTACTED', 'STALLED', 'NURTURE')
          THEN now() + interval '120 hours' ELSE next_action_at END,
        state = CASE WHEN state IN ('NEW', 'ENRICHED', 'QUALIFIED_FIT', 'QUEUED', 'CONTACTED', 'STALLED', 'NURTURE')
          THEN 'ENGAGED' ELSE state END,
        updated_at = now()
      WHERE id = existing_id;
    ELSE
      INSERT INTO agents.leads (
        name, company, email, phone, source, status, priority, category,
        notes, tenant, state, consent_basis, source_url, next_action_at, raw_data
      ) VALUES (
        NEW.name, NEW.company, lower(NEW.email), NEW.whatsapp, 'website', 'new', 'high', 'other',
        NEW.description, 'mo', 'ENGAGED', 'inbound', 'https://moalagab.art/start',
        now() + interval '120 hours',
        jsonb_build_object('website_brief', brief, 'signal_source', 'website_brief', 'state_entered_at', now())
      )
      RETURNING id INTO existing_id;
    END IF;

    INSERT INTO agents.lead_events (lead_id, event_type, data)
    VALUES (existing_id, 'website_brief', brief);

    NEW.agent_lead_id := existing_id;
  EXCEPTION WHEN others THEN
    NEW.agent_lead_id := NULL;
    RAISE WARNING 'leads_sync_to_agents failed for %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.leads_sync_to_agents() FROM public, anon, authenticated;

-- BEFORE INSERT so the CRM id is stored on the same row. Named to run after
-- leads_rate_limit_check (triggers fire alphabetically), so rate-limited
-- briefs never reach the CRM.
CREATE TRIGGER leads_sync_to_agents
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.leads_sync_to_agents();

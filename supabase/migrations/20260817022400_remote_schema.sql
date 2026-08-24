-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION IF EXISTS pg_net;

CREATE SCHEMA private AUTHORIZATION postgres;

GRANT USAGE ON SCHEMA private TO authenticated;

CREATE FUNCTION private.belongs_to_current_organisation (
  target_organisation_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select
    target_organisation_id is not null
    and private.is_care_user()
    and target_organisation_id =
      private.current_organisation_id();
$function$;

REVOKE ALL ON FUNCTION private.belongs_to_current_organisation(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.belongs_to_current_organisation(uuid) TO authenticated;

CREATE FUNCTION private.body_map_belongs_to_current_org (
  target_body_map_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select exists (
    select 1
    from public.body_maps bm
    where bm.id = target_body_map_id
      and bm.organisation_id =
        private.current_organisation_id()
      and private.is_care_user()
  );
$function$;

REVOKE ALL ON FUNCTION private.body_map_belongs_to_current_org(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.body_map_belongs_to_current_org(uuid) TO authenticated;

CREATE FUNCTION private.can_access_safeguarding_storage_path (
  object_name text
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'storage', 'private', 'pg_temp'
  AS $function$
  select exists (
    select 1
    from public.safeguarding_cases sc
    where sc.organisation_id::text = (storage.foldername(object_name))[1]
      and sc.id::text = (storage.foldername(object_name))[2]
      and private.can_manage_safeguarding_organisation(sc.organisation_id)
  );
$function$;

GRANT ALL ON FUNCTION private.can_access_safeguarding_storage_path(text) TO authenticated;

CREATE FUNCTION private.can_access_service_user (
  target_service_user_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select
    private.service_user_belongs_to_current_org(
      target_service_user_id
    )
    and (
      private.is_manager()
      or exists (
        select 1
        from public.staff_service_user_access ssua
        where ssua.staff_id = auth.uid()
          and ssua.service_user_id =
            target_service_user_id
      )
    );
$function$;

REVOKE ALL ON FUNCTION private.can_access_service_user(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.can_access_service_user(uuid) TO authenticated;

CREATE FUNCTION private.can_manage_safeguarding_organisation (
  target_organisation_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
  select coalesce(
    private.is_manager()
    and target_organisation_id = private.current_organisation_id(),
    false
  );
$function$;

GRANT ALL ON FUNCTION private.can_manage_safeguarding_organisation(uuid) TO authenticated;

CREATE FUNCTION private.current_organisation_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select p.organisation_id
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$function$;

REVOKE ALL ON FUNCTION private.current_organisation_id() FROM PUBLIC;

GRANT ALL ON FUNCTION private.current_organisation_id() TO authenticated;

CREATE FUNCTION private.current_user_is_manager()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'manager'
  );
$function$;

REVOKE ALL ON FUNCTION private.current_user_is_manager() FROM PUBLIC;

GRANT ALL ON FUNCTION private.current_user_is_manager() TO authenticated;

CREATE FUNCTION private.current_user_organisation_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
  select organisation_id
  from public.profiles
  where id = (select auth.uid())
  limit 1;
$function$;

REVOKE ALL ON FUNCTION private.current_user_organisation_id() FROM PUBLIC;

GRANT ALL ON FUNCTION private.current_user_organisation_id() TO authenticated;

CREATE FUNCTION private.current_user_role()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$function$;

REVOKE ALL ON FUNCTION private.current_user_role() FROM PUBLIC;

GRANT ALL ON FUNCTION private.current_user_role() TO authenticated;

CREATE FUNCTION private.guard_safeguarding_case_closure()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  if old.status = 'closed' then
    raise exception 'Closed safeguarding cases are immutable';
  end if;

  if new.status = 'closed'
    and old.status is distinct from 'closed'
    and exists (
      select 1
      from public.safeguarding_actions
      where case_id = new.id
        and status in ('todo', 'in_progress', 'blocked')
    ) then
    raise exception 'Complete or cancel every open action before closing the case';
  end if;

  return new;
end;
$function$;

CREATE FUNCTION private.guard_safeguarding_organisation_consistency()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private', 'pg_temp'
  AS $function$
declare
  parent_organisation_id uuid;
begin
  select organisation_id
  into parent_organisation_id
  from public.safeguarding_cases
  where id = new.case_id;

  if parent_organisation_id is null or new.organisation_id <> parent_organisation_id then
    raise exception 'Safeguarding child record must use the case organisation';
  end if;

  return new;
end;
$function$;

CREATE FUNCTION private.handover_belongs_to_current_org (
  target_handover_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select exists (
    select 1
    from public.handover_service_users hsu
    join public.service_users su
      on su.id = hsu.service_user_id
    where hsu.handover_id = target_handover_id
      and su.organisation_id =
        private.current_organisation_id()
      and private.is_care_user()
  );
$function$;

REVOKE ALL ON FUNCTION private.handover_belongs_to_current_org(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.handover_belongs_to_current_org(uuid) TO authenticated;

CREATE FUNCTION private.is_care_user()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select coalesce(
    private.current_user_role() in ('support', 'manager'),
    false
  );
$function$;

REVOKE ALL ON FUNCTION private.is_care_user() FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_care_user() TO authenticated;

CREATE FUNCTION private.is_castodia_owner()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select coalesce(
    private.current_user_role() = 'castodia_owner',
    false
  );
$function$;

REVOKE ALL ON FUNCTION private.is_castodia_owner() FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_castodia_owner() TO authenticated;

CREATE FUNCTION private.is_manager()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select coalesce(
    private.current_user_role() = 'manager',
    false
  );
$function$;

REVOKE ALL ON FUNCTION private.is_manager() FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_manager() TO authenticated;

CREATE FUNCTION private.is_platform_admin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select coalesce(
    private.current_user_role() in (
      'castodia_admin',
      'castodia_owner'
    ),
    false
  );
$function$;

REVOKE ALL ON FUNCTION private.is_platform_admin() FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_platform_admin() TO authenticated;

CREATE FUNCTION private.is_support()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select coalesce(
    private.current_user_role() = 'support',
    false
  );
$function$;

REVOKE ALL ON FUNCTION private.is_support() FROM PUBLIC;

GRANT ALL ON FUNCTION private.is_support() TO authenticated;

CREATE FUNCTION private.log_safeguarding_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
declare
  source_row jsonb;
  target_case_id uuid;
  target_organisation_id uuid;
  target_entity_id uuid;
begin
  source_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  target_entity_id := (source_row ->> 'id')::uuid;
  target_organisation_id := (source_row ->> 'organisation_id')::uuid;
  target_case_id := case
    when tg_table_name = 'safeguarding_cases' then target_entity_id
    else nullif(source_row ->> 'case_id', '')::uuid
  end;

  insert into public.safeguarding_audit_log (
    case_id,
    organisation_id,
    entity_type,
    entity_id,
    operation,
    old_data,
    new_data,
    actor_id
  ) values (
    target_case_id,
    target_organisation_id,
    tg_table_name,
    target_entity_id,
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end,
    auth.uid()
  );

  return case when tg_op = 'DELETE' then old else new end;
end;
$function$;

CREATE FUNCTION private.medication_profile_belongs_to_current_org (
  target_medication_profile_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select exists (
    select 1
    from public.medication_profiles mp
    join public.service_users su
      on su.id = mp.service_user_id
    where mp.id = target_medication_profile_id
      and su.organisation_id =
        private.current_organisation_id()
      and private.is_care_user()
  );
$function$;

REVOKE ALL ON FUNCTION private.medication_profile_belongs_to_current_org(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.medication_profile_belongs_to_current_org(uuid) TO authenticated;

CREATE FUNCTION private.next_safeguarding_reference (
  target_organisation_id uuid
)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private', 'pg_temp'
  AS $function$
declare
  v_reference_year integer := extract(year from current_date)::integer;
  v_next_value integer;
begin
  insert into private.safeguarding_case_sequences (organisation_id, reference_year, current_value)
  values (target_organisation_id, v_reference_year, 1)
  on conflict (organisation_id, reference_year) do update
    set current_value = private.safeguarding_case_sequences.current_value + 1
  returning private.safeguarding_case_sequences.current_value into v_next_value;

  return format('SG-%s-%s', v_reference_year, lpad(v_next_value::text, 4, '0'));
end;
$function$;

REVOKE ALL ON FUNCTION private.next_safeguarding_reference(uuid) FROM PUBLIC;

CREATE FUNCTION private.record_safeguarding_case_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
begin
  if old.status is distinct from new.status then
    insert into public.safeguarding_chronology (
      case_id, organisation_id, entry_type, description, occurred_at, created_by
    ) values (
      new.id,
      new.organisation_id,
      case when new.status = 'closed' then 'closure' else 'status_change' end,
      case
        when new.status = 'closed' then 'Case closed: ' || coalesce(new.closure_reason, '')
        else 'Status changed from ' || old.status || ' to ' || new.status
      end,
      now(),
      coalesce(auth.uid(), new.closed_by, new.assigned_manager_id, new.raised_by)
    );
  end if;

  if old.risk_level is distinct from new.risk_level then
    insert into public.safeguarding_chronology (
      case_id, organisation_id, entry_type, description, occurred_at, created_by
    ) values (
      new.id,
      new.organisation_id,
      'risk_change',
      'Risk level changed from ' || old.risk_level || ' to ' || new.risk_level,
      now(),
      coalesce(auth.uid(), new.assigned_manager_id, new.raised_by)
    );
  end if;

  if old.assigned_manager_id is distinct from new.assigned_manager_id then
    insert into public.safeguarding_chronology (
      case_id, organisation_id, entry_type, description, occurred_at, created_by
    ) values (
      new.id,
      new.organisation_id,
      'assignment_change',
      'Assigned manager changed',
      now(),
      coalesce(auth.uid(), new.assigned_manager_id, new.raised_by)
    );
  end if;

  return new;
end;
$function$;

CREATE FUNCTION private.safeguarding_case_belongs_to_current_org (
  target_case_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
  select exists (
    select 1
    from public.safeguarding_cases sc
    where sc.id = target_case_id
      and private.can_manage_safeguarding_organisation(sc.organisation_id)
  );
$function$;

GRANT ALL ON FUNCTION private.safeguarding_case_belongs_to_current_org(uuid) TO authenticated;

CREATE FUNCTION private.service_user_belongs_to_current_org (
  target_service_user_id uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
  select exists (
    select 1
    from public.service_users su
    where su.id = target_service_user_id
      and su.organisation_id =
        private.current_organisation_id()
      and private.is_care_user()
  );
$function$;

REVOKE ALL ON FUNCTION private.service_user_belongs_to_current_org(uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION private.service_user_belongs_to_current_org(uuid) TO authenticated;

CREATE FUNCTION private.set_care_plan_audit_fields()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private'
  AS $function$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
    new.created_at := now();
    new.updated_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;

  if new.status = 'published' and old.status is distinct from 'published' then
    new.published_at := now();
  elsif new.status <> 'published' then
    new.published_at := null;
  end if;

  return new;
end;
$function$;

CREATE FUNCTION private.set_care_plan_organisation()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private'
  AS $function$
declare
  resolved_organisation_id uuid;
begin
  select service_users.organisation_id
    into resolved_organisation_id
  from public.service_users
  where service_users.id = new.service_user_id;

  if resolved_organisation_id is null then
    raise exception 'The selected service user does not exist or has no organisation.';
  end if;

  new.organisation_id := resolved_organisation_id;

  return new;
end;
$function$;

CREATE FUNCTION private.set_care_plan_section_timestamps()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private'
  AS $function$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
  end if;

  new.updated_at := now();

  -- Prevent whitespace-only content being stored.
  new.content := btrim(new.content);

  return new;
end;
$function$;

CREATE FUNCTION private.set_risk_assessment_audit_fields()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private'
  AS $function$
begin
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.updated_by := auth.uid();
    new.created_at := now();
    new.updated_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
    new.updated_by := auth.uid();
    new.updated_at := now();
  end if;

  new.title := btrim(new.title);
  new.risk_description := btrim(new.risk_description);
  new.personal_risk_factors := btrim(new.personal_risk_factors);
  new.control_measures := btrim(new.control_measures);
  new.actions_if_occurs := btrim(new.actions_if_occurs);

  new.early_warning_signs :=
    nullif(btrim(new.early_warning_signs), '');

  new.review_frequency :=
    nullif(btrim(new.review_frequency), '');

  if new.status = 'archived'
     and old.status is distinct from 'archived' then
    new.archived_at := now();
  elsif new.status = 'active' then
    new.archived_at := null;
  end if;

  return new;
end;
$function$;

CREATE FUNCTION private.set_risk_assessment_organisation()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'private'
  AS $function$
declare
  resolved_organisation_id uuid;
begin
  select service_users.organisation_id
    into resolved_organisation_id
  from public.service_users
  where service_users.id = new.service_user_id;

  if resolved_organisation_id is null then
    raise exception
      'The selected service user does not exist or has no organisation.';
  end if;

  new.organisation_id := resolved_organisation_id;

  return new;
end;
$function$;

CREATE FUNCTION private.set_safeguarding_case_reference()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
begin
  new.case_reference := private.next_safeguarding_reference(new.organisation_id);
  return new;
end;
$function$;

CREATE FUNCTION private.set_safeguarding_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public', 'pg_temp'
  AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

CREATE FUNCTION private.sync_safeguarding_action_completion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO 'public', 'auth', 'pg_temp'
  AS $function$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    new.completed_at := now();
    new.completed_by := auth.uid();
  elsif new.status <> 'completed' then
    new.completed_at := null;
    new.completed_by := null;
  end if;
  return new;
end;
$function$;

CREATE TABLE private.safeguarding_case_sequences (
  organisation_id uuid    NOT NULL,
  reference_year  integer NOT NULL,
  current_value   integer DEFAULT 0 NOT NULL
);

ALTER TABLE private.safeguarding_case_sequences
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE private.safeguarding_case_sequences
  ADD CONSTRAINT safeguarding_case_sequences_pkey PRIMARY KEY (organisation_id, reference_year);

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE FUNCTION public.close_safeguarding_case (
  p_case_id         uuid,
  p_closure_reason  text,
  p_closure_outcome text,
  p_lessons_learned text DEFAULT NULL::text
)
  RETURNS void
  LANGUAGE plpgsql
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
begin
  if not private.safeguarding_case_belongs_to_current_org(p_case_id) then
    raise exception 'Safeguarding case not found or access denied';
  end if;

  if length(btrim(coalesce(p_closure_reason, ''))) = 0
    or length(btrim(coalesce(p_closure_outcome, ''))) = 0 then
    raise exception 'Closure reason and outcome are required';
  end if;

  if exists (
    select 1
    from public.safeguarding_actions
    where case_id = p_case_id
      and status in ('todo', 'in_progress', 'blocked')
  ) then
    raise exception 'Complete or cancel every open action before closing the case';
  end if;

  update public.safeguarding_cases
  set
    status = 'closed',
    closure_reason = btrim(p_closure_reason),
    closure_outcome = btrim(p_closure_outcome),
    lessons_learned = nullif(btrim(coalesce(p_lessons_learned, '')), ''),
    closed_at = now(),
    closed_by = auth.uid()
  where id = p_case_id;
end;
$function$;

REVOKE ALL ON FUNCTION public.close_safeguarding_case(uuid, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.close_safeguarding_case(uuid, text, text, text) TO authenticated;

GRANT ALL ON FUNCTION public.close_safeguarding_case(uuid, text, text, text) TO service_role;

CREATE FUNCTION public.create_safeguarding_case (
  p_service_user_id            uuid,
  p_title                      text,
  p_category                   text,
  p_risk_level                 text,
  p_concern_summary            text,
  p_date_concern_raised        timestamp with time zone,
  p_concern_source             text                     DEFAULT 'staff_observation'::text,
  p_immediate_actions          text                     DEFAULT NULL::text,
  p_desired_outcomes           text                     DEFAULT NULL::text,
  p_reported_by_name           text                     DEFAULT NULL::text,
  p_person_alleged_responsible text                     DEFAULT NULL::text,
  p_location                   text                     DEFAULT NULL::text
)
  RETURNS uuid
  LANGUAGE plpgsql
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
declare
  current_organisation uuid;
  new_case_id uuid;
begin
  current_organisation := private.current_organisation_id();

  if not private.can_manage_safeguarding_organisation(current_organisation) then
    raise exception 'Only an organisation manager can create a safeguarding case';
  end if;

  if not private.service_user_belongs_to_current_org(p_service_user_id) then
    raise exception 'Service user is not in the current organisation';
  end if;

  if length(btrim(coalesce(p_title, ''))) = 0
    or length(btrim(coalesce(p_concern_summary, ''))) = 0 then
    raise exception 'Title and concern summary are required';
  end if;

  insert into public.safeguarding_cases (
    organisation_id,
    service_user_id,
    case_reference,
    title,
    category,
    risk_level,
    concern_source,
    concern_summary,
    immediate_actions,
    desired_outcomes,
    reported_by_name,
    person_alleged_responsible,
    location,
    date_concern_raised,
    raised_by,
    assigned_manager_id
  ) values (
    current_organisation,
    p_service_user_id,
    'pending',
    btrim(p_title),
    p_category,
    p_risk_level,
    p_concern_source,
    btrim(p_concern_summary),
    nullif(btrim(coalesce(p_immediate_actions, '')), ''),
    nullif(btrim(coalesce(p_desired_outcomes, '')), ''),
    nullif(btrim(coalesce(p_reported_by_name, '')), ''),
    nullif(btrim(coalesce(p_person_alleged_responsible, '')), ''),
    nullif(btrim(coalesce(p_location, '')), ''),
    p_date_concern_raised,
    auth.uid(),
    auth.uid()
  )
  returning id into new_case_id;

  insert into public.safeguarding_chronology (
    case_id,
    organisation_id,
    entry_type,
    description,
    occurred_at,
    created_by
  ) values (
    new_case_id,
    current_organisation,
    'case_opened',
    'Safeguarding case opened: ' || btrim(p_title),
    p_date_concern_raised,
    auth.uid()
  );

  return new_case_id;
end;
$function$;

REVOKE ALL ON FUNCTION public.create_safeguarding_case(uuid, text, text, text, text, timestamp WITH time zone, text, text, text, text, text, text) FROM PUBLIC;

GRANT ALL ON FUNCTION public.create_safeguarding_case(uuid, text, text, text, text, timestamp WITH time zone, text, text, text, text, text, text) TO authenticated;

GRANT ALL ON FUNCTION public.create_safeguarding_case(uuid, text, text, text, text, timestamp WITH time zone, text, text, text, text, text, text) TO service_role;

CREATE FUNCTION public.current_castodia_organisation_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select organisation_id
  from public.profiles
  where id = auth.uid()
  limit 1;
$function$;

GRANT ALL ON FUNCTION public.current_castodia_organisation_id() TO anon;

GRANT ALL ON FUNCTION public.current_castodia_organisation_id() TO authenticated;

GRANT ALL ON FUNCTION public.current_castodia_organisation_id() TO service_role;

CREATE FUNCTION public.current_castodia_role()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1;
$function$;

GRANT ALL ON FUNCTION public.current_castodia_role() TO anon;

GRANT ALL ON FUNCTION public.current_castodia_role() TO authenticated;

GRANT ALL ON FUNCTION public.current_castodia_role() TO service_role;

CREATE FUNCTION public.current_organisation_id()
  RETURNS uuid
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
    SELECT organisation_id
    FROM profiles
    WHERE id = auth.uid();
$function$;

GRANT ALL ON FUNCTION public.current_organisation_id() TO anon;

GRANT ALL ON FUNCTION public.current_organisation_id() TO authenticated;

GRANT ALL ON FUNCTION public.current_organisation_id() TO service_role;

CREATE FUNCTION public.enable_rls_on_new_tables()
  RETURNS event_trigger
  LANGUAGE plpgsql
  AS $function$
declare
  obj record;
begin
  for obj in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag = 'CREATE TABLE'
  loop
    execute format(
      'alter table %s enable row level security',
      obj.object_identity
    );
  end loop;
end;
$function$;

GRANT ALL ON FUNCTION public.enable_rls_on_new_tables() TO anon;

GRANT ALL ON FUNCTION public.enable_rls_on_new_tables() TO authenticated;

GRANT ALL ON FUNCTION public.enable_rls_on_new_tables() TO service_role;

CREATE FUNCTION public.get_safeguarding_staff_options()
  RETURNS TABLE (
    id        uuid,
    full_name text,
    role      text
  )
  LANGUAGE plpgsql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
begin
  if not private.can_manage_safeguarding_organisation(private.current_organisation_id()) then
    raise exception 'Only an organisation manager can list safeguarding staff options';
  end if;

  return query
  select p.id, p.full_name, p.role
  from public.profiles p
  where p.organisation_id = private.current_organisation_id()
    and p.is_active = true
    and p.role in ('manager', 'support')
  order by p.full_name;
end;
$function$;

REVOKE ALL ON FUNCTION public.get_safeguarding_staff_options() FROM PUBLIC;

GRANT ALL ON FUNCTION public.get_safeguarding_staff_options() TO authenticated;

GRANT ALL ON FUNCTION public.get_safeguarding_staff_options() TO service_role;

CREATE FUNCTION public.guard_memory_photo_update()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  actor_role text;
begin
  actor_role := public.current_castodia_role();

  if actor_role = 'support' then

    if new.id is distinct from old.id
      or new.memory_id is distinct from old.memory_id
      or new.storage_path is distinct from old.storage_path
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception
        'Support users cannot change photo ownership fields.';
    end if;

    if new.family_visible is distinct from old.family_visible
      or new.family_visibility_changed_by
        is distinct from old.family_visibility_changed_by
      or new.family_visibility_changed_at
        is distinct from old.family_visibility_changed_at
      or new.family_visibility_note
        is distinct from old.family_visibility_note
    then
      raise exception
        'Photo family access can only be changed by a manager.';
    end if;

    return new;
  end if;


  if actor_role = 'manager' then

    -- Manager cannot alter the actual photograph metadata.
    if new.memory_id is distinct from old.memory_id
      or new.storage_path is distinct from old.storage_path
      or new.caption is distinct from old.caption
      or new.display_order is distinct from old.display_order
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception
        'Managers cannot edit memory photo content.';
    end if;


    if new.family_visible is distinct from old.family_visible
      or new.family_visibility_note
        is distinct from old.family_visibility_note
    then
      new.family_visibility_changed_by := auth.uid();
      new.family_visibility_changed_at := now();
    end if;

    return new;
  end if;


  raise exception
    'You do not have permission to update memory photos.';
end;
$function$;

GRANT ALL ON FUNCTION public.guard_memory_photo_update() TO anon;

GRANT ALL ON FUNCTION public.guard_memory_photo_update() TO authenticated;

GRANT ALL ON FUNCTION public.guard_memory_photo_update() TO service_role;

CREATE FUNCTION public.guard_memory_update()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  actor_role text;
begin
  actor_role := public.current_castodia_role();

  if actor_role = 'support' then

    -- Support cannot change ownership / scope.
    if new.id is distinct from old.id
      or new.organisation_id is distinct from old.organisation_id
      or new.service_user_id is distinct from old.service_user_id
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception
        'Support users cannot change memory ownership fields.';
    end if;

    -- Support cannot control family sharing.
    if new.family_visible is distinct from old.family_visible
      or new.family_visibility_changed_by
        is distinct from old.family_visibility_changed_by
      or new.family_visibility_changed_at
        is distinct from old.family_visibility_changed_at
      or new.family_visibility_note
        is distinct from old.family_visibility_note
    then
      raise exception
        'Family access can only be changed by a manager.';
    end if;

    -- Support cannot archive/delete.
    if new.archived is distinct from old.archived
      or new.archived_by is distinct from old.archived_by
      or new.archived_at is distinct from old.archived_at
    then
      raise exception
        'Memories can only be removed by a manager.';
    end if;

    -- Record editor.
    new.updated_by := auth.uid();
    new.updated_at := now();

    return new;
  end if;


  if actor_role = 'manager' then

    -- Managers are read-only for the actual memory content.
    if new.title is distinct from old.title
      or new.story is distinct from old.story
      or new.memory_date is distinct from old.memory_date
      or new.people_involved is distinct from old.people_involved
      or new.category is distinct from old.category
      or new.service_user_id is distinct from old.service_user_id
      or new.organisation_id is distinct from old.organisation_id
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception
        'Managers cannot edit memory content.';
    end if;


    -- Automatically stamp family-access changes.
    if new.family_visible is distinct from old.family_visible
      or new.family_visibility_note
        is distinct from old.family_visibility_note
    then
      new.family_visibility_changed_by := auth.uid();
      new.family_visibility_changed_at := now();
    end if;


    -- Automatically stamp archive/delete.
    if new.archived is distinct from old.archived then

      if new.archived = true then
        new.archived_by := auth.uid();
        new.archived_at := now();

        -- Archived memories must immediately disappear
        -- from the Family Portal.
        new.family_visible := false;
        new.family_visibility_changed_by := auth.uid();
        new.family_visibility_changed_at := now();

      else
        -- Allows a future manager Restore action.
        new.archived_by := null;
        new.archived_at := null;
      end if;

    end if;

    new.updated_by := auth.uid();
    new.updated_at := now();

    return new;
  end if;


  raise exception
    'You do not have permission to update memories.';
end;
$function$;

GRANT ALL ON FUNCTION public.guard_memory_update() TO anon;

GRANT ALL ON FUNCTION public.guard_memory_update() TO authenticated;

GRANT ALL ON FUNCTION public.guard_memory_update() TO service_role;

CREATE FUNCTION public.is_castodia_manager()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select coalesce(
    public.current_castodia_role() = 'manager',
    false
  );
$function$;

GRANT ALL ON FUNCTION public.is_castodia_manager() TO anon;

GRANT ALL ON FUNCTION public.is_castodia_manager() TO authenticated;

GRANT ALL ON FUNCTION public.is_castodia_manager() TO service_role;

CREATE FUNCTION public.is_castodia_support()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select coalesce(
    public.current_castodia_role() = 'support',
    false
  );
$function$;

GRANT ALL ON FUNCTION public.is_castodia_support() TO anon;

GRANT ALL ON FUNCTION public.is_castodia_support() TO authenticated;

GRANT ALL ON FUNCTION public.is_castodia_support() TO service_role;

CREATE FUNCTION public.normalise_medication_stock_unit (
  p_unit text
)
  RETURNS text
  LANGUAGE sql
  IMMUTABLE
  STRICT
  SET search_path TO 'public'
  AS $function$
  select case lower(trim(p_unit))
    when 'tablets' then 'tablet'
    when 'capsules' then 'capsule'
    when 'patches' then 'patch'
    when 'sachets' then 'sachet'
    when 'ampoules' then 'ampoule'
    when 'vials' then 'vial'
    when 'drops' then 'drop'
    when 'doses' then 'dose'
    else lower(trim(p_unit))
  end;
$function$;

GRANT ALL ON FUNCTION public.normalise_medication_stock_unit(text) TO anon;

GRANT ALL ON FUNCTION public.normalise_medication_stock_unit(text) TO authenticated;

GRANT ALL ON FUNCTION public.normalise_medication_stock_unit(text) TO service_role;

CREATE FUNCTION public.record_medication_event (
  p_client_request_id     uuid,
  p_medication_profile_id uuid,
  p_round                 text,
  p_status                text,
  p_reason                text                     DEFAULT NULL::text,
  p_event_time            timestamp with time zone DEFAULT now(),
  p_medication_round_id   uuid                     DEFAULT NULL::uuid
)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'pg_temp'
  AS $function$
declare
  v_user_id uuid;
  v_user_profile public.profiles%rowtype;
  v_medication public.medication_profiles%rowtype;
  v_service_user public.service_users%rowtype;
  v_round public.medication_rounds%rowtype;

  v_dose record;

  v_engine_event_id uuid;
  v_administration_id uuid;
  v_stock_transaction_id uuid;
  v_timeline_entry_id uuid;

  v_existing_event public.medication_engine_events%rowtype;

  v_administration_date date;
  v_stock_unit text;
  v_timeline_content text;
  v_result jsonb;

  v_rule record;
  v_rule_window_start timestamptz;
  v_qualifying_count integer;
  v_qualifying_ids uuid[];
  v_manager_review_id uuid;
  v_manager_reviews_created uuid[] := '{}'::uuid[];
begin
  /* ----------------------------------------------------------
     A. AUTHENTICATION
     ---------------------------------------------------------- */

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'You must be signed in to record medication';
  end if;

  select p.*
  into v_user_profile
  from public.profiles as p
  where p.id = v_user_id
    and p.is_active = true;

  if not found then
    raise exception 'An active staff profile could not be found';
  end if;

  if v_user_profile.organisation_id is null then
    raise exception 'Your organisation could not be identified';
  end if;


  /* ----------------------------------------------------------
     B. BASIC REQUEST VALIDATION
     ---------------------------------------------------------- */

  if p_client_request_id is null then
    raise exception 'A client request ID is required';
  end if;

  if p_event_time is null then
    raise exception 'An event time is required';
  end if;

  if nullif(trim(p_round), '') is null then
    raise exception 'A medication round is required';
  end if;

  if p_status not in (
    'Administered',
    'Refused',
    'Not given',
    'Unavailable',
    'Withheld'
  ) then
    raise exception 'Unsupported medication outcome: %', p_status;
  end if;

  if p_status <> 'Administered'
     and nullif(trim(coalesce(p_reason, '')), '') is null then
    raise exception 'A reason is required when medication is not administered';
  end if;


  /* Castodia currently operates in the UK. This can later become
     an organisation-level timezone setting. */

  v_administration_date :=
    (p_event_time at time zone 'Europe/London')::date;


  /* ----------------------------------------------------------
     C. IDEMPOTENCY

     Return the existing completed result when the same request
     is safely retried.
     ---------------------------------------------------------- */

  select mee.*
  into v_existing_event
  from public.medication_engine_events as mee
  where mee.client_request_id = p_client_request_id;

  if found then
    if v_existing_event.requested_by <> v_user_id then
      raise exception
        'This client request ID has already been used by another user';
    end if;

    if v_existing_event.processing_status = 'completed' then
      return v_existing_event.result;
    end if;

    raise exception
      'This medication request already exists with status: %',
      v_existing_event.processing_status;
  end if;


  /* ----------------------------------------------------------
     D. MEDICATION AND ORGANISATION VALIDATION
     ---------------------------------------------------------- */

  select mp.*
  into v_medication
  from public.medication_profiles as mp
  where mp.id = p_medication_profile_id
    and mp.active = true;

  if not found then
    raise exception 'The active medication profile could not be found';
  end if;

  select su.*
  into v_service_user
  from public.service_users as su
  where su.id = v_medication.service_user_id
    and su.is_active = true;

  if not found then
    raise exception 'The active service user could not be found';
  end if;

  if v_service_user.organisation_id is null then
    raise exception
      'The service user does not have an organisation assigned';
  end if;

  if v_service_user.organisation_id
     <> v_user_profile.organisation_id then
    raise exception
      'You cannot record medication for another organisation';
  end if;

  if trim(v_medication.round) <> trim(p_round) then
    raise exception
      'The supplied round does not match the medication profile round';
  end if;


  /* ----------------------------------------------------------
     E. OPTIONAL MEDICATION-ROUND VALIDATION
     ---------------------------------------------------------- */

  if p_medication_round_id is not null then
    select mr.*
    into v_round
    from public.medication_rounds as mr
    where mr.id = p_medication_round_id;

    if not found then
      raise exception 'The medication round could not be found';
    end if;

    if v_round.organisation_id
       <> v_user_profile.organisation_id then
      raise exception
        'The medication round belongs to another organisation';
    end if;

    if v_round.service_user_id <> v_service_user.id then
      raise exception
        'The medication round belongs to another service user';
    end if;

    if trim(v_round.round_name) <> trim(p_round) then
      raise exception
        'The medication-round name does not match the request';
    end if;

    if v_round.administration_date <> v_administration_date then
      raise exception
        'The medication-round date does not match the event date';
    end if;
  end if;


  /* ----------------------------------------------------------
     F. CREATE ENGINE EVENT
     ---------------------------------------------------------- */

  insert into public.medication_engine_events (
    organisation_id,
    service_user_id,
    medication_profile_id,
    medication_round_id,
    client_request_id,
    action_type,
    event_time,
    requested_by,
    processing_status
  )
  values (
    v_user_profile.organisation_id,
    v_service_user.id,
    v_medication.id,
    p_medication_round_id,
    p_client_request_id,
    'administration',
    p_event_time,
    v_user_id,
    'processing'
  )
  returning id into v_engine_event_id;


  /* ----------------------------------------------------------
     G. RESOLVE EFFECTIVE DOSE
     ---------------------------------------------------------- */

  select red.*
  into v_dose
  from public.resolve_effective_dose(
    p_medication_profile_id,
    p_event_time
  ) as red;

  if not found then
    raise exception 'The effective medication dose could not be resolved';
  end if;


  /* ----------------------------------------------------------
     H. SAVE ADMINISTRATION SNAPSHOT
     ---------------------------------------------------------- */

  insert into public.medication_administrations (
    service_user_id,
    medication_profile_id,
    administered_by,
    round,
    status,
    reason,
    administered_at,
    administration_date,
    medication_round_id,
    engine_event_id,
    resolved_dose_quantity,
    resolved_dose_unit,
    resolved_dose_text,
    dose_source,
    dose_protocol_id,
    dose_protocol_stage_id
  )
  values (
    v_service_user.id,
    v_medication.id,
    v_user_id,
    trim(p_round),
    p_status,
    case
      when p_status = 'Administered' then null
      else nullif(trim(p_reason), '')
    end,
    p_event_time,
    v_administration_date,
    p_medication_round_id,
    v_engine_event_id,
    v_dose.dose_quantity,
    v_dose.dose_unit,
    v_dose.dose_text,
    v_dose.dose_source,
    v_dose.protocol_id,
    v_dose.protocol_stage_id
  )
  returning id into v_administration_id;


  /* ----------------------------------------------------------
     I. STOCK MOVEMENT

     Administered medication produces a negative ledger entry.
     Other current outcomes do not move stock.
     ---------------------------------------------------------- */

  if p_status = 'Administered' then
    v_stock_unit :=
      public.normalise_medication_stock_unit(v_dose.dose_unit);

    insert into public.medication_stock_transactions (
      organisation_id,
      service_user_id,
      medication_profile_id,
      engine_event_id,
      administration_id,
      transaction_type,
      quantity,
      unit,
      reason,
      recorded_by,
      occurred_at
    )
    values (
      v_user_profile.organisation_id,
      v_service_user.id,
      v_medication.id,
      v_engine_event_id,
      v_administration_id,
      'administered',
      -1 * v_dose.dose_quantity,
      v_stock_unit,
      'Medication administered',
      v_user_id,
      p_event_time
    )
    returning id into v_stock_transaction_id;
  end if;


  /* ----------------------------------------------------------
     J. TIMELINE WORDING
     ---------------------------------------------------------- */

  if p_status = 'Administered' then
    v_timeline_content :=
      v_medication.medication_name
      || ' — '
      || v_dose.dose_text
      || ' administered.';

    if v_dose.dose_source = 'active_protocol' then
      v_timeline_content :=
        v_timeline_content
        || E'\n\nDose Management protocol active.'
        || E'\n'
        || coalesce(v_dose.protocol_title, 'Dose protocol')
        || '.'
        || E'\nStage '
        || v_dose.stage_number
        || ' of '
        || v_dose.total_stages
        || case
             when v_dose.stage_name is not null
             then ' — ' || v_dose.stage_name
             else ''
           end
        || '.';
    end if;
  else
    v_timeline_content :=
      v_medication.medication_name
      || ' — '
      || lower(p_status)
      || ': '
      || trim(p_reason)
      || '.';

    if v_dose.dose_source = 'active_protocol' then
      v_timeline_content :=
        v_timeline_content
        || E'\n\nCurrent resolved dose: '
        || v_dose.dose_text
        || '.'
        || E'\nDose Management protocol active — Stage '
        || v_dose.stage_number
        || ' of '
        || v_dose.total_stages
        || '.';
    end if;
  end if;

  insert into public.timeline_entries (
    service_user_id,
    created_by,
    entry_type,
    content,
    event_time,
    metadata
  )
  values (
    v_service_user.id::text,
    v_user_id,
    'Medication',
    v_timeline_content,
    p_event_time,
    jsonb_build_object(
      'source', 'medication_engine',
      'engine_event_id', v_engine_event_id,
      'administration_id', v_administration_id,
      'medication_profile_id', v_medication.id,
      'status', p_status,
      'resolved_dose_quantity', v_dose.dose_quantity,
      'resolved_dose_unit', v_dose.dose_unit,
      'dose_source', v_dose.dose_source,
      'dose_protocol_id', v_dose.protocol_id,
      'dose_protocol_stage_id', v_dose.protocol_stage_id
    )
  )
  returning id into v_timeline_entry_id;


  /* ----------------------------------------------------------
     K. MISSED-DOSE RULE EVALUATION
     ---------------------------------------------------------- */

  for v_rule in
    select mmdr.*
    from public.medication_missed_dose_rules as mmdr
    where mmdr.medication_profile_id = v_medication.id
      and mmdr.organisation_id = v_user_profile.organisation_id
      and mmdr.active = true
      and p_status = any(mmdr.qualifying_outcomes)
  loop
    v_qualifying_count := 0;
    v_qualifying_ids := '{}'::uuid[];


    /* Consecutive qualifying outcomes */

    if v_rule.rule_type = 'consecutive' then
      select
        count(*)::integer,
        coalesce(
          array_agg(
            recent.id
            order by recent.administered_at desc
          ),
          '{}'::uuid[]
        )
      into
        v_qualifying_count,
        v_qualifying_ids
      from (
        select
          ma.id,
          ma.status,
          ma.administered_at,
          sum(
            case
              when ma.status = any(v_rule.qualifying_outcomes)
              then 0
              else 1
            end
          ) over (
            order by
              ma.administered_at desc,
              ma.created_at desc,
              ma.id desc
          ) as interruption_count
        from public.medication_administrations as ma
        where ma.medication_profile_id = v_medication.id
          and ma.administered_at <= p_event_time
      ) as recent
      where recent.interruption_count = 0
        and recent.status = any(v_rule.qualifying_outcomes);


    /* Qualifying outcomes inside a rolling time window */

    elsif v_rule.rule_type = 'rolling_window' then
      v_rule_window_start :=
        case v_rule.window_unit
          when 'hours' then
            p_event_time
            - make_interval(hours => v_rule.window_value)

          when 'days' then
            p_event_time
            - make_interval(days => v_rule.window_value)

          when 'weeks' then
            p_event_time
            - make_interval(days => v_rule.window_value * 7)

          else null
        end;

      if v_rule_window_start is null then
        raise exception
          'Rolling missed-dose rule % has an invalid time window',
          v_rule.id;
      end if;

      select
        count(*)::integer,
        coalesce(
          array_agg(
            ma.id
            order by ma.administered_at
          ),
          '{}'::uuid[]
        )
      into
        v_qualifying_count,
        v_qualifying_ids
      from public.medication_administrations as ma
      where ma.medication_profile_id = v_medication.id
        and ma.status = any(v_rule.qualifying_outcomes)
        and ma.administered_at >= v_rule_window_start
        and ma.administered_at <= p_event_time;
    end if;


    /* Create one open manager review only. */

    if v_qualifying_count >= v_rule.threshold_count then
      select mmr.id
      into v_manager_review_id
      from public.medication_manager_reviews as mmr
      where mmr.medication_profile_id = v_medication.id
        and mmr.status in ('open', 'under_review')
      limit 1;

      if not found then
        insert into public.medication_manager_reviews (
          organisation_id,
          service_user_id,
          medication_profile_id,
          missed_dose_rule_id,
          trigger_engine_event_id,
          status,
          trigger_reason,
          qualifying_administration_ids
        )
        values (
          v_user_profile.organisation_id,
          v_service_user.id,
          v_medication.id,
          v_rule.id,
          v_engine_event_id,
          'open',
          format(
            '%s threshold reached: %s qualifying outcome(s), threshold %s.',
            v_rule.rule_name,
            v_qualifying_count,
            v_rule.threshold_count
          ),
          v_qualifying_ids
        )
        returning id into v_manager_review_id;

        v_manager_reviews_created :=
          array_append(
            v_manager_reviews_created,
            v_manager_review_id
          );
      end if;
    end if;
  end loop;


  /* ----------------------------------------------------------
     L. COMPLETE ENGINE EVENT
     ---------------------------------------------------------- */

  v_result := jsonb_build_object(
    'success', true,
    'already_processed', false,
    'engine_event_id', v_engine_event_id,
    'administration_id', v_administration_id,
    'timeline_entry_id', v_timeline_entry_id,
    'stock_transaction_id', v_stock_transaction_id,
    'manager_review_ids', to_jsonb(v_manager_reviews_created),
    'medication_profile_id', v_medication.id,
    'medication_name', v_medication.medication_name,
    'service_user_id', v_service_user.id,
    'status', p_status,
    'reason',
      case
        when p_status = 'Administered' then null
        else nullif(trim(p_reason), '')
      end,
    'event_time', p_event_time,
    'administration_date', v_administration_date,
    'effective_dose', jsonb_build_object(
      'quantity', v_dose.dose_quantity,
      'unit', v_dose.dose_unit,
      'text', v_dose.dose_text,
      'source', v_dose.dose_source
    ),
    'protocol', jsonb_build_object(
      'id', v_dose.protocol_id,
      'type', v_dose.protocol_type,
      'title', v_dose.protocol_title,
      'stage_id', v_dose.protocol_stage_id,
      'stage_number', v_dose.stage_number,
      'stage_name', v_dose.stage_name,
      'total_stages', v_dose.total_stages
    )
  );

  update public.medication_engine_events as mee
  set
    processing_status = 'completed',
    result = v_result,
    completed_at = now()
  where mee.id = v_engine_event_id;

  return v_result;
end;
$function$;

REVOKE ALL ON FUNCTION public.record_medication_event(uuid, uuid, text, text, text, timestamp WITH time zone, uuid) FROM PUBLIC;

GRANT ALL ON FUNCTION public.record_medication_event(uuid, uuid, text, text, text, timestamp WITH time zone, uuid) TO anon;

GRANT ALL ON FUNCTION public.record_medication_event(uuid, uuid, text, text, text, timestamp WITH time zone, uuid) TO authenticated;

GRANT ALL ON FUNCTION public.record_medication_event(uuid, uuid, text, text, text, timestamp WITH time zone, uuid) TO service_role;

CREATE FUNCTION public.record_medication_round (
  p_service_user_id   uuid,
  p_round_name        text,
  p_event_type        text,
  p_event_time        timestamp with time zone,
  p_client_request_id uuid,
  p_items             jsonb
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
declare
  v_user_id uuid;
  v_organisation_id uuid;
  v_round_id uuid;
  v_existing_round_id uuid;
  v_item_count integer;
  v_valid_medication_count integer;
begin
  -- ----------------------------------------------------------
  -- Confirm authenticated user
  -- ----------------------------------------------------------

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'You must be signed in to record medication.';
  end if;


  -- ----------------------------------------------------------
  -- Validate the main request
  -- ----------------------------------------------------------

  if p_service_user_id is null then
    raise exception 'A service user is required.';
  end if;

  if p_round_name is null
     or length(trim(p_round_name)) = 0 then
    raise exception 'A medication round name is required.';
  end if;

  if p_event_type not in (
    'scheduled',
    'prn',
    'variable',
    'emergency'
  ) then
    raise exception 'Invalid medication event type.';
  end if;

  if p_items is null
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one medication outcome is required.';
  end if;


  -- ----------------------------------------------------------
  -- Idempotency
  --
  -- If the same browser request is submitted twice, return
  -- the round already created instead of duplicating it.
  -- ----------------------------------------------------------

  if p_client_request_id is not null then
    select id
    into v_existing_round_id
    from public.medication_rounds
    where client_request_id = p_client_request_id
    limit 1;

    if v_existing_round_id is not null then
      return v_existing_round_id;
    end if;
  end if;


  -- ----------------------------------------------------------
  -- Resolve and validate organisation
  --
  -- The signed-in user and selected service user must belong
  -- to the same organisation.
  -- ----------------------------------------------------------

  select su.organisation_id
  into v_organisation_id
  from public.service_users su
  inner join public.profiles p
    on p.organisation_id = su.organisation_id
  where su.id = p_service_user_id
    and p.id = v_user_id
    and su.is_active = true
  limit 1;

  if v_organisation_id is null then
    raise exception
      'The service user could not be found in your organisation.';
  end if;


  -- ----------------------------------------------------------
  -- Validate supplied medication records
  -- ----------------------------------------------------------

  select count(*)
  into v_item_count
  from jsonb_to_recordset(p_items) as item(
    medication_id uuid,
    status text,
    reason text,
    quantity_administered numeric,
    stock_unit text
  );

  if v_item_count = 0 then
    raise exception 'No medication outcomes were supplied.';
  end if;


  -- Every supplied medication must:
  --   • exist;
  --   • belong to the selected service user;
  --   • currently be active.

  select count(*)
  into v_valid_medication_count
  from jsonb_to_recordset(p_items) as item(
    medication_id uuid,
    status text,
    reason text,
    quantity_administered numeric,
    stock_unit text
  )
  inner join public.medication_profiles medication
    on medication.id = item.medication_id
  where medication.service_user_id = p_service_user_id
    and medication.active = true;

  if v_valid_medication_count <> v_item_count then
    raise exception
      'One or more medications are invalid, inactive, or belong to another service user.';
  end if;


  -- Reject duplicate medications within the same request.

  if exists (
    select item.medication_id
    from jsonb_to_recordset(p_items) as item(
      medication_id uuid,
      status text,
      reason text,
      quantity_administered numeric,
      stock_unit text
    )
    group by item.medication_id
    having count(*) > 1
  ) then
    raise exception
      'The same medication cannot appear more than once in a round.';
  end if;


  -- Validate statuses and reasons before inserting anything.

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      medication_id uuid,
      status text,
      reason text,
      quantity_administered numeric,
      stock_unit text
    )
    where item.status is null
       or item.status not in (
         'Administered',
         'Refused',
         'Not given',
         'Unavailable',
         'Withheld'
       )
  ) then
    raise exception
      'One or more medication outcomes have an invalid status.';
  end if;


  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      medication_id uuid,
      status text,
      reason text,
      quantity_administered numeric,
      stock_unit text
    )
    where item.status <> 'Administered'
      and (
        item.reason is null
        or length(trim(item.reason)) = 0
      )
  ) then
    raise exception
      'A reason is required when medication is not administered.';
  end if;


  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      medication_id uuid,
      status text,
      reason text,
      quantity_administered numeric,
      stock_unit text
    )
    where item.quantity_administered is not null
      and item.quantity_administered < 0
  ) then
    raise exception
      'Quantity administered cannot be negative.';
  end if;


  -- ----------------------------------------------------------
  -- Create medication round
  -- ----------------------------------------------------------

  insert into public.medication_rounds (
    organisation_id,
    service_user_id,
    round_name,
    event_type,
    administration_date,
    event_time,
    completed_by,
    completed_at,
    client_request_id
  )
  values (
    v_organisation_id,
    p_service_user_id,
    trim(p_round_name),
    p_event_type,
    (coalesce(p_event_time, now()) at time zone 'UTC')::date,
    coalesce(p_event_time, now()),
    v_user_id,
    now(),
    p_client_request_id
  )
  returning id into v_round_id;


  -- ----------------------------------------------------------
  -- Create all round items
  -- ----------------------------------------------------------

  insert into public.medication_round_items (
    round_id,
    medication_id,
    status,
    reason,
    quantity_administered,
    stock_unit
  )
  select
    v_round_id,
    item.medication_id,
    item.status,

    case
      when item.status = 'Administered'
        then null
      else nullif(trim(item.reason), '')
    end,

    item.quantity_administered,
    nullif(trim(item.stock_unit), '')

  from jsonb_to_recordset(p_items) as item(
    medication_id uuid,
    status text,
    reason text,
    quantity_administered numeric,
    stock_unit text
  );


  return v_round_id;
end;
$function$;

REVOKE ALL ON FUNCTION public.record_medication_round(uuid, text, text, timestamp WITH time zone, uuid, jsonb) FROM PUBLIC;

GRANT ALL ON FUNCTION public.record_medication_round(uuid, text, text, timestamp WITH time zone, uuid, jsonb) TO anon;

GRANT ALL ON FUNCTION public.record_medication_round(uuid, text, text, timestamp WITH time zone, uuid, jsonb) TO authenticated;

GRANT ALL ON FUNCTION public.record_medication_round(uuid, text, text, timestamp WITH time zone, uuid, jsonb) TO service_role;

CREATE FUNCTION public.resolve_effective_dose (
  p_medication_profile_id uuid,
  p_event_time            timestamp with time zone DEFAULT now()
)
  RETURNS TABLE (
    medication_profile_id uuid,
    dose_quantity         numeric,
    dose_unit             text,
    dose_text             text,
    dose_source           text,
    protocol_id           uuid,
    protocol_stage_id     uuid,
    protocol_type         text,
    protocol_title        text,
    stage_number          integer,
    stage_name            text,
    total_stages          integer
  )
  LANGUAGE plpgsql
  SET search_path TO 'public'
  AS $function$
declare
  v_medication public.medication_profiles%rowtype;
  v_protocol public.medication_dose_protocols%rowtype;
  v_stage public.medication_dose_protocol_stages%rowtype;
  v_stage_count integer;
  v_stage_start timestamptz;
  v_stage_end timestamptz;
  v_candidate public.medication_dose_protocol_stages%rowtype;
begin
  if p_event_time is null then
    raise exception 'Event time is required';
  end if;

  select mp.*
  into v_medication
  from public.medication_profiles as mp
  where mp.id = p_medication_profile_id
    and mp.active = true;

  if not found then
    raise exception 'Active medication profile not found';
  end if;

  select mdp.*
  into v_protocol
  from public.medication_dose_protocols as mdp
  where mdp.medication_profile_id = p_medication_profile_id
    and mdp.status = 'active'
    and mdp.starts_at <= p_event_time
  order by mdp.starts_at desc
  limit 1;

  if found then
    select count(*)
    into v_stage_count
    from public.medication_dose_protocol_stages as mdps
    where mdps.protocol_id = v_protocol.id;

    if v_stage_count = 0 then
      raise exception 'Active dose protocol has no stages';
    end if;

    v_stage_start := v_protocol.starts_at;

    for v_candidate in
      select mdps.*
      from public.medication_dose_protocol_stages as mdps
      where mdps.protocol_id = v_protocol.id
      order by mdps.stage_number
    loop
      if v_candidate.duration_unit = 'until_review'
         or v_candidate.duration_unit is null then
        v_stage := v_candidate;
        exit;
      end if;

      v_stage_end :=
        case v_candidate.duration_unit
          when 'hours' then
            v_stage_start
            + make_interval(hours => v_candidate.duration_value)

          when 'days' then
            v_stage_start
            + make_interval(days => v_candidate.duration_value)

          when 'weeks' then
            v_stage_start
            + make_interval(days => v_candidate.duration_value * 7)

          else null
        end;

      if p_event_time >= v_stage_start
         and p_event_time < v_stage_end then
        v_stage := v_candidate;
        exit;
      end if;

      v_stage_start := v_stage_end;
    end loop;

    if v_stage.id is null then
      select mdps.*
      into v_stage
      from public.medication_dose_protocol_stages as mdps
      where mdps.protocol_id = v_protocol.id
      order by mdps.stage_number desc
      limit 1;
    end if;

    return query
    select
      v_medication.id,
      v_stage.dose_quantity,
      v_stage.dose_unit,
      concat(
        trim(to_char(v_stage.dose_quantity, 'FM999999990.####')),
        ' ',
        v_stage.dose_unit
      ),
      'active_protocol'::text,
      v_protocol.id,
      v_stage.id,
      v_protocol.protocol_type,
      v_protocol.title,
      v_stage.stage_number,
      v_stage.stage_name,
      v_stage_count;

    return;
  end if;

  if v_medication.administration_quantity is null
     or v_medication.administration_unit is null then
    raise exception
      'Medication profile does not have a structured administration dose';
  end if;

  return query
  select
    v_medication.id,
    v_medication.administration_quantity,
    v_medication.administration_unit,
    concat(
      trim(
        to_char(
          v_medication.administration_quantity,
          'FM999999990.####'
        )
      ),
      ' ',
      v_medication.administration_unit
    ),
    'medication_profile'::text,
    null::uuid,
    null::uuid,
    null::text,
    null::text,
    null::integer,
    null::text,
    null::integer;
end;
$function$;

REVOKE ALL ON FUNCTION public.resolve_effective_dose(uuid, timestamp WITH time zone) FROM PUBLIC;

GRANT ALL ON FUNCTION public.resolve_effective_dose(uuid, timestamp WITH time zone) TO anon;

GRANT ALL ON FUNCTION public.resolve_effective_dose(uuid, timestamp WITH time zone) TO authenticated;

GRANT ALL ON FUNCTION public.resolve_effective_dose(uuid, timestamp WITH time zone) TO service_role;

CREATE FUNCTION public.rls_auto_enable()
  RETURNS event_trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'pg_catalog'
  AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;

GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;

GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;

CREATE FUNCTION public.set_staff_employment_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

GRANT ALL ON FUNCTION public.set_staff_employment_updated_at() TO anon;

GRANT ALL ON FUNCTION public.set_staff_employment_updated_at() TO authenticated;

GRANT ALL ON FUNCTION public.set_staff_employment_updated_at() TO service_role;

CREATE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;

GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;

GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;

CREATE FUNCTION public.submit_support_safeguarding_report (
  p_service_user_id  uuid,
  p_concern_summary  text,
  p_happened_at      timestamp with time zone,
  p_immediate_danger text                     DEFAULT NULL::text,
  p_location         text                     DEFAULT NULL::text,
  p_is_anonymous     boolean                  DEFAULT false
)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'auth', 'private', 'pg_temp'
  AS $function$
declare
  v_profile public.profiles%rowtype;
  v_case_id uuid;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if not found or v_profile.role <> 'support' or coalesce(v_profile.is_active, true) = false then
    raise exception 'Only active support staff can submit a confidential safeguarding report';
  end if;

  if not exists (
    select 1 from public.staff_service_user_access a
    where a.staff_id = auth.uid() and a.service_user_id = p_service_user_id
  ) then
    raise exception 'You are not assigned to this service user';
  end if;

  if length(btrim(coalesce(p_concern_summary, ''))) = 0 then
    raise exception 'Please record the factual concern';
  end if;

  insert into public.safeguarding_cases (
    organisation_id, service_user_id, case_reference, title, category, risk_level,
    status, concern_source, concern_summary, immediate_actions, reported_by_name,
    location, date_concern_raised, raised_by
  ) values (
    v_profile.organisation_id, p_service_user_id, 'pending', 'Confidential support report',
    'other', 'not_assessed', 'open', 'confidential_support_report', btrim(p_concern_summary),
    nullif(btrim(coalesce(p_immediate_danger, '')), ''),
    case when p_is_anonymous then 'Anonymous support report' else v_profile.full_name end,
    nullif(btrim(coalesce(p_location, '')), ''), p_happened_at, auth.uid()
  ) returning id into v_case_id;

  insert into public.support_safeguarding_reports (
    organisation_id, service_user_id, safeguarding_case_id, reporter_id, happened_at,
    concern_summary, immediate_danger, location, is_anonymous
  ) values (
    v_profile.organisation_id, p_service_user_id, v_case_id, auth.uid(), p_happened_at,
    btrim(p_concern_summary), nullif(btrim(coalesce(p_immediate_danger, '')), ''),
    nullif(btrim(coalesce(p_location, '')), ''), coalesce(p_is_anonymous, false)
  );

  insert into public.safeguarding_chronology (
    case_id, organisation_id, entry_type, description, occurred_at, created_by
  ) values (
    v_case_id, v_profile.organisation_id, 'case_opened',
    'Confidential concern submitted by support staff. Risk assessment required.',
    p_happened_at, auth.uid()
  );

  return v_case_id;
end;
$function$;

REVOKE ALL ON FUNCTION public.submit_support_safeguarding_report(uuid, text, timestamp WITH time zone, text, text, boolean) FROM PUBLIC;

GRANT ALL ON FUNCTION public.submit_support_safeguarding_report(uuid, text, timestamp WITH time zone, text, text, boolean) TO authenticated;

GRANT ALL ON FUNCTION public.submit_support_safeguarding_report(uuid, text, timestamp WITH time zone, text, text, boolean) TO service_role;

CREATE TABLE public.behaviour_indicators (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id uuid                     NOT NULL,
  service_user_id uuid                     NOT NULL,
  name            text                     NOT NULL,
  created_at      timestamp with time zone DEFAULT now()
);

ALTER TABLE public.behaviour_indicators
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.behaviour_indicators
  ADD CONSTRAINT behaviour_indicators_pkey PRIMARY KEY (id);

GRANT ALL ON public.behaviour_indicators TO anon;

GRANT ALL ON public.behaviour_indicators TO authenticated;

GRANT ALL ON public.behaviour_indicators TO service_role;

CREATE TABLE public.body_map_markers (
  id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  body_map_id   uuid                     NOT NULL,
  marker_number integer                  NOT NULL,
  body_view     text                     NOT NULL,
  x_position    numeric                  NOT NULL,
  y_position    numeric                  NOT NULL,
  body_area     text,
  injury_type   text                     NOT NULL,
  description   text,
  size          text,
  appearance    text,
  pain_reported text,
  action_taken  text,
  created_at    timestamp with time zone DEFAULT now()
);

ALTER TABLE public.body_map_markers
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.body_map_markers
  ADD CONSTRAINT body_map_markers_pkey PRIMARY KEY (id);

GRANT ALL ON public.body_map_markers TO anon;

GRANT ALL ON public.body_map_markers TO authenticated;

GRANT ALL ON public.body_map_markers TO service_role;

CREATE TABLE public.body_maps (
  id                 uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id    uuid                     NOT NULL,
  service_user_id    uuid                     NOT NULL,
  timeline_entry_id  uuid                     NOT NULL,
  linked_incident_id uuid,
  created_by         uuid                     NOT NULL,
  created_at         timestamp with time zone DEFAULT now(),
  updated_at         timestamp with time zone DEFAULT now()
);

ALTER TABLE public.body_maps
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.body_maps
  ADD CONSTRAINT body_maps_pkey PRIMARY KEY (id);

ALTER TABLE public.body_map_markers
  ADD CONSTRAINT body_map_markers_body_map_id_fkey FOREIGN KEY (body_map_id) REFERENCES public.body_maps(id) ON DELETE CASCADE;

GRANT ALL ON public.body_maps TO anon;

GRANT ALL ON public.body_maps TO authenticated;

GRANT ALL ON public.body_maps TO service_role;

CREATE TABLE public.care_plan_sections (
  id            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  care_plan_id  uuid                     NOT NULL,
  section_key   text                     NOT NULL,
  content       text                     NOT NULL,
  display_order integer                  NOT NULL,
  created_at    timestamp with time zone DEFAULT now() NOT NULL,
  updated_at    timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.care_plan_sections IS 'Populated narrative sections belonging to a care plan. Empty sections are not stored.';

COMMENT ON COLUMN public.care_plan_sections.section_key IS 'Stable registry key defined by Castodia application code.';

COMMENT ON COLUMN public.care_plan_sections.content IS 'Single narrative field for the care-plan section.';

ALTER TABLE public.care_plan_sections
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_content_not_blank CHECK (length(btrim(content)) > 0);

ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_display_order_positive CHECK (display_order > 0);

ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_key_not_blank CHECK (length(btrim(section_key)) > 0);

ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_pkey PRIMARY KEY (id);

ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_plan_key_unique UNIQUE (care_plan_id, section_key);

GRANT ALL ON public.care_plan_sections TO anon;

GRANT ALL ON public.care_plan_sections TO authenticated;

GRANT ALL ON public.care_plan_sections TO service_role;

CREATE INDEX care_plan_sections_plan_order_idx ON public.care_plan_sections (care_plan_id, display_order);

CREATE INDEX care_plan_sections_care_plan_id_idx ON public.care_plan_sections (care_plan_id);

CREATE TRIGGER care_plan_sections_set_timestamps
  BEFORE INSERT OR UPDATE ON public.care_plan_sections
  FOR EACH ROW
  EXECUTE FUNCTION private.set_care_plan_section_timestamps();

CREATE TABLE public.care_plans (
  id               uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id  uuid                     NOT NULL,
  service_user_id  uuid                     NOT NULL,
  title            text                     DEFAULT 'Care Plan'::text NOT NULL,
  status           text                     DEFAULT 'draft'::text NOT NULL,
  plan_owner_id    uuid,
  last_reviewed_at timestamp with time zone,
  next_review_at   timestamp with time zone,
  created_by       uuid                     NOT NULL,
  updated_by       uuid                     NOT NULL,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  updated_at       timestamp with time zone DEFAULT now() NOT NULL,
  published_at     timestamp with time zone
);

COMMENT ON TABLE public.care_plans IS 'Care Plans v1 document metadata. Narrative content is stored in care_plan_sections.';

COMMENT ON COLUMN public.care_plans.status IS 'draft, published or archived. Support users may only read published plans.';

COMMENT ON COLUMN public.care_plans.plan_owner_id IS 'Manager responsible for maintaining and reviewing the care plan.';

ALTER TABLE public.care_plans
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_pkey PRIMARY KEY (id);

ALTER TABLE public.care_plan_sections
  ADD CONSTRAINT care_plan_sections_care_plan_id_fkey FOREIGN KEY (care_plan_id) REFERENCES public.care_plans(id) ON DELETE CASCADE;

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_published_state_valid CHECK (status = 'published'::text AND published_at IS NOT NULL OR status <> 'published'::text);

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_review_dates_valid CHECK (next_review_at IS NULL OR last_reviewed_at IS NULL OR next_review_at >= last_reviewed_at);

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_status_check CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'archived'::text]));

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_title_not_blank CHECK (length(btrim(title)) > 0);

GRANT ALL ON public.care_plans TO anon;

GRANT ALL ON public.care_plans TO authenticated;

GRANT ALL ON public.care_plans TO service_role;

CREATE INDEX care_plans_next_review_at_idx ON public.care_plans (next_review_at)
  WHERE next_review_at IS NOT NULL;

CREATE INDEX care_plans_service_user_id_idx ON public.care_plans (service_user_id);

CREATE INDEX care_plans_organisation_id_idx ON public.care_plans (organisation_id);

CREATE UNIQUE INDEX care_plans_one_current_plan_per_service_user ON public.care_plans (service_user_id)
  WHERE status = ANY (ARRAY['draft'::text, 'published'::text]);

CREATE INDEX care_plans_status_idx ON public.care_plans (status);

CREATE TRIGGER care_plans_set_audit_fields
  BEFORE INSERT OR UPDATE ON public.care_plans
  FOR EACH ROW
  EXECUTE FUNCTION private.set_care_plan_audit_fields();

CREATE TRIGGER care_plans_set_organisation
  BEFORE INSERT OR UPDATE OF service_user_id, organisation_id ON public.care_plans
  FOR EACH ROW
  EXECUTE FUNCTION private.set_care_plan_organisation();

CREATE TABLE public.family_users (
  id                 uuid                     DEFAULT gen_random_uuid() NOT NULL,
  auth_user_id       uuid                     NOT NULL,
  service_user_id    uuid                     NOT NULL,
  organisation_id    uuid                     NOT NULL,
  full_name          text                     NOT NULL,
  email              text                     NOT NULL,
  relationship       text,
  is_active          boolean                  DEFAULT true NOT NULL,
  created_by_user_id uuid                     NOT NULL,
  created_at         timestamp with time zone DEFAULT now() NOT NULL,
  updated_at         timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.family_users
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_auth_user_id_service_user_id_key UNIQUE (auth_user_id, service_user_id);

ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);

ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_pkey PRIMARY KEY (id);

GRANT ALL ON public.family_users TO anon;

GRANT ALL ON public.family_users TO authenticated;

GRANT ALL ON public.family_users TO service_role;

CREATE POLICY "Family users can read their own account" ON public.family_users
  FOR SELECT
  TO authenticated
  USING (((auth_user_id = auth.uid()) AND (is_active = true)));

CREATE TABLE public.handover_reads (
  id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  handover_id uuid                     NOT NULL,
  staff_id    uuid                     NOT NULL,
  read_at     timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.handover_reads
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handover_reads
  ADD CONSTRAINT handover_reads_handover_id_staff_id_key UNIQUE (handover_id, staff_id);

ALTER TABLE public.handover_reads
  ADD CONSTRAINT handover_reads_pkey PRIMARY KEY (id);

GRANT ALL ON public.handover_reads TO anon;

GRANT ALL ON public.handover_reads TO authenticated;

GRANT ALL ON public.handover_reads TO service_role;

CREATE POLICY "Logged in users can mark handovers as read" ON public.handover_reads
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = staff_id));

CREATE POLICY "Users can create handover reads" ON public.handover_reads
  FOR INSERT
  TO authenticated
  WITH CHECK ((staff_id = auth.uid()));

CREATE TABLE public.handover_service_users (
  id              uuid DEFAULT gen_random_uuid() NOT NULL,
  handover_id     uuid NOT NULL,
  service_user_id uuid NOT NULL
);

ALTER TABLE public.handover_service_users
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handover_service_users
  ADD CONSTRAINT handover_service_users_handover_id_service_user_id_key UNIQUE (handover_id, service_user_id);

ALTER TABLE public.handover_service_users
  ADD CONSTRAINT handover_service_users_pkey PRIMARY KEY (id);

GRANT ALL ON public.handover_service_users TO anon;

GRANT ALL ON public.handover_service_users TO authenticated;

GRANT ALL ON public.handover_service_users TO service_role;

CREATE TABLE public.handovers (
  id         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  title      text                     NOT NULL,
  content    text                     NOT NULL,
  created_by uuid                     NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  active     boolean                  DEFAULT true NOT NULL
);

ALTER TABLE public.handovers
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.handovers
  ADD CONSTRAINT handovers_pkey PRIMARY KEY (id);

ALTER TABLE public.handover_reads
  ADD CONSTRAINT handover_reads_handover_id_fkey FOREIGN KEY (handover_id) REFERENCES public.handovers(id) ON DELETE CASCADE;

ALTER TABLE public.handover_service_users
  ADD CONSTRAINT handover_service_users_handover_id_fkey FOREIGN KEY (handover_id) REFERENCES public.handovers(id) ON DELETE CASCADE;

GRANT ALL ON public.handovers TO anon;

GRANT ALL ON public.handovers TO authenticated;

GRANT ALL ON public.handovers TO service_role;

CREATE POLICY "Logged in users can create handovers" ON public.handovers
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = created_by));

CREATE POLICY "Users can create handovers" ON public.handovers
  FOR INSERT
  TO authenticated
  WITH CHECK ((created_by = auth.uid()));

CREATE TABLE public.houses (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id uuid                     NOT NULL,
  name            text                     NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.houses
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.houses
  ADD CONSTRAINT houses_pkey PRIMARY KEY (id);

GRANT ALL ON public.houses TO anon;

GRANT ALL ON public.houses TO authenticated;

GRANT ALL ON public.houses TO service_role;

CREATE TABLE public.medication_administrations (
  id                     uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id        uuid                     NOT NULL,
  medication_profile_id  uuid                     NOT NULL,
  administered_by        uuid                     NOT NULL,
  round                  text                     NOT NULL,
  status                 text                     NOT NULL,
  reason                 text,
  administered_at        timestamp with time zone NOT NULL,
  created_at             timestamp with time zone DEFAULT now() NOT NULL,
  administration_date    date                     NOT NULL,
  medication_round_id    uuid,
  engine_event_id        uuid,
  resolved_dose_quantity numeric(12,4),
  resolved_dose_unit     text,
  resolved_dose_text     text,
  dose_source            text,
  dose_protocol_id       uuid,
  dose_protocol_stage_id uuid
);

ALTER TABLE public.medication_administrations
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_dose_source_check
    CHECK (dose_source IS NULL OR (dose_source = ANY (ARRAY['medication_profile'::text, 'active_protocol'::text, 'authorised_override'::text])));

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_resolved_dose_positive CHECK (resolved_dose_quantity IS NULL OR resolved_dose_quantity > 0::numeric);

GRANT ALL ON public.medication_administrations TO anon;

GRANT ALL ON public.medication_administrations TO authenticated;

GRANT ALL ON public.medication_administrations TO service_role;

CREATE UNIQUE INDEX unique_med_admin_per_round ON public.medication_administrations (service_user_id, medication_profile_id, administration_date, round);

CREATE UNIQUE INDEX one_med_admin_per_round_per_day ON public.medication_administrations (service_user_id, medication_profile_id, round, administration_date);

CREATE INDEX medication_administrations_engine_event_idx ON public.medication_administrations (engine_event_id);

CREATE INDEX medication_administrations_round_idx ON public.medication_administrations (medication_round_id);

CREATE TABLE public.medication_dose_plan_history (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  plan_id               uuid                     NOT NULL,
  action                text                     NOT NULL,
  detail                text,
  previous_stage_number integer,
  new_stage_number      integer,
  created_by            uuid,
  created_at            timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_dose_plan_history
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_dose_plan_history
  ADD CONSTRAINT medication_dose_plan_history_pkey PRIMARY KEY (id);

GRANT ALL ON public.medication_dose_plan_history TO anon;

GRANT ALL ON public.medication_dose_plan_history TO authenticated;

GRANT ALL ON public.medication_dose_plan_history TO service_role;

CREATE INDEX dose_plan_history_plan_idx ON public.medication_dose_plan_history (plan_id);

CREATE TABLE public.medication_dose_plan_stages (
  id           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  plan_id      uuid                     NOT NULL,
  stage_number integer                  NOT NULL,
  dose         text                     NOT NULL,
  frequency    text,
  route        text,
  start_date   date,
  end_date     date,
  review_date  date,
  instructions text,
  status       text                     DEFAULT 'planned'::text NOT NULL,
  created_at   timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_dose_plan_stages
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_dose_plan_stages
  ADD CONSTRAINT medication_dose_plan_stages_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_dose_plan_stages
  ADD CONSTRAINT medication_dose_plan_stages_plan_id_stage_number_key UNIQUE (plan_id, stage_number);

ALTER TABLE public.medication_dose_plan_stages
  ADD CONSTRAINT medication_dose_plan_stages_status_check CHECK (status = ANY (ARRAY['planned'::text, 'current'::text, 'completed'::text, 'skipped'::text, 'cancelled'::text]));

GRANT ALL ON public.medication_dose_plan_stages TO anon;

GRANT ALL ON public.medication_dose_plan_stages TO authenticated;

GRANT ALL ON public.medication_dose_plan_stages TO service_role;

CREATE INDEX dose_plan_stages_plan_idx ON public.medication_dose_plan_stages (plan_id);

CREATE TABLE public.medication_dose_plans (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  medication_id         uuid                     NOT NULL,
  service_user_id       uuid                     NOT NULL,
  organisation_id       uuid                     NOT NULL,
  status                text                     DEFAULT 'draft'::text NOT NULL,
  plan_type             text                     DEFAULT 'titration'::text NOT NULL,
  reason                text,
  clinical_instructions text,
  authorised_by         text,
  authorisation_source  text,
  authorised_at         timestamp with time zone,
  start_date            date,
  review_date           date,
  current_stage_number  integer,
  automatic_progression boolean                  DEFAULT false NOT NULL,
  created_by            uuid,
  created_at            timestamp with time zone DEFAULT now() NOT NULL,
  updated_at            timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_dose_plans
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_dose_plans
  ADD CONSTRAINT medication_dose_plans_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_dose_plan_history
  ADD CONSTRAINT medication_dose_plan_history_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.medication_dose_plans(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_plan_stages
  ADD CONSTRAINT medication_dose_plan_stages_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.medication_dose_plans(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_plans
  ADD CONSTRAINT medication_dose_plans_plan_type_check
    CHECK (plan_type = ANY (ARRAY['titration'::text, 'dose_reduction'::text, 'temporary_change'::text, 'taper'::text, 'planned_discontinuation'::text, 'restart'::text]));

ALTER TABLE public.medication_dose_plans
  ADD CONSTRAINT medication_dose_plans_status_check CHECK (status = ANY (ARRAY['draft'::text, 'active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text]));

GRANT ALL ON public.medication_dose_plans TO anon;

GRANT ALL ON public.medication_dose_plans TO authenticated;

GRANT ALL ON public.medication_dose_plans TO service_role;

CREATE INDEX dose_plans_medication_idx ON public.medication_dose_plans (medication_id);

CREATE INDEX dose_plans_service_user_idx ON public.medication_dose_plans (service_user_id);

CREATE TABLE public.medication_dose_protocol_stages (
  id             uuid                     DEFAULT gen_random_uuid() NOT NULL,
  protocol_id    uuid                     NOT NULL,
  stage_number   integer                  NOT NULL,
  stage_name     text,
  dose_quantity  numeric(12,4)            NOT NULL,
  dose_unit      text                     NOT NULL,
  duration_value integer,
  duration_unit  text,
  instructions   text,
  created_at     timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_dose_protocol_stages
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_check
    CHECK (duration_value IS NULL AND duration_unit IS NULL OR duration_unit = 'until_review'::text AND duration_value IS NULL OR duration_value IS
    NOT NULL AND (duration_unit = ANY (ARRAY['hours'::text, 'days'::text, 'weeks'::text])));

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_dose_quantity_check CHECK (dose_quantity > 0::numeric);

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_duration_unit_check
    CHECK (duration_unit IS NULL OR (duration_unit = ANY (ARRAY['hours'::text, 'days'::text, 'weeks'::text, 'until_review'::text])));

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_duration_value_check CHECK (duration_value IS NULL OR duration_value > 0);

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_dose_protocol_stage_id_fkey FOREIGN KEY (dose_protocol_stage_id) REFERENCES public.medication_dose_protocol_stages(id);

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_protocol_id_stage_number_key UNIQUE (protocol_id, stage_number);

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_stage_number_check CHECK (stage_number > 0);

GRANT ALL ON public.medication_dose_protocol_stages TO anon;

GRANT ALL ON public.medication_dose_protocol_stages TO authenticated;

GRANT ALL ON public.medication_dose_protocol_stages TO service_role;

CREATE INDEX medication_dose_stages_protocol_idx ON public.medication_dose_protocol_stages (protocol_id, stage_number);

CREATE TABLE public.medication_dose_protocols (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id       uuid                     NOT NULL,
  service_user_id       uuid                     NOT NULL,
  medication_profile_id uuid                     NOT NULL,
  protocol_type         text                     NOT NULL,
  title                 text                     NOT NULL,
  instructions          text,
  status                text                     DEFAULT 'draft'::text NOT NULL,
  authorised_by         uuid,
  authorised_at         timestamp with time zone,
  activated_by          uuid,
  activated_at          timestamp with time zone,
  starts_at             timestamp with time zone,
  completed_at          timestamp with time zone,
  cancelled_at          timestamp with time zone,
  cancellation_reason   text,
  created_by            uuid                     NOT NULL,
  created_at            timestamp with time zone DEFAULT now() NOT NULL,
  updated_at            timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_dose_protocols
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_check CHECK ((status <> ALL (ARRAY['authorised'::text, 'active'::text])) OR authorised_by IS NOT NULL AND authorised_at IS NOT NULL);

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_check1 CHECK (status <> 'active'::text OR activated_by IS NOT NULL AND activated_at IS NOT NULL AND starts_at IS NOT NULL);

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_dose_protocol_id_fkey FOREIGN KEY (dose_protocol_id) REFERENCES public.medication_dose_protocols(id);

ALTER TABLE public.medication_dose_protocol_stages
  ADD CONSTRAINT medication_dose_protocol_stages_protocol_id_fkey FOREIGN KEY (protocol_id) REFERENCES public.medication_dose_protocols(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_protocol_type_check CHECK (protocol_type = ANY (ARRAY['titration'::text, 'taper'::text, 'restart'::text, 'temporary_change'::text]));

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'authorised'::text, 'active'::text, 'paused'::text, 'completed'::text, 'cancelled'::text]));

GRANT ALL ON public.medication_dose_protocols TO anon;

GRANT ALL ON public.medication_dose_protocols TO authenticated;

GRANT ALL ON public.medication_dose_protocols TO service_role;

CREATE INDEX medication_dose_protocols_org_idx ON public.medication_dose_protocols (organisation_id);

CREATE UNIQUE INDEX one_active_dose_protocol_per_medication ON public.medication_dose_protocols (medication_profile_id)
  WHERE status = 'active'::text;

CREATE INDEX medication_dose_protocols_medication_idx ON public.medication_dose_protocols (medication_profile_id, status);

CREATE TRIGGER medication_dose_protocols_updated_at
  BEFORE UPDATE ON public.medication_dose_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.medication_engine_events (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id       uuid                     NOT NULL,
  service_user_id       uuid                     NOT NULL,
  medication_profile_id uuid                     NOT NULL,
  medication_round_id   uuid,
  client_request_id     uuid                     NOT NULL,
  action_type           text                     NOT NULL,
  event_time            timestamp with time zone NOT NULL,
  requested_by          uuid                     NOT NULL,
  processing_status     text                     DEFAULT 'pending'::text NOT NULL,
  result                jsonb,
  failure_reason        text,
  created_at            timestamp with time zone DEFAULT now() NOT NULL,
  completed_at          timestamp with time zone
);

ALTER TABLE public.medication_engine_events
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_action_type_check
    CHECK (action_type = ANY (ARRAY['administration'::text, 'correction'::text, 'protocol_activation'::text, 'protocol_completion'::text, 'stock_adjustment'::text]));

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_client_request_id_key UNIQUE (client_request_id);

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_engine_event_id_fkey FOREIGN KEY (engine_event_id) REFERENCES public.medication_engine_events(id);

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_processing_status_check
    CHECK (processing_status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'reversed'::text]));

GRANT ALL ON public.medication_engine_events TO anon;

GRANT ALL ON public.medication_engine_events TO authenticated;

GRANT ALL ON public.medication_engine_events TO service_role;

CREATE INDEX medication_engine_events_medication_idx ON public.medication_engine_events (medication_profile_id, event_time DESC);

CREATE INDEX medication_engine_events_org_idx ON public.medication_engine_events (organisation_id);

CREATE TABLE public.medication_manager_reviews (
  id                            uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id               uuid                     NOT NULL,
  service_user_id               uuid                     NOT NULL,
  medication_profile_id         uuid                     NOT NULL,
  missed_dose_rule_id           uuid,
  trigger_engine_event_id       uuid,
  status                        text                     DEFAULT 'open'::text NOT NULL,
  trigger_reason                text                     NOT NULL,
  qualifying_administration_ids uuid[]                   DEFAULT '{}'::uuid[] NOT NULL,
  decision                      text,
  decision_notes                text,
  activated_protocol_id         uuid,
  reviewed_by                   uuid,
  reviewed_at                   timestamp with time zone,
  created_at                    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_manager_reviews
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_activated_protocol_id_fkey FOREIGN KEY (activated_protocol_id) REFERENCES public.medication_dose_protocols(id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_check CHECK (status <> 'resolved'::text OR reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL AND decision IS NOT NULL);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_decision_check
    CHECK
    (decision IS NULL OR (decision = ANY (ARRAY['no_change'::text, 'activate_restart_protocol'::text, 'activate_taper_protocol'::text, 'continue_withholding'::text,
    'await_gp'::text, 'other'::text])));

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_status_check CHECK (status = ANY (ARRAY['open'::text, 'under_review'::text, 'resolved'::text, 'cancelled'::text]));

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_trigger_engine_event_id_fkey FOREIGN KEY (trigger_engine_event_id) REFERENCES public.medication_engine_events(id);

GRANT ALL ON public.medication_manager_reviews TO anon;

GRANT ALL ON public.medication_manager_reviews TO authenticated;

GRANT ALL ON public.medication_manager_reviews TO service_role;

CREATE INDEX medication_manager_reviews_org_status_idx ON public.medication_manager_reviews (organisation_id, status, created_at DESC);

CREATE UNIQUE INDEX one_open_manager_review_per_medication ON public.medication_manager_reviews (medication_profile_id)
  WHERE status = ANY (ARRAY['open'::text, 'under_review'::text]);

CREATE TABLE public.medication_missed_dose_rules (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id       uuid                     NOT NULL,
  service_user_id       uuid                     NOT NULL,
  medication_profile_id uuid                     NOT NULL,
  rule_name             text                     NOT NULL,
  rule_type             text                     NOT NULL,
  threshold_count       integer                  NOT NULL,
  window_value          integer,
  window_unit           text,
  qualifying_outcomes   text[]                   DEFAULT ARRAY['Refused'::text,
  'Unavailable'::text,
  'Not given'::text] NOT NULL,
  active                boolean                  DEFAULT true NOT NULL,
  gp_instructions       text,
  created_by            uuid                     NOT NULL,
  created_at            timestamp with time zone DEFAULT now() NOT NULL,
  updated_at            timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_missed_dose_rules
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_check
    CHECK (rule_type = 'consecutive'::text AND window_value IS NULL AND window_unit IS NULL OR rule_type = 'rolling_window'::text AND window_value IS NOT NULL AND window_unit IS
    NOT NULL);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_missed_dose_rule_id_fkey FOREIGN KEY (missed_dose_rule_id) REFERENCES public.medication_missed_dose_rules(id);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_rule_type_check CHECK (rule_type = ANY (ARRAY['consecutive'::text, 'rolling_window'::text]));

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_threshold_count_check CHECK (threshold_count > 0);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_window_unit_check CHECK (window_unit IS NULL OR (window_unit = ANY (ARRAY['hours'::text, 'days'::text, 'weeks'::text])));

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_window_value_check CHECK (window_value IS NULL OR window_value > 0);

GRANT ALL ON public.medication_missed_dose_rules TO anon;

GRANT ALL ON public.medication_missed_dose_rules TO authenticated;

GRANT ALL ON public.medication_missed_dose_rules TO service_role;

CREATE INDEX medication_missed_rules_medication_idx ON public.medication_missed_dose_rules (medication_profile_id, active);

CREATE TRIGGER medication_missed_dose_rules_updated_at
  BEFORE UPDATE ON public.medication_missed_dose_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.medication_profiles (
  id                              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id                 uuid                     NOT NULL,
  medication_name                 text                     NOT NULL,
  dose                            text                     NOT NULL,
  route                           text,
  round                           text                     NOT NULL,
  instructions                    text,
  is_prn                          boolean                  DEFAULT false NOT NULL,
  titration_plan_available        boolean                  DEFAULT false NOT NULL,
  titration_trigger_missed_rounds integer,
  titration_instructions          text,
  manager_unlock_required         boolean                  DEFAULT false NOT NULL,
  locked                          boolean                  DEFAULT false NOT NULL,
  active                          boolean                  DEFAULT true NOT NULL,
  created_at                      timestamp with time zone DEFAULT now() NOT NULL,
  strength_quantity               numeric(12,4),
  strength_unit                   text,
  administration_quantity         numeric(12,4),
  administration_unit             text
);

ALTER TABLE public.medication_profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_profiles
  ADD CONSTRAINT medication_profiles_administration_quantity_positive CHECK (administration_quantity IS NULL OR administration_quantity > 0::numeric);

ALTER TABLE public.medication_profiles
  ADD CONSTRAINT medication_profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_medication_profile_id_fkey FOREIGN KEY (medication_profile_id) REFERENCES public.medication_profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.medication_dose_plans
  ADD CONSTRAINT medication_dose_plans_medication_id_fkey FOREIGN KEY (medication_id) REFERENCES public.medication_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_medication_profile_id_fkey FOREIGN KEY (medication_profile_id) REFERENCES public.medication_profiles(id);

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_medication_profile_id_fkey FOREIGN KEY (medication_profile_id) REFERENCES public.medication_profiles(id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_medication_profile_id_fkey FOREIGN KEY (medication_profile_id) REFERENCES public.medication_profiles(id);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_medication_profile_id_fkey FOREIGN KEY (medication_profile_id) REFERENCES public.medication_profiles(id);

ALTER TABLE public.medication_profiles
  ADD CONSTRAINT medication_profiles_strength_quantity_positive CHECK (strength_quantity IS NULL OR strength_quantity > 0::numeric);

ALTER TABLE public.medication_profiles
  ADD CONSTRAINT medication_profiles_structured_dose_complete CHECK (administration_quantity IS NULL AND administration_unit IS NULL OR administration_quantity IS
    NOT NULL AND administration_unit IS NOT NULL);

ALTER TABLE public.medication_profiles
  ADD CONSTRAINT medication_profiles_structured_strength_complete CHECK (strength_quantity IS NULL AND strength_unit IS NULL OR strength_quantity IS NOT NULL AND strength_unit IS
    NOT NULL);

GRANT ALL ON public.medication_profiles TO anon;

GRANT ALL ON public.medication_profiles TO authenticated;

GRANT ALL ON public.medication_profiles TO service_role;

CREATE TABLE public.medication_rounds (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id     uuid                     NOT NULL,
  service_user_id     uuid                     NOT NULL,
  round_name          text                     NOT NULL,
  administration_date date                     NOT NULL,
  event_time          timestamp with time zone DEFAULT now() NOT NULL,
  completed_by        uuid                     NOT NULL,
  completed_at        timestamp with time zone DEFAULT now() NOT NULL,
  timeline_entry_id   uuid,
  created_at          timestamp with time zone DEFAULT now() NOT NULL,
  event_type          text                     DEFAULT 'scheduled'::text NOT NULL,
  client_request_id   uuid
);

ALTER TABLE public.medication_rounds
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_rounds
  ADD CONSTRAINT medication_round_name_not_empty CHECK (length(TRIM(BOTH FROM round_name)) > 0);

ALTER TABLE public.medication_rounds
  ADD CONSTRAINT medication_rounds_event_type_check CHECK (event_type = ANY (ARRAY['scheduled'::text, 'prn'::text, 'variable'::text, 'emergency'::text]));

ALTER TABLE public.medication_rounds
  ADD CONSTRAINT medication_rounds_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_medication_round_id_fkey FOREIGN KEY (medication_round_id) REFERENCES public.medication_rounds(id) ON DELETE SET NULL;

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_medication_round_id_fkey FOREIGN KEY (medication_round_id) REFERENCES public.medication_rounds(id);

GRANT ALL ON public.medication_rounds TO anon;

GRANT ALL ON public.medication_rounds TO authenticated;

GRANT ALL ON public.medication_rounds TO service_role;

CREATE INDEX medication_rounds_service_user_idx ON public.medication_rounds (service_user_id);

CREATE UNIQUE INDEX medication_rounds_client_request_idx ON public.medication_rounds (client_request_id)
  WHERE client_request_id IS NOT NULL;

CREATE INDEX medication_rounds_service_user_date_idx ON public.medication_rounds (service_user_id, administration_date DESC);

CREATE INDEX medication_rounds_date_idx ON public.medication_rounds (administration_date DESC);

CREATE INDEX medication_rounds_organisation_idx ON public.medication_rounds (organisation_id);

CREATE TABLE public.medication_stock_transactions (
  id                      uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id         uuid                     NOT NULL,
  service_user_id         uuid                     NOT NULL,
  medication_profile_id   uuid                     NOT NULL,
  engine_event_id         uuid,
  administration_id       uuid,
  transaction_type        text                     NOT NULL,
  quantity                numeric(12,4)            NOT NULL,
  unit                    text                     NOT NULL,
  reason                  text,
  reverses_transaction_id uuid,
  recorded_by             uuid                     NOT NULL,
  occurred_at             timestamp with time zone NOT NULL,
  created_at              timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.medication_stock_transactions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_administration_id_fkey FOREIGN KEY (administration_id) REFERENCES public.medication_administrations(id);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_check CHECK (transaction_type <> 'reversal'::text OR reverses_transaction_id IS NOT NULL);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_engine_event_id_fkey FOREIGN KEY (engine_event_id) REFERENCES public.medication_engine_events(id);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_medication_profile_id_fkey FOREIGN KEY (medication_profile_id) REFERENCES public.medication_profiles(id);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_pkey PRIMARY KEY (id);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_quantity_check CHECK (quantity <> 0::numeric);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_reverses_transaction_id_fkey FOREIGN KEY (reverses_transaction_id) REFERENCES public.medication_stock_transactions(id);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_transaction_type_check
    CHECK (transaction_type = ANY (ARRAY['received'::text, 'administered'::text, 'wasted'::text, 'damaged'::text, 'returned'::text, 'adjustment'::text, 'reversal'::text]));

GRANT ALL ON public.medication_stock_transactions TO anon;

GRANT ALL ON public.medication_stock_transactions TO authenticated;

GRANT ALL ON public.medication_stock_transactions TO service_role;

CREATE INDEX medication_stock_transactions_medication_idx ON public.medication_stock_transactions (medication_profile_id, occurred_at DESC);

CREATE INDEX medication_stock_transactions_engine_event_idx ON public.medication_stock_transactions (engine_event_id);

CREATE TABLE public.memories (
  id                           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id              uuid                     NOT NULL,
  service_user_id              uuid                     NOT NULL,
  title                        text                     NOT NULL,
  story                        text                     NOT NULL,
  memory_date                  date                     NOT NULL,
  people_involved              text,
  category                     text,
  created_by                   uuid                     NOT NULL,
  created_at                   timestamp with time zone DEFAULT now() NOT NULL,
  updated_by                   uuid,
  updated_at                   timestamp with time zone DEFAULT now() NOT NULL,
  family_visible               boolean                  DEFAULT false NOT NULL,
  family_visibility_changed_by uuid,
  family_visibility_changed_at timestamp with time zone,
  family_visibility_note       text,
  archived                     boolean                  DEFAULT false NOT NULL,
  archived_by                  uuid,
  archived_at                  timestamp with time zone
);

ALTER TABLE public.memories
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.memories
  ADD CONSTRAINT memories_pkey PRIMARY KEY (id);

GRANT ALL ON public.memories TO anon;

GRANT ALL ON public.memories TO authenticated;

GRANT ALL ON public.memories TO service_role;

CREATE INDEX memories_organisation_idx ON public.memories (organisation_id);

CREATE INDEX memories_memory_date_idx ON public.memories (memory_date DESC);

CREATE INDEX memories_family_visible_idx ON public.memories (service_user_id, family_visible);

CREATE INDEX memories_service_user_idx ON public.memories (service_user_id);

CREATE TRIGGER guard_memory_update_trigger
  BEFORE UPDATE ON public.memories
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_memory_update();

CREATE POLICY "Family can view shared memories" ON public.memories
  FOR SELECT
  TO authenticated
  USING (((family_visible = true) AND (archived = false) AND (EXISTS ( SELECT 1
   FROM public.family_users fu
  WHERE ((fu.auth_user_id = auth.uid()) AND (fu.service_user_id = memories.service_user_id) AND (fu.organisation_id = memories.organisation_id) AND (fu.is_active = true))))));

CREATE POLICY "Managers can update memory governance" ON public.memories
  FOR UPDATE
  TO authenticated
  USING ((public.is_castodia_manager() AND (organisation_id = public.current_castodia_organisation_id())))
  WITH CHECK ((public.is_castodia_manager() AND (organisation_id = public.current_castodia_organisation_id())));

CREATE POLICY "Memories visible within organisation" ON public.memories
  FOR SELECT
  TO authenticated
  USING ((organisation_id = public.current_castodia_organisation_id()));

CREATE POLICY "Support can update memories" ON public.memories
  FOR UPDATE
  TO authenticated
  USING ((public.is_castodia_support() AND (organisation_id = public.current_castodia_organisation_id()) AND (archived = false)))
  WITH CHECK ((public.is_castodia_support() AND (organisation_id = public.current_castodia_organisation_id())));

CREATE TABLE public.memory_photos (
  id                           uuid                     DEFAULT gen_random_uuid() NOT NULL,
  memory_id                    uuid                     NOT NULL,
  storage_path                 text                     NOT NULL,
  caption                      text,
  display_order                integer                  DEFAULT 0 NOT NULL,
  created_by                   uuid                     NOT NULL,
  created_at                   timestamp with time zone DEFAULT now() NOT NULL,
  family_visible               boolean                  DEFAULT true NOT NULL,
  family_visibility_changed_by uuid,
  family_visibility_changed_at timestamp with time zone,
  family_visibility_note       text
);

ALTER TABLE public.memory_photos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.memory_photos
  ADD CONSTRAINT memory_photos_memory_id_fkey FOREIGN KEY (memory_id) REFERENCES public.memories(id) ON DELETE CASCADE;

ALTER TABLE public.memory_photos
  ADD CONSTRAINT memory_photos_pkey PRIMARY KEY (id);

GRANT ALL ON public.memory_photos TO anon;

GRANT ALL ON public.memory_photos TO authenticated;

GRANT ALL ON public.memory_photos TO service_role;

CREATE INDEX memory_photos_memory_idx ON public.memory_photos (memory_id);

CREATE INDEX memory_photos_display_order_idx ON public.memory_photos (memory_id, display_order);

CREATE TRIGGER guard_memory_photo_update_trigger
  BEFORE UPDATE ON public.memory_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.guard_memory_photo_update();

CREATE POLICY "Family can view shared memory photos" ON public.memory_photos
  FOR SELECT
  TO authenticated
  USING (((family_visible = true) AND (EXISTS ( SELECT 1
   FROM (public.memories m
     JOIN public.family_users fu ON (((fu.service_user_id = m.service_user_id) AND (fu.organisation_id = m.organisation_id))))
  WHERE ((m.id = memory_photos.memory_id) AND (m.family_visible = true) AND (m.archived = false) AND (fu.auth_user_id = auth.uid()) AND (fu.is_active = true))))));

CREATE POLICY "Managers can update photo governance" ON public.memory_photos
  FOR UPDATE
  TO authenticated
  USING ((public.is_castodia_manager() AND (EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id()))))))
  WITH CHECK ((public.is_castodia_manager() AND (EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id()))))));

CREATE POLICY "Memory photos visible within organisation" ON public.memory_photos
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id())))));

CREATE POLICY "Support can add memory photos" ON public.memory_photos
  FOR INSERT
  TO authenticated
  WITH
    CHECK
    ((public.is_castodia_support() AND (created_by = auth.uid()) AND (family_visible = true) AND (family_visibility_changed_by IS NULL) AND (family_visibility_changed_at IS NULL)
    AND (EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id()) AND (m.archived = false))))));

CREATE POLICY "Support can remove memory photos" ON public.memory_photos
  FOR DELETE
  TO authenticated
  USING ((public.is_castodia_support() AND (EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id()) AND (m.archived = false))))));

CREATE POLICY "Support can update memory photos" ON public.memory_photos
  FOR UPDATE
  TO authenticated
  USING ((public.is_castodia_support() AND (EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id()) AND (m.archived = false))))))
  WITH CHECK ((public.is_castodia_support() AND (EXISTS ( SELECT 1
   FROM public.memories m
  WHERE ((m.id = memory_photos.memory_id) AND (m.organisation_id = public.current_castodia_organisation_id()) AND (m.archived = false))))));

CREATE TABLE public.organisation_modules (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id uuid                     NOT NULL,
  module_key      text                     NOT NULL,
  is_enabled      boolean                  DEFAULT false NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.organisation_modules
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organisation_modules
  ADD CONSTRAINT organisation_features_organisation_id_feature_key_key UNIQUE (organisation_id, module_key);

ALTER TABLE public.organisation_modules
  ADD CONSTRAINT organisation_features_pkey PRIMARY KEY (id);

GRANT ALL ON public.organisation_modules TO anon;

GRANT ALL ON public.organisation_modules TO authenticated;

GRANT ALL ON public.organisation_modules TO service_role;

CREATE TABLE public.organisation_timeline_categories (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id uuid                     NOT NULL,
  category_key    text                     NOT NULL,
  is_enabled      boolean                  DEFAULT true NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.organisation_timeline_categories
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organisation_timeline_categories
  ADD CONSTRAINT organisation_timeline_categori_organisation_id_category_key_key UNIQUE (organisation_id, category_key);

ALTER TABLE public.organisation_timeline_categories
  ADD CONSTRAINT organisation_timeline_categories_pkey PRIMARY KEY (id);

GRANT ALL ON public.organisation_timeline_categories TO anon;

GRANT ALL ON public.organisation_timeline_categories TO authenticated;

GRANT ALL ON public.organisation_timeline_categories TO service_role;

CREATE TABLE public.organisation_timeline_options (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id uuid                     NOT NULL,
  option_key      text                     NOT NULL,
  category_key    text                     NOT NULL,
  is_enabled      boolean                  DEFAULT true NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.organisation_timeline_options
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organisation_timeline_options
  ADD CONSTRAINT organisation_timeline_options_organisation_id_option_key_key UNIQUE (organisation_id, option_key);

ALTER TABLE public.organisation_timeline_options
  ADD CONSTRAINT organisation_timeline_options_pkey PRIMARY KEY (id);

GRANT ALL ON public.organisation_timeline_options TO anon;

GRANT ALL ON public.organisation_timeline_options TO authenticated;

GRANT ALL ON public.organisation_timeline_options TO service_role;

CREATE TABLE public.organisations (
  id          uuid                     DEFAULT gen_random_uuid() NOT NULL,
  name        text                     NOT NULL,
  uses_houses boolean                  DEFAULT false NOT NULL,
  created_at  timestamp with time zone DEFAULT now() NOT NULL,
  is_active   boolean                  DEFAULT true NOT NULL,
  status      text                     DEFAULT 'active'::text NOT NULL
);

ALTER TABLE public.organisations
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.organisations
  ADD CONSTRAINT organisations_pkey PRIMARY KEY (id);

ALTER TABLE private.safeguarding_case_sequences
  ADD CONSTRAINT safeguarding_case_sequences_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.houses
  ADD CONSTRAINT houses_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.organisation_modules
  ADD CONSTRAINT organisation_features_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.organisation_timeline_categories
  ADD CONSTRAINT organisation_timeline_categories_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.organisation_timeline_options
  ADD CONSTRAINT organisation_timeline_options_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.organisations
  ADD CONSTRAINT organisations_status_check CHECK (status = ANY (ARRAY['active'::text, 'trial'::text, 'suspended'::text, 'archived'::text]));

GRANT ALL ON public.organisations TO anon;

GRANT ALL ON public.organisations TO authenticated;

GRANT ALL ON public.organisations TO service_role;

CREATE TABLE public.personal_care_records (
  id               uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id  uuid                     NOT NULL,
  created_by       uuid                     NOT NULL,
  care_type        text                     NOT NULL,
  assistance_level text                     NOT NULL,
  notes            text,
  occurred_at      timestamp with time zone NOT NULL,
  created_at       timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.personal_care_records
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.personal_care_records
  ADD CONSTRAINT personal_care_records_pkey PRIMARY KEY (id);

GRANT ALL ON public.personal_care_records TO anon;

GRANT ALL ON public.personal_care_records TO authenticated;

GRANT ALL ON public.personal_care_records TO service_role;

CREATE TABLE public.platform_issues (
  id               uuid                     DEFAULT gen_random_uuid() NOT NULL,
  ticket_number    bigint                   GENERATED BY DEFAULT AS IDENTITY NOT NULL,
  title            text                     NOT NULL,
  description      text                     NOT NULL,
  category         text                     DEFAULT 'technical'::text NOT NULL,
  status           text                     DEFAULT 'submitted'::text NOT NULL,
  priority         text                     DEFAULT 'medium'::text NOT NULL,
  organisation_id  uuid,
  reported_by      uuid,
  assigned_to      uuid,
  affected_area    text,
  reporter_urgency text,
  public_response  text,
  internal_notes   text,
  resolution_notes text,
  created_at       timestamp with time zone DEFAULT now() NOT NULL,
  updated_at       timestamp with time zone DEFAULT now() NOT NULL,
  resolved_at      timestamp with time zone,
  closed_at        timestamp with time zone
);

ALTER TABLE public.platform_issues
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_category_check
    CHECK (category = ANY (ARRAY['technical'::text, 'bug'::text, 'access'::text, 'account'::text, 'feature_request'::text, 'billing'::text, 'security'::text, 'other'::text]));

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE SET NULL;

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_pkey PRIMARY KEY (id);

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_priority_check CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]));

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_status_check
    CHECK (status = ANY (ARRAY['submitted'::text, 'triaged'::text, 'in_progress'::text, 'waiting_for_customer'::text, 'resolved'::text, 'closed'::text]));

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_ticket_number_key UNIQUE (ticket_number);

GRANT ALL ON public.platform_issues TO anon;

GRANT ALL ON public.platform_issues TO authenticated;

GRANT ALL ON public.platform_issues TO service_role;

CREATE TABLE public.profiles (
  id              uuid                     NOT NULL,
  full_name       text                     NOT NULL,
  role            text                     DEFAULT 'staff'::text NOT NULL,
  organisation_id uuid,
  first_name      text,
  surname         text,
  email           text,
  is_active       boolean                  DEFAULT true NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL,
  photo_url       text
);

CREATE POLICY "Allow organisation users to insert body map markers" ON public.body_map_markers
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.body_maps
  WHERE ((body_maps.id = body_map_markers.body_map_id) AND (body_maps.organisation_id IN ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Allow organisation users to view body map markers" ON public.body_map_markers
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM public.body_maps
  WHERE ((body_maps.id = body_map_markers.body_map_id) AND (body_maps.organisation_id IN ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Users can view body map markers in their organisation" ON public.body_map_markers
  FOR SELECT
  USING ((body_map_id IN ( SELECT body_maps.id
   FROM public.body_maps
  WHERE (body_maps.organisation_id IN ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Allow organisation users to insert body maps" ON public.body_maps
  FOR INSERT
  WITH CHECK ((organisation_id IN ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Allow organisation users to view body maps" ON public.body_maps
  FOR SELECT
  USING ((organisation_id IN ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Users can view body maps in their organisation" ON public.body_maps
  FOR SELECT
  USING ((organisation_id IN ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Managers can create care plan sections in their organisation" ON public.care_plan_sections
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.care_plans
  WHERE ((care_plans.id = care_plan_sections.care_plan_id) AND (care_plans.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
           FROM public.profiles
          WHERE (profiles.id = auth.uid())) = 'manager'::text)))));

CREATE POLICY "Managers can delete care plan sections in their organisation" ON public.care_plan_sections
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.care_plans
  WHERE ((care_plans.id = care_plan_sections.care_plan_id) AND (care_plans.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
           FROM public.profiles
          WHERE (profiles.id = auth.uid())) = 'manager'::text)))));

CREATE POLICY "Managers can update care plan sections in their organisation" ON public.care_plan_sections
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.care_plans
  WHERE ((care_plans.id = care_plan_sections.care_plan_id) AND (care_plans.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
           FROM public.profiles
          WHERE (profiles.id = auth.uid())) = 'manager'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.care_plans
  WHERE ((care_plans.id = care_plan_sections.care_plan_id) AND (care_plans.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
           FROM public.profiles
          WHERE (profiles.id = auth.uid())) = 'manager'::text)))));

CREATE POLICY "Managers can view care plan sections in their organisation" ON public.care_plan_sections
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.care_plans
  WHERE ((care_plans.id = care_plan_sections.care_plan_id) AND (care_plans.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
           FROM public.profiles
          WHERE (profiles.id = auth.uid())) = 'manager'::text)))));

CREATE POLICY "Users can view published care plan sections in their organisati" ON public.care_plan_sections
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.care_plans
  WHERE ((care_plans.id = care_plan_sections.care_plan_id) AND (care_plans.status = 'published'::text) AND (care_plans.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Managers can delete care plans in their organisation" ON public.care_plans
  FOR DELETE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Managers can view care plans in their organisation" ON public.care_plans
  FOR SELECT
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can view published care plans in their organisation" ON public.care_plans
  FOR SELECT
  TO authenticated
  USING (((status = 'published'::text) AND (organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))));

CREATE POLICY "Managers can create protocol stages in their organisation" ON public.medication_dose_protocol_stages
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.medication_dose_protocols protocol
     JOIN public.profiles profile ON ((profile.id = auth.uid())))
  WHERE ((protocol.id = medication_dose_protocol_stages.protocol_id) AND (protocol.organisation_id = profile.organisation_id) AND (profile.role = 'manager'::text)))));

CREATE POLICY "Managers can update protocol stages in their organisation" ON public.medication_dose_protocol_stages
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM (public.medication_dose_protocols protocol
     JOIN public.profiles profile ON ((profile.id = auth.uid())))
  WHERE ((protocol.id = medication_dose_protocol_stages.protocol_id) AND (protocol.organisation_id = profile.organisation_id) AND (profile.role = 'manager'::text)))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.medication_dose_protocols protocol
     JOIN public.profiles profile ON ((profile.id = auth.uid())))
  WHERE ((protocol.id = medication_dose_protocol_stages.protocol_id) AND (protocol.organisation_id = profile.organisation_id) AND (profile.role = 'manager'::text)))));

CREATE POLICY "Users can view medication dose protocol stages in their organis" ON public.medication_dose_protocol_stages
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM (public.medication_dose_protocols protocol
     JOIN public.profiles profile ON ((profile.id = auth.uid())))
  WHERE ((protocol.id = medication_dose_protocol_stages.protocol_id) AND (protocol.organisation_id = profile.organisation_id)))));

CREATE POLICY "Managers can create dose protocols in their organisation" ON public.medication_dose_protocols
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))) AND (created_by = auth.uid())));

CREATE POLICY "Managers can update dose protocols in their organisation" ON public.medication_dose_protocols
  FOR UPDATE
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))))
  WITH CHECK ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))));

CREATE POLICY "Users can view medication dose protocols in their organisation" ON public.medication_dose_protocols
  FOR SELECT
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Users can view medication engine events in their organisation" ON public.medication_engine_events
  FOR SELECT
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Managers can update medication reviews in their organisation" ON public.medication_manager_reviews
  FOR UPDATE
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))))
  WITH CHECK ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))));

CREATE POLICY "Users can view medication reviews in their organisation" ON public.medication_manager_reviews
  FOR SELECT
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Managers can create missed dose rules in their organisation" ON public.medication_missed_dose_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))) AND (created_by = auth.uid())));

CREATE POLICY "Managers can update missed dose rules in their organisation" ON public.medication_missed_dose_rules
  FOR UPDATE
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))))
  WITH CHECK ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text)))));

CREATE POLICY "Users can view missed dose rules in their organisation" ON public.medication_missed_dose_rules
  FOR SELECT
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Users can view medication stock in their organisation" ON public.medication_stock_transactions
  FOR SELECT
  TO authenticated
  USING ((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))));

CREATE POLICY "Platform users can manage organisation features" ON public.organisation_modules
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))));

CREATE POLICY "Organisation users can read timeline categories" ON public.organisation_timeline_categories
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE
    ((profiles.id = auth.uid()) AND (profiles.organisation_id = organisation_timeline_categories.organisation_id) AND (profiles.role = ANY (ARRAY['manager'::text,
    'support'::text]))))));

CREATE POLICY "Platform users can manage timeline categories" ON public.organisation_timeline_categories
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))));

CREATE POLICY "Organisation users can read timeline options" ON public.organisation_timeline_options
  FOR SELECT
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE
    ((profiles.id = auth.uid()) AND (profiles.organisation_id = organisation_timeline_options.organisation_id) AND (profiles.role = ANY (ARRAY['manager'::text,
    'support'::text]))))));

CREATE POLICY "Platform users can manage timeline options" ON public.organisation_timeline_options
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))));

CREATE POLICY "Platform admins can view organisations" ON public.organisations
  FOR SELECT
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))));

CREATE POLICY "Platform users can create organisations" ON public.organisations
  FOR INSERT
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text]))))));

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_plan_owner_id_fkey FOREIGN KEY (plan_owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.handover_reads
  ADD CONSTRAINT handover_reads_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id);

ALTER TABLE public.handovers
  ADD CONSTRAINT handovers_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_administered_by_fkey FOREIGN KEY (administered_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_dose_plan_history
  ADD CONSTRAINT medication_dose_plan_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_dose_plans
  ADD CONSTRAINT medication_dose_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_activated_by_fkey FOREIGN KEY (activated_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_authorised_by_fkey FOREIGN KEY (authorised_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.medication_rounds
  ADD CONSTRAINT medication_rounds_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id);

ALTER TABLE public.memories
  ADD CONSTRAINT memories_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.profiles(id);

ALTER TABLE public.memories
  ADD CONSTRAINT memories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.memories
  ADD CONSTRAINT memories_family_visibility_changed_by_fkey FOREIGN KEY (family_visibility_changed_by) REFERENCES public.profiles(id);

ALTER TABLE public.memories
  ADD CONSTRAINT memories_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);

ALTER TABLE public.memory_photos
  ADD CONSTRAINT memory_photos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.memory_photos
  ADD CONSTRAINT memory_photos_family_visibility_changed_by_fkey FOREIGN KEY (family_visibility_changed_by) REFERENCES public.profiles(id);

ALTER TABLE public.personal_care_records
  ADD CONSTRAINT personal_care_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.platform_issues
  ADD CONSTRAINT platform_issues_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role = ANY (ARRAY['castodia_owner'::text, 'castodia_admin'::text, 'manager'::text, 'support'::text]));

GRANT ALL ON public.profiles TO anon;

GRANT ALL ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

CREATE INDEX profiles_organisation_role_idx ON public.profiles (organisation_id, ROLE);

CREATE INDEX profiles_organisation_full_name_idx ON public.profiles (organisation_id, full_name);

CREATE INDEX profiles_organisation_id_idx ON public.profiles (organisation_id);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Managers can create profiles" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((private.current_user_is_manager() AND (organisation_id = private.current_user_organisation_id())));

CREATE POLICY "Managers can update profiles" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((private.current_user_is_manager() AND (organisation_id = private.current_user_organisation_id())))
  WITH CHECK ((private.current_user_is_manager() AND (organisation_id = private.current_user_organisation_id())));

CREATE POLICY "Users and managers can read profiles" ON public.profiles
  FOR SELECT
  TO authenticated
  USING
    (((id = ( SELECT auth.uid() AS uid)) OR (( SELECT private.current_user_is_manager() AS current_user_is_manager) AND (organisation_id = ( SELECT
    private.current_user_organisation_id() AS current_user_organisation_id)))));

CREATE TABLE public.risk_assessments (
  id                    uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id       uuid                     NOT NULL,
  service_user_id       uuid                     NOT NULL,
  title                 text                     NOT NULL,
  risk_description      text                     NOT NULL,
  personal_risk_factors text                     NOT NULL,
  control_measures      text                     NOT NULL,
  early_warning_signs   text,
  actions_if_occurs     text                     NOT NULL,
  plan_owner_id         uuid,
  review_frequency      text,
  next_review_date      date,
  overall_risk          text                     NOT NULL,
  status                text                     DEFAULT 'active'::text NOT NULL,
  reviewed_at           timestamp with time zone,
  created_by            uuid                     NOT NULL,
  updated_by            uuid                     NOT NULL,
  created_at            timestamp with time zone DEFAULT now() NOT NULL,
  updated_at            timestamp with time zone DEFAULT now() NOT NULL,
  archived_at           timestamp with time zone
);

COMMENT ON TABLE public.risk_assessments IS 'Person-specific professional risk assessments forming the service user Risk Register.';

COMMENT ON COLUMN public.risk_assessments.personal_risk_factors IS 'Narrative explaining why this particular person is vulnerable to the identified risk.';

COMMENT ON COLUMN public.risk_assessments.actions_if_occurs IS 'Immediate actions staff should take if the identified risk materialises.';

COMMENT ON COLUMN public.risk_assessments.overall_risk IS 'Professional judgement recorded by the responsible manager. Castodia does not calculate this value.';

ALTER TABLE public.risk_assessments
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_actions_not_blank CHECK (length(btrim(actions_if_occurs)) > 0);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_archive_state_valid CHECK (status = 'archived'::text AND archived_at IS NOT NULL OR status = 'active'::text AND archived_at IS NULL);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_controls_not_blank CHECK (length(btrim(control_measures)) > 0);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_description_not_blank CHECK (length(btrim(risk_description)) > 0);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_factors_not_blank CHECK (length(btrim(personal_risk_factors)) > 0);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_overall_risk_check CHECK (overall_risk = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]));

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_pkey PRIMARY KEY (id);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_plan_owner_id_fkey FOREIGN KEY (plan_owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_status_check CHECK (status = ANY (ARRAY['active'::text, 'archived'::text]));

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_title_not_blank CHECK (length(btrim(title)) > 0);

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

GRANT ALL ON public.risk_assessments TO anon;

GRANT ALL ON public.risk_assessments TO authenticated;

GRANT ALL ON public.risk_assessments TO service_role;

CREATE INDEX risk_assessments_overall_risk_idx ON public.risk_assessments (overall_risk)
  WHERE status = 'active'::text;

CREATE INDEX risk_assessments_service_user_id_idx ON public.risk_assessments (service_user_id);

CREATE INDEX risk_assessments_next_review_date_idx ON public.risk_assessments (next_review_date)
  WHERE status = 'active'::text AND next_review_date IS NOT NULL;

CREATE INDEX risk_assessments_organisation_id_idx ON public.risk_assessments (organisation_id);

CREATE INDEX risk_assessments_service_user_status_idx ON public.risk_assessments (service_user_id, status);

CREATE TRIGGER risk_assessments_set_audit_fields
  BEFORE INSERT OR UPDATE ON public.risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION private.set_risk_assessment_audit_fields();

CREATE TRIGGER risk_assessments_set_organisation
  BEFORE INSERT OR UPDATE OF service_user_id, organisation_id ON public.risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION private.set_risk_assessment_organisation();

CREATE POLICY "Managers can view risk assessments in their organisation" ON public.risk_assessments
  FOR SELECT
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can view active risk assessments in their organisation" ON public.risk_assessments
  FOR SELECT
  TO authenticated
  USING (((status = 'active'::text) AND (organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid())))));

CREATE TABLE public.safeguarding_actions (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  case_id         uuid                     NOT NULL,
  organisation_id uuid                     NOT NULL,
  title           text                     NOT NULL,
  details         text,
  assigned_to     uuid,
  due_date        date,
  priority        text                     DEFAULT 'medium'::text NOT NULL,
  status          text                     DEFAULT 'todo'::text NOT NULL,
  completion_note text,
  completed_at    timestamp with time zone,
  completed_by    uuid,
  created_by      uuid                     NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.safeguarding_actions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_completion_check CHECK (status = 'completed'::text AND completed_at IS NOT NULL AND completed_by IS
    NOT NULL OR status <> 'completed'::text AND completed_at IS NULL AND completed_by IS NULL);

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_pkey PRIMARY KEY (id);

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_priority_check CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]));

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_status_check CHECK (status = ANY (ARRAY['todo'::text, 'in_progress'::text, 'blocked'::text, 'completed'::text, 'cancelled'::text]));

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_title_not_blank CHECK (length(btrim(title)) > 0);

GRANT ALL ON public.safeguarding_actions TO authenticated;

GRANT ALL ON public.safeguarding_actions TO service_role;

CREATE INDEX safeguarding_actions_case_status_idx ON public.safeguarding_actions (case_id, status, due_date);

CREATE TRIGGER safeguarding_actions_audit_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.safeguarding_actions
  FOR EACH ROW
  EXECUTE FUNCTION private.log_safeguarding_change();

CREATE TRIGGER safeguarding_actions_completion_trigger
  BEFORE UPDATE ON public.safeguarding_actions
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_safeguarding_action_completion();

CREATE TRIGGER safeguarding_actions_organisation_guard_trigger
  BEFORE INSERT OR UPDATE ON public.safeguarding_actions
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_safeguarding_organisation_consistency();

CREATE TRIGGER safeguarding_actions_updated_at_trigger
  BEFORE UPDATE ON public.safeguarding_actions
  FOR EACH ROW
  EXECUTE FUNCTION private.set_safeguarding_updated_at();

CREATE POLICY safeguarding_actions_manager_insert ON public.safeguarding_actions
  FOR INSERT
  TO authenticated
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id) AND (created_by = auth.uid())));

CREATE POLICY safeguarding_actions_manager_select ON public.safeguarding_actions
  FOR SELECT
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE POLICY safeguarding_actions_manager_update ON public.safeguarding_actions
  FOR UPDATE
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)))
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE TABLE public.safeguarding_audit_log (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  case_id         uuid,
  organisation_id uuid                     NOT NULL,
  entity_type     text                     NOT NULL,
  entity_id       uuid                     NOT NULL,
  operation       text                     NOT NULL,
  old_data        jsonb,
  new_data        jsonb,
  actor_id        uuid,
  occurred_at     timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.safeguarding_audit_log
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.safeguarding_audit_log
  ADD CONSTRAINT safeguarding_audit_log_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.safeguarding_audit_log
  ADD CONSTRAINT safeguarding_audit_log_operation_check CHECK (operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text]));

ALTER TABLE public.safeguarding_audit_log
  ADD CONSTRAINT safeguarding_audit_log_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_audit_log
  ADD CONSTRAINT safeguarding_audit_log_pkey PRIMARY KEY (id);

GRANT ALL ON public.safeguarding_audit_log TO authenticated;

GRANT ALL ON public.safeguarding_audit_log TO service_role;

CREATE INDEX safeguarding_audit_case_idx ON public.safeguarding_audit_log (case_id, occurred_at DESC);

CREATE POLICY safeguarding_audit_manager_select ON public.safeguarding_audit_log
  FOR SELECT
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE TABLE public.safeguarding_cases (
  id                         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id            uuid                     NOT NULL,
  service_user_id            uuid                     NOT NULL,
  case_reference             text                     NOT NULL,
  title                      text                     NOT NULL,
  category                   text                     NOT NULL,
  risk_level                 text                     DEFAULT 'medium'::text NOT NULL,
  status                     text                     DEFAULT 'open'::text NOT NULL,
  concern_source             text                     DEFAULT 'staff_observation'::text NOT NULL,
  concern_summary            text                     NOT NULL,
  immediate_actions          text,
  desired_outcomes           text,
  reported_by_name           text,
  person_alleged_responsible text,
  location                   text,
  external_reference         text,
  local_authority_reference  text,
  police_reference           text,
  date_concern_raised        timestamp with time zone NOT NULL,
  raised_by                  uuid                     NOT NULL,
  assigned_manager_id        uuid,
  closure_reason             text,
  closure_outcome            text,
  lessons_learned            text,
  closed_at                  timestamp with time zone,
  closed_by                  uuid,
  created_at                 timestamp with time zone DEFAULT now() NOT NULL,
  updated_at                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.safeguarding_cases
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_assigned_manager_id_fkey FOREIGN KEY (assigned_manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_category_check
    CHECK
    (category = ANY (ARRAY['physical'::text, 'sexual'::text, 'emotional'::text, 'financial'::text, 'discriminatory'::text, 'neglect'::text, 'organisational'::text,
    'self_neglect'::text, 'domestic_abuse'::text, 'modern_slavery'::text, 'other'::text]));

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_closed_by_fkey FOREIGN KEY (closed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_closure_check CHECK (status <> 'closed'::text AND closed_at IS NULL AND closed_by IS NULL OR status = 'closed'::text AND closed_at IS
    NOT NULL AND closed_by IS NOT NULL AND length(btrim(COALESCE(closure_reason, ''::text))) > 0 AND length(btrim(COALESCE(closure_outcome, ''::text))) > 0);

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_pkey PRIMARY KEY (id);

ALTER TABLE public.safeguarding_actions
  ADD CONSTRAINT safeguarding_actions_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.safeguarding_cases(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_audit_log
  ADD CONSTRAINT safeguarding_audit_log_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.safeguarding_cases(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_raised_by_fkey FOREIGN KEY (raised_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_reference_unique UNIQUE (organisation_id, case_reference);

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_risk_check CHECK (risk_level = ANY (ARRAY['not_assessed'::text, 'low'::text, 'medium'::text, 'high'::text, 'critical'::text]));

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_status_check CHECK (status = ANY (ARRAY['open'::text, 'referred'::text, 'investigating'::text, 'monitoring'::text, 'closed'::text]));

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_summary_not_blank CHECK (length(btrim(concern_summary)) > 0);

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_title_not_blank CHECK (length(btrim(title)) > 0);

GRANT ALL ON public.safeguarding_cases TO authenticated;

GRANT ALL ON public.safeguarding_cases TO service_role;

CREATE INDEX safeguarding_cases_service_user_idx ON public.safeguarding_cases (service_user_id, created_at DESC);

CREATE INDEX safeguarding_cases_org_status_idx ON public.safeguarding_cases (organisation_id, status, updated_at DESC);

CREATE TRIGGER safeguarding_case_change_chronology_trigger
  AFTER UPDATE ON public.safeguarding_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.record_safeguarding_case_change();

CREATE TRIGGER safeguarding_cases_audit_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.safeguarding_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.log_safeguarding_change();

CREATE TRIGGER safeguarding_cases_closure_guard_trigger
  BEFORE UPDATE ON public.safeguarding_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_safeguarding_case_closure();

CREATE TRIGGER safeguarding_cases_reference_trigger
  BEFORE INSERT ON public.safeguarding_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.set_safeguarding_case_reference();

CREATE TRIGGER safeguarding_cases_updated_at_trigger
  BEFORE UPDATE ON public.safeguarding_cases
  FOR EACH ROW
  EXECUTE FUNCTION private.set_safeguarding_updated_at();

CREATE POLICY safeguarding_cases_manager_insert ON public.safeguarding_cases
  FOR INSERT
  TO authenticated
  WITH
    CHECK
    ((private.can_manage_safeguarding_organisation(organisation_id) AND private.service_user_belongs_to_current_org(service_user_id) AND (raised_by = auth.uid()) AND (status =
    'open'::text)));

CREATE POLICY safeguarding_cases_manager_select ON public.safeguarding_cases
  FOR SELECT
  TO authenticated
  USING (private.can_manage_safeguarding_organisation(organisation_id));

CREATE POLICY safeguarding_cases_manager_update ON public.safeguarding_cases
  FOR UPDATE
  TO authenticated
  USING (private.can_manage_safeguarding_organisation(organisation_id))
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.service_user_belongs_to_current_org(service_user_id)));

CREATE TABLE public.safeguarding_chronology (
  id                       uuid                     DEFAULT gen_random_uuid() NOT NULL,
  case_id                  uuid                     NOT NULL,
  organisation_id          uuid                     NOT NULL,
  entry_type               text                     DEFAULT 'note'::text NOT NULL,
  description              text                     NOT NULL,
  occurred_at              timestamp with time zone DEFAULT now() NOT NULL,
  linked_timeline_entry_id uuid,
  linked_timeline_snapshot jsonb,
  created_by               uuid                     NOT NULL,
  created_at               timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.safeguarding_chronology
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.safeguarding_cases(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_description_not_blank CHECK (length(btrim(description)) > 0);

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_pkey PRIMARY KEY (id);

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_type_check
    CHECK
    (entry_type = ANY (ARRAY['case_opened'::text, 'note'::text, 'update'::text, 'contact'::text, 'decision'::text, 'meeting'::text, 'evidence'::text, 'timeline_link'::text,
    'status_change'::text, 'risk_change'::text, 'assignment_change'::text, 'referral'::text, 'action'::text, 'document'::text, 'closure'::text]));

GRANT ALL ON public.safeguarding_chronology TO authenticated;

GRANT ALL ON public.safeguarding_chronology TO service_role;

CREATE INDEX safeguarding_chronology_case_idx ON public.safeguarding_chronology (case_id, occurred_at DESC, created_at DESC);

CREATE UNIQUE INDEX safeguarding_chronology_timeline_link_unique ON public.safeguarding_chronology (case_id, linked_timeline_entry_id)
  WHERE linked_timeline_entry_id IS NOT NULL;

CREATE TRIGGER safeguarding_chronology_audit_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.safeguarding_chronology
  FOR EACH ROW
  EXECUTE FUNCTION private.log_safeguarding_change();

CREATE TRIGGER safeguarding_chronology_organisation_guard_trigger
  BEFORE INSERT OR UPDATE ON public.safeguarding_chronology
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_safeguarding_organisation_consistency();

CREATE POLICY safeguarding_chronology_manager_insert ON public.safeguarding_chronology
  FOR INSERT
  TO authenticated
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id) AND (created_by = auth.uid())));

CREATE POLICY safeguarding_chronology_manager_select ON public.safeguarding_chronology
  FOR SELECT
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE TABLE public.safeguarding_documents (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  case_id         uuid                     NOT NULL,
  organisation_id uuid                     NOT NULL,
  file_name       text                     NOT NULL,
  storage_path    text                     NOT NULL,
  mime_type       text,
  file_size_bytes bigint                   NOT NULL,
  category        text                     DEFAULT 'evidence'::text NOT NULL,
  description     text,
  uploaded_by     uuid                     NOT NULL,
  uploaded_at     timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.safeguarding_documents
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.safeguarding_cases(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_category_check
    CHECK (category = ANY (ARRAY['evidence'::text, 'referral'::text, 'correspondence'::text, 'meeting'::text, 'assessment'::text, 'closure'::text, 'other'::text]));

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_name_not_blank CHECK (length(btrim(file_name)) > 0);

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_pkey PRIMARY KEY (id);

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_size_check CHECK (file_size_bytes > 0 AND file_size_bytes <= 20971520);

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_storage_path_key UNIQUE (storage_path);

ALTER TABLE public.safeguarding_documents
  ADD CONSTRAINT safeguarding_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

GRANT ALL ON public.safeguarding_documents TO authenticated;

GRANT ALL ON public.safeguarding_documents TO service_role;

CREATE INDEX safeguarding_documents_case_idx ON public.safeguarding_documents (case_id, uploaded_at DESC);

CREATE TRIGGER safeguarding_documents_audit_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.safeguarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION private.log_safeguarding_change();

CREATE TRIGGER safeguarding_documents_organisation_guard_trigger
  BEFORE INSERT OR UPDATE ON public.safeguarding_documents
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_safeguarding_organisation_consistency();

CREATE POLICY safeguarding_documents_manager_delete ON public.safeguarding_documents
  FOR DELETE
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE POLICY safeguarding_documents_manager_insert ON public.safeguarding_documents
  FOR INSERT
  TO authenticated
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id) AND (uploaded_by = auth.uid())));

CREATE POLICY safeguarding_documents_manager_select ON public.safeguarding_documents
  FOR SELECT
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE TABLE public.safeguarding_referrals (
  id                 uuid                     DEFAULT gen_random_uuid() NOT NULL,
  case_id            uuid                     NOT NULL,
  organisation_id    uuid                     NOT NULL,
  agency             text                     NOT NULL,
  contact_name       text,
  contact_details    text,
  referral_method    text,
  referral_reference text,
  referred_at        timestamp with time zone NOT NULL,
  status             text                     DEFAULT 'submitted'::text NOT NULL,
  outcome            text,
  created_by         uuid                     NOT NULL,
  created_at         timestamp with time zone DEFAULT now() NOT NULL,
  updated_at         timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.safeguarding_referrals
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.safeguarding_referrals
  ADD CONSTRAINT safeguarding_referrals_agency_not_blank CHECK (length(btrim(agency)) > 0);

ALTER TABLE public.safeguarding_referrals
  ADD CONSTRAINT safeguarding_referrals_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.safeguarding_cases(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_referrals
  ADD CONSTRAINT safeguarding_referrals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_referrals
  ADD CONSTRAINT safeguarding_referrals_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.safeguarding_referrals
  ADD CONSTRAINT safeguarding_referrals_pkey PRIMARY KEY (id);

ALTER TABLE public.safeguarding_referrals
  ADD CONSTRAINT safeguarding_referrals_status_check
    CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'acknowledged'::text, 'accepted'::text, 'declined'::text, 'closed'::text]));

GRANT ALL ON public.safeguarding_referrals TO authenticated;

GRANT ALL ON public.safeguarding_referrals TO service_role;

CREATE INDEX safeguarding_referrals_case_idx ON public.safeguarding_referrals (case_id, referred_at DESC);

CREATE TRIGGER safeguarding_referrals_audit_trigger
  AFTER INSERT OR DELETE OR UPDATE ON public.safeguarding_referrals
  FOR EACH ROW
  EXECUTE FUNCTION private.log_safeguarding_change();

CREATE TRIGGER safeguarding_referrals_organisation_guard_trigger
  BEFORE INSERT OR UPDATE ON public.safeguarding_referrals
  FOR EACH ROW
  EXECUTE FUNCTION private.guard_safeguarding_organisation_consistency();

CREATE TRIGGER safeguarding_referrals_updated_at_trigger
  BEFORE UPDATE ON public.safeguarding_referrals
  FOR EACH ROW
  EXECUTE FUNCTION private.set_safeguarding_updated_at();

CREATE POLICY safeguarding_referrals_manager_insert ON public.safeguarding_referrals
  FOR INSERT
  TO authenticated
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id) AND (created_by = auth.uid())));

CREATE POLICY safeguarding_referrals_manager_select ON public.safeguarding_referrals
  FOR SELECT
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE POLICY safeguarding_referrals_manager_update ON public.safeguarding_referrals
  FOR UPDATE
  TO authenticated
  USING ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)))
  WITH CHECK ((private.can_manage_safeguarding_organisation(organisation_id) AND private.safeguarding_case_belongs_to_current_org(case_id)));

CREATE TABLE public.service_user_about_me (
  id                             uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id                uuid                     NOT NULL,
  about_me                       text,
  preferred_name                 text,
  gender_identity                text,
  nhs_number                     text,
  religion                       text,
  nationality                    text,
  languages                      text[]                   DEFAULT '{}'::text[],
  emergency_contact_name         text,
  emergency_contact_relationship text,
  emergency_contact_phone        text,
  key_worker_name                text,
  gp_name                        text,
  likes                          text[]                   DEFAULT '{}'::text[],
  dislikes_triggers              text[]                   DEFAULT '{}'::text[],
  preferred_communication        text,
  hearing_notes                  text,
  vision_notes                   text,
  communication_notes            text,
  important_information          text[]                   DEFAULT '{}'::text[],
  created_at                     timestamp with time zone DEFAULT now() NOT NULL,
  updated_at                     timestamp with time zone DEFAULT now() NOT NULL,
  updated_by                     uuid
);

ALTER TABLE public.service_user_about_me
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_user_about_me
  ADD CONSTRAINT service_user_about_me_pkey PRIMARY KEY (id);

ALTER TABLE public.service_user_about_me
  ADD CONSTRAINT service_user_about_me_service_user_id_key UNIQUE (service_user_id);

ALTER TABLE public.service_user_about_me
  ADD CONSTRAINT service_user_about_me_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);

GRANT ALL ON public.service_user_about_me TO anon;

GRANT ALL ON public.service_user_about_me TO authenticated;

GRANT ALL ON public.service_user_about_me TO service_role;

CREATE INDEX service_user_about_me_service_user_id_idx ON public.service_user_about_me (service_user_id);

CREATE TABLE public.service_user_wellbeing_indicators (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id uuid                     NOT NULL,
  label           text                     NOT NULL,
  is_active       boolean                  DEFAULT true NOT NULL,
  created_by      uuid,
  created_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.service_user_wellbeing_indicators
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_user_wellbeing_indicators
  ADD CONSTRAINT service_user_wellbeing_indicators_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.service_user_wellbeing_indicators
  ADD CONSTRAINT service_user_wellbeing_indicators_pkey PRIMARY KEY (id);

GRANT ALL ON public.service_user_wellbeing_indicators TO anon;

GRANT ALL ON public.service_user_wellbeing_indicators TO authenticated;

GRANT ALL ON public.service_user_wellbeing_indicators TO service_role;

CREATE TABLE public.service_users (
  id                        uuid                     DEFAULT gen_random_uuid() NOT NULL,
  full_name                 text                     NOT NULL,
  house_name                text                     NOT NULL,
  notes                     text,
  is_active                 boolean                  DEFAULT true NOT NULL,
  created_at                timestamp with time zone DEFAULT now() NOT NULL,
  photo_url                 text,
  date_of_birth             date,
  key_notes                 text,
  allergies                 text,
  communication_needs       text,
  risk_notes                text,
  organisation_id           uuid,
  continence_care_enabled   boolean                  DEFAULT false NOT NULL,
  track_pad_changes         boolean                  DEFAULT false NOT NULL,
  track_bristol_stool_chart boolean                  DEFAULT false NOT NULL,
  first_name                text,
  surname                   text,
  gender                    text,
  photo_path                text
);

CREATE POLICY "Managers can create care plans in their organisation" ON public.care_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text) AND (created_by = auth.uid()) AND (updated_by = auth.uid())));

CREATE POLICY "Managers can update care plans in their organisation" ON public.care_plans
  FOR UPDATE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text) AND (updated_by = auth.uid())));

CREATE POLICY "Users can view handover reads in their organisation" ON public.handover_reads
  FOR SELECT
  TO authenticated
  USING ((handover_id IN ( SELECT h.id
   FROM ((public.handovers h
     JOIN public.handover_service_users hsu ON ((h.id = hsu.handover_id)))
     JOIN public.service_users su ON ((hsu.service_user_id = su.id)))
  WHERE (su.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Users can create handover links in their organisation" ON public.handover_service_users
  FOR INSERT
  TO authenticated
  WITH CHECK ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Users can view handover links in their organisation" ON public.handover_service_users
  FOR SELECT
  TO authenticated
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Managers can update handovers in their organisation" ON public.handovers
  FOR UPDATE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text) AND (EXISTS ( SELECT 1
           FROM (public.handover_service_users hsu
             JOIN public.service_users su ON ((su.id = hsu.service_user_id)))
          WHERE ((hsu.handover_id = handovers.id) AND (su.organisation_id = p.organisation_id))))))))
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text) AND (EXISTS ( SELECT 1
           FROM (public.handover_service_users hsu
             JOIN public.service_users su ON ((su.id = hsu.service_user_id)))
          WHERE ((hsu.handover_id = handovers.id) AND (su.organisation_id = p.organisation_id))))))));

CREATE POLICY "Users can view handovers linked to their organisation" ON public.handovers
  FOR SELECT
  TO authenticated
  USING ((id IN ( SELECT handover_service_users.handover_id
   FROM public.handover_service_users
  WHERE (handover_service_users.service_user_id IN ( SELECT service_users.id
           FROM public.service_users
          WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
                   FROM public.profiles
                  WHERE (profiles.id = auth.uid()))))))));

CREATE POLICY "Users can create medication administrations in their organisati" ON public.medication_administrations
  FOR INSERT
  TO authenticated
  WITH CHECK (((administered_by = auth.uid()) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Users can view medication administrations in their organisation" ON public.medication_administrations
  FOR SELECT
  TO authenticated
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Managers can create medication profiles in their organisation" ON public.medication_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Managers can update medication profiles in their organisation" ON public.medication_profiles
  FOR UPDATE
  TO authenticated
  USING (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can view medication profiles in their organisation" ON public.medication_profiles
  FOR SELECT
  TO authenticated
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Support can create memories" ON public.memories
  FOR INSERT
  TO authenticated
  WITH
    CHECK
    ((public.is_castodia_support() AND (organisation_id = public.current_castodia_organisation_id()) AND (created_by = auth.uid()) AND (family_visible = false) AND
    (family_visibility_changed_by IS NULL) AND (family_visibility_changed_at IS NULL) AND (archived = false) AND (archived_by IS NULL) AND (archived_at IS NULL) AND
    (EXISTS ( SELECT 1
   FROM public.service_users su
  WHERE ((su.id = memories.service_user_id) AND (su.organisation_id = memories.organisation_id))))));

CREATE POLICY "Users can create personal care records in their organisation" ON public.personal_care_records
  FOR INSERT
  TO authenticated
  WITH CHECK (((created_by = auth.uid()) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Users can view personal care records in their organisation" ON public.personal_care_records
  FOR SELECT
  TO authenticated
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE POLICY "Managers can create risk assessments in their organisation" ON public.risk_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text) AND (created_by = auth.uid()) AND (updated_by = auth.uid())));

CREATE POLICY "Managers can update risk assessments in their organisation" ON public.risk_assessments
  FOR UPDATE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text) AND (updated_by = auth.uid())));

CREATE POLICY "Managers can create service user about me in their organisation" ON public.service_user_about_me
  FOR INSERT
  TO authenticated
  WITH CHECK (((service_user_id IN ( SELECT su.id
   FROM public.service_users su
  WHERE (su.organisation_id = ( SELECT p.organisation_id
           FROM public.profiles p
          WHERE (p.id = auth.uid()))))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text))))));

CREATE POLICY "Managers can update service user about me in their organisation" ON public.service_user_about_me
  FOR UPDATE
  TO authenticated
  USING (((service_user_id IN ( SELECT su.id
   FROM public.service_users su
  WHERE (su.organisation_id = ( SELECT p.organisation_id
           FROM public.profiles p
          WHERE (p.id = auth.uid()))))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text))))))
  WITH CHECK (((service_user_id IN ( SELECT su.id
   FROM public.service_users su
  WHERE (su.organisation_id = ( SELECT p.organisation_id
           FROM public.profiles p
          WHERE (p.id = auth.uid()))))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text))))));

CREATE POLICY "Users can view service user about me in their organisation" ON public.service_user_about_me
  FOR SELECT
  TO authenticated
  USING ((service_user_id IN ( SELECT su.id
   FROM public.service_users su
  WHERE (su.organisation_id = ( SELECT p.organisation_id
           FROM public.profiles p
          WHERE (p.id = auth.uid()))))));

CREATE POLICY "Managers can create wellbeing indicators in their organisation" ON public.service_user_wellbeing_indicators
  FOR INSERT
  WITH CHECK (((created_by = auth.uid()) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Managers can update wellbeing indicators in their organisation" ON public.service_user_wellbeing_indicators
  FOR UPDATE
  USING (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can view wellbeing indicators in their organisation" ON public.service_user_wellbeing_indicators
  FOR SELECT
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

ALTER TABLE public.service_users
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_users
  ADD CONSTRAINT service_users_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id);

ALTER TABLE public.service_users
  ADD CONSTRAINT service_users_pkey PRIMARY KEY (id);

ALTER TABLE public.body_maps
  ADD CONSTRAINT body_maps_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.care_plans
  ADD CONSTRAINT care_plans_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.family_users
  ADD CONSTRAINT family_users_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.handover_service_users
  ADD CONSTRAINT handover_service_users_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_plans
  ADD CONSTRAINT medication_dose_plans_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.medication_dose_protocols
  ADD CONSTRAINT medication_dose_protocols_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.medication_engine_events
  ADD CONSTRAINT medication_engine_events_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.medication_manager_reviews
  ADD CONSTRAINT medication_manager_reviews_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.medication_missed_dose_rules
  ADD CONSTRAINT medication_missed_dose_rules_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.medication_profiles
  ADD CONSTRAINT medication_profiles_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.medication_rounds
  ADD CONSTRAINT medication_rounds_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.medication_stock_transactions
  ADD CONSTRAINT medication_stock_transactions_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.memories
  ADD CONSTRAINT memories_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.personal_care_records
  ADD CONSTRAINT personal_care_records_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.risk_assessments
  ADD CONSTRAINT risk_assessments_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.safeguarding_cases
  ADD CONSTRAINT safeguarding_cases_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE RESTRICT;

ALTER TABLE public.service_user_about_me
  ADD CONSTRAINT service_user_about_me_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.service_user_wellbeing_indicators
  ADD CONSTRAINT service_user_wellbeing_indicators_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

GRANT ALL ON public.service_users TO anon;

GRANT ALL ON public.service_users TO authenticated;

GRANT ALL ON public.service_users TO service_role;

CREATE POLICY "Family users can read their linked service user" ON public.service_users
  FOR SELECT
  TO authenticated
  USING ((id IN ( SELECT fu.service_user_id
   FROM public.family_users fu
  WHERE ((fu.auth_user_id = auth.uid()) AND (fu.is_active = true)))));

CREATE POLICY "Managers can create service users in their organisation" ON public.service_users
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Managers can update service users in their organisation" ON public.service_users
  FOR UPDATE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can view service users in their organisation" ON public.service_users
  FOR SELECT
  TO authenticated
  USING ((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE TABLE public.staff_competencies (
  id                uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id   uuid                     NOT NULL,
  staff_id          uuid                     NOT NULL,
  assessor_id       uuid,
  competency_type   text                     DEFAULT 'Medication Administration'::text NOT NULL,
  assessment_date   date                     NOT NULL,
  review_date       date,
  knowledge_checks  jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  practical_checks  jsonb                    DEFAULT '{}'::jsonb NOT NULL,
  strengths         text,
  development_areas text,
  actions           jsonb                    DEFAULT '[]'::jsonb NOT NULL,
  outcome           text                     NOT NULL,
  assessor_signed   boolean                  DEFAULT false NOT NULL,
  staff_signed      boolean                  DEFAULT false NOT NULL,
  created_at        timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.staff_competencies
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_competencies
  ADD CONSTRAINT staff_competencies_assessor_id_fkey FOREIGN KEY (assessor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.staff_competencies
  ADD CONSTRAINT staff_competencies_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.staff_competencies
  ADD CONSTRAINT staff_competencies_pkey PRIMARY KEY (id);

ALTER TABLE public.staff_competencies
  ADD CONSTRAINT staff_competencies_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT ALL ON public.staff_competencies TO anon;

GRANT ALL ON public.staff_competencies TO authenticated;

GRANT ALL ON public.staff_competencies TO service_role;

CREATE POLICY "Managers can manage competencies in their organisation" ON public.staff_competencies
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE TABLE public.staff_documents (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id uuid                     NOT NULL,
  staff_id        uuid                     NOT NULL,
  category        text                     NOT NULL,
  document_type   text                     NOT NULL,
  file_name       text                     NOT NULL,
  storage_path    text                     NOT NULL,
  mime_type       text,
  file_size       bigint,
  issue_date      date,
  expiry_date     date,
  notes           text,
  uploaded_by     uuid,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.staff_documents
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_documents
  ADD CONSTRAINT staff_documents_category_check
    CHECK (category = ANY (ARRAY['employment'::text, 'identity'::text, 'compliance'::text, 'insurance'::text, 'qualifications'::text, 'other'::text]));

ALTER TABLE public.staff_documents
  ADD CONSTRAINT staff_documents_pkey PRIMARY KEY (id);

ALTER TABLE public.staff_documents
  ADD CONSTRAINT staff_documents_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.staff_documents
  ADD CONSTRAINT staff_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

GRANT ALL ON public.staff_documents TO anon;

GRANT ALL ON public.staff_documents TO authenticated;

GRANT ALL ON public.staff_documents TO service_role;

CREATE INDEX staff_documents_staff_id_idx ON public.staff_documents (staff_id);

CREATE INDEX staff_documents_expiry_date_idx ON public.staff_documents (expiry_date);

CREATE INDEX staff_documents_organisation_id_idx ON public.staff_documents (organisation_id);

CREATE POLICY "Managers can create staff documents" ON public.staff_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))));

CREATE POLICY "Managers can delete staff documents" ON public.staff_documents
  FOR DELETE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))));

CREATE POLICY "Managers can update staff documents" ON public.staff_documents
  FOR UPDATE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))))
  WITH CHECK ((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE POLICY "Managers can view staff documents in their organisation" ON public.staff_documents
  FOR SELECT
  TO authenticated
  USING (((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text))))));

CREATE TABLE public.staff_employment (
  id                              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id                 uuid                     NOT NULL,
  staff_id                        uuid                     NOT NULL,
  job_title                       text,
  department                      text,
  house_name                      text,
  manager_id                      uuid,
  employment_status               text                     DEFAULT 'active'::text NOT NULL,
  contract_type                   text,
  contracted_hours                numeric(6,2),
  start_date                      date,
  probation_end_date              date,
  end_date                        date,
  work_email                      text,
  work_phone                      text,
  emergency_contact_name          text,
  emergency_contact_relationship  text,
  emergency_contact_phone         text,
  right_to_work_status            text,
  right_to_work_checked_at        date,
  right_to_work_expiry_date       date,
  dbs_status                      text,
  dbs_level                       text,
  dbs_certificate_number          text,
  dbs_issue_date                  date,
  dbs_update_service              boolean                  DEFAULT false NOT NULL,
  dbs_last_checked_at             date,
  dbs_next_check_date             date,
  occupational_health_status      text,
  occupational_health_review_date date,
  workplace_adjustments           text,
  notes                           text,
  created_by                      uuid,
  updated_by                      uuid,
  created_at                      timestamp with time zone DEFAULT now() NOT NULL,
  updated_at                      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.staff_employment
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_contract_type_check
    CHECK
    (contract_type IS NULL OR (contract_type = ANY (ARRAY['permanent'::text, 'fixed_term'::text, 'zero_hours'::text, 'bank'::text, 'agency'::text, 'volunteer'::text,
    'other'::text])));

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_dbs_level_check
    CHECK (dbs_level IS NULL OR (dbs_level = ANY (ARRAY['basic'::text, 'standard'::text, 'enhanced'::text, 'enhanced_with_barred_list'::text])));

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_dbs_status_check
    CHECK (dbs_status IS NULL OR (dbs_status = ANY (ARRAY['clear'::text, 'risk_assessed'::text, 'pending'::text, 'expired'::text, 'not_required'::text])));

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_employment_status_check
    CHECK (employment_status = ANY (ARRAY['active'::text, 'probation'::text, 'suspended'::text, 'maternity_leave'::text, 'long_term_leave'::text, 'left'::text]));

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.profiles(id);

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_occupational_health_status_check
    CHECK
    (occupational_health_status IS NULL OR (occupational_health_status = ANY (ARRAY['cleared'::text, 'cleared_with_adjustments'::text, 'pending'::text, 'review_required'::text,
    'not_required'::text])));

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_one_record_per_staff UNIQUE (staff_id);

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_pkey PRIMARY KEY (id);

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_right_to_work_status_check
    CHECK (right_to_work_status IS NULL OR (right_to_work_status = ANY (ARRAY['verified'::text, 'pending'::text, 'expired'::text, 'not_required'::text])));

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.staff_employment
  ADD CONSTRAINT staff_employment_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id);

GRANT ALL ON public.staff_employment TO anon;

GRANT ALL ON public.staff_employment TO authenticated;

GRANT ALL ON public.staff_employment TO service_role;

CREATE INDEX staff_employment_dbs_next_check_idx ON public.staff_employment (dbs_next_check_date);

CREATE INDEX staff_employment_start_date_idx ON public.staff_employment (start_date);

CREATE INDEX staff_employment_manager_idx ON public.staff_employment (manager_id);

CREATE INDEX staff_employment_organisation_idx ON public.staff_employment (organisation_id);

CREATE INDEX staff_employment_right_to_work_expiry_idx ON public.staff_employment (right_to_work_expiry_date);

CREATE TRIGGER staff_employment_set_updated_at
  BEFORE UPDATE ON public.staff_employment
  FOR EACH ROW
  EXECUTE FUNCTION public.set_staff_employment_updated_at();

CREATE POLICY "Managers can view staff employment in their organisation" ON public.staff_employment
  FOR SELECT
  TO authenticated
  USING (((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text))))));

CREATE POLICY "Managers create staff employment" ON public.staff_employment
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))));

CREATE POLICY "Managers delete staff employment" ON public.staff_employment
  FOR DELETE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))));

CREATE POLICY "Managers update staff employment" ON public.staff_employment
  FOR UPDATE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))))
  WITH CHECK ((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE TABLE public.staff_service_user_access (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  staff_id        uuid                     NOT NULL,
  service_user_id uuid                     NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.staff_service_user_access
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_service_user_access
  ADD CONSTRAINT staff_service_user_access_pkey PRIMARY KEY (id);

ALTER TABLE public.staff_service_user_access
  ADD CONSTRAINT staff_service_user_access_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

ALTER TABLE public.staff_service_user_access
  ADD CONSTRAINT staff_service_user_access_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id);

ALTER TABLE public.staff_service_user_access
  ADD CONSTRAINT staff_service_user_access_staff_id_service_user_id_key UNIQUE (staff_id, service_user_id);

GRANT ALL ON public.staff_service_user_access TO anon;

GRANT ALL ON public.staff_service_user_access TO authenticated;

GRANT ALL ON public.staff_service_user_access TO service_role;

CREATE POLICY "Managers can create access permissions in their organisation" ON public.staff_service_user_access
  FOR INSERT
  TO authenticated
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public.profiles manager_profile
  WHERE ((manager_profile.id = auth.uid()) AND (manager_profile.role = 'manager'::text) AND (EXISTS ( SELECT 1
           FROM public.profiles staff_profile
          WHERE ((staff_profile.id = staff_service_user_access.staff_id) AND (staff_profile.organisation_id = manager_profile.organisation_id)))) AND (EXISTS ( SELECT 1
           FROM public.service_users su
          WHERE ((su.id = staff_service_user_access.service_user_id) AND (su.organisation_id = manager_profile.organisation_id))))))));

CREATE POLICY "Managers can delete access permissions in their organisation" ON public.staff_service_user_access
  FOR DELETE
  TO authenticated
  USING ((EXISTS ( SELECT 1
   FROM public.profiles manager_profile
  WHERE ((manager_profile.id = auth.uid()) AND (manager_profile.role = 'manager'::text) AND (EXISTS ( SELECT 1
           FROM public.profiles staff_profile
          WHERE ((staff_profile.id = staff_service_user_access.staff_id) AND (staff_profile.organisation_id = manager_profile.organisation_id)))) AND (EXISTS ( SELECT 1
           FROM public.service_users su
          WHERE ((su.id = staff_service_user_access.service_user_id) AND (su.organisation_id = manager_profile.organisation_id))))))));

CREATE POLICY "Users can view access permissions in their organisation" ON public.staff_service_user_access
  FOR SELECT
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE TABLE public.staff_supervisions (
  id                      uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id         uuid                     NOT NULL,
  staff_id                uuid                     NOT NULL,
  supervisor_id           uuid                     NOT NULL,
  supervision_date        date                     NOT NULL,
  supervision_type        text                     DEFAULT 'Formal Supervision'::text NOT NULL,
  wellbeing_notes         text,
  performance_notes       text,
  training_discussed      text,
  concerns_discussed      text,
  actions_agreed          text,
  staff_comments          text,
  next_supervision_date   date,
  signed_by_supervisor    boolean                  DEFAULT false NOT NULL,
  signed_by_staff         boolean                  DEFAULT false NOT NULL,
  created_at              timestamp with time zone DEFAULT now() NOT NULL,
  previous_actions_review text,
  manager_summary         text,
  actions                 jsonb                    DEFAULT '[]'::jsonb
);

ALTER TABLE public.staff_supervisions
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_supervisions
  ADD CONSTRAINT staff_supervisions_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE CASCADE;

ALTER TABLE public.staff_supervisions
  ADD CONSTRAINT staff_supervisions_pkey PRIMARY KEY (id);

ALTER TABLE public.staff_supervisions
  ADD CONSTRAINT staff_supervisions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.staff_supervisions
  ADD CONSTRAINT staff_supervisions_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

GRANT ALL ON public.staff_supervisions TO anon;

GRANT ALL ON public.staff_supervisions TO authenticated;

GRANT ALL ON public.staff_supervisions TO service_role;

CREATE POLICY "Managers can manage supervisions in their organisation" ON public.staff_supervisions
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE TABLE public.staff_training_records (
  id                       uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id          uuid                     NOT NULL,
  staff_id                 uuid                     NOT NULL,
  course_name              text                     NOT NULL,
  provider                 text,
  completion_date          date                     NOT NULL,
  expiry_date              date,
  certificate_storage_path text,
  certificate_file_name    text,
  certificate_mime_type    text,
  certificate_file_size    bigint,
  notes                    text,
  created_by               uuid,
  created_at               timestamp with time zone DEFAULT now() NOT NULL,
  updated_at               timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.staff_training_records
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_training_records
  ADD CONSTRAINT staff_training_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.staff_training_records
  ADD CONSTRAINT staff_training_records_pkey PRIMARY KEY (id);

ALTER TABLE public.staff_training_records
  ADD CONSTRAINT staff_training_records_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

GRANT ALL ON public.staff_training_records TO anon;

GRANT ALL ON public.staff_training_records TO authenticated;

GRANT ALL ON public.staff_training_records TO service_role;

CREATE INDEX staff_training_records_staff_idx ON public.staff_training_records (staff_id);

CREATE INDEX staff_training_records_organisation_idx ON public.staff_training_records (organisation_id);

CREATE INDEX staff_training_records_course_idx ON public.staff_training_records (course_name);

CREATE INDEX staff_training_records_expiry_idx ON public.staff_training_records (expiry_date);

CREATE POLICY "Managers can view training records in their organisation" ON public.staff_training_records
  FOR SELECT
  TO authenticated
  USING (((organisation_id = ( SELECT p.organisation_id
   FROM public.profiles p
  WHERE (p.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'manager'::text))))));

CREATE POLICY "Managers create training records" ON public.staff_training_records
  FOR INSERT
  TO authenticated
  WITH CHECK (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))));

CREATE POLICY "Managers delete training records" ON public.staff_training_records
  FOR DELETE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))));

CREATE POLICY "Managers update training records" ON public.staff_training_records
  FOR UPDATE
  TO authenticated
  USING (((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM public.profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'manager'::text))))))
  WITH CHECK ((organisation_id = ( SELECT profiles.organisation_id
   FROM public.profiles
  WHERE (profiles.id = auth.uid()))));

CREATE TABLE public.support_safeguarding_reports (
  id                   uuid                     DEFAULT gen_random_uuid() NOT NULL,
  organisation_id      uuid                     NOT NULL,
  service_user_id      uuid                     NOT NULL,
  safeguarding_case_id uuid                     NOT NULL,
  reporter_id          uuid                     NOT NULL,
  happened_at          timestamp with time zone NOT NULL,
  submitted_at         timestamp with time zone DEFAULT now() NOT NULL,
  concern_summary      text                     NOT NULL,
  immediate_danger     text,
  location             text,
  is_anonymous         boolean                  DEFAULT false NOT NULL
);

ALTER TABLE public.support_safeguarding_reports
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_concern_summary_check CHECK (length(btrim(concern_summary)) > 0);

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_organisation_id_fkey FOREIGN KEY (organisation_id) REFERENCES public.organisations(id) ON DELETE RESTRICT;

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_pkey PRIMARY KEY (id);

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_safeguarding_case_id_fkey FOREIGN KEY (safeguarding_case_id) REFERENCES public.safeguarding_cases(id) ON DELETE RESTRICT;

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_safeguarding_case_id_key UNIQUE (safeguarding_case_id);

ALTER TABLE public.support_safeguarding_reports
  ADD CONSTRAINT support_safeguarding_reports_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE RESTRICT;

GRANT SELECT ON public.support_safeguarding_reports TO authenticated;

GRANT ALL ON public.support_safeguarding_reports TO service_role;

CREATE POLICY support_safeguarding_reports_manager_select ON public.support_safeguarding_reports
  FOR SELECT
  TO authenticated
  USING (private.can_manage_safeguarding_organisation(organisation_id));

CREATE TABLE public.timeline_entries (
  id              uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id text                     NOT NULL,
  created_by      uuid                     NOT NULL,
  entry_type      text                     NOT NULL,
  content         text                     NOT NULL,
  created_at      timestamp with time zone DEFAULT now() NOT NULL,
  reviewed        boolean                  DEFAULT false NOT NULL,
  reviewed_by     uuid,
  reviewed_at     timestamp with time zone,
  review_comment  text,
  event_time      timestamp with time zone NOT NULL,
  metadata        jsonb
);

ALTER TABLE public.timeline_entries
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.timeline_entries
  ADD CONSTRAINT timeline_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.timeline_entries
  ADD CONSTRAINT timeline_entries_created_by_profiles_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.timeline_entries
  ADD CONSTRAINT timeline_entries_pkey PRIMARY KEY (id);

ALTER TABLE public.body_maps
  ADD CONSTRAINT body_maps_linked_incident_id_fkey FOREIGN KEY (linked_incident_id) REFERENCES public.timeline_entries(id) ON DELETE SET NULL;

ALTER TABLE public.body_maps
  ADD CONSTRAINT body_maps_timeline_entry_id_fkey FOREIGN KEY (timeline_entry_id) REFERENCES public.timeline_entries(id) ON DELETE CASCADE;

ALTER TABLE public.medication_rounds
  ADD CONSTRAINT medication_rounds_timeline_entry_id_fkey FOREIGN KEY (timeline_entry_id) REFERENCES public.timeline_entries(id) ON DELETE SET NULL;

ALTER TABLE public.safeguarding_chronology
  ADD CONSTRAINT safeguarding_chronology_timeline_entry_id_fkey FOREIGN KEY (linked_timeline_entry_id) REFERENCES public.timeline_entries(id) ON DELETE SET NULL;

ALTER TABLE public.timeline_entries
  ADD CONSTRAINT timeline_entries_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);

GRANT ALL ON public.timeline_entries TO anon;

GRANT ALL ON public.timeline_entries TO authenticated;

GRANT ALL ON public.timeline_entries TO service_role;

CREATE POLICY "Managers can update timeline entries in their organisation" ON public.timeline_entries
  FOR UPDATE
  TO authenticated
  USING ((((service_user_id)::uuid IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK ((((service_user_id)::uuid IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can create timeline entries for their organisation" ON public.timeline_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (((created_by = auth.uid()) AND ((service_user_id)::uuid IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Users can view timeline entries in their organisation" ON public.timeline_entries
  FOR SELECT
  TO authenticated
  USING (((service_user_id)::uuid IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE TABLE public.toileting_records (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id     uuid                     NOT NULL,
  created_by          uuid                     NOT NULL,
  toileting_outcome   text                     NOT NULL,
  assistance_required text                     NOT NULL,
  pad_changed         text,
  bristol_stool_type  integer,
  notes               text,
  occurred_at         timestamp with time zone NOT NULL,
  created_at          timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.toileting_records
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.toileting_records
  ADD CONSTRAINT toileting_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.toileting_records
  ADD CONSTRAINT toileting_records_pkey PRIMARY KEY (id);

ALTER TABLE public.toileting_records
  ADD CONSTRAINT toileting_records_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id) ON DELETE CASCADE;

GRANT ALL ON public.toileting_records TO anon;

GRANT ALL ON public.toileting_records TO authenticated;

GRANT ALL ON public.toileting_records TO service_role;

CREATE POLICY "Users can create toileting records in their organisation" ON public.toileting_records
  FOR INSERT
  TO authenticated
  WITH CHECK (((created_by = auth.uid()) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Users can view toileting records in their organisation" ON public.toileting_records
  FOR SELECT
  TO authenticated
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE TABLE public.wellbeing_observations (
  id                         uuid                     DEFAULT gen_random_uuid() NOT NULL,
  service_user_id            uuid                     NOT NULL,
  overall_presentation_score integer                  NOT NULL,
  observed_indicators        text[]                   DEFAULT '{}'::text[] NOT NULL,
  notes                      text,
  recorded_by                uuid                     NOT NULL,
  created_at                 timestamp with time zone DEFAULT now(),
  overall_presentation_label text
);

ALTER TABLE public.wellbeing_observations
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.wellbeing_observations
  ADD CONSTRAINT mood_observations_pkey PRIMARY KEY (id);

ALTER TABLE public.wellbeing_observations
  ADD CONSTRAINT mood_observations_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id);

ALTER TABLE public.wellbeing_observations
  ADD CONSTRAINT mood_observations_service_user_id_fkey FOREIGN KEY (service_user_id) REFERENCES public.service_users(id);

ALTER TABLE public.wellbeing_observations
  ADD CONSTRAINT wellbeing_observations_score_check CHECK (overall_presentation_score >= 1 AND overall_presentation_score <= 5);

GRANT ALL ON public.wellbeing_observations TO anon;

GRANT ALL ON public.wellbeing_observations TO authenticated;

GRANT ALL ON public.wellbeing_observations TO service_role;

CREATE POLICY "Managers can update wellbeing observations in their organisatio" ON public.wellbeing_observations
  FOR UPDATE
  USING (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)))
  WITH CHECK (((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))) AND (( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) = 'manager'::text)));

CREATE POLICY "Users can create wellbeing observations for their organisation" ON public.wellbeing_observations
  FOR INSERT
  WITH CHECK (((recorded_by = auth.uid()) AND (service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid())))))));

CREATE POLICY "Users can view wellbeing observations in their organisation" ON public.wellbeing_observations
  FOR SELECT
  USING ((service_user_id IN ( SELECT service_users.id
   FROM public.service_users
  WHERE (service_users.organisation_id = ( SELECT profiles.organisation_id
           FROM public.profiles
          WHERE (profiles.id = auth.uid()))))));

CREATE EVENT TRIGGER auto_enable_rls
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE')
  EXECUTE FUNCTION public.enable_rls_on_new_tables();

CREATE EVENT TRIGGER ensure_rls
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION public.rls_auto_enable();

-- Castodia Growth: Phase 0/1 domain foundation.
-- Timeline entries remain authoritative; Growth observations are queryable mappings.

alter table public.monthly_service_user_reviews
  add column if not exists organisation_id uuid references public.organisations(id) on delete restrict;

update public.monthly_service_user_reviews review
set organisation_id = service_user.organisation_id
from public.service_users service_user
where service_user.id = review.service_user_id
  and review.organisation_id is null;

alter table public.monthly_service_user_reviews
  alter column organisation_id set not null;

drop policy if exists "Authenticated users can read monthly reviews" on public.monthly_service_user_reviews;
drop policy if exists "Authenticated users can create monthly reviews" on public.monthly_service_user_reviews;
drop policy if exists "Reviewers can update their monthly reviews" on public.monthly_service_user_reviews;

create or replace function private.can_access_growth_person(target_service_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.is_active
      and profile.role in ('manager', 'support')
  )
  and private.can_access_service_user(target_service_user_id);
$$;

revoke all on function private.can_access_growth_person(uuid) from public;
grant execute on function private.can_access_growth_person(uuid) to authenticated;

create or replace function private.is_active_family_for_growth(
  target_organisation_id uuid,
  target_service_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select exists (
    select 1
    from public.family_users family_user
    where family_user.auth_user_id = auth.uid()
      and family_user.organisation_id = target_organisation_id
      and family_user.service_user_id = target_service_user_id
      and family_user.is_active
  );
$$;

revoke all on function private.is_active_family_for_growth(uuid, uuid) from public;
grant execute on function private.is_active_family_for_growth(uuid, uuid) to authenticated;

create or replace function private.set_monthly_review_organisation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  resolved_organisation_id uuid;
begin
  select organisation_id into resolved_organisation_id
  from public.service_users
  where id = new.service_user_id;

  if resolved_organisation_id is null then
    raise exception 'Monthly review service user does not exist';
  end if;

  if new.organisation_id is not null and new.organisation_id <> resolved_organisation_id then
    raise exception 'Monthly review organisation must match its service user';
  end if;

  new.organisation_id := resolved_organisation_id;
  return new;
end;
$$;

drop trigger if exists monthly_review_set_organisation on public.monthly_service_user_reviews;
create trigger monthly_review_set_organisation
before insert or update of service_user_id, organisation_id
on public.monthly_service_user_reviews
for each row execute function private.set_monthly_review_organisation();

create policy "Managers can read monthly reviews for accessible people"
on public.monthly_service_user_reviews for select to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
);

create policy "Support can read assigned monthly reviews"
on public.monthly_service_user_reviews for select to authenticated
using (
  private.is_support()
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
);

create policy "Managers can create monthly reviews"
on public.monthly_service_user_reviews for insert to authenticated
with check (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and reviewer_id = auth.uid()
);

create policy "Managers can update monthly reviews"
on public.monthly_service_user_reviews for update to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
)
with check (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and reviewer_id = auth.uid()
);

create table public.growth_goals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  desired_outcome text,
  support_approach text,
  domain text not null check (domain in (
    'social_engagement_and_relationships', 'independent_living',
    'education_and_employment', 'health_and_wellbeing',
    'community_participation', 'personal_choice_and_confidence'
  )),
  status text not null check (status in ('draft', 'active', 'paused', 'achieved', 'closed')),
  start_date date not null,
  target_date date,
  achieved_at timestamptz,
  family_visible boolean not null default false,
  source_type text not null check (source_type in ('monthly_check_in', 'manager_created')),
  source_review_id uuid references public.monthly_service_user_reviews(id) on delete restrict,
  source_external_id text,
  created_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_by_user_id uuid not null references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now(),
  check (target_date is null or target_date >= start_date),
  check (status <> 'achieved' or achieved_at is not null),
  check (
    (source_type = 'monthly_check_in' and source_review_id is not null and source_external_id is not null)
    or (source_type = 'manager_created' and source_review_id is null and source_external_id is null)
  )
);

create unique index growth_goals_review_source_identity
on public.growth_goals(source_type, source_review_id, source_external_id)
where source_review_id is not null and source_external_id is not null;
create index growth_goals_person_status on public.growth_goals(service_user_id, status, target_date);
create index growth_goals_organisation on public.growth_goals(organisation_id);

create table public.growth_observations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  timeline_entry_id uuid not null unique references public.timeline_entries(id) on delete restrict,
  domain text not null check (domain in (
    'social_engagement_and_relationships', 'independent_living',
    'education_and_employment', 'health_and_wellbeing',
    'community_participation', 'personal_choice_and_confidence'
  )),
  progress_type text not null check (progress_type in ('progress', 'maintained', 'barrier', 'milestone')),
  summary text,
  occurred_at timestamptz not null,
  recorded_by_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index growth_observations_person_occurred on public.growth_observations(service_user_id, occurred_at desc);
create index growth_observations_organisation on public.growth_observations(organisation_id);

create table public.growth_goal_evidence (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  goal_id uuid not null references public.growth_goals(id) on delete cascade,
  observation_id uuid not null references public.growth_observations(id) on delete restrict,
  family_visible boolean not null default false,
  linked_by_user_id uuid not null references public.profiles(id) on delete restrict,
  linked_at timestamptz not null default now(),
  unique(goal_id, observation_id)
);

create index growth_goal_evidence_observation on public.growth_goal_evidence(observation_id);
create index growth_goal_evidence_organisation on public.growth_goal_evidence(organisation_id);

create table public.growth_goal_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  goal_id uuid not null references public.growth_goals(id) on delete cascade,
  event_type text not null check (event_type in (
    'created', 'edited', 'reviewed', 'paused', 'activated',
    'achieved', 'closed', 'visibility_changed', 'evidence_linked', 'evidence_unlinked'
  )),
  from_status text check (from_status is null or from_status in ('draft', 'active', 'paused', 'achieved', 'closed')),
  to_status text check (to_status is null or to_status in ('draft', 'active', 'paused', 'achieved', 'closed')),
  note text,
  actor_user_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index growth_goal_events_goal_created on public.growth_goal_events(goal_id, created_at desc);
create index growth_goal_events_organisation on public.growth_goal_events(organisation_id);

alter table public.growth_goals enable row level security;
alter table public.growth_observations enable row level security;
alter table public.growth_goal_evidence enable row level security;
alter table public.growth_goal_events enable row level security;

create or replace function private.validate_growth_goal()
returns trigger language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare resolved_organisation_id uuid;
begin
  select organisation_id into resolved_organisation_id from public.service_users where id = new.service_user_id;
  if resolved_organisation_id is null or new.organisation_id <> resolved_organisation_id then
    raise exception 'Growth goal organisation must match its service user';
  end if;
  if tg_op = 'INSERT' then
    if auth.uid() is not null
      and (new.created_by_user_id <> auth.uid() or new.updated_by_user_id <> auth.uid()) then
      raise exception 'Growth goal actor must be the authenticated user';
    end if;
  else
    if new.created_by_user_id <> old.created_by_user_id or new.created_at <> old.created_at then
      raise exception 'Growth goal creation attribution is immutable';
    end if;
    if new.organisation_id <> old.organisation_id or new.service_user_id <> old.service_user_id
      or new.source_type <> old.source_type or new.source_review_id is distinct from old.source_review_id
      or new.source_external_id is distinct from old.source_external_id then
      raise exception 'Growth goal ownership and source identity are immutable';
    end if;
    if new.updated_by_user_id <> auth.uid() then
      raise exception 'Growth goal updater must be the authenticated user';
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger growth_goal_validate before insert or update on public.growth_goals
for each row execute function private.validate_growth_goal();

create or replace function private.audit_growth_goal()
returns trigger language plpgsql security definer set search_path = public, auth, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    insert into public.growth_goal_events(
      organisation_id, goal_id, event_type, to_status, actor_user_id
    ) values (new.organisation_id, new.id, 'created', new.status, new.updated_by_user_id);
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.growth_goal_events(
      organisation_id, goal_id, event_type, from_status, to_status, actor_user_id
    ) values (
      new.organisation_id, new.id,
      case new.status
        when 'paused' then 'paused' when 'active' then 'activated'
        when 'achieved' then 'achieved' when 'closed' then 'closed' else 'edited'
      end,
      old.status, new.status, new.updated_by_user_id
    );
  end if;

  if new.family_visible is distinct from old.family_visible then
    insert into public.growth_goal_events(
      organisation_id, goal_id, event_type, from_status, to_status, actor_user_id
    ) values (
      new.organisation_id, new.id, 'visibility_changed', old.status, new.status,
      new.updated_by_user_id
    );
  end if;

  if (new.title, new.desired_outcome, new.support_approach, new.domain,
      new.start_date, new.target_date)
     is distinct from
     (old.title, old.desired_outcome, old.support_approach, old.domain,
      old.start_date, old.target_date) then
    insert into public.growth_goal_events(
      organisation_id, goal_id, event_type, from_status, to_status, actor_user_id
    ) values (
      new.organisation_id, new.id, 'edited', old.status, new.status,
      new.updated_by_user_id
    );
  end if;

  return new;
end;
$$;

create trigger growth_goal_audit after insert or update on public.growth_goals
for each row execute function private.audit_growth_goal();

create or replace function private.validate_growth_evidence_link()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
declare
  goal_organisation_id uuid;
  goal_service_user_id uuid;
  observation_organisation_id uuid;
  observation_service_user_id uuid;
begin
  if tg_op = 'UPDATE' then
    if new.organisation_id <> old.organisation_id or new.goal_id <> old.goal_id
      or new.observation_id <> old.observation_id
      or new.linked_by_user_id <> old.linked_by_user_id or new.linked_at <> old.linked_at then
      raise exception 'Growth evidence identity and attribution are immutable';
    end if;
    return new;
  end if;

  select organisation_id, service_user_id
    into goal_organisation_id, goal_service_user_id
  from public.growth_goals where id = new.goal_id;
  select organisation_id, service_user_id
    into observation_organisation_id, observation_service_user_id
  from public.growth_observations where id = new.observation_id;

  if new.organisation_id <> goal_organisation_id
    or new.organisation_id <> observation_organisation_id
    or goal_service_user_id <> observation_service_user_id then
    raise exception 'Growth evidence must link records for the same person and organisation';
  end if;
  return new;
end;
$$;

create trigger growth_evidence_link_validate before insert or update on public.growth_goal_evidence
for each row execute function private.validate_growth_evidence_link();

create or replace function private.audit_growth_evidence_link()
returns trigger language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare source_row public.growth_goal_evidence;
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; else return new; end if;
  end if;
  if tg_op = 'DELETE' then source_row := old; else source_row := new; end if;
  insert into public.growth_goal_events(
    organisation_id, goal_id, event_type, note, actor_user_id
  ) values (
    source_row.organisation_id,
    source_row.goal_id,
    case
      when tg_op = 'INSERT' then 'evidence_linked'
      when tg_op = 'DELETE' then 'evidence_unlinked'
      else 'visibility_changed'
    end,
    'Evidence ' || source_row.observation_id::text,
    auth.uid()
  );
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;

create trigger growth_evidence_link_create_audit after insert
on public.growth_goal_evidence for each row execute function private.audit_growth_evidence_link();
create trigger growth_evidence_link_visibility_audit after update of family_visible
on public.growth_goal_evidence for each row execute function private.audit_growth_evidence_link();
create trigger growth_evidence_link_delete_audit after delete
on public.growth_goal_evidence for each row execute function private.audit_growth_evidence_link();

create policy "Care users can read accessible growth goals" on public.growth_goals
for select to authenticated using (
  organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
);
create policy "Family can read authorised growth goals" on public.growth_goals
for select to authenticated using (
  family_visible and private.is_active_family_for_growth(organisation_id, service_user_id)
);
create policy "Managers can create growth goals" on public.growth_goals
for insert to authenticated with check (
  private.is_manager() and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and created_by_user_id = auth.uid() and updated_by_user_id = auth.uid()
);
create policy "Managers can update growth goals" on public.growth_goals
for update to authenticated using (
  private.is_manager() and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
) with check (
  private.is_manager() and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id) and updated_by_user_id = auth.uid()
);

create policy "Care users can read accessible growth observations" on public.growth_observations
for select to authenticated using (
  organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
);
create policy "Family can read separately authorised growth observations" on public.growth_observations
for select to authenticated using (
  private.is_active_family_for_growth(organisation_id, service_user_id)
  and exists (
    select 1 from public.growth_goal_evidence evidence
    join public.growth_goals goal on goal.id = evidence.goal_id
    where evidence.observation_id = growth_observations.id
      and evidence.family_visible and goal.family_visible
  )
);
create policy "Care users can create mapped growth observations" on public.growth_observations
for insert to authenticated with check (
  organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and recorded_by_user_id = auth.uid()
  and exists (
    select 1 from public.timeline_entries entry
    where entry.id = timeline_entry_id
      and entry.service_user_id::uuid = service_user_id
      and entry.created_by = auth.uid()
      and entry.event_time = occurred_at
  )
);

create policy "Care users can read accessible growth evidence" on public.growth_goal_evidence
for select to authenticated using (
  organisation_id = private.current_organisation_id()
  and exists (
    select 1 from public.growth_goals goal
    where goal.id = growth_goal_evidence.goal_id
      and private.can_access_growth_person(goal.service_user_id)
  )
);
create policy "Family can read authorised growth evidence" on public.growth_goal_evidence
for select to authenticated using (
  family_visible and exists (
    select 1 from public.growth_goals goal
    where goal.id = growth_goal_evidence.goal_id and goal.family_visible
      and private.is_active_family_for_growth(goal.organisation_id, goal.service_user_id)
  )
);
create policy "Managers can link growth evidence" on public.growth_goal_evidence
for insert to authenticated with check (
  private.is_manager() and organisation_id = private.current_organisation_id()
  and linked_by_user_id = auth.uid()
  and exists (
    select 1 from public.growth_goals goal
    join public.growth_observations observation
      on observation.id = growth_goal_evidence.observation_id
    where goal.id = growth_goal_evidence.goal_id
      and goal.organisation_id = growth_goal_evidence.organisation_id
      and observation.organisation_id = growth_goal_evidence.organisation_id
      and observation.service_user_id = goal.service_user_id
  )
);
create policy "Support can link own observations to active goals" on public.growth_goal_evidence
for insert to authenticated with check (
  private.is_support() and organisation_id = private.current_organisation_id()
  and linked_by_user_id = auth.uid() and family_visible = false
  and exists (
    select 1 from public.growth_goals goal
    join public.growth_observations observation
      on observation.id = growth_goal_evidence.observation_id
    where goal.id = growth_goal_evidence.goal_id and goal.status = 'active'
      and goal.organisation_id = growth_goal_evidence.organisation_id
      and observation.organisation_id = growth_goal_evidence.organisation_id
      and observation.service_user_id = goal.service_user_id
      and observation.recorded_by_user_id = auth.uid()
      and private.can_access_growth_person(goal.service_user_id)
  )
);
create policy "Managers can govern growth evidence" on public.growth_goal_evidence
for update to authenticated using (
  private.is_manager() and organisation_id = private.current_organisation_id()
) with check (
  private.is_manager() and organisation_id = private.current_organisation_id()
);
create policy "Managers can unlink growth evidence" on public.growth_goal_evidence
for delete to authenticated using (
  private.is_manager() and organisation_id = private.current_organisation_id()
);

create policy "Managers can read accessible growth goal events" on public.growth_goal_events
for select to authenticated using (
  private.is_manager() and organisation_id = private.current_organisation_id()
  and exists (
    select 1 from public.growth_goals goal
    where goal.id = growth_goal_events.goal_id
      and private.can_access_growth_person(goal.service_user_id)
  )
);

grant select, insert, update on public.growth_goals to authenticated;
grant select, insert on public.growth_observations to authenticated;
grant select, insert, update, delete on public.growth_goal_evidence to authenticated;
grant select on public.growth_goal_events to authenticated;
grant all on public.growth_goals, public.growth_observations, public.growth_goal_evidence, public.growth_goal_events to service_role;

create or replace function public.create_growth_goal(
  p_service_user_id uuid, p_title text, p_desired_outcome text,
  p_support_approach text, p_domain text, p_status text,
  p_start_date date, p_target_date date
)
returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare new_goal_id uuid; actor_organisation_id uuid;
begin
  if not private.is_manager() then raise exception 'Only managers can create Growth goals'; end if;
  actor_organisation_id := private.current_organisation_id();
  insert into public.growth_goals(
    organisation_id, service_user_id, title, desired_outcome, support_approach,
    domain, status, start_date, target_date, family_visible, source_type,
    created_by_user_id, updated_by_user_id
  ) values (
    actor_organisation_id, p_service_user_id, btrim(p_title), nullif(btrim(p_desired_outcome), ''),
    nullif(btrim(p_support_approach), ''), p_domain, p_status, p_start_date, p_target_date,
    false, 'manager_created', auth.uid(), auth.uid()
  ) returning id into new_goal_id;
  return new_goal_id;
end;
$$;
revoke all on function public.create_growth_goal(uuid,text,text,text,text,text,date,date) from public;
grant execute on function public.create_growth_goal(uuid,text,text,text,text,text,date,date) to authenticated;

create or replace function public.update_growth_goal(
  p_goal_id uuid, p_title text, p_desired_outcome text,
  p_support_approach text, p_domain text, p_status text,
  p_start_date date, p_target_date date, p_family_visible boolean
)
returns void language plpgsql security invoker set search_path = public, auth, pg_temp as $$
begin
  if not private.is_manager() then raise exception 'Only managers can update Growth goals'; end if;

  update public.growth_goals
  set title = btrim(p_title),
      desired_outcome = nullif(btrim(p_desired_outcome), ''),
      support_approach = nullif(btrim(p_support_approach), ''),
      domain = p_domain,
      status = p_status,
      start_date = p_start_date,
      target_date = p_target_date,
      achieved_at = case
        when p_status = 'achieved' then coalesce(achieved_at, now())
        else achieved_at
      end,
      family_visible = p_family_visible,
      updated_by_user_id = auth.uid()
  where id = p_goal_id;

  if not found then raise exception 'Growth goal was not found or is not accessible'; end if;
end;
$$;
revoke all on function public.update_growth_goal(uuid,text,text,text,text,text,date,date,boolean) from public;
grant execute on function public.update_growth_goal(uuid,text,text,text,text,text,date,date,boolean) to authenticated;

create or replace function public.record_growth_goal_review(p_goal_id uuid, p_note text)
returns void language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare goal_row public.growth_goals;
begin
  if not private.is_manager() then raise exception 'Only managers can record Growth reviews'; end if;
  if nullif(btrim(p_note), '') is null then raise exception 'A progress review note is required'; end if;
  select * into goal_row from public.growth_goals where id = p_goal_id;
  if not found or goal_row.organisation_id <> private.current_organisation_id()
    or not private.can_access_growth_person(goal_row.service_user_id) then
    raise exception 'Growth goal was not found or is not accessible';
  end if;
  insert into public.growth_goal_events(
    organisation_id, goal_id, event_type, from_status, to_status, note, actor_user_id
  ) values (
    goal_row.organisation_id, goal_row.id, 'reviewed', goal_row.status,
    goal_row.status, btrim(p_note), auth.uid()
  );
end;
$$;
revoke all on function public.record_growth_goal_review(uuid,text) from public;
grant execute on function public.record_growth_goal_review(uuid,text) to authenticated;

create or replace function public.save_timeline_entry_with_growth(
  p_service_user_id uuid,
  p_entry_type text,
  p_content text,
  p_metadata jsonb,
  p_event_time timestamptz,
  p_growth jsonb
)
returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare
  new_timeline_entry_id uuid;
  new_observation_id uuid;
  actor_organisation_id uuid := private.current_organisation_id();
  related_goal_id_text text;
begin
  if auth.uid() is null then raise exception 'You must be signed in to record Growth evidence'; end if;
  if not private.can_access_growth_person(p_service_user_id) then
    raise exception 'You cannot record Growth evidence for this person';
  end if;
  if nullif(btrim(p_entry_type), '') is null or nullif(btrim(p_content), '') is null then
    raise exception 'Timeline entry type and content are required';
  end if;
  if p_growth->>'domain' is null or p_growth->>'progressType' is null then
    raise exception 'Growth area and progress type are required';
  end if;

  insert into public.timeline_entries(
    service_user_id, created_by, entry_type, content, metadata, event_time
  ) values (
    p_service_user_id::text, auth.uid(), btrim(p_entry_type), p_content,
    coalesce(p_metadata, '{}'::jsonb) || jsonb_build_object('growth', p_growth), p_event_time
  ) returning id into new_timeline_entry_id;

  insert into public.growth_observations(
    organisation_id, service_user_id, timeline_entry_id, domain, progress_type,
    summary, occurred_at, recorded_by_user_id
  ) values (
    actor_organisation_id, p_service_user_id, new_timeline_entry_id,
    p_growth->>'domain', p_growth->>'progressType',
    nullif(btrim(p_growth->>'summary'), ''), p_event_time, auth.uid()
  ) returning id into new_observation_id;

  for related_goal_id_text in
    select jsonb_array_elements_text(coalesce(p_growth->'relatedGoalIds', '[]'::jsonb))
  loop
    insert into public.growth_goal_evidence(
      organisation_id, goal_id, observation_id, family_visible, linked_by_user_id
    ) values (
      actor_organisation_id, related_goal_id_text::uuid, new_observation_id, false, auth.uid()
    );
  end loop;

  return new_timeline_entry_id;
end;
$$;
revoke all on function public.save_timeline_entry_with_growth(uuid,text,text,jsonb,timestamptz,jsonb) from public;
grant execute on function public.save_timeline_entry_with_growth(uuid,text,text,jsonb,timestamptz,jsonb) to authenticated;

create or replace function public.save_monthly_review_with_growth(p_review jsonb)
returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare
  review_id uuid;
  service_user_id_value uuid := (p_review->>'service_user_id')::uuid;
  actor_organisation_id uuid := private.current_organisation_id();
  goal jsonb;
begin
  if not private.is_manager() then raise exception 'Only managers can save monthly reviews'; end if;
  if (p_review->>'reviewer_id')::uuid <> auth.uid() then raise exception 'Reviewer must be the authenticated user'; end if;

  insert into public.monthly_service_user_reviews(
    organisation_id, service_user_id, reviewer_id, review_month, meeting_date,
    responses, consent, actions, service_user_comments, reviewer_name,
    service_user_name, representative_name, representative_relationship,
    capacity_status, best_interest_decision_copy, completed_at, updated_at
  ) values (
    actor_organisation_id, service_user_id_value, auth.uid(), (p_review->>'review_month')::date,
    (p_review->>'meeting_date')::date, coalesce(p_review->'responses', '{}'::jsonb),
    coalesce(p_review->'consent', '{}'::jsonb), coalesce(p_review->'actions', '[]'::jsonb),
    nullif(p_review->>'service_user_comments', ''), p_review->>'reviewer_name',
    p_review->>'service_user_name', nullif(p_review->>'representative_name', ''),
    nullif(p_review->>'representative_relationship', ''), nullif(p_review->>'capacity_status', ''),
    (p_review->>'best_interest_decision_copy')::boolean, (p_review->>'completed_at')::timestamptz, now()
  )
  on conflict (service_user_id, review_month) do update set
    reviewer_id = auth.uid(), meeting_date = excluded.meeting_date, responses = excluded.responses,
    consent = excluded.consent, actions = excluded.actions,
    service_user_comments = excluded.service_user_comments, reviewer_name = excluded.reviewer_name,
    service_user_name = excluded.service_user_name, representative_name = excluded.representative_name,
    representative_relationship = excluded.representative_relationship,
    capacity_status = excluded.capacity_status,
    best_interest_decision_copy = excluded.best_interest_decision_copy,
    completed_at = excluded.completed_at, updated_at = now()
  returning id into review_id;

  for goal in select value from jsonb_array_elements(coalesce(p_review#>'{responses,agreedGoals}', '[]'::jsonb)) loop
    if nullif(btrim(goal->>'id'), '') is null or nullif(btrim(goal->>'title'), '') is null then
      raise exception 'Every agreed Growth goal requires an id and title';
    end if;
    insert into public.growth_goals(
      organisation_id, service_user_id, title, desired_outcome, domain, status,
      start_date, target_date, family_visible, source_type, source_review_id,
      source_external_id, created_by_user_id, updated_by_user_id
    ) values (
      actor_organisation_id, service_user_id_value, btrim(goal->>'title'),
      nullif(btrim(goal->>'desiredOutcome'), ''),
      coalesce(nullif(goal->>'domain', ''), 'personal_choice_and_confidence'), 'active',
      coalesce((goal->>'agreedAt')::timestamptz::date, current_date),
      (goal->>'targetDate')::date, false, 'monthly_check_in', review_id,
      goal->>'id', auth.uid(), auth.uid()
    )
    on conflict (source_type, source_review_id, source_external_id)
      where source_review_id is not null and source_external_id is not null
    do update set
      title = excluded.title, desired_outcome = excluded.desired_outcome,
      domain = excluded.domain, target_date = excluded.target_date,
      updated_by_user_id = auth.uid();
  end loop;
  return review_id;
end;
$$;
revoke all on function public.save_monthly_review_with_growth(jsonb) from public;
grant execute on function public.save_monthly_review_with_growth(jsonb) to authenticated;

-- Preserve the source JSON. Backfill only creates first-class projections.
insert into public.growth_goals(
  organisation_id, service_user_id, title, desired_outcome, domain, status,
  start_date, target_date, family_visible, source_type, source_review_id,
  source_external_id, created_by_user_id, updated_by_user_id
)
select
  review.organisation_id, review.service_user_id, btrim(goal->>'title'),
  nullif(btrim(goal->>'desiredOutcome'), ''),
  coalesce(nullif(goal->>'domain', ''), 'personal_choice_and_confidence'),
  'active', coalesce((goal->>'agreedAt')::timestamptz::date, review.meeting_date),
  (goal->>'targetDate')::date, false, 'monthly_check_in', review.id,
  goal->>'id', review.reviewer_id, review.reviewer_id
from public.monthly_service_user_reviews review
cross join lateral jsonb_array_elements(coalesce(review.responses->'agreedGoals', '[]'::jsonb)) goal
where nullif(btrim(goal->>'id'), '') is not null
  and nullif(btrim(goal->>'title'), '') is not null
on conflict (source_type, source_review_id, source_external_id)
  where source_review_id is not null and source_external_id is not null
do nothing;

comment on table public.growth_goals is 'First-class person-centred goals shared across Castodia portals.';
comment on table public.growth_observations is 'Queryable interpretation of authoritative timeline evidence.';
comment on table public.growth_goal_events is 'Append-only audit history for material Growth goal changes.';

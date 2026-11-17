-- Domiciliary scheduling source records; additive and isolated from legacy rotas.
-- Pending local migration validation; do not apply to production before review.
create table public.domiciliary_activity_requirements (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id),
 service_user_id uuid not null references public.service_users(id) on delete cascade,
 activity_code text not null check (activity_code in ('personal_care','medication','mobility_transfer','nutrition','community_access','companionship')),
 title text not null check (length(trim(title)) > 0),
 required_staff integer not null default 1 check (required_staff between 1 and 10),
 duration_minutes integer not null check (duration_minutes between 5 and 1440),
 earliest_start time, latest_start time,
 weekdays integer[] not null default '{1,2,3,4,5,6,7}',
 valid_from date not null default current_date, valid_until date,
 source_care_plan_id uuid references public.care_plans(id) on delete set null,
 source_risk_assessment_id uuid references public.risk_assessments(id) on delete set null,
 all_staff_competencies text[] not null default '{}',
 team_competencies text[] not null default '{}',
 equipment_notes text,
 requirements_notes text,
 verified_at timestamptz,
 verified_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (valid_until is null or valid_until >= valid_from),
 check (earliest_start is null or latest_start is null or earliest_start <= latest_start),
 check (weekdays <@ array[1,2,3,4,5,6,7] and cardinality(weekdays) > 0)
);
create index domiciliary_requirements_person_idx on public.domiciliary_activity_requirements(service_user_id,valid_from);

create table public.domiciliary_person_preferences (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id),
 service_user_id uuid not null references public.service_users(id) on delete cascade,
 activity_code text not null check (activity_code in ('personal_care','medication','mobility_transfer','nutrition','community_access','companionship')),
 strength text not null check (strength in ('mandatory','strong','general')),
 preference_kind text not null check (preference_kind in ('worker_gender','named_worker','continuity','other')),
 permitted_worker_values text[] not null default '{}',
 preferred_staff_id uuid references public.profiles(id),
 expressed_by text not null check (expressed_by in ('person','representative','best_interests_process')),
 source_notes text,
 valid_from date not null default current_date, review_date date,
 verified_at timestamptz,
 verified_by uuid references public.profiles(id),
 created_at timestamptz not null default now(),
 check (preference_kind <> 'named_worker' or preferred_staff_id is not null),
 check (preference_kind <> 'worker_gender' or cardinality(permitted_worker_values) > 0)
);
create index domiciliary_preferences_person_idx on public.domiciliary_person_preferences(service_user_id,activity_code);

create table public.staff_recurring_availability (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id),
 staff_id uuid not null references public.profiles(id) on delete cascade,
 weekday integer not null check (weekday between 1 and 7),
 start_time time not null,
 end_time time not null,
 valid_from date not null default current_date,
 valid_until date,
 status text not null default 'approved' check (status in ('proposed','approved','rejected')),
 reviewed_by uuid references public.profiles(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 check (start_time < end_time),
 check (valid_until is null or valid_until >= valid_from)
);
create index staff_recurring_availability_staff_idx on public.staff_recurring_availability(staff_id,weekday);

create table public.staff_availability_exceptions (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id),
 staff_id uuid not null references public.profiles(id) on delete cascade,
 exception_date date not null,
 start_time time,
 end_time time,
 available boolean not null,
 reason text,
 status text not null default 'proposed' check (status in ('proposed','approved','rejected')),
 reviewed_by uuid references public.profiles(id),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 check ((start_time is null and end_time is null) or (start_time is not null and end_time is not null and start_time < end_time))
);
create index staff_availability_exceptions_staff_idx on public.staff_availability_exceptions(staff_id,exception_date);

create table public.staff_person_competency_authorisations (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id),
 staff_id uuid not null references public.profiles(id) on delete cascade,
 service_user_id uuid not null references public.service_users(id) on delete cascade,
 competency_code text not null,
 assessor_id uuid not null references public.profiles(id),
 assessed_at date not null,
 expires_at date,
 outcome text not null check (outcome in ('competent','not_competent','requires_supervision')),
 evidence_notes text,
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 check (expires_at is null or expires_at >= assessed_at)
);
create index staff_person_authorisations_idx on public.staff_person_competency_authorisations(staff_id,service_user_id,competency_code);

-- Source organisation must agree with all referenced person/staff records.
create or replace function public.domiciliary_source_org_check() returns trigger
language plpgsql security invoker set search_path = public, pg_temp as $$
begin
 if TG_TABLE_NAME in ('domiciliary_activity_requirements','domiciliary_person_preferences','staff_person_competency_authorisations') then
  if not exists (select 1 from public.service_users su where su.id = new.service_user_id and su.organisation_id = new.organisation_id) then
   raise exception 'Person organisation mismatch';
  end if;
 end if;
 if TG_TABLE_NAME in ('staff_recurring_availability','staff_availability_exceptions','staff_person_competency_authorisations') then
  if not exists (select 1 from public.profiles p where p.id = new.staff_id and p.organisation_id = new.organisation_id and p.is_active) then
   raise exception 'Staff organisation mismatch';
  end if;
 end if;
 if TG_TABLE_NAME = 'domiciliary_person_preferences' and new.preferred_staff_id is not null then
  if not exists (select 1 from public.profiles p where p.id = new.preferred_staff_id and p.organisation_id = new.organisation_id) then
   raise exception 'Preferred staff organisation mismatch';
  end if;
 end if;
 return new;
end $$;
do $$
declare t text;
begin
 foreach t in array array['domiciliary_activity_requirements','domiciliary_person_preferences','staff_recurring_availability','staff_availability_exceptions','staff_person_competency_authorisations'] loop
  execute format('create trigger %I before insert or update on public.%I for each row execute function public.domiciliary_source_org_check()', t || '_org_guard', t);
  execute format('alter table public.%I enable row level security', t);
 end loop;
end $$;

-- Managers may manage organisation-scoped requirements and authorisations.
create policy "Managers manage activity requirements" on public.domiciliary_activity_requirements for all to authenticated
 using (private.is_manager() and organisation_id = private.current_organisation_id())
 with check (private.is_manager() and organisation_id = private.current_organisation_id());
create policy "Managers manage person preferences" on public.domiciliary_person_preferences for all to authenticated
 using (private.is_manager() and organisation_id = private.current_organisation_id())
 with check (private.is_manager() and organisation_id = private.current_organisation_id());
create policy "Managers manage person competency authorisations" on public.staff_person_competency_authorisations for all to authenticated
 using (private.is_manager() and organisation_id = private.current_organisation_id())
 with check (private.is_manager() and organisation_id = private.current_organisation_id());

-- Managers manage availability; staff can read their own rows, but do not self-approve.
create policy "Managers manage recurring availability" on public.staff_recurring_availability for all to authenticated
 using (private.is_manager() and organisation_id = private.current_organisation_id())
 with check (private.is_manager() and organisation_id = private.current_organisation_id());
create policy "Staff read own recurring availability" on public.staff_recurring_availability for select to authenticated
 using (organisation_id = private.current_organisation_id() and staff_id = (select auth.uid()));
create policy "Managers manage availability exceptions" on public.staff_availability_exceptions for all to authenticated
 using (private.is_manager() and organisation_id = private.current_organisation_id())
 with check (private.is_manager() and organisation_id = private.current_organisation_id());
create policy "Staff read own availability exceptions" on public.staff_availability_exceptions for select to authenticated
 using (organisation_id = private.current_organisation_id() and staff_id = (select auth.uid()));

grant select,insert,update,delete on public.domiciliary_activity_requirements,public.domiciliary_person_preferences,public.staff_recurring_availability,public.staff_availability_exceptions,public.staff_person_competency_authorisations to authenticated;

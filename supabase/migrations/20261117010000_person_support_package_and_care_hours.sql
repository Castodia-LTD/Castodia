-- Support packages and recorded care units, separated from planned rota hours.
create table public.person_support_packages (
  service_user_id uuid primary key references public.service_users(id) on delete cascade,
  commissioned_hours_weekly numeric(8,2) check (commissioned_hours_weekly >= 0),
  assessed_hours_weekly numeric(8,2) check (assessed_hours_weekly >= 0),
  support_level text,
  funding_source text,
  commissioner text,
  package_start date,
  next_review date,
  personal_care boolean not null default false,
  regulated_activity_notes text,
  support_details text,
  updated_at timestamptz not null default now()
);
create table public.person_care_hours (
  id uuid primary key default gen_random_uuid(),
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  care_model text not null check (care_model in ('supported_living','domiciliary','residential')),
  care_date date not null,
  unit_type text not null check (unit_type in ('care_hours','visit','placement_day','sleep_in','waking_night','additional_support')),
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz,
  recorded_minutes integer check (recorded_minutes >= 0),
  source text not null default 'manager_adjustment' check (source in ('rota','visit_clock','placement','manager_adjustment')),
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','estimated','disputed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (actual_end is null or actual_start is not null),
  check (actual_end is null or actual_end >= actual_start)
);
create index person_care_hours_person_date_idx on public.person_care_hours(service_user_id,care_date desc);
alter table public.person_support_packages enable row level security;
alter table public.person_care_hours enable row level security;
-- Match each person's organisation against the authenticated user's trusted profile.
-- Writes are restricted to management roles; client-side UI checks are not authorization.
create policy "Organisation can read support packages" on public.person_support_packages for select to authenticated
using (exists(select 1 from public.service_users su join public.profiles p on p.organisation_id=su.organisation_id where su.id=service_user_id and p.id=(select auth.uid())));
create policy "Managers can insert support packages" on public.person_support_packages for insert to authenticated
with check (exists(select 1 from public.service_users su join public.profiles p on p.organisation_id=su.organisation_id where su.id=service_user_id and p.id=(select auth.uid()) and p.role in ('manager','admin','castodia_owner','castodia_admin')));
create policy "Managers can update support packages" on public.person_support_packages for update to authenticated
using (exists(select 1 from public.service_users su join public.profiles p on p.organisation_id=su.organisation_id where su.id=service_user_id and p.id=(select auth.uid()) and p.role in ('manager','admin','castodia_owner','castodia_admin')))
with check (exists(select 1 from public.service_users su join public.profiles p on p.organisation_id=su.organisation_id where su.id=service_user_id and p.id=(select auth.uid()) and p.role in ('manager','admin','castodia_owner','castodia_admin')));
create policy "Organisation can read care hours" on public.person_care_hours for select to authenticated
using (exists(select 1 from public.service_users su join public.profiles p on p.organisation_id=su.organisation_id where su.id=service_user_id and p.id=(select auth.uid())));
-- Hours will be written by verified rota/visit workflows in a later phase; no client write policy yet.

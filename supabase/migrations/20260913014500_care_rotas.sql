-- CastodiaCare rota foundation.
-- Managers build person-centred shifts and assign staff. Staff rotas are derived from those assignments.

create table if not exists public.rota_shifts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  shift_date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  shift_type text not null default 'Support',
  notes text,
  status text not null default 'planned' check (status in ('planned', 'cancelled')),
  created_by_user_id uuid not null references public.profiles(id),
  updated_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rota_shifts_org_date_idx
  on public.rota_shifts (organisation_id, shift_date);
create index if not exists rota_shifts_person_date_idx
  on public.rota_shifts (service_user_id, shift_date);

create table if not exists public.rota_shift_assignments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  shift_id uuid not null references public.rota_shifts(id) on delete cascade,
  staff_user_id uuid not null references public.profiles(id) on delete cascade,
  created_by_user_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (shift_id, staff_user_id)
);

create index if not exists rota_assignments_staff_idx
  on public.rota_shift_assignments (staff_user_id);
create index if not exists rota_assignments_shift_idx
  on public.rota_shift_assignments (shift_id);

alter table public.rota_shifts enable row level security;
alter table public.rota_shift_assignments enable row level security;

drop policy if exists "Managers can view organisation rota shifts" on public.rota_shifts;
create policy "Managers can view organisation rota shifts"
on public.rota_shifts for select to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
);

drop policy if exists "Support can view assigned rota shifts" on public.rota_shifts;
create policy "Support can view assigned rota shifts"
on public.rota_shifts for select to authenticated
using (
  private.is_support()
  and organisation_id = private.current_organisation_id()
  and exists (
    select 1
    from public.rota_shift_assignments assignment
    where assignment.shift_id = rota_shifts.id
      and assignment.staff_user_id = auth.uid()
  )
);

drop policy if exists "Managers can create organisation rota shifts" on public.rota_shifts;
create policy "Managers can create organisation rota shifts"
on public.rota_shifts for insert to authenticated
with check (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and created_by_user_id = auth.uid()
  and updated_by_user_id = auth.uid()
);

drop policy if exists "Managers can update organisation rota shifts" on public.rota_shifts;
create policy "Managers can update organisation rota shifts"
on public.rota_shifts for update to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
)
with check (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and updated_by_user_id = auth.uid()
);

drop policy if exists "Managers can delete organisation rota shifts" on public.rota_shifts;
create policy "Managers can delete organisation rota shifts"
on public.rota_shifts for delete to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
);

drop policy if exists "Managers can view organisation rota assignments" on public.rota_shift_assignments;
create policy "Managers can view organisation rota assignments"
on public.rota_shift_assignments for select to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
);

drop policy if exists "Support can view own rota assignments" on public.rota_shift_assignments;
create policy "Support can view own rota assignments"
on public.rota_shift_assignments for select to authenticated
using (
  private.is_support()
  and organisation_id = private.current_organisation_id()
  and staff_user_id = auth.uid()
);

drop policy if exists "Managers can create organisation rota assignments" on public.rota_shift_assignments;
create policy "Managers can create organisation rota assignments"
on public.rota_shift_assignments for insert to authenticated
with check (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
  and created_by_user_id = auth.uid()
);

drop policy if exists "Managers can delete organisation rota assignments" on public.rota_shift_assignments;
create policy "Managers can delete organisation rota assignments"
on public.rota_shift_assignments for delete to authenticated
using (
  private.is_manager()
  and organisation_id = private.current_organisation_id()
);

create or replace function public.create_rota_shift(
  p_service_user_id uuid,
  p_shift_date date,
  p_start_time time,
  p_end_time time,
  p_shift_type text,
  p_notes text,
  p_staff_user_ids uuid[] default '{}'::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor_organisation_id uuid := private.current_organisation_id();
  new_shift_id uuid;
  staff_id uuid;
begin
  if not private.is_manager() then
    raise exception 'Only managers can build rotas';
  end if;

  if actor_organisation_id is null then
    raise exception 'Organisation not found';
  end if;

  if not exists (
    select 1 from public.service_users person
    where person.id = p_service_user_id
      and person.organisation_id = actor_organisation_id
      and coalesce(person.is_active, true)
  ) then
    raise exception 'Person is not available to this organisation';
  end if;

  insert into public.rota_shifts (
    organisation_id, service_user_id, shift_date, start_time, end_time,
    shift_type, notes, created_by_user_id, updated_by_user_id
  ) values (
    actor_organisation_id, p_service_user_id, p_shift_date, p_start_time, p_end_time,
    coalesce(nullif(btrim(p_shift_type), ''), 'Support'), nullif(btrim(p_notes), ''),
    auth.uid(), auth.uid()
  ) returning id into new_shift_id;

  foreach staff_id in array coalesce(p_staff_user_ids, '{}'::uuid[]) loop
    if not exists (
      select 1 from public.profiles profile
      where profile.id = staff_id
        and profile.organisation_id = actor_organisation_id
        and profile.role in ('manager', 'support')
    ) then
      raise exception 'Assigned staff member is not available to this organisation';
    end if;

    insert into public.rota_shift_assignments (
      organisation_id, shift_id, staff_user_id, created_by_user_id
    ) values (
      actor_organisation_id, new_shift_id, staff_id, auth.uid()
    ) on conflict (shift_id, staff_user_id) do nothing;
  end loop;

  return new_shift_id;
end;
$$;

revoke all on function public.create_rota_shift(uuid,date,time,time,text,text,uuid[]) from public;
grant execute on function public.create_rota_shift(uuid,date,time,time,text,text,uuid[]) to authenticated;

create or replace function public.set_rota_shift_staff(
  p_shift_id uuid,
  p_staff_user_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor_organisation_id uuid := private.current_organisation_id();
  staff_id uuid;
begin
  if not private.is_manager() then
    raise exception 'Only managers can assign rota staff';
  end if;

  if not exists (
    select 1 from public.rota_shifts shift
    where shift.id = p_shift_id
      and shift.organisation_id = actor_organisation_id
  ) then
    raise exception 'Shift not found';
  end if;

  delete from public.rota_shift_assignments
  where shift_id = p_shift_id
    and organisation_id = actor_organisation_id;

  foreach staff_id in array coalesce(p_staff_user_ids, '{}'::uuid[]) loop
    if not exists (
      select 1 from public.profiles profile
      where profile.id = staff_id
        and profile.organisation_id = actor_organisation_id
        and profile.role in ('manager', 'support')
    ) then
      raise exception 'Assigned staff member is not available to this organisation';
    end if;

    insert into public.rota_shift_assignments (
      organisation_id, shift_id, staff_user_id, created_by_user_id
    ) values (
      actor_organisation_id, p_shift_id, staff_id, auth.uid()
    );
  end loop;

  update public.rota_shifts
  set updated_by_user_id = auth.uid(), updated_at = now()
  where id = p_shift_id;
end;
$$;

revoke all on function public.set_rota_shift_staff(uuid,uuid[]) from public;
grant execute on function public.set_rota_shift_staff(uuid,uuid[]) to authenticated;

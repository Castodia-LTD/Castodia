-- Extend rota records for monthly day/night planning and staff leave cover.
alter table public.rota_shifts
  add column if not exists shift_period text not null default 'day';

alter table public.rota_shift_assignments
  add column if not exists assignment_type text not null default 'working';

alter table public.rota_shifts
  drop constraint if exists rota_shifts_shift_period_check;
alter table public.rota_shifts
  add constraint rota_shifts_shift_period_check
  check (shift_period in ('day', 'night'));

alter table public.rota_shift_assignments
  drop constraint if exists rota_shift_assignments_assignment_type_check;
alter table public.rota_shift_assignments
  add constraint rota_shift_assignments_assignment_type_check
  check (assignment_type in ('working', 'annual_leave'));

create index if not exists rota_assignments_staff_type_idx
  on public.rota_shift_assignments (staff_user_id, assignment_type);

create or replace function public.create_rota_shift_v2(
  p_service_user_id uuid,
  p_shift_date date,
  p_start_time time,
  p_end_time time,
  p_shift_type text,
  p_notes text,
  p_working_staff_user_ids uuid[],
  p_annual_leave_staff_user_ids uuid[],
  p_shift_period text
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

  if p_shift_period not in ('day', 'night') then
    raise exception 'Shift period must be day or night';
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
    shift_type, shift_period, notes, created_by_user_id, updated_by_user_id
  ) values (
    actor_organisation_id, p_service_user_id, p_shift_date, p_start_time, p_end_time,
    coalesce(nullif(btrim(p_shift_type), ''), 'Support'), p_shift_period,
    nullif(btrim(p_notes), ''), auth.uid(), auth.uid()
  ) returning id into new_shift_id;

  foreach staff_id in array coalesce(p_working_staff_user_ids, '{}'::uuid[]) loop
    if not exists (
      select 1 from public.profiles profile
      where profile.id = staff_id
        and profile.organisation_id = actor_organisation_id
        and profile.role in ('manager', 'support')
    ) then
      raise exception 'Assigned staff member is not available to this organisation';
    end if;

    insert into public.rota_shift_assignments (
      organisation_id, shift_id, staff_user_id, assignment_type, created_by_user_id
    ) values (
      actor_organisation_id, new_shift_id, staff_id, 'working', auth.uid()
    ) on conflict (shift_id, staff_user_id) do update
      set assignment_type = excluded.assignment_type;
  end loop;

  foreach staff_id in array coalesce(p_annual_leave_staff_user_ids, '{}'::uuid[]) loop
    if not exists (
      select 1 from public.profiles profile
      where profile.id = staff_id
        and profile.organisation_id = actor_organisation_id
        and profile.role in ('manager', 'support')
    ) then
      raise exception 'Annual leave staff member is not available to this organisation';
    end if;

    insert into public.rota_shift_assignments (
      organisation_id, shift_id, staff_user_id, assignment_type, created_by_user_id
    ) values (
      actor_organisation_id, new_shift_id, staff_id, 'annual_leave', auth.uid()
    ) on conflict (shift_id, staff_user_id) do update
      set assignment_type = excluded.assignment_type;
  end loop;

  return new_shift_id;
end;
$$;

grant execute on function public.create_rota_shift_v2(uuid,date,time,time,text,text,uuid[],uuid[],text) to authenticated;

-- Keep rota edits behind trusted database functions so audit identity comes from auth.uid().

create or replace function public.update_rota_shift(
  p_shift_id uuid,
  p_service_user_id uuid,
  p_shift_date date,
  p_start_time time,
  p_end_time time,
  p_shift_type text,
  p_notes text,
  p_staff_user_ids uuid[] default '{}'::uuid[]
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
    raise exception 'Only managers can edit rotas';
  end if;

  if not exists (
    select 1 from public.rota_shifts shift
    where shift.id = p_shift_id
      and shift.organisation_id = actor_organisation_id
      and shift.status = 'planned'
  ) then
    raise exception 'Active shift not found';
  end if;

  if not exists (
    select 1 from public.service_users person
    where person.id = p_service_user_id
      and person.organisation_id = actor_organisation_id
      and coalesce(person.is_active, true)
  ) then
    raise exception 'Person is not available to this organisation';
  end if;

  update public.rota_shifts
  set service_user_id = p_service_user_id,
      shift_date = p_shift_date,
      start_time = p_start_time,
      end_time = p_end_time,
      shift_type = coalesce(nullif(btrim(p_shift_type), ''), 'Support'),
      notes = nullif(btrim(p_notes), ''),
      updated_by_user_id = auth.uid(),
      updated_at = now()
  where id = p_shift_id
    and organisation_id = actor_organisation_id;

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
end;
$$;

revoke all on function public.update_rota_shift(uuid,uuid,date,time,time,text,text,uuid[]) from public;
grant execute on function public.update_rota_shift(uuid,uuid,date,time,time,text,text,uuid[]) to authenticated;

create or replace function public.cancel_rota_shift(p_shift_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor_organisation_id uuid := private.current_organisation_id();
begin
  if not private.is_manager() then
    raise exception 'Only managers can cancel rota shifts';
  end if;

  update public.rota_shifts
  set status = 'cancelled',
      updated_by_user_id = auth.uid(),
      updated_at = now()
  where id = p_shift_id
    and organisation_id = actor_organisation_id
    and status = 'planned';

  if not found then
    raise exception 'Active shift not found';
  end if;
end;
$$;

revoke all on function public.cancel_rota_shift(uuid) from public;
grant execute on function public.cancel_rota_shift(uuid) to authenticated;

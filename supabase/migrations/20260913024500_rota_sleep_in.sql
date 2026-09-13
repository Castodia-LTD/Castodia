-- Add explicit sleep-in marking to rota shifts.
alter table public.rota_shifts
  add column if not exists is_sleep_in boolean not null default false;

-- Replace the rota configuration helper with a sleep-in-aware signature.
drop function if exists public.configure_rota_shift(uuid,text,uuid[]);

create or replace function public.configure_rota_shift(
  p_shift_id uuid,
  p_shift_period text,
  p_annual_leave_staff_user_ids uuid[] default '{}'::uuid[],
  p_is_sleep_in boolean default false
)
returns void
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor_organisation_id uuid := private.current_organisation_id();
begin
  if not private.is_manager() then
    raise exception 'Only managers can configure rota shifts';
  end if;

  if p_shift_period not in ('day', 'night') then
    raise exception 'Shift period must be day or night';
  end if;

  update public.rota_shifts
  set shift_period = p_shift_period,
      is_sleep_in = coalesce(p_is_sleep_in, false),
      updated_by_user_id = auth.uid(),
      updated_at = now()
  where id = p_shift_id
    and organisation_id = actor_organisation_id
    and status = 'planned';

  if not found then
    raise exception 'Active shift not found';
  end if;

  update public.rota_shift_assignments
  set assignment_type = case
    when staff_user_id = any(coalesce(p_annual_leave_staff_user_ids, '{}'::uuid[])) then 'annual_leave'
    else 'working'
  end
  where shift_id = p_shift_id
    and organisation_id = actor_organisation_id;
end;
$$;

revoke all on function public.configure_rota_shift(uuid,text,uuid[],boolean) from public;
grant execute on function public.configure_rota_shift(uuid,text,uuid[],boolean) to authenticated;

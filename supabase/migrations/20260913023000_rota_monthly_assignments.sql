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

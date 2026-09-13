-- Extend rota records for monthly day/night planning and staff leave cover.
alter table public.rota_shifts
  add column if not exists shift_period text not null default 'day';

alter table public.rota_shift_assignments
  add column if not exists assignment_type text not null default 'working';

alter table public.domiciliary_activity_requirements
 add column if not exists lifecycle_status text not null default 'active',
 add column if not exists lifecycle_reason text,
 add column if not exists lifecycle_changed_at timestamptz,
 add column if not exists lifecycle_changed_by uuid references auth.users(id);
alter table public.domiciliary_activity_requirements drop constraint if exists domiciliary_activity_requirements_lifecycle_status_check;
alter table public.domiciliary_activity_requirements add constraint domiciliary_activity_requirements_lifecycle_status_check check (lifecycle_status in ('active','paused','removed'));
create index if not exists domiciliary_activity_requirements_lifecycle_idx on public.domiciliary_activity_requirements (organisation_id,lifecycle_status,service_user_id);
comment on column public.domiciliary_activity_requirements.lifecycle_status is 'Active, temporarily paused, or removed from future visit generation; records are never hard-deleted from the manager interface.';
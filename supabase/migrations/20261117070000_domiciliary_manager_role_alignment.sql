-- Align domiciliary manager editing permissions with the manager portal's accepted roles.
-- Roles are read from the protected profiles table, not client-supplied claims.
create or replace function private.can_manage_domiciliary(p_organisation_id uuid)
returns boolean language sql stable security definer
set search_path = public, auth, pg_temp
as $$
 select exists (
  select 1 from public.profiles p
  where p.id = (select auth.uid())
    and p.organisation_id = p_organisation_id
    and p.is_active = true
    and p.role in ('manager','admin','castodia_owner','castodia_admin')
 );
$$;
revoke all on function private.can_manage_domiciliary(uuid) from public, anon;
grant execute on function private.can_manage_domiciliary(uuid) to authenticated;

drop policy if exists "Managers manage activity requirements" on public.domiciliary_activity_requirements;
create policy "Managers manage activity requirements" on public.domiciliary_activity_requirements
for all to authenticated
using (private.can_manage_domiciliary(organisation_id))
with check (private.can_manage_domiciliary(organisation_id));

drop policy if exists "Managers manage person preferences" on public.domiciliary_person_preferences;
create policy "Managers manage person preferences" on public.domiciliary_person_preferences
for all to authenticated
using (private.can_manage_domiciliary(organisation_id))
with check (private.can_manage_domiciliary(organisation_id));

drop policy if exists "Managers manage person competency authorisations" on public.staff_person_competency_authorisations;
create policy "Managers manage person competency authorisations" on public.staff_person_competency_authorisations
for all to authenticated
using (private.can_manage_domiciliary(organisation_id))
with check (private.can_manage_domiciliary(organisation_id));

drop policy if exists "Managers manage recurring availability" on public.staff_recurring_availability;
create policy "Managers manage recurring availability" on public.staff_recurring_availability
for all to authenticated
using (private.can_manage_domiciliary(organisation_id))
with check (private.can_manage_domiciliary(organisation_id));

drop policy if exists "Managers manage availability exceptions" on public.staff_availability_exceptions;
create policy "Managers manage availability exceptions" on public.staff_availability_exceptions
for all to authenticated
using (private.can_manage_domiciliary(organisation_id))
with check (private.can_manage_domiciliary(organisation_id));

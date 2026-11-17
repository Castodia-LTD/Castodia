create or replace function public.domiciliary_source_org_check()
returns trigger language plpgsql set search_path = public, pg_temp as $$
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
 -- Nested condition is essential: activity requirement rows have no preferred_staff_id field.
 if TG_TABLE_NAME = 'domiciliary_person_preferences' then
  if new.preferred_staff_id is not null then
   if not exists (select 1 from public.profiles p where p.id = new.preferred_staff_id and p.organisation_id = new.organisation_id) then
    raise exception 'Preferred staff organisation mismatch';
   end if;
  end if;
 end if;
 return new;
end $$;
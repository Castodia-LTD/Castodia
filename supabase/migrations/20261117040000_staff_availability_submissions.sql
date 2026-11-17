-- Staff can submit availability proposals without approving or changing them.
-- Approval remains a manager decision; proposals must not silently override published rotas.
create policy "Staff propose own recurring availability"
on public.staff_recurring_availability for insert to authenticated
with check (
 organisation_id = private.current_organisation_id()
 and staff_id = (select auth.uid())
 and status = 'proposed'
 and reviewed_by is null and reviewed_at is null
);
create policy "Staff withdraw own proposed recurring availability"
on public.staff_recurring_availability for delete to authenticated
using (
 organisation_id = private.current_organisation_id()
 and staff_id = (select auth.uid())
 and status = 'proposed'
);
create policy "Staff propose own availability exceptions"
on public.staff_availability_exceptions for insert to authenticated
with check (
 organisation_id = private.current_organisation_id()
 and staff_id = (select auth.uid())
 and status = 'proposed'
 and reviewed_by is null and reviewed_at is null
);
create policy "Staff withdraw own proposed availability exceptions"
on public.staff_availability_exceptions for delete to authenticated
using (
 organisation_id = private.current_organisation_id()
 and staff_id = (select auth.uid())
 and status = 'proposed'
);
-- Protect against forged manager approval fields through future policy changes.
create or replace function public.staff_availability_submission_guard()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
begin
 if not private.is_manager() then
   if tg_op = 'UPDATE' then raise exception 'Only managers can review availability'; end if;
   if new.staff_id is distinct from auth.uid()
      or new.organisation_id is distinct from private.current_organisation_id()
      or new.status <> 'proposed'
      or new.reviewed_by is not null or new.reviewed_at is not null then
     raise exception 'Staff may only submit their own proposed availability';
   end if;
 end if;
 return new;
end $$;
create trigger staff_recurring_availability_submission_guard
before insert or update on public.staff_recurring_availability
for each row execute function public.staff_availability_submission_guard();
create trigger staff_availability_exceptions_submission_guard
before insert or update on public.staff_availability_exceptions
for each row execute function public.staff_availability_submission_guard();

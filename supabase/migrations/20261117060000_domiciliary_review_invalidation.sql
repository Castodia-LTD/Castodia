-- Verified care requirements must be reviewed again after a material change.
create or replace function public.domiciliary_requirements_invalidate_review()
returns trigger language plpgsql security invoker set search_path = public, pg_temp as $$
begin
 if (old.title,old.activity_code,old.required_staff,old.duration_minutes,old.earliest_start,
     old.latest_start,old.weekdays,old.valid_from,old.valid_until,old.all_staff_competencies,
     old.team_competencies,old.requirements_notes,old.source_care_plan_id,old.source_risk_assessment_id)
    is distinct from
    (new.title,new.activity_code,new.required_staff,new.duration_minutes,new.earliest_start,
     new.latest_start,new.weekdays,new.valid_from,new.valid_until,new.all_staff_competencies,
     new.team_competencies,new.requirements_notes,new.source_care_plan_id,new.source_risk_assessment_id) then
    new.verified_at := null;
    new.verified_by := null;
 end if;
 return new;
end $$;
create trigger domiciliary_requirements_review_reset before update on public.domiciliary_activity_requirements
for each row execute function public.domiciliary_requirements_invalidate_review();

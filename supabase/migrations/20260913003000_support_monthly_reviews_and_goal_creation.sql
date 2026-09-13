-- Support staff and managers can complete monthly check-ins and agree new goals.
-- Managers retain goal updates, status governance, reviews and Family visibility.

drop policy if exists "Managers can create monthly reviews"
  on public.monthly_service_user_reviews;
drop policy if exists "Managers can update monthly reviews"
  on public.monthly_service_user_reviews;

create policy "Care users can create monthly reviews"
on public.monthly_service_user_reviews for insert to authenticated
with check (
  (private.is_manager() or private.is_support())
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and reviewer_id = auth.uid()
);

create policy "Care users can update monthly reviews"
on public.monthly_service_user_reviews for update to authenticated
using (
  (private.is_manager() or private.is_support())
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
)
with check (
  (private.is_manager() or private.is_support())
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and reviewer_id = auth.uid()
);

drop policy if exists "Managers can create growth goals" on public.growth_goals;

create policy "Care users can create growth goals" on public.growth_goals
for insert to authenticated with check (
  (private.is_manager() or private.is_support())
  and organisation_id = private.current_organisation_id()
  and private.can_access_growth_person(service_user_id)
  and created_by_user_id = auth.uid()
  and updated_by_user_id = auth.uid()
  and family_visible = false
  and status in ('draft', 'active')
);

create or replace function public.create_growth_goal(
  p_service_user_id uuid, p_title text, p_desired_outcome text,
  p_support_approach text, p_domain text, p_status text,
  p_start_date date, p_target_date date
)
returns uuid language plpgsql security invoker set search_path = public, auth, pg_temp as $$
declare new_goal_id uuid; actor_organisation_id uuid;
begin
  if not (private.is_manager() or private.is_support()) then
    raise exception 'Only care staff can create Growth goals';
  end if;
  if not private.can_access_growth_person(p_service_user_id) then
    raise exception 'You cannot create a Growth goal for this person';
  end if;
  if p_status not in ('draft', 'active') then
    raise exception 'New Growth goals must be draft or active';
  end if;

  actor_organisation_id := private.current_organisation_id();
  insert into public.growth_goals(
    organisation_id, service_user_id, title, desired_outcome, support_approach,
    domain, status, start_date, target_date, family_visible, source_type,
    created_by_user_id, updated_by_user_id
  ) values (
    actor_organisation_id, p_service_user_id, btrim(p_title), nullif(btrim(p_desired_outcome), ''),
    nullif(btrim(p_support_approach), ''), p_domain, p_status, p_start_date, p_target_date,
    false, 'manager_created', auth.uid(), auth.uid()
  ) returning id into new_goal_id;
  return new_goal_id;
end;
$$;
revoke all on function public.create_growth_goal(uuid,text,text,text,text,text,date,date) from public;
grant execute on function public.create_growth_goal(uuid,text,text,text,text,text,date,date) to authenticated;

create or replace function public.save_monthly_review_with_growth(p_review jsonb)
returns uuid language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  review_id uuid;
  service_user_id_value uuid := (p_review->>'service_user_id')::uuid;
  actor_organisation_id uuid := private.current_organisation_id();
  goal jsonb;
begin
  if not (private.is_manager() or private.is_support()) then
    raise exception 'Only care staff can save monthly reviews';
  end if;
  if (p_review->>'reviewer_id')::uuid <> auth.uid() then
    raise exception 'Reviewer must be the authenticated user';
  end if;
  if actor_organisation_id is null
    or not private.can_access_growth_person(service_user_id_value) then
    raise exception 'You cannot save a monthly review for this person';
  end if;

  insert into public.monthly_service_user_reviews(
    organisation_id, service_user_id, reviewer_id, review_month, meeting_date,
    responses, consent, actions, service_user_comments, reviewer_name,
    service_user_name, representative_name, representative_relationship,
    capacity_status, best_interest_decision_copy, completed_at, updated_at
  ) values (
    actor_organisation_id, service_user_id_value, auth.uid(), (p_review->>'review_month')::date,
    (p_review->>'meeting_date')::date, coalesce(p_review->'responses', '{}'::jsonb),
    coalesce(p_review->'consent', '{}'::jsonb), coalesce(p_review->'actions', '[]'::jsonb),
    nullif(p_review->>'service_user_comments', ''), p_review->>'reviewer_name',
    p_review->>'service_user_name', nullif(p_review->>'representative_name', ''),
    nullif(p_review->>'representative_relationship', ''), nullif(p_review->>'capacity_status', ''),
    (p_review->>'best_interest_decision_copy')::boolean, (p_review->>'completed_at')::timestamptz, now()
  )
  on conflict (service_user_id, review_month) do update set
    reviewer_id = auth.uid(), meeting_date = excluded.meeting_date, responses = excluded.responses,
    consent = excluded.consent, actions = excluded.actions,
    service_user_comments = excluded.service_user_comments, reviewer_name = excluded.reviewer_name,
    service_user_name = excluded.service_user_name, representative_name = excluded.representative_name,
    representative_relationship = excluded.representative_relationship,
    capacity_status = excluded.capacity_status,
    best_interest_decision_copy = excluded.best_interest_decision_copy,
    completed_at = excluded.completed_at, updated_at = now()
  returning id into review_id;

  for goal in
    select value
    from jsonb_array_elements(coalesce(p_review#>'{responses,agreedGoals}', '[]'::jsonb))
  loop
    if nullif(btrim(goal->>'id'), '') is null
      or nullif(btrim(goal->>'title'), '') is null then
      raise exception 'Every agreed Growth goal requires an id and title';
    end if;

    insert into public.growth_goals(
      organisation_id, service_user_id, title, desired_outcome, domain, status,
      start_date, target_date, family_visible, source_type, source_review_id,
      source_external_id, created_by_user_id, updated_by_user_id
    ) values (
      actor_organisation_id, service_user_id_value, btrim(goal->>'title'),
      nullif(btrim(goal->>'desiredOutcome'), ''),
      coalesce(nullif(goal->>'domain', ''), 'personal_choice_and_confidence'), 'active',
      coalesce((goal->>'agreedAt')::timestamptz::date, current_date),
      (goal->>'targetDate')::date, false, 'monthly_check_in', review_id,
      goal->>'id', auth.uid(), auth.uid()
    )
    on conflict (source_type, source_review_id, source_external_id)
      where source_review_id is not null and source_external_id is not null
    do update set
      title = excluded.title, desired_outcome = excluded.desired_outcome,
      domain = excluded.domain, target_date = excluded.target_date,
      updated_by_user_id = auth.uid();
  end loop;

  return review_id;
end;
$$;
revoke all on function public.save_monthly_review_with_growth(jsonb) from public;
grant execute on function public.save_monthly_review_with_growth(jsonb) to authenticated;

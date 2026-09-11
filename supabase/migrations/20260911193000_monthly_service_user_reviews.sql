create table if not exists public.monthly_service_user_reviews (
  id uuid primary key default gen_random_uuid(),
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  review_month date not null,
  meeting_date date not null default current_date,
  responses jsonb not null default '{}'::jsonb,
  consent jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  service_user_comments text,
  reviewer_name text,
  service_user_name text,
  representative_name text,
  representative_relationship text,
  capacity_status text,
  best_interest_decision_copy boolean,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(service_user_id, review_month)
);

create index if not exists monthly_service_user_reviews_service_user_idx
  on public.monthly_service_user_reviews(service_user_id, review_month desc);

alter table public.monthly_service_user_reviews enable row level security;

create policy "Authenticated users can read monthly reviews"
  on public.monthly_service_user_reviews
  for select
  to authenticated
  using (true);

create policy "Authenticated users can create monthly reviews"
  on public.monthly_service_user_reviews
  for insert
  to authenticated
  with check (auth.uid() = reviewer_id);

create policy "Reviewers can update their monthly reviews"
  on public.monthly_service_user_reviews
  for update
  to authenticated
  using (auth.uid() = reviewer_id)
  with check (auth.uid() = reviewer_id);

comment on table public.monthly_service_user_reviews is
  'Monthly person-centred review combining the service user voice, consent review, outcomes and agreed actions.';

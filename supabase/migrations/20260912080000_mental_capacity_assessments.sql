create table if not exists public.mental_capacity_assessments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  title text not null,
  decision text not null,
  assessment_date date not null default current_date,
  review_date date,
  outcome text not null,
  status text not null default 'completed',
  version integer not null default 1,
  supersedes_assessment_id uuid references public.mental_capacity_assessments(id) on delete restrict,
  assessment_data jsonb not null default '{}'::jsonb,
  template_snapshot jsonb not null default '{}'::jsonb,
  assessor_id uuid not null references public.profiles(id) on delete restrict,
  assessor_name text not null,
  completed_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mental_capacity_title_not_blank check (length(btrim(title)) > 0),
  constraint mental_capacity_decision_not_blank check (length(btrim(decision)) > 0),
  constraint mental_capacity_assessor_name_not_blank check (length(btrim(assessor_name)) > 0),
  constraint mental_capacity_outcome_check check (
    outcome in ('has_capacity', 'lacks_capacity', 'inconclusive')
  ),
  constraint mental_capacity_status_check check (
    status in ('completed', 'superseded', 'archived')
  ),
  constraint mental_capacity_version_positive check (version > 0),
  constraint mental_capacity_review_date_valid check (
    review_date is null or review_date >= assessment_date
  ),
  constraint mental_capacity_assessment_data_complete check (
    jsonb_typeof(assessment_data) = 'object'
    and assessment_data ?& array[
      'reasonForAssessment', 'practicableSupport', 'impairmentDetails',
      'impairmentNature', 'relevantInformation', 'understand', 'retain',
      'useOrWeigh', 'communicate', 'causalLink', 'conclusionReasoning',
      'capacityMayFluctuate'
    ]
    and length(btrim(assessment_data->>'reasonForAssessment')) > 0
    and length(btrim(assessment_data->>'practicableSupport')) > 0
    and length(btrim(assessment_data->>'impairmentDetails')) > 0
    and assessment_data->>'impairmentNature' in (
      'temporary', 'permanent', 'fluctuating', 'unknown'
    )
    and length(btrim(assessment_data->>'relevantInformation')) > 0
    and jsonb_typeof(assessment_data->'understand') = 'object'
    and (assessment_data->'understand') ?& array['result', 'evidence']
    and assessment_data#>>'{understand,result}' in (
      'demonstrated', 'not_demonstrated', 'unclear'
    )
    and length(btrim(assessment_data#>>'{understand,evidence}')) > 0
    and jsonb_typeof(assessment_data->'retain') = 'object'
    and (assessment_data->'retain') ?& array['result', 'evidence']
    and assessment_data#>>'{retain,result}' in (
      'demonstrated', 'not_demonstrated', 'unclear'
    )
    and length(btrim(assessment_data#>>'{retain,evidence}')) > 0
    and jsonb_typeof(assessment_data->'useOrWeigh') = 'object'
    and (assessment_data->'useOrWeigh') ?& array['result', 'evidence']
    and assessment_data#>>'{useOrWeigh,result}' in (
      'demonstrated', 'not_demonstrated', 'unclear'
    )
    and length(btrim(assessment_data#>>'{useOrWeigh,evidence}')) > 0
    and jsonb_typeof(assessment_data->'communicate') = 'object'
    and (assessment_data->'communicate') ?& array['result', 'evidence']
    and assessment_data#>>'{communicate,result}' in (
      'demonstrated', 'not_demonstrated', 'unclear'
    )
    and length(btrim(assessment_data#>>'{communicate,evidence}')) > 0
    and length(btrim(assessment_data->>'causalLink')) > 0
    and length(btrim(assessment_data->>'conclusionReasoning')) > 0
    and jsonb_typeof(assessment_data->'capacityMayFluctuate') = 'boolean'
  ),
  constraint mental_capacity_template_snapshot_valid check (
    jsonb_typeof(template_snapshot) = 'object'
    and template_snapshot ?& array['framework', 'title']
    and template_snapshot->>'framework' = 'castodia_mca_v1'
    and length(btrim(template_snapshot->>'title')) > 0
  )
);

comment on table public.mental_capacity_assessments is
  'Immutable, decision-specific Mental Capacity Act assessment records. New reviews create new versions rather than replacing completed evidence.';

comment on column public.mental_capacity_assessments.outcome is
  'Human assessor conclusion. Castodia must not calculate this value.';

comment on column public.mental_capacity_assessments.assessment_data is
  'Structured evidence captured through the statutory assessment workflow.';

comment on column public.mental_capacity_assessments.template_snapshot is
  'Frozen template metadata used for this assessment so later template changes cannot alter the historic record.';

create index if not exists mental_capacity_service_user_idx
  on public.mental_capacity_assessments(service_user_id, assessment_date desc);

create index if not exists mental_capacity_review_date_idx
  on public.mental_capacity_assessments(review_date)
  where status = 'completed' and review_date is not null;

create index if not exists mental_capacity_organisation_idx
  on public.mental_capacity_assessments(organisation_id);

alter table public.mental_capacity_assessments enable row level security;

create policy "Managers can read MCA records in their organisation"
  on public.mental_capacity_assessments
  for select
  to authenticated
  using (
    public.is_castodia_manager()
    and organisation_id = public.current_castodia_organisation_id()
  );

create policy "Support can read completed MCA records in their organisation"
  on public.mental_capacity_assessments
  for select
  to authenticated
  using (
    public.is_castodia_support()
    and organisation_id = public.current_castodia_organisation_id()
    and status in ('completed', 'superseded')
  );

create policy "Managers can create MCA records in their organisation"
  on public.mental_capacity_assessments
  for insert
  to authenticated
  with check (
    public.is_castodia_manager()
    and organisation_id = public.current_castodia_organisation_id()
    and assessor_id = auth.uid()
    and created_by = auth.uid()
    and status = 'completed'
    and exists (
      select 1
      from public.service_users as service_user
      where service_user.id = mental_capacity_assessments.service_user_id
        and service_user.organisation_id = mental_capacity_assessments.organisation_id
    )
  );

grant select, insert on public.mental_capacity_assessments to authenticated;
grant all on public.mental_capacity_assessments to service_role;

create table if not exists public.mental_capacity_documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  service_user_id uuid not null references public.service_users(id) on delete cascade,
  title text not null,
  decision text not null,
  assessment_date date not null,
  review_date date,
  completed_by text not null,
  notes text,
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size_bytes bigint not null,
  uploaded_by uuid not null references public.profiles(id) on delete restrict,
  uploaded_at timestamptz not null default now(),
  constraint mental_capacity_document_title_not_blank check (length(btrim(title)) > 0),
  constraint mental_capacity_document_decision_not_blank check (length(btrim(decision)) > 0),
  constraint mental_capacity_document_completed_by_not_blank check (length(btrim(completed_by)) > 0),
  constraint mental_capacity_document_file_name_not_blank check (length(btrim(file_name)) > 0),
  constraint mental_capacity_document_path_not_blank check (length(btrim(storage_path)) > 0),
  constraint mental_capacity_document_review_date_valid check (
    review_date is null or review_date >= assessment_date
  ),
  constraint mental_capacity_document_mime_type_valid check (
    mime_type in (
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )
  ),
  constraint mental_capacity_document_file_size_valid check (
    file_size_bytes between 1 and 10485760
  )
);

comment on table public.mental_capacity_documents is
  'Metadata for completed external MCA documents uploaded against a service user. Files are held in a private storage bucket.';

create index if not exists mental_capacity_documents_service_user_idx
  on public.mental_capacity_documents(service_user_id, assessment_date desc);

create index if not exists mental_capacity_documents_review_date_idx
  on public.mental_capacity_documents(review_date)
  where review_date is not null;

alter table public.mental_capacity_documents enable row level security;

create policy "Managers can read uploaded MCA documents in their organisation"
  on public.mental_capacity_documents
  for select
  to authenticated
  using (
    public.is_castodia_manager()
    and organisation_id = public.current_castodia_organisation_id()
  );

create policy "Support can read uploaded MCA documents in their organisation"
  on public.mental_capacity_documents
  for select
  to authenticated
  using (
    public.is_castodia_support()
    and organisation_id = public.current_castodia_organisation_id()
  );

create policy "Managers can register uploaded MCA documents in their organisation"
  on public.mental_capacity_documents
  for insert
  to authenticated
  with check (
    public.is_castodia_manager()
    and organisation_id = public.current_castodia_organisation_id()
    and uploaded_by = auth.uid()
    and exists (
      select 1
      from public.service_users as service_user
      where service_user.id = mental_capacity_documents.service_user_id
        and service_user.organisation_id = mental_capacity_documents.organisation_id
    )
  );

grant select, insert on public.mental_capacity_documents to authenticated;
grant all on public.mental_capacity_documents to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mental-capacity-documents',
  'mental-capacity-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Managers can upload MCA files for their organisation"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'mental-capacity-documents'
    and public.is_castodia_manager()
    and (storage.foldername(name))[1] = public.current_castodia_organisation_id()::text
    and lower(storage.extension(name)) in ('pdf', 'doc', 'docx')
  );

create policy "Managers can read MCA files for their organisation"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'mental-capacity-documents'
    and public.is_castodia_manager()
    and (storage.foldername(name))[1] = public.current_castodia_organisation_id()::text
  );

create policy "Support can read MCA files for their organisation"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'mental-capacity-documents'
    and public.is_castodia_support()
    and (storage.foldername(name))[1] = public.current_castodia_organisation_id()::text
  );

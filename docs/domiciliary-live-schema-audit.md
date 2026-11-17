# Live database schema audit — 17 November 2026

Read-only introspection of Supabase project schema (no person/staff data retrieved, no DDL executed). This supplements `docs/domiciliary-scheduling-source-audit.md`.

## Confirmed existing tables and columns

- `public.staff_competencies`: `organisation_id`, `staff_id`, `assessor_id`, `competency_type`, `assessment_date`, `review_date`, `knowledge_checks` jsonb, `practical_checks` jsonb, `outcome`, `assessor_signed`, `staff_signed`. Competency evidence exists but its outcome enum/accepted values, assessment scope, and authorisation policy must be inspected. No person-specific sign-off column was identified.
- `public.staff_training_records`: `organisation_id`, `staff_id`, `course_name`, `completion_date`, `expiry_date`, certificate metadata. Training completion is not proof of competency.
- `public.staff_employment`: `organisation_id`, `staff_id`, `employment_status`, `contract_type`, `contracted_hours`, start/end dates. No recurring availability schedule was identified.
- `public.care_plans` + `public.care_plan_sections`: person/organisation-linked plan metadata and narrative section `content` text. No structured activity-level staff ratio, competency code, recurrence or timing field identified.
- `public.risk_assessments`: person/organisation-linked risk narrative and review/status fields; not yet structured into visit-level restrictions.
- `public.service_user_about_me`: preferences/communication fields, `gender_identity`, likes/dislikes, important information. No structured activity-scoped worker-gender wishes; never infer such wishes from the person's own gender.
- `public.medication_profiles`: person-linked medication, route, `round`, `is_prn`, active/locked, instructions. `public.medication_rounds`: dated recorded events. `public.medication_dose_plans`: authorised plans and clinical instructions. These do not establish individual worker medication authorisation.
- `public.person_support_packages`: commissioned/assessed hours, personal care flag, free-text support details; not per-visit requirements.
- `public.rota_shifts` and `public.rota_shift_assignments`: existing scheduled shifts and staff links; no activity codes or staffing positions in observed columns.

All listed public tables reported RLS enabled. **RLS enabled does not prove policies are correct**; policy-by-policy and RPC audit is required.

## Design consequences

1. Add an explicit structured *person care activity requirement* with source care plan/assessment references, per-activity staffing ratio, duration, recurrence/window, relevant equipment and verified status. Narrative remains authoritative care evidence, but not automatically parsed into safety-critical staffing instructions.
2. Add activity-scoped *person wishes and restrictions*, explicitly recorded by the person/authorised decision-maker with source, effective/review dates, mandatory vs preference and narrow task scope.
3. Add a canonical competency taxonomy and mappings from assessed `staff_competencies` outcomes and training records; person-specific authorisations must be represented separately where required.
4. Add staff recurring availability and exceptions, independent of `staff_employment.contracted_hours`.
5. Add visit occurrences and independent staffing positions, then validate allocations against verified requirements server-side before publish.
6. Keep new functionality isolated from legacy `rota_shifts` until migration/integration and supported-living regression tests are complete.

## Not yet verified
- Exact RLS policy semantics, constraints and RPC behaviour on live schema.
- Allowed `staff_competencies.outcome` values and which indicate a valid, signed competency.
- Medication round timing interpretation and person-specific staff administration authority.
- Existing staff leave workflow and structured availability.
- Current deployment, tests and end-to-end data access.

No schema or production data was modified by this audit.

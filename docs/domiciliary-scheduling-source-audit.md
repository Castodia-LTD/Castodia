# Domiciliary scheduling — source data audit and integration contract

Status: partial repository audit, 17 November 2026. No live database introspection, deployment or production migration in this branch.

## Authoritative source-to-requirement mapping

| Scheduling input | Intended authority | Current repository evidence | Gap / next audit |
| --- | --- | --- | --- |
| Person and care model | `service_users` | `20261117003000_service_user_care_model.sql` | Confirm deployed migration, RLS |
| Commissioned/assessed hours, personal care indicator | `person_support_packages` | `20261117010000_person_support_package_and_care_hours.sql` | Boolean and free text do not define visit activities, frequency, duration or 1:1/2:1/3:1 staffing |
| Planned/actual care units | `person_care_hours` | Same migration | Not an authoritative recurring requirement |
| Shift and assigned workers | `rota_shifts`, `rota_shift_assignments` | `20260913014500_care_rotas.sql` | No demonstrated competency or person-preference validation in original RPCs |
| Care activities, risk and person wishes | Person Hub structured care plans/preferences/assessments | `ServiceUserHubPage.tsx` links to care plans, risks and medication | Inspect actual tables, field semantics, versioning, approval, RLS |
| Medication type/timing/authorisation | Person Hub medication and eMAR; Staff Hub competency | Hub navigation; build-state notes reference eMAR | Inspect medication schemas, distinction prompting/assistance/administration, person-specific authorisations |
| Mobility, hoist and transfers | Person Hub moving-and-handling assessment | Not established in inspected schema | Need activity-specific staffing, equipment, verified staff sign-offs |
| Nutrition and swallowing | Person Hub nutrition/care plan | Not established | Identify task-specific training and risk flags |
| Staff availability, contract, leave | Staff Hub | `MyRotaPage.tsx` reads assigned shifts | Inspect authoritative staff employment, availability and absence schemas |
| Staff training and competency | Staff Hub training/competency records | Not established | Inspect completion vs assessed competency, expiry, scope, assessor, person-specific authorisation |
| Route feasibility | Visit locations + ORS | `DomiciliaryTravelCalculator.tsx` manual coordinate estimator | Automatic route feasibility not implemented |

## Minimum structured visit contract
- Person ID, organisation ID, care model, source requirement IDs and effective source versions.
- One or more activity codes; activity-specific requirements rather than a generic person-wide label.
- Recurrence/date, permitted start window, duration, fixed/time-critical flags, required worker count and independent positions.
- For each activity: mandatory person wishes and restrictions, preferred staff, all-worker competencies, at-least-one-worker competencies, relevant equipment, medication authorisation and assessed risk.
- Explicitly verified source status; missing/ambiguous/outdated mandatory requirements must be reviewed rather than inferred from free text.

## Matching sequence
1. Confirm authenticated organisation scope and authorised source reads.
2. Resolve each visit activity to versioned Person Hub requirements and expressed wishes.
3. Combine mandatory requirements across activities; identify worker-by-worker and team-level requirements.
4. Resolve Staff Hub availability, contracts, leave, restrictions, completed training, assessed competence, expiry and person-specific sign-off.
5. Exclude unavailable workers and unmet explicit mandatory personal requirements; hold unverified competency cases for review (not cleared).
6. Validate distinct worker slots, team coverage, overlap, journey feasibility and hours.
7. Rank only fully eligible allocations by continuity, preference and travel. Manager reviews and confirms.
8. Preserve source references and alert managers to source changes affecting drafts or published visits; never silently alter published visits.

## Current code delivered on this branch
`features/care/shared/rota/activityEligibility.ts` is a pure domain module with individual and team checks. It is **not connected** to Supabase, UI, RPCs or production. It intentionally cannot validate source authenticity, training record schemas, gender/privacy rules, shift overlaps, medication schedules or travel without the subsequent integration layers.

## Safety and permissions
- Do not infer gender preference from the person's sex or assign protected characteristics by default.
- Person-expressed requirements can be mandatory for specific activities (e.g. intimate personal care) without excluding staff from unrelated activities.
- Record person's own wishes separately from family/representative requests and any capacity/best-interests decisions.
- Restrict access to sensitive worker/person attributes; staff-facing screens should expose minimum necessary information.
- Missing verification must never be treated as eligibility clearance.
- Existing legacy shift RPCs are not yet wired to this checker. No claim of enforcement until server-side authoritative validation exists.

## Next repository audit targets
1. Care plan, medication/eMAR, risk and support assessment migrations and feature queries.
2. Staff Hub profile, training, qualifications, competency, leave and contract migrations.
3. RLS, role-scoped reads, existing RPC entry points and source update events.
4. Map confirmed columns to an explicit normalised projection, then write tests and server-side enforcement.

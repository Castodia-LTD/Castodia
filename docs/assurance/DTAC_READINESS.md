# Castodia DTAC readiness and evidence matrix

Last reviewed: 14 September 2026
Owner: Castodia Ltd
Scope: CastodiaCare, CastodiaCore and CastodiaFamily code and deployment controls represented by this repository.

## Purpose

This document is the repository-level index for evidence relevant to the NHS Digital Technology Assessment Criteria (DTAC). It is intentionally conservative: a control is not marked complete merely because the product appears capable of meeting it. Where external assurance, named accountable roles, contracts, policies, test reports or production evidence are required, those items remain open until the evidence exists.

This repository therefore aims for **no unidentified repository-controlled DTAC gaps**, not to claim DTAC approval.

## Product boundary and intended purpose

Castodia is a digital care-management and communication platform for social-care organisations, staff and authorised family members. It supports recording, viewing, organising and sharing care-related information, operational workflows and person-centred outcomes.

The software is not intended by Castodia to diagnose disease, recommend treatment, calculate clinical decisions, replace professional judgement, or autonomously direct clinical care. If functionality is later introduced that may meet the definition of software as a medical device, the intended purpose and regulatory classification must be reassessed before release.

## Evidence matrix

| DTAC area | Repository evidence / control | Status | External or operational evidence still required |
|---|---|---|---|
| Clinical safety | `docs/assurance/CLINICAL_SAFETY.md`; release safety checkpoint in `DEPLOYMENT_CHECKLIST.md`; test and RLS documentation | Partially evidenced | Named competent Clinical Safety Officer; DCB0129 clinical risk management plan; maintained hazard log approved by CSO; Clinical Safety Case Report; release sign-off records |
| Data protection | `docs/assurance/DATA_PROTECTION.md`; Supabase/RLS architecture in existing project docs; least-privilege server routes | Partially evidenced | Signed DPIA; controller/processor role decisions; Article 30 record; contracts/DPA; subprocessor register; retention schedule approval; DSAR/erasure operational evidence |
| Technical security | `SECURITY.md`; automated CI; Dependabot; secure response headers in `next.config.ts`; RLS tests | Repository controls implemented | Independent penetration test; vulnerability remediation records; Cyber Essentials/Plus where required; production monitoring evidence; formal access reviews |
| Interoperability | `docs/assurance/INTEROPERABILITY.md`; documented API/product boundaries | Roadmap / boundary documented | Confirm target NHS interfaces; standards conformance evidence where integrations are commissioned; FHIR/UK Core evidence if applicable |
| Usability & accessibility | `docs/assurance/ACCESSIBILITY.md`; CI build/lint/test gate | Standard defined | WCAG 2.2 AA audit; assistive-technology testing; published accessibility statement; evidence of remediation/user testing |

## Repository assurance controls

The repository must keep the following controls active:

1. Pull-request CI runs lint, tests and a production build.
2. Dependency updates are surfaced automatically.
3. Security-sensitive changes receive explicit review against `SECURITY.md` and this matrix.
4. Database/RLS changes are tested for tenant isolation and least privilege.
5. Releases use `DEPLOYMENT_CHECKLIST.md` and record unresolved clinical, security, privacy and accessibility risks.
6. No document may state that Castodia is DTAC compliant, DCB0129 compliant, clinically safe, penetration-tested, Cyber Essentials certified or WCAG conformant unless the corresponding external evidence has actually been completed and retained.

## Evidence retention

For each production release, retain outside the repository where necessary:

- release identifier and deployment date;
- approver(s);
- CI results;
- database migration list;
- known-risk decision log;
- clinical-safety sign-off where required;
- security findings and remediation status;
- accessibility findings and remediation status;
- incident/change references affecting the release.

## Open DTAC actions that cannot be completed by code alone

- Appoint a competent Clinical Safety Officer and complete DCB0129 artefacts.
- Complete and approve a DPIA for the live service and each material processing change.
- Commission independent penetration testing before NHS deployment and after material security changes.
- Establish formal production incident response, backup/restore tests, access reviews and business-continuity evidence.
- Complete an independent WCAG 2.2 AA accessibility audit and publish an accessibility statement.
- Confirm interoperability requirements with each NHS customer and evidence relevant standards rather than assuming FHIR is required in every deployment.

## Change rule

Any material feature affecting clinical workflows, personal-data processing, authentication/authorisation, integrations, automated decision support or accessibility must update this matrix and the associated assurance document in the same change set.
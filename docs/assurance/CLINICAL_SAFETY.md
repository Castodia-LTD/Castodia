# Clinical safety assurance framework

This repository supports preparation for NHS clinical-safety assurance. It does not by itself constitute DCB0129 compliance.

## Intended safety boundary

Castodia supports recording and communicating information used in care delivery. The system must not be treated as a substitute for professional judgement, emergency procedures or local escalation processes. Safety controls must therefore address both software failure and the risk that users over-rely on incomplete, delayed or incorrect digital information.

## Required DCB0129 artefacts

The following artefacts must exist, be version controlled or otherwise retained, and be approved by a competent Clinical Safety Officer (CSO) before a deployment that requires DCB0129 assurance:

- Clinical Risk Management Plan;
- Hazard Log;
- Clinical Safety Case Report;
- defined clinical-safety responsibilities and escalation path;
- evidence linking hazards to controls, verification and residual-risk decisions;
- release-specific safety review for material changes.

## Hazard-log minimum fields

Every hazard entry should record: unique ID, hazard, foreseeable cause, hazardous situation, potential harm, affected users/persons, initial severity and likelihood, risk controls, verification evidence, residual severity and likelihood, owner, status, review date and CSO decision.

## Baseline hazard themes

The formal hazard log must consider at least the following themes where relevant to deployed functionality:

1. Incorrect person or record selected.
2. Information saved against the wrong person or organisation.
3. Missing, stale, duplicated or delayed care information.
4. Unauthorised disclosure or cross-tenant data access.
5. Failure to record or display a risk, medication-related item, care-plan update or escalation.
6. Incorrect interpretation of dashboards, trends, goals or generated/derived information.
7. Availability loss during a care-critical workflow.
8. Failed synchronisation or integration producing inconsistent records.
9. User-interface or accessibility defects causing omission, misreading or incorrect action.
10. Role/permission defects exposing functions to an inappropriate user.

This list is a starting point only and must not be copied into a safety case as if it were a completed clinical risk assessment.

## Engineering expectations

Safety-relevant changes must have acceptance criteria, tests and review evidence. Where a control depends on RLS, permissions or tenant boundaries, a negative test must show that access is denied as well as a positive test showing intended access. Derived information must remain traceable to its source where practical, and the user interface must distinguish recorded facts from summaries, calculations or inferred/derived content.

## Release safety checkpoint

Before production release, ask:

- Does this change alter a care workflow or how a person’s information is interpreted?
- Does it introduce derived, calculated, summarised or automated information?
- Could failure, delay or incorrect display contribute to harm?
- Does it change roles, permissions, tenant isolation or identity matching?
- Does it change availability, offline behaviour, synchronisation or integrations?

If yes to any item, the release must be assessed against the hazard log and reviewed under the organisation's clinical risk process. Material unresolved clinical risk must block release unless formally accepted by the authorised clinical-safety role.

## Medical-device boundary

Castodia's current intended purpose is not diagnostic or therapeutic decision-making. Any future feature that recommends treatment, produces a clinical decision, predicts an individual's disease or deterioration for a medical purpose, or otherwise changes the intended purpose must trigger a documented UK medical-device classification review before release.
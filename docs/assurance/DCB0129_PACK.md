# DCB0129 clinical-safety artefact pack

These are working templates for completion and approval by a competent Clinical Safety Officer (CSO). Their presence in the repository is not evidence of DCB0129 compliance.

## 1. Clinical Risk Management Plan template

**Document ID / version:**

**System / release scope:**

**Clinical intended use and boundaries:**

**Excluded uses / foreseeable misuse:**

**Clinical Safety Officer:**

**Other safety roles and responsibilities:**

**Risk-management method:** Define severity/likelihood scales, risk matrix, acceptability criteria and escalation rules used by the organisation.

**Lifecycle activities:** Describe hazard identification, risk analysis, control selection, verification, residual-risk acceptance, release review, incident feedback and periodic review.

**Required evidence:** Link requirements, tests, RLS/permission evidence, usability/accessibility evidence, integration tests and operational controls to relevant hazards.

**Change control:** Define which product/database/integration changes require clinical-safety reassessment.

**Approval:** Name, role, date and decision.

---

## 2. Hazard Log template

Maintain one row per hazard/risk scenario and use organisation-approved scoring criteria.

| ID | Hazard / hazardous situation | Foreseeable causes | Potential harm | Affected person(s) | Initial risk | Controls | Verification evidence | Residual risk | Owner | Status | CSO decision / date |
|---|---|---|---|---|---|---|---|---|---|---|---|
| H-001 |  |  |  |  |  |  |  |  |  | Open |  |

The hazard log should consider the baseline themes in `CLINICAL_SAFETY.md`, but must be based on the actual deployed system and workflows.

---

## 3. Clinical Safety Case Report template

### Executive safety claim
State the system/release being assessed, its intended use, deployment context and the safety claim being made. Do not state that the system is safe without the evidence and authorised approval supporting that statement.

### System description and boundaries
Describe products, user groups, data flows, hosting/integrations, relevant manual processes and exclusions.

### Clinical risk-management approach
Reference the approved Clinical Risk Management Plan, risk criteria, roles and review process.

### Hazard analysis
Summarise material hazards, key controls, verification and residual risks. Link to the controlled hazard log rather than duplicating it inconsistently.

### Verification and validation evidence
Reference relevant automated/manual tests, RLS/permission tests, accessibility/usability evidence, integration testing, operational controls and incident history.

### Outstanding issues and residual risk
List open defects, accepted limitations, deployment conditions and safety recommendations.

### Conclusion and release decision
Record the CSO's conclusion, conditions, approval/rejection decision, name, competence/role, signature or controlled approval mechanism and date.

---

## 4. Release clinical-safety record template

- Release/commit:
- Date:
- Material care-workflow changes:
- New/changed hazards:
- Controls changed:
- Verification evidence:
- Open safety-related defects:
- Hazard-log references:
- DPIA/security/accessibility cross-impacts:
- CSO review required? Yes/No + rationale:
- CSO decision/conditions:
- Release approver:

Completed records should be retained in the controlled assurance system appropriate to Castodia and its NHS/customer contracts; sensitive assurance evidence does not need to be made public merely because these templates live in a public repository.
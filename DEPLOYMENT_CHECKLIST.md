# Castodia deployment and assurance checklist

Use this checklist for production releases. Product-specific release steps may add to it but must not bypass the assurance gates below.

## Build and deployment

1. Back up the current working repository and confirm production database backup coverage.
2. Review all Supabase migrations in the release and apply them in the required order.
3. Install dependencies using the locked npm workflow (`npm ci` in CI/reproducible environments).
4. Run:
   - `npm run build`
   - `npm test`
   - `npm run lint`
5. Smoke-test:
   - Care Manager login and `/care/manager/dashboard`
   - Care Support login and `/care/support/dashboard`
   - Manager -> Support portal switch
   - CastodiaCore owner/admin login and `/core/dashboard`
   - CastodiaFamily login and `/family`
   - issue submission and Core issue management
   - Core organisation/user administration
6. Confirm legacy `/manager`, `/support` and `/platform` URLs redirect correctly where still supported.
7. Confirm role, organisation and tenant boundaries with both positive and negative access tests for security-sensitive changes.

## Native release checks

1. Run `npx cap sync ios` after installing dependencies when native assets/code changed.
2. Confirm each native target's display name, bundle ID, entitlements and production server configuration.
3. Test native login and confirm accounts cannot be routed into a product they are not authorised to access.
4. Confirm the deployed Apple association endpoint returns the expected content and bundle identifiers.
5. Confirm Associated Domains/provisioning are valid and signed entitlements include the expected `webcredentials` domain.
6. On a physical supported device, verify login/password AutoFill and the principal care journeys affected by the release.

## DTAC / assurance release gate

Before approving production deployment, record the result of each item below:

- **Clinical safety:** Has the change altered a care workflow, derived information, risk display, permissions, identity matching, availability or an integration? If yes, assess it against the clinical hazard process and obtain the required Clinical Safety Officer decision before release.
- **Data protection:** Has the purpose, category, recipient, retention, location or access to personal data changed? If yes, review the DPIA/data-flow record before release.
- **Security:** Have authentication, authorisation, RLS, tenant isolation, file handling, exports, integrations or privileged operations changed? If yes, complete targeted tests and document residual findings.
- **Accessibility:** Have user-facing components or workflows changed? If yes, perform keyboard/accessibility checks appropriate to the change and record known defects/remediation.
- **Interoperability:** Have APIs/integrations changed? If yes, verify the applicable interface contract, provenance, failure/retry behaviour and any relevant standards conformance.
- **Operations:** Are monitoring, rollback/mitigation, backup/restore implications and support/runbook changes understood?

Material unresolved clinical-safety, privacy, security or data-integrity risks must block release unless accepted by the appropriately authorised accountable role and recorded with rationale.

## Release evidence to retain

For each production release retain: commit/release identifier, deployment date, approver, CI results, migration list, test evidence, known risks, assurance decisions, rollback/mitigation information and links to incidents or corrective actions where relevant.

See `docs/assurance/DTAC_READINESS.md` for the evidence matrix and remaining external assurance requirements.

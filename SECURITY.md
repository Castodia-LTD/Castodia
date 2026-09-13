# Security policy

## Supported code

Security fixes should target the current production release and main branch. Older deployments should be upgraded or receive an explicitly approved backport where contractual obligations require it.

## Reporting vulnerabilities

Do not disclose suspected vulnerabilities, credentials, personal data or exploit details in a public GitHub issue. Report them privately to Castodia Ltd through the organisation's security/contact channel and include affected component, reproduction steps, impact and any evidence that can be shared safely.

## Engineering security rules

- Never commit passwords, access tokens, service-role keys, private certificates or production environment files.
- Keep privileged Supabase/service-role operations server-side only.
- Enforce authorisation as well as authentication on privileged routes.
- Treat organisation/tenant isolation and row-level security as security boundaries and test both allowed and denied access.
- Validate untrusted input and avoid reflecting sensitive values in errors or logs.
- Use secure transport in production and maintain restrictive response headers.
- Review dependencies continuously and remediate known exploitable vulnerabilities according to risk.
- Avoid broad CORS, wildcard origins or disabling browser security controls merely to resolve development issues.
- Record and review security-sensitive changes to authentication, permissions, data export, file upload, integrations and audit logging.

## Vulnerability triage

Security findings should record severity, exploitability, affected data/users, exposure, owner, remediation plan and verification evidence. Critical findings with credible production exploitation or cross-tenant exposure should trigger the incident process immediately. Lower-severity findings should still have an explicit risk decision and due date.

## Penetration testing

Repository review and automated dependency scanning are not substitutes for independent penetration testing. Before NHS production assurance, commission appropriately scoped external testing covering authentication, authorisation, tenant isolation, API endpoints, session handling, common web vulnerabilities and relevant native/webview behaviours. Retain the report and closure evidence outside the public repository.

## Dependency management

Dependabot configuration and CI provide early warning and verification. Automated update suggestions must still be reviewed and tested before release.

## Secrets and incident response

If a secret is accidentally committed, assume it is compromised: revoke/rotate it immediately, assess logs and access, remove it from current code, and enter the event into the incident process. Rewriting Git history does not by itself make an exposed credential safe.

See `docs/assurance/OPERATIONS_AND_INCIDENTS.md` and `docs/assurance/DTAC_READINESS.md` for the wider assurance process.
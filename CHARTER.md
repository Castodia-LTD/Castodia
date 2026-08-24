Castodia Engineering Charter

Status: Active
Applies to: Castodia application code, APIs, database,
authentication, storage, deployment configuration and technical
documentation
Purpose: To define the non-negotiable engineering principles that
protect people, care data, customer organisations and the long-term
maintainability of Castodia.

1. Purpose

Castodia is care-management software. Engineering decisions can affect
the confidentiality, integrity and availability of information used in
real care.

The purpose of this charter is to make the platform's core engineering
expectations explicit. It applies whether a change is made by the
founder, an employee, a contractor, an external development partner or
an automated coding tool.

Speed of development does not override the principles in this charter.

2. Core Principles

2.1 Care comes before convenience

Features must support safe, understandable and dependable care
workflows. A technically convenient implementation must not knowingly
weaken data protection, accountability or the clarity of information
presented to users.

2.2 Deny by default

Access should be granted deliberately rather than assumed. Users,
organisations and roles should receive only the access required for
their legitimate function.

2.3 Tenant isolation is a system invariant

One Castodia organisation must not be able to access another
organisation's protected data unless a deliberate platform-level
function explicitly requires and authorises that access.

Organisation isolation must not depend solely on hidden UI elements or
client-side checks.

2.4 The server establishes authority

Client-supplied identifiers such as userId, creatorId,
organisationId or role must never be treated as proof of identity or
permission.

For privileged operations, identity must come from a verified
authenticated session or token. Role and organisation authority must
then be resolved from trusted server-side data.

2.5 Least privilege

The Supabase service-role credential bypasses Row Level Security and is
therefore highly privileged.

It must: - remain server-side; - never use a NEXT_PUBLIC_ prefix; -
never be committed to source control; - never be logged or returned to a
client; - be used only where ordinary authenticated/RLS-controlled
access is insufficient; and - only be invoked after appropriate
authentication and authorisation.

3. Authentication and Roles

Castodia currently distinguishes organisation-level and platform-level
authority.

Organisation roles: - support - manager

Platform roles: - castodia_admin - castodia_owner

Platform privileges must not be creatable through ordinary organisation
staff-management workflows.

Route protection, API authorisation and database policy must remain
consistent with the intended role model. Hiding a control in the
interface is not an authorisation mechanism.

4. Database and Row Level Security

PostgreSQL Row Level Security is a primary security boundary for
Castodia.

All public application tables that contain protected application data
must have RLS enabled and appropriate policies defined.

When adding or changing a policy:

Determine who should be allowed to perform SELECT, INSERT, UPDATE
and DELETE independently.

Enforce organisation ownership where applicable.

Consider the interaction with every other policy on the table.

Avoid broad policies such as USING (true) or WITH CHECK (true)
unless the access is deliberately public and documented.

Remember that permissive PostgreSQL policies can combine in ways
that make an older broad policy undermine a newer restrictive
policy.

Test both allowed and forbidden scenarios.

Schema and RLS changes should be captured in version-controlled
migrations so that the security state can be reproduced and reviewed.

5. Storage Security

Supabase Storage is subject to the same tenant-isolation standard as
database records.

Storage policy must consider: - bucket; - object path; - authenticated
user; - organisation ownership; - intended role; and - whether the
bucket should be public or private.

Knowing or guessing an object path must not give an unauthorised user
the ability to upload, replace or delete another organisation's
protected objects.

6. Sensitive Information

Castodia handles information that may include personal care information,
medication records, safeguarding information, health-related
information, staff employment information and identifying details.

Developers must minimise unnecessary exposure of that information.

Do not: - use real service-user information as development fixtures
unless specifically authorised and appropriately protected; - copy
production data into informal test environments; - place secrets or
sensitive records in source control; - log full sensitive records merely
for debugging; or - include real credentials in technical due-diligence
packages.

7. Privileged API Routes

Any endpoint using a privileged Supabase client must:

authenticate the caller;

derive the caller's identity from verified authentication;

retrieve trusted role and organisation information server-side;

explicitly authorise the requested operation;

validate user-controlled input;

restrict the operation to the smallest necessary scope; and

fail closed when authentication, authorisation or validation is
uncertain.

Where a multi-step privileged operation partially succeeds, reasonable
rollback or recovery behaviour should be implemented to avoid
inconsistent records.

8. Testing Standard

Security-sensitive behaviour should be backed by automated regression
tests.

The minimum Castodia security suite should prove scenarios including:

unauthenticated callers cannot use privileged APIs;

support workers cannot perform manager-only operations;

organisation A cannot read organisation B service-user data;

organisation A cannot modify organisation B service-user data;

organisation A cannot access organisation B medication or care
records;

organisation A cannot access organisation B staff/HR records;

family users cannot access unrelated service users;

organisation managers cannot create platform administrator/owner
accounts; and

authorised operations continue to work for the correct organisation
and role.

A test suite must contain positive tests as well as denial tests.
Security that denies everyone is not functioning security.

9. Change Control

Before production deployment, changes should be proportionate to their
risk.

At minimum: - run linting; - run the production build; - run relevant
automated tests once available; - review authentication/RLS/Storage
changes carefully; - confirm database migrations target the correct
environment; and - smoke-test affected workflows.

Changes affecting authentication, tenant isolation, medication,
safeguarding, care records or privileged administration deserve
additional review.

10. Maintainability

Castodia should improve incrementally rather than through unnecessary
rewrites.

New code should favour: - clear domain boundaries; - small,
understandable functions; - reusable components and services where
genuinely useful; - meaningful TypeScript types; - explicit error
handling; - limited duplication; and - names that communicate intent.

Large existing components may be decomposed gradually when they are
changed or become difficult to reason about. Refactoring must preserve
working behaviour and should not be performed merely to make the
codebase look more sophisticated.

Avoid suppressing TypeScript errors without a documented reason.

11. Logging and Observability

Logs must help diagnose failures without becoming an uncontrolled copy
of sensitive care data.

Production logging should: - avoid complete care/medication/safeguarding
payloads; - avoid secrets and access tokens; - provide useful context
without unnecessary personal information; and - distinguish expected
user errors from unexpected system failures.

Temporary debug logging should be removed or deliberately disabled
before production where it exposes sensitive or noisy information.

12. Environment Separation

Production credentials belong to production.

Preview and development environments should increasingly use separate
Supabase projects or appropriately restricted credentials so that a
preview deployment cannot exercise unnecessary authority over production
data.

Production service-role credentials should not be distributed to
developers or environments that do not require them.

13. Documentation

Technical documentation is part of the product.

Material changes to architecture, security, deployment or developer
workflow should be reflected in the relevant repository documentation.

The repository should maintain: - README.md --- repository
introduction and developer entry point; - this CHARTER.md ---
engineering principles and non-negotiable rules; and - detailed
documents under docs/ covering architecture, security and operations.

Documentation must describe the system that actually exists.
Aspirational controls should be clearly identified as planned work
rather than presented as completed.

14. Dependency and Supply-Chain Discipline

Dependencies should be added deliberately.

Before adding a package, consider whether: - the functionality already
exists in the platform or current dependencies; - the package is
actively maintained; - the package introduces unnecessary client-side
code or privileges; and - the dependency materially improves the
implementation.

Security-relevant dependency alerts should be investigated and resolved
proportionately to their actual impact on Castodia.

15. Accessibility and Usability

Castodia is operational software, not merely a visual interface.

Changes should preserve: - keyboard accessibility where applicable; -
readable labels and error messages; - clear status and
destructive-action feedback; - usable layouts across supported screen
sizes; and - understandable language for care staff and families.

Visual polish must not make important care information harder to
understand.

16. Incident Principle

If a change creates a credible risk of cross-tenant exposure,
unauthorised privileged access or corruption of critical care
information, protecting data takes priority over keeping the affected
feature available.

The affected functionality should be contained, investigated, corrected
and tested before normal operation resumes.

17. Technical Due Diligence

Castodia's technical posture should be represented accurately.

Reviewers may be provided with architecture, security, deployment,
schema/RLS and testing evidence without being given production secrets
or real service-user records.

Known technical debt should be documented with proportionate remediation
plans rather than hidden.

18. Charter Ownership

This charter should evolve as Castodia matures, but its central
principles --- care-data protection, tenant isolation, verified
authority, least privilege and dependable change --- are not optional
implementation preferences.

Any proposed exception affecting those principles should be explicit,
documented and reviewed before implementation.

Castodia
Digital care management built around real care.
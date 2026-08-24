# Castodia

Castodia is a multi-role digital care management platform designed to support care organisations with day-to-day care recording, care planning, medication management, safeguarding, staff management, handovers and family engagement.

The platform is built around organisation-level data isolation, role-based access and structured digital care records.

## Technology Stack

Castodia is built using:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
  - PostgreSQL
  - Authentication
  - Row Level Security (RLS)
  - Storage
- Vercel

## Application Structure

The application supports several distinct user roles and interfaces.

### Support Worker Portal

Operational care functionality for support staff, including:

- Service-user access
- Timeline and care recording
- Handovers
- Medication workflows
- Personal care records
- Wellbeing observations
- Safeguarding reporting

### Manager Portal

Organisation-level management functionality, including:

- Service-user management
- Care plans
- Risk assessments
- Medication management
- Safeguarding management
- Staff administration
- Training and competency records
- Staff employment information
- Supervisions
- Organisation configuration

### Family Portal

Dedicated functionality allowing authorised family users to interact with information associated with the relevant service user.

### Castodia Platform Administration

Platform-level administration is separated from organisation management.

Platform roles include:

- `castodia_admin`
- `castodia_owner`

Organisation roles include:

- `manager`
- `support`

## Repository Structure

```text
app/
    Next.js routes, layouts and API routes

components/
    Shared application and design-system components

features/
    Domain-specific application functionality

    manager/
        Manager portal features

    support/
        Support worker features

    platform/
        Castodia platform administration

    shared/
        Shared domain functionality

hooks/
    Shared React hooks

lib/
    Application utilities and integrations

    supabase/
        Supabase browser, server and privileged clients

public/
    Static application assets

supabase/
    Supabase configuration and database migrations

docs/
    Technical and operational documentation
```

## Local Development

### Requirements

You will need:

- Node.js
- npm
- Access to an appropriate Supabase environment

Clone the repository and install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:3000
```

## Environment Variables

Castodia requires Supabase configuration.

Create a local:

```text
.env.local
```

with the appropriate environment-specific values.

Required variables include:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Security

`SUPABASE_SERVICE_ROLE_KEY` is a privileged server-side credential.

It must:

- never be exposed to browser code;
- never use the `NEXT_PUBLIC_` prefix;
- never be committed to source control;
- only be used by trusted server-side operations.

Environment files are excluded from Git.

Do not include `.env.local` or production credentials in technical due-diligence packages.

## Authentication and Authorisation

Authentication is provided by Supabase Auth.

Castodia combines several layers of access control:

1. Supabase authentication
2. Application role checks
3. Portal-level route protection
4. API authorisation
5. PostgreSQL Row Level Security
6. Organisation-level tenant isolation

The application recognises the principal roles:

```text
support
manager
castodia_admin
castodia_owner
```

Platform administration is separated from organisation-level administration.

## Database Security

Castodia uses PostgreSQL Row Level Security through Supabase.

RLS is enabled across the public application tables in the reviewed schema.

Policies are designed to prevent authenticated users from accessing records belonging to another organisation unless explicitly authorised.

Particular care must be taken when modifying:

- `organisation_id` relationships
- service-user access
- staff access
- medication records
- care plans
- safeguarding records
- family access
- privileged API routes

Changes to security policies should be tested against cross-organisation access scenarios before production deployment.

## Privileged Server Operations

Some server-side operations require the Supabase service role.

These operations must authenticate and authorise the requesting user before invoking privileged Supabase functionality.

Never trust caller-supplied values such as:

```text
userId
creatorId
organisationId
role
```

as proof of identity or authority.

Identity should be derived from a verified authenticated session/token, and organisation/role information should be resolved server-side.

## Database Migrations

Supabase configuration is stored under:

```text
supabase/
```

Database schema and security changes should be captured as migrations under:

```text
supabase/migrations/
```

Database changes should increasingly use migration-based deployment so the production schema and security configuration remain reproducible and reviewable.

## Development Checks

Before deployment, run:

```bash
npm run lint
```

and:

```bash
npm run build
```

Both should complete successfully before production deployment.

## Automated Testing

Automated testing is being introduced as part of the platform's engineering-hardening process.

Priority regression coverage includes:

- authentication
- role authorisation
- organisation isolation
- cross-tenant access prevention
- privileged API endpoints
- service-user access
- medication permissions
- safeguarding permissions
- family-user isolation

Security-sensitive changes should not rely solely on UI testing.

## Deployment

Castodia is deployed using Vercel.

Production deployments are associated with the production branch and production environment configuration.

Supabase credentials and other environment-specific values are managed through deployment environment variables rather than committed configuration.

Production and preview environments should use appropriately isolated credentials and infrastructure.

## Technical Documentation

Additional technical documentation is maintained under:

```text
docs/
```

Current documentation includes:

- `Castodia_Developer_Repository_Guide.docx`
- `Castodia_Technical_Architecture.docx`
- `Castodia_Security_Tenant_Isolation.docx`
- `Castodia_Deployment_Operations_Guide.docx`

These documents cover developer onboarding, architecture, security and tenant isolation, deployment and operational practices.

## Security Reporting

Security issues should not be disclosed through public issues or other public channels.

Potential vulnerabilities involving authentication, tenant isolation, service-role operations or sensitive care information should be treated as high priority and investigated before further deployment of the affected functionality.

## Project Status

Castodia is under active development.

The core platform and principal care-management functionality are implemented. Current engineering work includes security hardening, automated testing, documentation, maintainability improvements and production-readiness work.

---

**Castodia**

Digital care management built around real care.
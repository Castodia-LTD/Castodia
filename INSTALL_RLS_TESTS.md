# Castodia RLS Integration Test Installation

These tests are intentionally designed to execute against a real Supabase database so they can prove that PostgreSQL Row Level Security actually prevents cross-organisation access.

## Important safety rule

Use a NEW, DEDICATED, NON-PRODUCTION Supabase project.

Do not point these tests at the live Castodia database.

The test contains two safeguards:

1. `CASTODIA_ALLOW_TEST_DATABASE` must be exactly `YES`.
2. The test refuses to run if the Supabase URL contains the known Castodia production project reference.

## Files

Copy:

```text
tests/integration/tenant-isolation.test.ts
```

into:

```text
castodia/tests/integration/tenant-isolation.test.ts
```

Copy:

```text
.env.test.example
```

to the Castodia repository root.

Then create:

```text
.env.test.local
```

from the example and fill in ONLY credentials from the dedicated test Supabase project.

Your existing `.gitignore` already ignores `.env*`, but confirm `.env.test.local` is not tracked.

## The test project must contain the Castodia schema and RLS policies

The integration project needs the same relevant tables/policies as production. The clean long-term approach is to apply Castodia's version-controlled Supabase migrations to this test project.

Until the migration baseline is complete, do not manually improvise a fake schema and assume it proves production security.

## Running

Your existing `npm test` command will discover this test automatically.

Once configured:

```bash
npm test
```

The same report system will include both the existing create-staff tests and these integration tests.

## What this first integration suite proves

- Manager A can read Organisation A service users.
- Manager A cannot read Organisation B service users.
- Support A can read Organisation A service users.
- Support A cannot read Organisation B service users.
- Manager A cannot update Organisation B service users.
- Manager A cannot insert a service user into Organisation B.
- Support A cannot create service users.
- Manager B cannot read Organisation A service users.

The suite creates fake organisations/users/service users and performs best-effort cleanup after the run.

# Castodia Testing

Castodia uses Vitest for automated tests.

## Running the suite

```bash
npm test
```

Each run:

1. executes all `tests/**/*.test.ts` files;
2. prints the normal Vitest result to the terminal;
3. writes the raw Vitest JSON result to `test-results/latest.json`;
4. creates `test-results/latest-report.html`;
5. creates `test-results/latest-report.md`; and
6. saves timestamped HTML and Markdown copies under `test-results/history/`.

Open `test-results/latest-report.html` in a browser for the easiest report to read.

## Current starter coverage

The starter suite tests the privileged staff-creation endpoint:

- unauthenticated callers are denied;
- invalid sessions are denied;
- support workers cannot create staff;
- platform-level roles cannot be created through the organisation staff route;
- a verified manager's organisation is used for the new account; and
- a failed profile insert rolls back the newly-created Supabase Auth user.

These are API-level tests using mocked Supabase clients. They are deliberately independent of production data.

## Next stage: integration security tests

The next testing phase should use a dedicated non-production Supabase project and two fake organisations.

That suite should directly verify RLS and Storage isolation, including:

- Organisation A cannot read Organisation B service users.
- Organisation A cannot modify Organisation B service users.
- Organisation A cannot read Organisation B medication records.
- Organisation A cannot read Organisation B care-plan/risk data.
- Organisation A cannot access Organisation B HR/staff records.
- Family A cannot access an unrelated service user.
- Storage objects cannot be modified across organisations.
- Correctly-authorised users can still complete the intended operations.

Do not run destructive integration tests against the production Castodia database.

## Test evidence for technical due diligence

`test-results/` should normally be ignored by Git because each run generates new files.

When a formal evidence snapshot is required, copy a clean passing report into:

```text
docs/test-evidence/
```

using a descriptive filename, for example:

```text
2026-08-17-security-regression-report.html
```

Only save evidence generated against fake/non-production test data.

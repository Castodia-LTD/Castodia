# RLS Integration Testing Addition

The `tests/integration/tenant-isolation.test.ts` suite performs real database-level security tests against a dedicated Supabase test environment.

Unlike mocked API tests, these checks authenticate as real fake users and submit queries directly to Supabase. This intentionally bypasses Castodia's UI so that the test evaluates the database security boundary itself.

The suite must never target production.

Environment values are loaded from `.env.test.local`, which must remain excluded from source control.

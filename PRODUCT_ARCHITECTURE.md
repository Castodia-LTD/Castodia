# Castodia Product Architecture

The repository is one Castodia platform codebase with explicit product boundaries.

## CastodiaCare

Routes:
- `/care/manager/*`
- `/care/support/*`
- `/api/care/*`

Code ownership:
- `features/care/*`
- `components/care/*`
- `lib/care/*`
- `hooks/care/*`
- `components/native/ios/care/*`

The current native iOS wrapper is CastodiaCare:
- App name: `CastodiaCare`
- Bundle ID: `uk.co.castodia.care`

Manager and Support remain separate workflows inside the Care product.

## CastodiaCore

Routes:
- `/core/*`
- `/api/core/*`

Code ownership:
- `features/core/*`
- `components/core/*`
- `lib/core/*`

Core owns Castodia administration such as organisations, Core users, issue management and demonstration tooling.

## CastodiaFamily

Routes:
- `/family/*`

Code ownership:
- `features/family/*`
- `components/family/*`
- `lib/family/*`
- `hooks/family/*`

Family remains a separate user experience while sharing Castodia authentication and the same underlying tenancy model.

## Shared infrastructure

The following remain product-neutral:
- `lib/auth/*`
- `lib/supabase/*`
- `components/layout/*`
- `components/castodia/*`
- `components/auth/*`
- `components/issues/*`
- `hooks/auth/*`
- `hooks/native/*`
- `config/products.ts`

## Authentication

The web login remains automatic and resolves the user's existing Castodia access.

The current native iOS wrapper is explicitly product-scoped to `care`, so a Core-only or Family-only account is not routed out of CastodiaCare into another product.

The authentication helper already accepts `care`, `core`, `family` or `auto`, which provides the foundation for future dedicated CastodiaFamily/Core wrappers or entry points without creating separate identities.

## Compatibility

`next.config.ts` contains temporary redirects from the previous namespaces:
- `/manager/*` -> `/care/manager/*`
- `/support/*` -> `/care/support/*`
- `/platform/*` -> `/core/*`
- old Care API paths -> `/api/care/*`
- `/api/platform/*` -> `/api/core/*`

These can be removed after old bookmarks/clients are no longer in use.

## Database naming

A new Supabase migration renames the remaining Platform-specific database objects to Core terminology:
- `public.platform_issues` -> `public.core_issues`
- `private.is_platform_admin()` -> `private.is_core_admin()`
- associated issue constraints/identity sequence are renamed.

Historical migration files are intentionally unchanged. Migration history should describe the schema as it existed at that point in time.

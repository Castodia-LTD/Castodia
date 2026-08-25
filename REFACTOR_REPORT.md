# Castodia Product Separation & Codebase Cleanup

## Completed product separation

The repository now has explicit product boundaries rather than top-level Manager / Support / Platform folders.

### CastodiaCare
- `app/care/manager/*`
- `app/care/support/*`
- `app/api/care/*`
- `features/care/*`
- `components/care/*`
- `lib/care/*`
- `hooks/care/*`
- native Manager/Support presentation under `components/native/ios/care/*`

### CastodiaCore
- renamed `app/platform` -> `app/core`
- renamed `app/api/platform` -> `app/api/core`
- renamed `features/platform` -> `features/core`
- renamed `components/platform` -> `components/core`
- renamed Platform-prefixed Core feature files, components and identifiers to Core terminology
- renamed Platform navigation to `coreNavigation`
- Core shell portal is now `core`

### CastodiaFamily
- Family remains under `/family` but now has a formal `features/family` domain.
- Family home orchestration was moved out of the presentation component.
- Family shell was decomposed into controller, sidebar, brand, loading and decoration components.
- Removed Family navigation items that pointed to routes which did not exist.

## Route cleanup

New canonical routes:
- Manager: `/care/manager/*`
- Support: `/care/support/*`
- Core: `/core/*`
- Family: `/family/*`

Care-specific API routes are now under `/api/care/*`.
Core API routes are under `/api/core/*`.

Temporary compatibility redirects preserve old URLs.

## Authentication cleanup

- Central product registry added at `config/products.ts`.
- Login resolver is product-aware (`care`, `core`, `family`, `auto`).
- The iOS wrapper authenticates specifically into CastodiaCare.
- Core-only accounts can no longer be sent into Core from the CastodiaCare native login.
- Generic dashboard redirect now handles Owner/Admin, Manager and Support correctly.

## Native app identity

Updated native iOS identity:
- `CastodiaCare`
- `uk.co.castodia.care`

Updated Capacitor config and generated Xcode bundle identifier/display name references.
The temporary forced-iOS development hook was replaced with the real Capacitor platform detector.

## Database rename

Added migration:
`supabase/migrations/20260825013000_rename_platform_to_core.sql`

It renames:
- `platform_issues` -> `core_issues`
- `is_platform_admin()` -> `is_core_admin()`
- related constraints and identity sequence.

Application issue handling now uses `core_issues`.

## Dead / broken code removed or corrected

- Removed the obsolete `/app/admin/reports` duplicate route; a compatibility redirect remains.
- Removed the broken development demo route that called a non-existent API.
- Removed unused Support menu registry.
- Removed unreachable legacy service-user cards/types, timeline types and unused auth guards.
- Removed unused Care admin/timeline type files identified by the static reachability pass.
- Fixed supervision navigation to the real `/care/manager/staff/supervisions` route.
- Removed Family navigation links for unimplemented `/family/memories` and `/family/settings` pages.
- Removed debug logging from the Supabase route guard.

## Structural maturity retained from the previous pass

- `AppShell.tsx` remains a small coordinator.
- Desktop/mobile browser shell pieces remain decomposed.
- iOS navigation/dashboard components remain shared and isolated from browser presentation.
- route `page.tsx` files remain thin.

## Static validation

Performed after the product refactor:
- 411 TypeScript/TSX files syntax-transpiled successfully: 0 syntax errors.
- Internal alias/relative import resolution scan: 0 missing imports.
- Static import reachability scan: 0 unreachable source modules in `components`, `features`, `hooks`, `lib` or `config`.
- Old canonical `/manager`, `/support` and `/platform` route references in source: 0 (compatibility redirects excluded).
- No old top-level Manager / Support / Platform source directories remain outside the new Care/Core boundaries.

## Full runtime validation still required

The archive intentionally does not contain `node_modules`. A full Next.js build, lint and Vitest run therefore still needs to be performed on the development machine after dependency installation.

Some domain-heavy screens remain large internally (eMAR, Calendar, Insights, staff management and Core issue/user management). They were not mechanically split during the namespace migration because doing so without full runtime regression testing would create unnecessary clinical/business-logic risk. Their ownership is now correct and they can be matured feature-by-feature without another product-boundary migration.

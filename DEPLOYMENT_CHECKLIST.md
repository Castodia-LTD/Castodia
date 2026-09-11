# Product Refactor Deployment Checklist

This refactor changes application routes and renames live Supabase objects. Use the following order.

1. Back up the current working repository and production database.
2. Review `supabase/migrations/20260825013000_rename_platform_to_core.sql`.
3. Apply the Supabase migration before deploying the new application source.
4. Install dependencies with the project's normal npm workflow.
5. Run:
   - `npm run build`
   - `npm test`
   - `npm run lint`
6. Start the app locally and smoke-test:
   - Care Manager login and `/care/manager/dashboard`
   - Care Support login and `/care/support/dashboard`
   - Manager -> Support portal switch
   - CastodiaCore owner/admin login and `/core/dashboard`
   - CastodiaFamily login and `/family`
   - issue submission and Core issue management
   - Core organisation/user administration
7. Confirm the old `/manager`, `/support` and `/platform` URLs redirect correctly.
8. Restore/confirm the real Capacitor platform detector (this package already contains the real detector, not the forced-iOS preview hook).
9. Run `npx cap sync ios` after installing dependencies.
10. In Xcode, confirm the native target uses:
    - Display name: `CastodiaCare`
    - Bundle ID: `uk.co.castodia.care`
11. Test the native Care login to confirm Core-only/Family-only accounts are refused rather than routed into another product.
12. Confirm the deployed Apple association contains Team ID `4C4AT5B42L`.
13. Confirm `https://app.castodia.co.uk/.well-known/apple-app-site-association` returns HTTP 200, `application/json`, and both production bundle identifiers.
14. In Apple Developer, enable Associated Domains for:
    - `uk.co.castodia.care`
    - `uk.co.castodia.family`
15. Refresh the provisioning profiles, build both apps, and confirm their signed entitlements contain `webcredentials:app.castodia.co.uk`.
16. On a physical iPhone or iPad with Password AutoFill enabled, sign in once and save the credentials, then sign out and confirm Apple Passwords offers them on both native login screens.

Do not deploy the code that references `core_issues` before applying the database migration.

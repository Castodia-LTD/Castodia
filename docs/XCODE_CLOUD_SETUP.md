# CastodiaCare Xcode Cloud setup

The repository is prepared so Xcode Cloud can install the required Node.js dependencies and regenerate the Capacitor iOS files on every clean checkout.

## One-time setup in Xcode

1. Open `ios/App/App.xcodeproj` in Xcode while signed into the Apple developer account for team `4C4AT5B42L`.
2. Confirm that the `App` target uses automatic signing and the Castodia team.
3. Select **Product > Xcode Cloud > Create Workflow**.
4. Choose the shared `App` scheme and connect the `Castodia-LTD/Castodia` GitHub repository.
5. Configure an archive action for iOS and distribution to TestFlight/App Store Connect.
6. To conserve the included compute allowance, initially use manual starts or restrict automatic builds to changes on `main`.
7. Run the first build and verify that the post-clone log ends with `Capacitor iOS project is ready for Xcode Cloud.`

## Build behaviour

Xcode Cloud automatically finds `ci_scripts/ci_post_clone.sh` beside the Xcode project. The script:

- ensures Node.js 22 or newer is available;
- installs the exact dependency versions in `package-lock.json`;
- runs `cap sync ios` to generate the ignored Capacitor configuration and bundled web assets; and
- leaves Xcode to resolve Swift packages and archive the shared `App` scheme.

The native app loads `https://app.castodia.co.uk`, so this workflow does not run a production Next.js build and does not require Supabase environment variables.

## Settings already committed

- Bundle identifier: `uk.co.castodia.care`
- Apple development team: `4C4AT5B42L`
- Deployment target: iOS 15
- Next native build number: 2
- Signing: automatic
- Associated Domains entitlement: `webcredentials:app.castodia.co.uk`
- Shared scheme: `App`

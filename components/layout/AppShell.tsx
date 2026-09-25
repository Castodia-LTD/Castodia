"use client";

import { useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { ReportIssueModal } from "@/components/issues/ReportIssueModal";
import { IOSAppShell } from "@/components/native/ios/IOSAppShell";
import { useOrganisationModules } from "@/hooks/core/useOrganisationModules";
import { moduleDefinitionByKey } from "@/lib/core/modules/availableModules";
import { moduleKeysForPath } from "@/lib/core/modules/routeModules";

import { FeatureUnavailable } from "./FeatureUnavailable";
import { AppShellDesktopSidebar } from "./app-shell/AppShellDesktopSidebar";
import { AppShellMobile } from "./app-shell/AppShellMobile";
import type { AppShellLink, AppShellPortal } from "./app-shell/appShellTypes";
import { useAppShellController } from "./app-shell/useAppShellController";

export type {
  AppShellIcon,
  AppShellLink,
  AppShellPortal,
} from "./app-shell/appShellTypes";

type Props = {
  children: ReactNode;
  links?: AppShellLink[];
  portal?: AppShellPortal;
};

export function AppShell({ children, links = [], portal }: Props) {
  const pathname = usePathname();
  const shell = useAppShellController({ links, portal });
  const shouldLoadModules = portal === "care-manager" || portal === "care-support";
  const moduleState = useOrganisationModules(shouldLoadModules);

  const visibleLinks = useMemo(() => {
    if (!shouldLoadModules) return links;
    if (moduleState.loading) return [];

    return links.filter(
      (link) => !link.featureKey || moduleState.isEnabled(link.featureKey),
    );
  }, [links, moduleState, shouldLoadModules]);

  const blockedModule = useMemo(() => {
    if (!shouldLoadModules || moduleState.loading) return null;

    return moduleKeysForPath(pathname).find(
      (moduleKey) => !moduleState.isEnabled(moduleKey),
    ) ?? null;
  }, [moduleState, pathname, shouldLoadModules]);

  const pageContent = moduleState.loading && shouldLoadModules ? (
    <div className="flex min-h-[420px] items-center justify-center text-sm font-medium text-slate-500">
      Loading Castodia...
    </div>
  ) : blockedModule ? (
    <FeatureUnavailable
      featureName={
        moduleDefinitionByKey.get(blockedModule)?.label ?? "This feature"
      }
    />
  ) : (
    children
  );

  if (!shell.nativePlatformLoaded) return null;

  if (!shell.isAuthenticatedShell) {
    return <div className="min-h-dvh w-full">{pageContent}</div>;
  }

  if (shell.isIOS) {
    return (
      <>
        <IOSAppShell
          portalHome={shell.portal.home}
          portalName={shell.portal.name}
          isDashboard={shell.isPortalDashboard}
          canSwitchPortal={shell.portal.canSwitch}
          canReportIssue={shell.portal.canReportIssue}
          switchPortalHref={shell.portal.switchHref}
          switchPortalLabel={shell.portal.switchLabel}
          loggingOut={shell.ui.loggingOut}
          onOpenIssue={shell.actions.openIssue}
          onLogout={() => void shell.actions.logout()}
        >
          {pageContent}
        </IOSAppShell>

        {shell.portal.canReportIssue ? (
          <ReportIssueModal
            open={shell.ui.reportIssueOpen}
            onClose={shell.actions.closeIssue}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="flex min-h-dvh w-full bg-[#f7f9fb] text-slate-950">
      <AppShellDesktopSidebar
        links={visibleLinks}
        name={shell.profile.name}
        photoUrl={shell.profile.photoUrl}
        initials={shell.profile.initials}
        greeting={shell.profile.greeting}
        roleLabel={shell.profile.roleLabel}
        portalName={shell.portal.name}
        sidebarCollapsed={shell.ui.sidebarCollapsed}
        sidebarPreferenceLoaded={shell.ui.sidebarPreferenceLoaded}
        canSwitchPortal={shell.portal.canSwitch}
        canReportIssue={shell.portal.canReportIssue}
        switchPortalHref={shell.portal.switchHref}
        switchPortalLabel={shell.portal.switchLabel}
        loggingOut={shell.ui.loggingOut}
        onToggleSidebar={shell.actions.toggleSidebar}
        onOpenIssue={shell.actions.openIssue}
        onLogout={() => void shell.actions.logout()}
        isLinkActive={shell.isLinkActive}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <AppShellMobile
          links={visibleLinks}
          portalHome={shell.portal.home}
          portalName={shell.portal.name}
          name={shell.profile.name}
          photoUrl={shell.profile.photoUrl}
          initials={shell.profile.initials}
          greeting={shell.profile.greeting}
          roleLabel={shell.profile.roleLabel}
          canSwitchPortal={shell.portal.canSwitch}
          canReportIssue={shell.portal.canReportIssue}
          switchPortalHref={shell.portal.switchHref}
          switchPortalLabel={shell.portal.switchLabel}
          switchPortalShortLabel={shell.portal.switchShortLabel}
          loggingOut={shell.ui.loggingOut}
          mobileMenuOpen={shell.ui.mobileMenuOpen}
          onOpenMenu={shell.actions.openMobileMenu}
          onCloseMenu={shell.actions.closeMobileMenu}
          onOpenIssue={shell.actions.openIssueFromMobile}
          onLogout={() => void shell.actions.logout()}
          isLinkActive={shell.isLinkActive}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden bg-[#fbfcfd] px-4 pb-[calc(82px+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pb-0 xl:px-10">
          {pageContent}
        </main>
      </div>

      <ReportIssueModal
        open={shell.ui.reportIssueOpen}
        onClose={shell.actions.closeIssue}
      />
    </div>
  );
}

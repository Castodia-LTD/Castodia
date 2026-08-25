"use client";

import type { ReactNode } from "react";

import { ReportIssueModal } from "@/components/issues/ReportIssueModal";
import { IOSAppShell } from "@/components/native/ios/IOSAppShell";

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
  const shell = useAppShellController({ links, portal });

  if (!shell.nativePlatformLoaded) return null;

  if (!shell.isAuthenticatedShell) {
    return <div className="min-h-dvh w-full">{children}</div>;
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
          {children}
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
        links={links}
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
          links={links}
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
          {children}
        </main>
      </div>

      <ReportIssueModal
        open={shell.ui.reportIssueOpen}
        onClose={shell.actions.closeIssue}
      />
    </div>
  );
}

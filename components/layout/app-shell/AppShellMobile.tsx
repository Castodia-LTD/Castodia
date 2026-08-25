"use client";

import { AppShellMobileBottomNav } from "./AppShellMobileBottomNav";
import { AppShellMobileDrawer } from "./AppShellMobileDrawer";
import { AppShellMobileHeader } from "./AppShellMobileHeader";
import { AppShellMobileIssueButton } from "./AppShellMobileIssueButton";
import type { AppShellLink } from "./appShellTypes";

type Props = {
  links: AppShellLink[];
  portalHome: string;
  portalName: string;
  name: string;
  photoUrl: string | null;
  initials: string;
  greeting: string;
  roleLabel: string;
  canSwitchPortal: boolean;
  canReportIssue: boolean;
  switchPortalHref: string;
  switchPortalLabel: string;
  switchPortalShortLabel: string;
  loggingOut: boolean;
  mobileMenuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onOpenIssue: () => void;
  onLogout: () => void;
  isLinkActive: (link: AppShellLink) => boolean;
};

export function AppShellMobile(props: Props) {
  return (
    <>
      <AppShellMobileHeader
        portalHome={props.portalHome}
        portalName={props.portalName}
        name={props.name}
        photoUrl={props.photoUrl}
        initials={props.initials}
        greeting={props.greeting}
        roleLabel={props.roleLabel}
        canSwitchPortal={props.canSwitchPortal}
        switchPortalHref={props.switchPortalHref}
        switchPortalShortLabel={props.switchPortalShortLabel}
        onOpenMenu={props.onOpenMenu}
      />

      {props.canReportIssue ? (
        <AppShellMobileIssueButton onOpenIssue={props.onOpenIssue} />
      ) : null}

      <AppShellMobileBottomNav
        links={props.links}
        mobileMenuOpen={props.mobileMenuOpen}
        onOpenMenu={props.onOpenMenu}
        isLinkActive={props.isLinkActive}
      />

      <AppShellMobileDrawer
        links={props.links}
        open={props.mobileMenuOpen}
        portalName={props.portalName}
        name={props.name}
        photoUrl={props.photoUrl}
        initials={props.initials}
        greeting={props.greeting}
        roleLabel={props.roleLabel}
        canSwitchPortal={props.canSwitchPortal}
        canReportIssue={props.canReportIssue}
        switchPortalHref={props.switchPortalHref}
        switchPortalLabel={props.switchPortalLabel}
        loggingOut={props.loggingOut}
        onClose={props.onCloseMenu}
        onOpenIssue={props.onOpenIssue}
        onLogout={props.onLogout}
        isLinkActive={props.isLinkActive}
      />
    </>
  );
}

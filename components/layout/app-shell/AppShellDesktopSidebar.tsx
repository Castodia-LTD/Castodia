"use client";

import { AppShellDesktopActions } from "./AppShellDesktopActions";
import { AppShellDesktopBrand } from "./AppShellDesktopBrand";
import { AppShellDesktopNav } from "./AppShellDesktopNav";
import type { AppShellLink } from "./appShellTypes";

type Props = {
  links: AppShellLink[];
  name: string;
  photoUrl: string | null;
  initials: string;
  greeting: string;
  roleLabel: string;
  portalName: string;
  sidebarCollapsed: boolean;
  sidebarPreferenceLoaded: boolean;
  canSwitchPortal: boolean;
  canReportIssue: boolean;
  switchPortalHref: string;
  switchPortalLabel: string;
  loggingOut: boolean;
  onToggleSidebar: () => void;
  onOpenIssue: () => void;
  onLogout: () => void;
  isLinkActive: (link: AppShellLink) => boolean;
};

export function AppShellDesktopSidebar(props: Props) {
  return (
    <aside
      className={[
        "sticky top-0 hidden h-dvh shrink-0 overflow-hidden border-r border-slate-200",
        "bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7]",
        "transition-[width] duration-300 ease-out lg:flex lg:flex-col",
        props.sidebarPreferenceLoaded && props.sidebarCollapsed ? "w-[76px]" : "w-[270px]",
      ].join(" ")}
    >
      <AppShellDesktopBrand
        name={props.name}
        photoUrl={props.photoUrl}
        initials={props.initials}
        greeting={props.greeting}
        roleLabel={props.roleLabel}
        portalName={props.portalName}
        collapsed={props.sidebarCollapsed}
        onToggle={props.onToggleSidebar}
      />

      <AppShellDesktopNav
        links={props.links}
        collapsed={props.sidebarCollapsed}
        isLinkActive={props.isLinkActive}
      />

      <AppShellDesktopActions
        collapsed={props.sidebarCollapsed}
        canSwitchPortal={props.canSwitchPortal}
        canReportIssue={props.canReportIssue}
        switchPortalHref={props.switchPortalHref}
        switchPortalLabel={props.switchPortalLabel}
        loggingOut={props.loggingOut}
        onOpenIssue={props.onOpenIssue}
        onLogout={props.onLogout}
      />
    </aside>
  );
}

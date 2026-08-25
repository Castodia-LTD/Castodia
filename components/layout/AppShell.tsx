"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import { ReportIssueModal } from "@/components/issues/ReportIssueModal";
import { IOSAppShell } from "@/components/native/ios/IOSAppShell";

import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { supabase } from "@/lib/supabase";

import { AppShellDesktopSidebar } from "./app-shell/AppShellDesktopSidebar";
import { AppShellMobile } from "./app-shell/AppShellMobile";

import {
  getRoleLabel,
  portalHomes,
  portalNames,
  SIDEBAR_STORAGE_KEY,
} from "./app-shell/appShellConfig";

import { useAppShellProfile } from "./app-shell/useAppShellProfile";

import type {
  AppShellLink,
  AppShellPortal,
} from "./app-shell/appShellTypes";

export type {
  AppShellIcon,
  AppShellLink,
  AppShellPortal,
} from "./app-shell/appShellTypes";

type AppShellProps = {
  children: ReactNode;
  links?: AppShellLink[];
  portal?: AppShellPortal;
};

export function AppShell({
  children,
  links = [],
  portal,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    isIOS,
    platformLoaded,
  } = useNativePlatform();

  const isAuthenticatedShell =
    Boolean(portal) &&
    links.length > 0;

  const {
    name,
    role,
    photoUrl,
  } = useAppShellProfile(
    isAuthenticatedShell,
  );

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    reportIssueOpen,
    setReportIssueOpen,
  ] = useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    sidebarPreferenceLoaded,
    setSidebarPreferenceLoaded,
  ] = useState(false);

  useEffect(() => {
    const savedValue =
      window.localStorage.getItem(
        SIDEBAR_STORAGE_KEY,
      );

    setSidebarCollapsed(
      savedValue === "true",
    );

    setSidebarPreferenceLoaded(
      true,
    );
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileMenuOpen]);

  const greeting =
    useMemo(() => {
      const hour =
        new Date().getHours();

      if (hour < 12) {
        return "Good morning";
      }

      if (hour < 17) {
        return "Good afternoon";
      }

      return "Good evening";
    }, []);

  const initials =
    useMemo(() => {
      if (!name.trim()) {
        return "?";
      }

      return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) =>
          part
            .charAt(0)
            .toUpperCase(),
        )
        .join("");
    }, [name]);

  function isLinkActive(
    link: AppShellLink,
  ) {
    if (link.exact) {
      return pathname === link.href;
    }

    return (
      pathname === link.href ||
      pathname.startsWith(
        `${link.href}/`,
      )
    );
  }

  function toggleSidebar() {
    setSidebarCollapsed(
      (currentValue) => {
        const nextValue =
          !currentValue;

        window.localStorage.setItem(
          SIDEBAR_STORAGE_KEY,
          String(nextValue),
        );

        return nextValue;
      },
    );
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Unable to log out:",
        error.message,
      );

      setLoggingOut(false);
      return;
    }

    setMobileMenuOpen(false);

    router.replace("/");
    router.refresh();
  }

  if (!platformLoaded) {
    return null;
  }

  if (!isAuthenticatedShell) {
    return (
      <div className="min-h-dvh w-full">
        {children}
      </div>
    );
  }

  const portalHome =
    portal
      ? portalHomes[portal]
      : "/";

  const portalName =
    portal
      ? portalNames[portal]
      : "";

  const roleLabel =
    getRoleLabel(role);

  const canSwitchPortal =
    portal !== "platform" &&
    role === "manager";

  const canReportIssue =
    portal === "manager" ||
    portal === "support";

  const switchPortalHref =
    portal === "manager"
      ? "/support/dashboard"
      : "/manager/dashboard";

  const switchPortalLabel =
    portal === "manager"
      ? "Switch to Support Portal"
      : "Return to Manager Portal";

  const switchPortalShortLabel =
    portal === "manager"
      ? "Switch to Support"
      : "Return to Manager";

  /*
   * Native iOS shell
   *
   * Dashboard:
   * - no Back/Home controls
   *
   * Subpages:
   * - Back
   * - Home → current portal dashboard
   *
   * Web navigation is never rendered inside
   * the native iOS application.
   */
  if (isIOS) {
  const isPortalDashboard =
    pathname === portalHome;

  return (
    <>
      <IOSAppShell
        portalHome={portalHome}
        portalName={portalName}
        isDashboard={
          isPortalDashboard
        }
        canSwitchPortal={
          canSwitchPortal
        }
        canReportIssue={
          canReportIssue
        }
        switchPortalHref={
          switchPortalHref
        }
        switchPortalLabel={
          switchPortalLabel
        }
        loggingOut={
          loggingOut
        }
        onOpenIssue={() =>
          setReportIssueOpen(
            true,
          )
        }
        onLogout={() =>
          void handleLogout()
        }
      >
        {children}
      </IOSAppShell>

      {canReportIssue ? (
        <ReportIssueModal
          open={
            reportIssueOpen
          }
          onClose={() =>
            setReportIssueOpen(
              false,
            )
          }
        />
      ) : null}
    </>
  );
}

  /*
   * Web / browser shell
   */
  return (
    <div className="flex min-h-dvh w-full bg-[#f7f9fb] text-slate-950">
      <AppShellDesktopSidebar
        links={links}
        name={name}
        photoUrl={photoUrl}
        initials={initials}
        greeting={greeting}
        roleLabel={roleLabel}
        portalName={portalName}
        sidebarCollapsed={
          sidebarCollapsed
        }
        sidebarPreferenceLoaded={
          sidebarPreferenceLoaded
        }
        canSwitchPortal={
          canSwitchPortal
        }
        canReportIssue={
          canReportIssue
        }
        switchPortalHref={
          switchPortalHref
        }
        switchPortalLabel={
          switchPortalLabel
        }
        loggingOut={
          loggingOut
        }
        onToggleSidebar={
          toggleSidebar
        }
        onOpenIssue={() =>
          setReportIssueOpen(
            true,
          )
        }
        onLogout={() =>
          void handleLogout()
        }
        isLinkActive={
          isLinkActive
        }
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <AppShellMobile
          links={links}
          portalHome={
            portalHome
          }
          portalName={
            portalName
          }
          name={name}
          photoUrl={
            photoUrl
          }
          initials={
            initials
          }
          greeting={
            greeting
          }
          roleLabel={
            roleLabel
          }
          canSwitchPortal={
            canSwitchPortal
          }
          canReportIssue={
            canReportIssue
          }
          switchPortalHref={
            switchPortalHref
          }
          switchPortalLabel={
            switchPortalLabel
          }
          switchPortalShortLabel={
            switchPortalShortLabel
          }
          loggingOut={
            loggingOut
          }
          mobileMenuOpen={
            mobileMenuOpen
          }
          onOpenMenu={() =>
            setMobileMenuOpen(
              true,
            )
          }
          onCloseMenu={() =>
            setMobileMenuOpen(
              false,
            )
          }
          onOpenIssue={() => {
            setMobileMenuOpen(
              false,
            );

            setReportIssueOpen(
              true,
            );
          }}
          onLogout={() =>
            void handleLogout()
          }
          isLinkActive={
            isLinkActive
          }
        />

        <main
          className={[
            "min-h-0 min-w-0 flex-1 overflow-x-hidden bg-[#fbfcfd]",
            "px-4 sm:px-6 lg:px-8 xl:px-10",
            "pb-[calc(82px+env(safe-area-inset-bottom))] lg:pb-0",
          ].join(" ")}
        >
          {children}
        </main>
      </div>

      <ReportIssueModal
        open={
          reportIssueOpen
        }
        onClose={() =>
          setReportIssueOpen(
            false,
          )
        }
      />
    </div>
  );
}
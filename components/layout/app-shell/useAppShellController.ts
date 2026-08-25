"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { CASTODIA_PRODUCTS } from "@/config/products";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { supabase } from "@/lib/supabase";

import {
  getRoleLabel,
  portalHomes,
  portalNames,
  SIDEBAR_STORAGE_KEY,
} from "./appShellConfig";
import type { AppShellLink, AppShellPortal } from "./appShellTypes";
import { useAppShellProfile } from "./useAppShellProfile";

type Options = {
  links: AppShellLink[];
  portal?: AppShellPortal;
};

export function useAppShellController({ links, portal }: Options) {
  const pathname = usePathname();
  const router = useRouter();
  const { isIOS, nativePlatformLoaded } = useNativePlatform();

  const isAuthenticatedShell = Boolean(portal) && links.length > 0;
  const { name, role, photoUrl } = useAppShellProfile(isAuthenticatedShell);

  const [loggingOut, setLoggingOut] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPreferenceLoaded, setSidebarPreferenceLoaded] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(
      window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true",
    );
    setSidebarPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const initials = useMemo(() => {
    if (!name.trim()) return "?";

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [name]);

  const isLinkActive = useCallback(
    (link: AppShellLink) => {
      if (link.exact) return pathname === link.href;
      return pathname === link.href || pathname.startsWith(`${link.href}/`);
    },
    [pathname],
  );

  function toggleSidebar() {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to log out:", error.message);
      setLoggingOut(false);
      return;
    }

    setMobileMenuOpen(false);
    router.replace("/");
    router.refresh();
  }

  const portalHome = portal ? portalHomes[portal] : "/";
  const portalName = portal ? portalNames[portal] : "";
  const roleLabel = getRoleLabel(role);
  const isCareManager = portal === "care-manager";
  const isCareSupport = portal === "care-support";

  const canSwitchPortal = role === "manager" && (isCareManager || isCareSupport);
  const canReportIssue = isCareManager || isCareSupport;

  const switchPortalHref = isCareManager
    ? CASTODIA_PRODUCTS.care.supportHome
    : CASTODIA_PRODUCTS.care.managerHome;
  const switchPortalLabel = isCareManager
    ? "Switch to Support Portal"
    : "Return to Manager Portal";
  const switchPortalShortLabel = isCareManager
    ? "Switch to Support"
    : "Return to Manager";

  return {
    nativePlatformLoaded,
    isIOS,
    isAuthenticatedShell,
    isPortalDashboard: pathname === portalHome,
    profile: { name, role, photoUrl, initials, greeting, roleLabel },
    portal: {
      home: portalHome,
      name: portalName,
      canSwitch: canSwitchPortal,
      canReportIssue,
      switchHref: switchPortalHref,
      switchLabel: switchPortalLabel,
      switchShortLabel: switchPortalShortLabel,
    },
    ui: {
      loggingOut,
      reportIssueOpen,
      mobileMenuOpen,
      sidebarCollapsed,
      sidebarPreferenceLoaded,
    },
    actions: {
      toggleSidebar,
      openIssue: () => setReportIssueOpen(true),
      closeIssue: () => setReportIssueOpen(false),
      openMobileMenu: () => setMobileMenuOpen(true),
      closeMobileMenu: () => setMobileMenuOpen(false),
      openIssueFromMobile: () => {
        setMobileMenuOpen(false);
        setReportIssueOpen(true);
      },
      logout,
    },
    isLinkActive,
  };
}

import {
  BarChart3,
  Bug,
  Building2,
  CalendarDays,
  ClipboardList,
  Clock3,
  HeartPulse,
  Home,
  LayoutDashboard,
  Pill,
  Settings,
  UserRound,
  Users,
} from "lucide-react";

import type {
  AppShellPortal,
  IconMap,
} from "./appShellTypes";

export const iconMap: IconMap = {
  dashboard: LayoutDashboard,
  home: Home,
  calendar: CalendarDays,
  "service-users": UserRound,
  staff: Users,
  emar: Pill,
  safeguarding: HeartPulse,
  compliance: BarChart3,
  settings: Settings,
  timelines: Clock3,
  handovers: ClipboardList,
  organisations: Building2,
  issues: Bug,
  "admin-users": Users,
};

export const portalNames: Record<
  AppShellPortal,
  string
> = {
  manager: "Manager Portal",
  support: "Support Portal",
  platform: "Platform Admin",
};

export const portalHomes: Record<
  AppShellPortal,
  string
> = {
  manager: "/manager/dashboard",
  support: "/support/dashboard",
  platform: "/platform/dashboard",
};

export const MOBILE_NAV_LIMIT = 4;

export const SIDEBAR_STORAGE_KEY =
  "castodia-sidebar-collapsed";

export function getRoleLabel(
  role: string | null,
) {
  switch (role) {
    case "manager":
      return "Manager";

    case "support":
      return "Support Worker";

    case "castodia_admin":
      return "Castodia Admin";

    case "castodia_owner":
      return "Castodia Owner";

    default:
      return "Castodia User";
  }
}
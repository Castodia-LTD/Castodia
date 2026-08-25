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

import { CASTODIA_PRODUCTS } from "@/config/products";

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
  "care-manager": "Manager Portal",
  "care-support": "Support Portal",
  core: "CastodiaCore",
};

export const portalHomes: Record<
  AppShellPortal,
  string
> = {
  "care-manager": CASTODIA_PRODUCTS.care.managerHome,
  "care-support": CASTODIA_PRODUCTS.care.supportHome,
  core: CASTODIA_PRODUCTS.core.home,
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
      return "CastodiaCore Admin";

    case "castodia_owner":
      return "Castodia Owner";

    default:
      return "Castodia User";
  }
}
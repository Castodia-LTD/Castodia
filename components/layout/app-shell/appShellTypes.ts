import type { LucideIcon } from "lucide-react";

export type AppShellIcon =
  | "dashboard"
  | "home"
  | "calendar"
  | "service-users"
  | "staff"
  | "emar"
  | "safeguarding"
  | "compliance"
  | "settings"
  | "timelines"
  | "handovers"
  | "organisations"
  | "issues"
  | "admin-users";

export type AppShellLink = {
  href: string;
  label: string;
  icon: AppShellIcon;
  exact?: boolean;
};

export type AppShellPortal =
  | "care-manager"
  | "care-support"
  | "core";

export type AppShellProfile = {
  name: string;
  role: string | null;
  photoUrl: string | null;
};

export type IconMap = Record<AppShellIcon, LucideIcon>;

import type { AppShellLink } from "@/components/layout/AppShell";

export const platformNavigation: AppShellLink[] = [
  {
    label: "Dashboard",
    href: "/platform/dashboard",
    icon: "dashboard",
    exact: true,
  },
  {
    label: "Organisations",
    href: "/platform/organisations",
    icon: "organisations",
  },
  {
    label: "Issues",
    href: "/platform/issues",
    icon: "issues",
  },
  {
    label: "Admin Users",
    href: "/platform/users",
    icon: "admin-users",
  },
  {
    label: "Settings",
    href: "/platform/settings",
    icon: "settings",
  },
];
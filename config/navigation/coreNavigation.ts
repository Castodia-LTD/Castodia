import type { AppShellLink } from "@/components/layout/AppShell";

export const coreNavigation: AppShellLink[] = [
  {
    label: "Dashboard",
    href: "/core/dashboard",
    icon: "dashboard",
    exact: true,
  },
  {
    label: "Organisations",
    href: "/core/organisations",
    icon: "organisations",
  },
  {
    label: "Issues",
    href: "/core/issues",
    icon: "issues",
  },
  {
    label: "Admin Users",
    href: "/core/users",
    icon: "admin-users",
  },
  {
    label: "Demonstration",
    href: "/core/demo-engine",
    icon: "settings",
  },
];
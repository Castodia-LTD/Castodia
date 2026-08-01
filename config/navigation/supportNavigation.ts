import type { AppShellLink } from "@/components/layout";

export const supportNavigation: AppShellLink[] = [
  {
    href: "/support/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    exact: true,
  },
    {
  href: "/support/timelines",
  label: "Timelines",
  icon: "timelines",
},
  {
  href: "/support/service-users",
  label: "Service Users",
  icon: "service-users",
},
  {
    href: "/support/handovers",
    label: "Handovers",
    icon: "handovers",
  },
];
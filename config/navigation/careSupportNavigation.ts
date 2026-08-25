import type { AppShellLink } from "@/components/layout";

export const careSupportNavigation: AppShellLink[] = [
  {
    href: "/care/support/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    exact: true,
  },
  {
    href: "/care/support/timelines",
    label: "Timelines",
    icon: "timelines",
  },
  {
    href: "/care/support/service-users",
    label: "Service Users",
    icon: "service-users",
  },
  {
    href: "/care/support/handovers",
    label: "Handovers",
    icon: "handovers",
  },
  {
    href: "/care/support/reporting/safeguarding",
    label: "Safeguarding",
    icon: "safeguarding",
  },
];

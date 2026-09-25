import type { AppShellLink } from "@/components/layout";

export const careSupportNavigation: AppShellLink[] = [
  {
    href: "/care/support/dashboard",
    label: "Dashboard",
    icon: "dashboard",
    exact: true,
  },
  {
    href: "/care/support/rota",
    label: "My rota",
    icon: "calendar",
    featureKey: "rota",
  },
  {
    href: "/care/support/timelines",
    label: "Timelines",
    icon: "timelines",
    featureKey: "timelines",
  },
  {
    href: "/care/support/service-users",
    label: "People",
    icon: "service-users",
    featureKey: "people",
  },
  {
    href: "/care/support/handovers",
    label: "Handovers",
    icon: "handovers",
    featureKey: "handovers",
  },
  {
    href: "/care/support/reporting/safeguarding",
    label: "Safeguarding",
    icon: "safeguarding",
    featureKey: "safeguarding",
  },
];

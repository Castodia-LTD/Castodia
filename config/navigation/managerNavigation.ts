import type { AppShellLink } from "@/components/layout";

export const managerNavigation: AppShellLink[] = [
  {
    href: "/manager/dashboard",
    label: "Insights",
    icon: "home",
    exact: true,
  },
  {
    href: "/manager/calendar",
    label: "Calendar",
    icon: "calendar",
  },
  {
    href: "/manager/service-users",
    label: "Service Users",
    icon: "service-users",
  },
  {
    href: "/manager/staff",
    label: "Staff",
    icon: "staff",
  },
  {
    href: "/manager/emar",
    label: "eMAR",
    icon: "emar",
  },
  {
    href: "/manager/safeguarding",
    label: "Safeguarding",
    icon: "safeguarding",
  },
  {
    href: "/manager/compliance",
    label: "Compliance",
    icon: "compliance",
  },
];
import type { AppShellLink } from "@/components/layout";

export const careManagerNavigation: AppShellLink[] = [
  {
    href: "/care/manager/insights",
    label: "Insights",
    icon: "home",
    exact: true,
  },
  {
    href: "/care/manager/calendar",
    label: "Calendar",
    icon: "calendar",
  },
  {
    href: "/care/manager/service-users",
    label: "Service Users",
    icon: "service-users",
  },
  {
    href: "/care/manager/staff",
    label: "Staff",
    icon: "staff",
  },
  {
    href: "/care/manager/emar",
    label: "eMAR",
    icon: "emar",
  },
  {
    href: "/care/manager/safeguarding",
    label: "Safeguarding",
    icon: "safeguarding",
  },
  {
    href: "/care/manager/compliance",
    label: "Compliance",
    icon: "compliance",
  },
];
import type { AppShellLink } from "@/components/layout";

export const careManagerNavigation: AppShellLink[] = [
  {
    href: "/care/manager/insights",
    label: "Insights",
    icon: "home",
    exact: true,
    featureKey: "insights",
  },
  {
    href: "/care/manager/calendar",
    label: "Calendar",
    icon: "calendar",
    featureKey: "calendar",
  },
  {
    href: "/care/manager/rota",
    label: "Rotas",
    icon: "calendar",
    featureKey: "rota",
  },
  {
    href: "/care/manager/service-users",
    label: "People",
    icon: "service-users",
    featureKey: "people",
  },
  {
    href: "/care/manager/staff",
    label: "Staff",
    icon: "staff",
    featureKey: "staff",
  },
  {
    href: "/care/manager/emar",
    label: "eMAR",
    icon: "emar",
    featureKey: "medication",
  },
  {
    href: "/care/manager/safeguarding",
    label: "Safeguarding",
    icon: "safeguarding",
    featureKey: "safeguarding",
  },
  {
    href: "/care/manager/compliance",
    label: "Compliance",
    icon: "compliance",
    featureKey: "compliance",
  },
];

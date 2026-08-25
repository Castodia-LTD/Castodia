import {
  BarChart3,
  CalendarDays,
  HeartPulse,
  Home,
  Pill,
  UserRound,
  Users,
} from "lucide-react";

import type { IOSDashboardTile } from "../../dashboard/IOSDashboardTiles";

export const managerDashboardTiles: readonly IOSDashboardTile[] = [
  {
    label: "Insights",
    description: "Key actions, patterns and management oversight.",
    href: "/care/manager/insights",
    icon: Home,
  },
  {
    label: "Calendar",
    description: "View scheduled events and important dates.",
    href: "/care/manager/calendar",
    icon: CalendarDays,
  },
  {
    label: "Service Users",
    description: "Access people, records and care information.",
    href: "/care/manager/service-users",
    icon: UserRound,
  },
  {
    label: "Staff",
    description: "Manage staff records and workforce information.",
    href: "/care/manager/staff",
    icon: Users,
  },
  {
    label: "eMAR",
    description: "Medication setup and management oversight.",
    href: "/care/manager/emar",
    icon: Pill,
  },
  {
    label: "Safeguarding",
    description: "Review and manage safeguarding activity.",
    href: "/care/manager/safeguarding",
    icon: HeartPulse,
  },
  {
    label: "Compliance",
    description: "Access compliance and governance oversight.",
    href: "/care/manager/compliance",
    icon: BarChart3,
  },
];

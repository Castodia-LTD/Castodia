import {
  BarChart3,
  HeartPulse,
  Home,
  Pill,
  Settings,
  ShieldAlert,
  Users,
  CalendarDays,
} from "lucide-react";

export const managerMenuItems = [
  {
    href: "/manager/dashboard",
    label: "Insights",
    icon: Home,
  },
  {
    href: "/manager/calendar",
    label: "Calendar",
    icon: CalendarDays,
  },
  {
    href: "/manager/service-users",
    label: "Service Users",
    icon: Users,
  },
  {
    href: "/manager/staff",
    label: "Staff",
    icon: ShieldAlert,
  },
  {
    href: "/manager/emar",
    label: "eMAR",
    icon: Pill,
  },
  {
    href: "/manager/safeguarding",
    label: "Safeguarding",
    icon: HeartPulse,
  },
  {
    href: "/manager/compliance",
    label: "Compliance",
    icon: BarChart3,
  },
  {
    href: "/manager/admin",
    label: "Administration",
    icon: Settings,
  },
  
]

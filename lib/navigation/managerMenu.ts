import {
  BarChart3,
  HeartPulse,
  Home,
  Pill,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";

export const managerMenuItems = [
  {
    href: "/manager/dashboard",
    label: "Dashboard",
    icon: Home,
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
    href: "/manager/medication",
    label: "Medication",
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
];
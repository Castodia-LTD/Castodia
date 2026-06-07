import {
  BarChart3,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Home,
  Pill,
  ShieldAlert,
  Users,
} from "lucide-react";

export const managerMenuItems = [
  {
    href: "/manager",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/admin/staff",
    label: "User Management",
    icon: Users,
  },
  {
    href: "/admin/service-users",
    label: "Service Users",
    icon: FileText,
  },
  {
  href: "/manager/emar",
  label: "eMAR",
  icon: Pill,
  },
  {
    href: "/admin/supervisions",
    label: "Supervisions",
    icon: ClipboardCheck,
  },
  {
    href: "/admin/competencies",
    label: "Competencies",
    icon: ShieldAlert,
  },
  {
    href: "/admin/incidents",
    label: "Incidents",
    icon: HeartPulse,
  },
];
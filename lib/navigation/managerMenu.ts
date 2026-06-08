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
    href: "/manager/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/manager/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/manager/service-users",
    label: "Service Users",
    icon: FileText,
  },
  {
    href: "/manager/emar",
    label: "Medication Profiles",
    icon: Pill,
  },
  {
    href: "/manager/supervisions",
    label: "Supervisions",
    icon: ClipboardCheck,
  },
  {
    href: "/manager/competencies",
    label: "Competencies",
    icon: ShieldAlert,
  },
  {
  href: "/manager/incidents",
  label: "Behaviour Incidents",
  icon: HeartPulse,
},
{
  href: "/manager/admin",
  label: "Admin",
  icon: Users,
}
];
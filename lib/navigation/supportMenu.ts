import {
  ClipboardList,
  Clock3,
  LayoutDashboard,
  Users,
} from "lucide-react";

export const supportMenuItems = [
  {
    href: "/support",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/timelines",
    label: "Timelines",
    icon: Clock3,
  },
  {
    href: "/service-users",
    label: "Service Users",
    icon: Users,
  },
  {
    href: "/handovers",
    label: "Handovers",
    icon: ClipboardList,
  },
];
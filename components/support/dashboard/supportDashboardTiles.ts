import {
  ClipboardList,
  Clock3,
  HeartPulse,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type SupportDashboardTile = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const supportDashboardTiles: SupportDashboardTile[] = [
  {
    label: "Timelines",
    description: "Record and review daily support.",
    href: "/support/timelines",
    icon: Clock3,
  },
  {
    label: "Service Users",
    description: "View the people you support.",
    href: "/support/service-users",
    icon: UserRound,
  },
  {
    label: "Handovers",
    description: "Read and create staff handovers.",
    href: "/support/handovers",
    icon: ClipboardList,
  },
  {
    label: "Safeguarding",
    description: "Record and review safeguarding concerns.",
    href: "/support/reporting/safeguarding",
    icon: HeartPulse,
  },
];
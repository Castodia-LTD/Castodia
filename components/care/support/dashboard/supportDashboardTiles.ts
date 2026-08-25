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
    href: "/care/support/timelines",
    icon: Clock3,
  },
  {
    label: "Service Users",
    description: "View the people you support.",
    href: "/care/support/service-users",
    icon: UserRound,
  },
  {
    label: "Handovers",
    description: "Read and create staff handovers.",
    href: "/care/support/handovers",
    icon: ClipboardList,
  },
  {
    label: "Safeguarding",
    description: "Record and review safeguarding concerns.",
    href: "/care/support/reporting/safeguarding",
    icon: HeartPulse,
  },
];
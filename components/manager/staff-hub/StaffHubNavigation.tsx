"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  GraduationCap,
  History,
  LayoutDashboard,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

type StaffHubNavigationProps = {
  staffId: string;
};

const staffHubItems = [
  {
    label: "Overview",
    segment: "",
    icon: LayoutDashboard,
  },
  {
    label: "Employment",
    segment: "employment",
    icon: BriefcaseBusiness,
  },
  {
    label: "Training",
    segment: "training",
    icon: GraduationCap,
  },
  {
    label: "Competencies",
    segment: "competencies",
    icon: ClipboardCheck,
  },
  {
    label: "Supervisions",
    segment: "supervisions",
    icon: MessageSquareText,
  },
  {
    label: "Documents",
    segment: "documents",
    icon: FileText,
  },
  {
    label: "Access & Permissions",
    segment: "access",
    icon: ShieldCheck,
  },
  {
    label: "Timeline",
    segment: "timeline",
    icon: History,
  },
];

export default function StaffHubNavigation({
  staffId,
}: StaffHubNavigationProps) {
  const pathname = usePathname();
  const baseHref = `/manager/staff/${staffId}`;

  return (
    <nav
      aria-label="Staff workspace"
      className="border-t border-white/50 px-4 py-4 sm:px-6"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {staffHubItems.map((item) => {
          const href = item.segment
            ? `${baseHref}/${item.segment}`
            : baseHref;

          const isActive = item.segment
            ? pathname === href || pathname.startsWith(`${href}/`)
            : pathname === baseHref;

          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/70"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-950",
              ].join(" ")}
            >
              <Icon
                className={[
                  "h-4 w-4",
                  isActive ? "text-cyan-700" : "text-slate-400",
                ].join(" ")}
              />

              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
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
    href: (id: string) => `/care/manager/staff/${id}`,
    icon: LayoutDashboard,
  },
  {
    label: "Employment",
    href: (id: string) => `/care/manager/staff/${id}/employment`,
    icon: BriefcaseBusiness,
  },
  {
    label: "Training",
    href: () => "/THIS-IS-A-TEST",
    icon: GraduationCap,
  },
  {
    label: "Competencies",
    href: () => "/care/manager/staff/competencies",
    icon: ClipboardCheck,
  },
  {
    label: "Supervisions",
    href: () => "/care/manager/staff/supervisions",
    icon: MessageSquareText,
  },
  {
    label: "Documents",
    href: (id: string) => `/care/manager/staff/${id}/documents`,
    icon: FileText,
  },
  {
    label: "Access & Permissions",
    href: () => "/care/manager/admin/access",
    icon: ShieldCheck,
  },
  {
    label: "Timeline",
    href: (id: string) => `/care/manager/staff/${id}/timeline`,
    icon: History,
  },
];

export default function StaffHubNavigation({
  staffId,
}: StaffHubNavigationProps) {
  const pathname = usePathname();
  const baseHref = `/care/manager/staff/${staffId}`;

  return (
    <nav
      aria-label="Staff workspace"
      className="border-t border-white/50 px-4 py-4 sm:px-6"
    >
      <div className="flex gap-2 overflow-x-auto pb-1">
        {staffHubItems.map((item) => {
          const href = item.href(staffId);

const isActive =
  pathname === href ||
  (href !== baseHref && pathname.startsWith(`${href}/`));

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
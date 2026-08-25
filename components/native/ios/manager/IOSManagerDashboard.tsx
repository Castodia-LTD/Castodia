"use client";

import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  HeartPulse,
  Home,
  Pill,
  UserRound,
  Users,
} from "lucide-react";

type IOSManagerDashboardProps = {
  name: string;
};

const managerTiles = [
  {
    label: "Insights",
    description: "Key actions, patterns and management oversight.",
    href: "/manager/insights",
    icon: Home,
  },
  {
    label: "Calendar",
    description: "View scheduled events and important dates.",
    href: "/manager/calendar",
    icon: CalendarDays,
  },
  {
    label: "Service Users",
    description: "Access people, records and care information.",
    href: "/manager/service-users",
    icon: UserRound,
  },
  {
    label: "Staff",
    description: "Manage staff records and workforce information.",
    href: "/manager/staff",
    icon: Users,
  },
  {
    label: "eMAR",
    description: "Medication setup and management oversight.",
    href: "/manager/emar",
    icon: Pill,
  },
  {
    label: "Safeguarding",
    description: "Review and manage safeguarding activity.",
    href: "/manager/safeguarding",
    icon: HeartPulse,
  },
  {
    label: "Compliance",
    description: "Access compliance and governance oversight.",
    href: "/manager/compliance",
    icon: BarChart3,
  },
] as const;

export function IOSManagerDashboard({
  name,
}: IOSManagerDashboardProps) {
  const firstName =
    name.trim().split(/\s+/)[0] || "";

  return (
    <main className="min-h-full bg-[#f5f8f9] px-4 pb-8 pt-5">
      <section className="mb-5">
        <p className="text-sm font-semibold text-teal-700">
          Manager
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {firstName
            ? `Welcome, ${firstName}`
            : "Welcome"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          What would you like to manage?
        </p>
      </section>

      <section
        aria-label="Manager tools"
        className="grid grid-cols-2 gap-3"
      >
        {managerTiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <Link
              key={tile.href}
              href={tile.href}
              className={[
                "flex min-h-[150px] flex-col justify-between",
                "rounded-[24px]",
                "border border-slate-200/80",
                "bg-white p-4",
                "shadow-[0_10px_28px_rgba(15,23,42,0.07)]",
                "transition active:scale-[0.985]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-teal-500",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-11 w-11 items-center justify-center",
                  "rounded-2xl",
                  "bg-gradient-to-br from-[#079c9c] to-[#65d0c7]",
                  "text-white",
                  "shadow-sm",
                ].join(" ")}
              >
                <Icon
                  size={21}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-[15px] font-bold text-slate-950">
                  {tile.label}
                </h2>

                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {tile.description}
                </p>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
"use client";

import Link from "next/link";
import { FileText, Users } from "lucide-react";

import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

export default function ReportsPage() {
  const reports = [
    {
      href: "/care/manager/reports/service-users",
      title: "Service User Reports",
      description:
        "Timeline activity, incidents, medication, personal care, toileting and auditing.",
      icon: Users,
    },
    {
      href: "/care/manager/reports/staff",
      title: "Staff Reports",
      description:
        "Supervisions, competencies, training and workforce reporting.",
      icon: FileText,
    },
  ];

  return (
    <CastodiaPageShell
      title="Reports"
      description="Select a reporting area."
      maxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <Link key={report.href} href={report.href}>
              <CastodiaCard interactive>
                <Icon size={32} className="mb-4 text-slate-500" />

                <h2 className="text-xl font-semibold text-slate-950">
                  {report.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {report.description}
                </p>
              </CastodiaCard>
            </Link>
          );
        })}
      </div>
    </CastodiaPageShell>
  );
}
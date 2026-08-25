"use client";

import { ClipboardCheck, ShieldAlert, Users } from "lucide-react";
import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

export default function StaffReportsPage() {
  const reports = [
    {
      title: "Supervision Reports",
      description: "Monitor completed, overdue and upcoming supervisions.",
      icon: ClipboardCheck,
    },
    {
      title: "Competency Reports",
      description: "Review competency outcomes, expiries and reassessments.",
      icon: ShieldAlert,
    },
    {
      title: "Workforce Reports",
      description: "Staff compliance, training and workforce overview.",
      icon: Users,
    },
  ];

  return (
    <CastodiaPageShell
      title="Staff Reports"
      description="Reporting and auditing for staff performance, supervision and compliance."
      maxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <CastodiaCard key={report.title} interactive>
              <Icon className="mb-4 text-slate-500" size={32} />

              <h2 className="text-xl font-semibold text-slate-950">
                {report.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {report.description}
              </p>
            </CastodiaCard>
          );
        })}
      </div>
    </CastodiaPageShell>
  );
}
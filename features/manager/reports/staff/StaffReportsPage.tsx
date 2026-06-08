"use client";

import { PageContainer, PageHeader } from "@/components/layouts";
import { ClipboardCheck, ShieldAlert, Users } from "lucide-react";

export default function StaffReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Staff Reports"
        subtitle="Reporting and auditing for staff performance, supervision and compliance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
          <ClipboardCheck className="mb-4 text-cyan-400" size={32} />

          <h2 className="text-xl font-bold text-white">
            Supervision Reports
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Monitor completed, overdue and upcoming supervisions.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
          <ShieldAlert className="mb-4 text-teal-400" size={32} />

          <h2 className="text-xl font-bold text-white">
            Competency Reports
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Review competency outcomes, expiries and reassessments.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
          <Users className="mb-4 text-blue-400" size={32} />

          <h2 className="text-xl font-bold text-white">
            Workforce Reports
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Staff compliance, training and workforce overview.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
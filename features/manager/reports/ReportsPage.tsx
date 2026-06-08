"use client";

import Link from "next/link";
import { FileText, Users } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layouts";

export default function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        subtitle="Select a reporting area."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/manager/reports/service-users"
          className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur transition hover:bg-white/20"
        >
          <Users size={32} className="mb-4 text-cyan-400" />

          <h2 className="text-xl font-bold text-white">
            Service User Reports
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Timeline activity, incidents, medication, personal care,
            toileting and auditing.
          </p>
        </Link>

        <Link
          href="/manager/reports/staff"
          className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur transition hover:bg-white/20"
        >
          <FileText size={32} className="mb-4 text-teal-400" />

          <h2 className="text-xl font-bold text-white">
            Staff Reports
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Supervisions, competencies, training and workforce reporting.
          </p>
        </Link>
      </div>
    </PageContainer>
  );
}
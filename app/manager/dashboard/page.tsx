"use client";

import ManagerShell from "@/components/layouts/ManagerShell";

export default function ManagerDashboardPage() {
  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Manager Portal</h1>

          <p className="mt-2 text-slate-400">
            Oversight, reporting and management tools for your organisation.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h2 className="text-xl font-bold">Reports</h2>
              <p className="mt-2 text-slate-400">
                Review service user and staff data.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h2 className="text-xl font-bold">Supervisions</h2>
              <p className="mt-2 text-slate-400">
                View staff supervision records.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <h2 className="text-xl font-bold">Competencies</h2>
              <p className="mt-2 text-slate-400">
                Manage competency assessments.
              </p>
            </div>
          </div>
        </div>
      </main>
    </ManagerShell>
  );
}
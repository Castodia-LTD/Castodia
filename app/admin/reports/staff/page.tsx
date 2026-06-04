"use client";

import ManagerShell from "@/components/layouts/ManagerShell";

export default function StaffReportsPage() {
  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Staff Reports & Auditing</h1>

          <p className="mt-2 text-slate-400">
            Staff reports for supervisions, competencies and actions will appear
            here.
          </p>
        </div>
      </main>
    </ManagerShell>
  );
}
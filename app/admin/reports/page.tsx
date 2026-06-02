"use client";

import AppShell from "@/components/AppShell";
import AdminMenuCard from "@/components/admin/AdminMenuCard";

const reportMenuItems = [
  {
    href: "/admin/reports/service-user",
    title: "Service User Reports & Auditing",
    description:
      "View timeline entries, incidents, wellbeing, medication, personal care and service-user records.",
  },
  {
    href: "/admin/reports/staff",
    title: "Staff Reports & Auditing",
    description:
      "View supervisions, competencies, staff actions and staff oversight records.",
  },
];

export default function ReportsMenuPage() {
  return (
    <AppShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Reports & Auditing</h1>

          <p className="mt-2 text-slate-400">
            Choose whether you want to review service-user records or staff
            oversight records.
          </p>

          <div className="mt-8 grid gap-4">
            {reportMenuItems.map((item) => (
              <AdminMenuCard
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
"use client";

import ManagerShell from "@/components/layouts/ManagerShell";
import AdminMenuCard from "@/components/admin/AdminMenuCard";
import { adminMenuItems } from "@/lib/admin/constants";

export default function AdminPage() {
  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Admin Portal</h1>

          <p className="mt-2 text-slate-400">
            Manage staff, service users, permissions and incident auditing.
          </p>

          <div className="mt-8 grid gap-4">
            {adminMenuItems.map((item) => (
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
    </ManagerShell>
  );
}
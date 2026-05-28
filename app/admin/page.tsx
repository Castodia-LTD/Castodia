"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-slate-400">
          ← Dashboard
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Admin Portal</h1>

        <p className="mt-2 text-slate-400">
          Manage staff, service users, permissions and incident auditing.
        </p>

        <div className="mt-8 grid gap-4">
          <Link
            href="/admin/incidents"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
          >
            <h2 className="text-xl font-semibold">Incident Auditing</h2>
            <p className="mt-2 text-slate-400">
              Review incident entries across all service users.
            </p>
          </Link>
          <Link
  href="/admin/reports"
  className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
>
  <h2 className="text-xl font-semibold">Reports & Auditing</h2>
  <p className="mt-2 text-slate-400">
    View monthly service data and manager oversight reports.
  </p>
</Link>
          <Link
            href="/admin/medications"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
          >
            <h2 className="text-xl font-semibold">Medication Profiles</h2>
            <p className="mt-2 text-slate-400">
              Manage medication profiles for all service users.
            </p>
          </Link>
          <Link
            href="/admin/staff"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
          >
            <h2 className="text-xl font-semibold">Staff Management</h2>
            <p className="mt-2 text-slate-400">
              Add staff, set roles and manage access.
            </p>
          </Link>

          <Link
            href="/admin/service-users"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
          >
            <h2 className="text-xl font-semibold">Service Users</h2>
            <p className="mt-2 text-slate-400">
              Create and manage service user profiles.
            </p>
          </Link>

          <Link
            href="/admin/permissions/staff-service-user-access"
            className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
          >
            <h2 className="text-xl font-semibold">Access Permissions</h2>
            <p className="mt-2 text-slate-400">
              Assign staff to service users.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
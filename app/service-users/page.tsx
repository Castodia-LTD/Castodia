"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string | null;
  photo_url: string | null;
  allergies: string | null;
};

export default function ServiceUsersPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);

  async function loadServiceUsers() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    // Managers see all service users
    if (profile.role === "manager") {
      const { data, error } = await supabase
        .from("service_users")
        .select(`
          id,
          full_name,
          house_name,
          photo_url,
          allergies
        `)
        .eq("organisation_id", profile.organisation_id)
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        alert(error.message);
        return;
      }

      setServiceUsers(data || []);
      return;
    }

    // Staff only see assigned service users
    const { data: accessData, error: accessError } = await supabase
      .from("staff_service_user_access")
      .select(`
        service_users (
          id,
          full_name,
          house_name,
          photo_url,
          allergies
        )
      `)
      .eq("staff_id", user.id);

    if (accessError) {
      alert(accessError.message);
      return;
    }

    const assignedServiceUsers =
      accessData?.map((row: any) => row.service_users).filter(Boolean) || [];

    setServiceUsers(assignedServiceUsers);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-screen-xl px-4 py-6">

        <div>
          <h1 className="text-3xl font-bold">
            Service Users
          </h1>

          <p className="mt-2 text-slate-400">
            View profiles, care information and important notes.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {serviceUsers.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400 backdrop-blur">
              No service users assigned.
            </div>
          )}

          {serviceUsers.map((su) => (
            <Link
              key={su.id}
              href={`/service-users/${su.id}/profile`}
              className="group rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:bg-white/15"
            >
              <div className="flex items-center gap-4">

                {su.photo_url ? (
                  <img
                    src={su.photo_url}
                    alt={su.full_name}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950/60 text-2xl font-bold text-cyan-300">
                    {su.full_name.charAt(0)}
                  </div>
                )}

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold">
                    {su.full_name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    {su.house_name || "No house assigned"}
                  </p>
                </div>
              </div>

              {su.allergies && (
                <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                    Allergies
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-100">
                    {su.allergies}
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-sm text-slate-400">
                  Open profile
                </span>

                <span className="text-cyan-300 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
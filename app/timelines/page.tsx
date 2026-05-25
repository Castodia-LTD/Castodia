"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

export default function TimelinesPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [role, setRole] = useState<string | null>(null);

  async function loadServiceUsers() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    setRole(profile.role);

    if (profile.role === "manager") {
      const { data, error } = await supabase
        .from("service_users")
        .select("id, full_name, house_name")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setServiceUsers(data || []);
      return;
    }

    const { data: accessData, error: accessError } = await supabase
      .from("staff_service_user_access")
      .select(`
        service_users (
          id,
          full_name,
          house_name
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
      <div className="p-6">
        <div>
          <h1 className="text-3xl font-bold">Timelines</h1>
          <p className="mt-2 text-slate-400">
            Select a service user to open their daily records.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceUsers.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400 backdrop-blur">
              No service users assigned.
            </div>
          )}

          {serviceUsers.map((su) => (
            <Link
              key={su.id}
              href={`/timelines/${su.id}`}
              className="group rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:bg-white/15"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/60 text-xl font-bold text-blue-300">
                  {su.full_name.charAt(0)}
                </div>

                <div>
                  <h3 className="text-xl font-bold">{su.full_name}</h3>
                  <p className="text-sm text-slate-400">{su.house_name}</p>
                </div>
              </div>

              <p className="mt-5 text-sm text-slate-400 group-hover:text-slate-300">
                Open timeline →
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
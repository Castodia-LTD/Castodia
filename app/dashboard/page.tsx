"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);

  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      alert(profileError.message);
      return;
    }

    setName(profile.full_name);
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
    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-6">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-start justify-between gap-4">
          <div>
            <Image
              src="/logo.png"
              alt="Castodia"
              width={260}
              height={80}
              priority
            />

            {name && (
              <p className="mt-6 text-slate-300">
                Welcome,{" "}
                <span className="font-semibold text-white">{name}</span>

                <span className="ml-2 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                  {role === "manager" ? "Manager" : "Support Worker"}
                </span>
              </p>
            )}
          </div>

          <button
            onClick={logout}
            className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 backdrop-blur"
          >
            Log Out
          </button>
        </div>

        {role === "manager" && (
          <Link
            href="/admin"
            className="mt-8 block rounded-3xl border border-blue-400/20 bg-gradient-to-r from-blue-600 to-teal-500 p-6 shadow-xl shadow-blue-900/30"
          >
            <p className="text-sm font-semibold text-blue-100">
              Manager tools
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Admin Portal
            </h2>

            <p className="mt-2 text-blue-50/80">
              Manage staff, service users, permissions and incident reviews.
            </p>
          </Link>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold">Service Users</h2>
          <p className="mt-1 text-sm text-slate-400">
            Select a service user to open their timeline.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceUsers.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400 backdrop-blur">
              No service users assigned.
            </div>
          )}

          {serviceUsers.map((su) => (
            <Link
              key={su.id}
              href={`/service-user/${su.id}`}
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
    </main>
  );
}
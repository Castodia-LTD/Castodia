"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

type Handover = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  active: boolean;
  staff_name?: string;
  read?: boolean;
  service_users?: ServiceUser[];
};

export default function Dashboard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [handovers, setHandovers] = useState<Handover[]>([]);

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    if (!profile) return;

    setName(profile.full_name);
    setRole(profile.role);

    let visibleServiceUsers: ServiceUser[] = [];

    if (profile.role === "manager") {
      const { data } = await supabase
        .from("service_users")
        .select("id, full_name, house_name")
        .eq("is_active", true);

      visibleServiceUsers = data || [];
    } else {
      const { data } = await supabase
        .from("staff_service_user_access")
        .select(`
          service_users (
            id,
            full_name,
            house_name
          )
        `)
        .eq("staff_id", user.id);

      visibleServiceUsers =
        data?.map((row: any) => row.service_users).filter(Boolean) || [];
    }

    const visibleIds = visibleServiceUsers.map((su) => su.id);

    if (visibleIds.length === 0) {
      setHandovers([]);
      return;
    }

    const since = new Date();
    since.setHours(since.getHours() - 48);

    const { data: handoverLinks } = await supabase
      .from("handover_service_users")
      .select("handover_id, service_user_id")
      .in("service_user_id", visibleIds);

    const handoverIds = [
      ...new Set(handoverLinks?.map((link) => link.handover_id) || []),
    ];

    if (handoverIds.length === 0) {
      setHandovers([]);
      return;
    }

    const { data: handoverData } = await supabase
      .from("handovers")
      .select("*")
      .eq("active", true)
      .gte("created_at", since.toISOString())
      .in("id", handoverIds)
      .order("created_at", { ascending: false });

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: reads } = await supabase
      .from("handover_reads")
      .select("handover_id, staff_id")
      .eq("staff_id", user.id);

    const enriched =
      handoverData?.map((handover) => {
        const staff = profiles?.find((p) => p.id === handover.created_by);
        const hasRead = reads?.some((r) => r.handover_id === handover.id);

        const linkedServiceUsers =
          handoverLinks
            ?.filter((link) => link.handover_id === handover.id)
            .map((link) =>
              visibleServiceUsers.find((su) => su.id === link.service_user_id)
            )
            .filter(Boolean) as ServiceUser[];

        return {
          ...handover,
          staff_name: staff?.full_name || "Unknown",
          read: hasRead || false,
          service_users: linkedServiceUsers,
        };
      }) || [];

    setHandovers(enriched);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <AppShell>
      <div className="w-full max-w-screen-sm px-4 py-6 mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Image
              src="/logo.png"
              alt="Castodia"
              width={170}
              height={55}
              priority
              className="h-auto w-[150px]"
            />

            {name && (
              <p className="mt-5 text-sm text-slate-300">
                Welcome,{" "}
                <span className="font-semibold text-white">{name}</span>
              </p>
            )}

            {role && (
              <span className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                {role === "manager" ? "Manager" : "Support Worker"}
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="shrink-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur"
          >
            Log Out
          </button>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">Recent Handovers</h1>
              <p className="mt-1 text-sm text-slate-400">
                Last 48 hours.
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
              {handovers.filter((h) => !h.read).length} unread
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {handovers.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400 backdrop-blur">
                No recent handovers.
              </div>
            )}

            {handovers.map((handover) => (
              <div
                key={handover.id}
                className="w-full rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-slate-400">
                      {new Date(handover.created_at).toLocaleString("en-GB")}
                    </p>

                    <h2 className="mt-2 break-words text-xl font-bold">
                      {handover.title}
                    </h2>
                  </div>

                  {handover.read ? (
                    <span className="shrink-0 rounded-full bg-green-600 px-3 py-1 text-sm font-semibold">
                      Read
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-500 px-3 py-1 text-sm font-semibold">
                      Unread
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {handover.service_users?.map((su) => (
                    <span
                      key={su.id}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                    >
                      {su.full_name}
                    </span>
                  ))}
                </div>

                <p className="mt-4 whitespace-pre-line break-words text-slate-200">
                  {handover.content}
                </p>

                <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
                  Created by {handover.staff_name}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
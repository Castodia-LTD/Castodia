"use client";

import { useEffect, useState } from "react";
import {
  PageContainer,
  PageHeader,
  SectionCard,
} from "@/components/layouts";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

type HandoverLink = {
  handover_id: string;
  service_user_id: string;
};

type Handover = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  active: boolean;
  staff_name: string;
  read: boolean;
  service_users: ServiceUser[];
};

export default function SupportDashboardPage() {
  const [name, setName] = useState("");
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = handovers.filter((handover) => !handover.read).length;

  async function loadSupportDashboard() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
  .from("profiles")
  .select("full_name, role")
  .eq("id", user.id)
  .single();

setName(profile?.full_name || "");

let visibleServiceUsers: ServiceUser[] = [];

if (profile?.role === "manager") {
  const { data } = await supabase
    .from("service_users")
    .select("id, full_name, house_name")
    .eq("is_active", true)
    .order("full_name");

  visibleServiceUsers = data || [];
} else {
  const { data: accessRows } = await supabase
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
    accessRows
      ?.map((row: any) => row.service_users)
      .filter(Boolean) || [];
}

    const visibleIds = visibleServiceUsers.map(
      (serviceUser: ServiceUser) => serviceUser.id
    );

    if (visibleIds.length === 0) {
      setHandovers([]);
      setLoading(false);
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
      setLoading(false);
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
      .select("handover_id")
      .eq("staff_id", user.id);

    const enrichedHandovers =
      handoverData?.map((handover) => {
        const staff = profiles?.find(
          (profile) => profile.id === handover.created_by
        );

        const linkedServiceUsers =
          handoverLinks
            ?.filter(
              (link: HandoverLink) => link.handover_id === handover.id
            )
            .map((link: HandoverLink) =>
              visibleServiceUsers.find(
                (serviceUser: ServiceUser) =>
                  serviceUser.id === link.service_user_id
              )
            )
            .filter(Boolean) || [];

        return {
          ...handover,
          staff_name: staff?.full_name || "Unknown",
          read:
            reads?.some((read) => read.handover_id === handover.id) || false,
          service_users: linkedServiceUsers,
        };
      }) || [];

    setHandovers(enrichedHandovers);
    setLoading(false);
  }

  useEffect(() => {
    loadSupportDashboard();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Support Dashboard"
        subtitle={name ? `Welcome, ${name}` : "Your assigned care updates"}
      >
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
          {unreadCount} unread
        </span>
      </PageHeader>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Recent Handovers
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Active handovers from the last 48 hours for your assigned service
            users.
          </p>
        </div>

        {loading && (
          <SectionCard>
            <p className="text-sm text-slate-400">Loading handovers...</p>
          </SectionCard>
        )}

        {!loading && handovers.length === 0 && (
          <SectionCard>
            <p className="text-sm text-slate-400">No recent handovers.</p>
          </SectionCard>
        )}

        {!loading &&
          handovers.map((handover) => (
            <SectionCard key={handover.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-slate-400">
                    {new Date(handover.created_at).toLocaleString("en-GB")}
                  </p>

                  <h3 className="mt-2 break-words text-xl font-bold text-white">
                    {handover.title}
                  </h3>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                    handover.read
                      ? "bg-green-600 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {handover.read ? "Read" : "Unread"}
                </span>
              </div>

              {handover.service_users.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {handover.service_users.map((serviceUser) => (
                    <span
                      key={serviceUser.id}
                      className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
                    >
                      {serviceUser.full_name}
                    </span>
                  ))}
                </div>
              )}

              <p className="mt-4 whitespace-pre-line break-words text-slate-200">
                {handover.content}
              </p>

              <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
                Created by {handover.staff_name}
              </p>
            </SectionCard>
          ))}
      </section>
    </PageContainer>
  );
}
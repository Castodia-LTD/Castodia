"use client";

import { useEffect, useState } from "react";
import ManagerShell from "@/components/layouts/ManagerShell";
import IncidentAuditCard from "@/components/admin/incidents/IncidentAuditCard";
import { supabase } from "@/lib/supabase";
import type { Incident } from "@/lib/admin/incidents/types";

export default function IncidentAuditPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  async function loadIncidents() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError || !currentProfile?.organisation_id) {
      alert("Organisation not found.");
      return;
    }

    const { data: serviceUsers } = await supabase
      .from("service_users")
      .select("id, first_name, surname, house_name")
      .eq("organisation_id", currentProfile.organisation_id);

    const serviceUserIds = serviceUsers?.map((su) => su.id) || [];

    if (serviceUserIds.length === 0) {
      setIncidents([]);
      return;
    }

    const { data: incidentData, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("entry_type", "Incident")
      .in("service_user_id", serviceUserIds)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("organisation_id", currentProfile.organisation_id);

    const enriched =
      incidentData?.map((incident) => {
        const staff = profiles?.find((p) => p.id === incident.created_by);

        const serviceUser = serviceUsers?.find(
          (su) => su.id === incident.service_user_id
        );

        const serviceUserName =
          `${serviceUser?.first_name ?? ""} ${
            serviceUser?.surname ?? ""
          }`.trim() || "Unknown service user";

        return {
          ...incident,
          staff_name: staff?.full_name || "Unknown staff member",
          service_user_name: serviceUserName,
          house_name: serviceUser?.house_name || "",
        };
      }) || [];

    setIncidents(enriched);
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Incident Auditing</h1>

          <p className="mt-2 text-slate-400">
            Review incident entries across service users.
          </p>

          <div className="mt-8 space-y-4">
            {incidents.length === 0 && (
              <p className="text-slate-400">No incidents recorded.</p>
            )}

            {incidents.map((incident) => (
              <IncidentAuditCard key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      </main>
    </ManagerShell>
  );
}
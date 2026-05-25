"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Incident = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  created_at: string;
  reviewed: boolean;
  staff_name?: string;
  service_user_name?: string;
  house_name?: string;
};

export default function IncidentAuditPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  async function loadIncidents() {
    const { data: incidentData, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("entry_type", "Incident")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: serviceUsers } = await supabase
      .from("service_users")
      .select("id, full_name, house_name");

    const enriched =
      incidentData?.map((incident) => {
        const staff = profiles?.find((p) => p.id === incident.created_by);
        const su = serviceUsers?.find(
          (s) => s.id === incident.service_user_id
        );

        return {
          ...incident,
          staff_name: staff?.full_name || "Unknown staff member",
          service_user_name: su?.full_name || "Unknown service user",
          house_name: su?.house_name || "",
        };
      }) || [];

    setIncidents(enriched);
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <Link href="/admin" className="text-slate-400">
        ← Admin Portal
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Incident Auditing</h1>

      <p className="mt-2 text-slate-400">
        Review incident entries across service users.
      </p>

      <div className="mt-8 space-y-4">
        {incidents.length === 0 && (
          <p className="text-slate-400">No incidents recorded.</p>
        )}

        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/incidents/${incident.id}`}
            className="block rounded-2xl bg-slate-900 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">
                  {new Date(incident.created_at).toLocaleString("en-GB")}
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  {incident.service_user_name}
                </h2>

                <p className="text-slate-400">{incident.house_name}</p>
              </div>

              {incident.reviewed && (
                <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold">
                  Reviewed
                </span>
              )}
            </div>

            <p className="mt-4 text-slate-300">
              Tap to view incident details
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Entered by {incident.staff_name}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
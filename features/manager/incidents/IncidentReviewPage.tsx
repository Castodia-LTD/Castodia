"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Incident } from "./types";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"unreviewed" | "reviewed" | "all">(
    "unreviewed"
  );

  async function loadIncidents() {
    setLoading(true);

    const { data: entries, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("entry_type", "Behaviour Incident")
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    const { data: serviceUsers } = await supabase
      .from("service_users")
      .select("id, full_name");

    const enriched =
      entries?.map((entry) => {
        const staff = profiles?.find(
          (profile) => profile.id === entry.created_by
        );

        const serviceUser = serviceUsers?.find(
          (serviceUser) => serviceUser.id === entry.service_user_id
        );

        return {
          ...entry,
          staff_name: staff?.full_name || "Unknown staff member",
          service_user_name: serviceUser?.full_name || "Unknown service user",
        };
      }) || [];

    setIncidents(enriched);
    setLoading(false);
  }

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = incidents.filter((incident) => {
    if (filter === "unreviewed") return !incident.reviewed;
    if (filter === "reviewed") return incident.reviewed;
    return true;
  });

  const unreviewedCount = incidents.filter((incident) => !incident.reviewed)
    .length;

  const reviewedCount = incidents.filter((incident) => incident.reviewed)
    .length;

  return (
    <CastodiaPageShell
      title="Behaviour Incidents"
      description="Review behaviour incidents and record management oversight."
      maxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Awaiting review</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {unreviewedCount}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Reviewed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {reviewedCount}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">Total behaviour incidents</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {incidents.length}
          </p>
        </CastodiaCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "unreviewed", label: "Awaiting review" },
          { key: "reviewed", label: "Reviewed" },
          { key: "all", label: "All" },
        ].map((item) => (
          <CastodiaButton
            key={item.key}
            variant={filter === item.key ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(item.key as typeof filter)}
          >
            {item.label}
          </CastodiaButton>
        ))}
      </div>

      <section className="space-y-4">
        {loading && (
          <CastodiaCard>
            <p className="text-sm text-slate-500">
              Loading behaviour incidents...
            </p>
          </CastodiaCard>
        )}

        {!loading && filteredIncidents.length === 0 && (
          <CastodiaCard>
            <p className="text-sm text-slate-500">
              No behaviour incidents found for this filter.
            </p>
          </CastodiaCard>
        )}

        {!loading &&
          filteredIncidents.map((incident) => (
            <Link key={incident.id} href={`/manager/incidents/${incident.id}`}>
              <CastodiaCard interactive>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CastodiaBadge
                        variant={incident.reviewed ? "success" : "warning"}
                      >
                        <span className="inline-flex items-center gap-1">
                          {incident.reviewed ? (
                            <CheckCircle size={14} />
                          ) : (
                            <AlertTriangle size={14} />
                          )}

                          {incident.reviewed
                            ? "Reviewed"
                            : "Awaiting review"}
                        </span>
                      </CastodiaBadge>

                      <CastodiaBadge variant="neutral">
                        Behaviour Incident
                      </CastodiaBadge>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold text-slate-950">
                      {incident.service_user_name}
                    </h2>

                    <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                      {incident.content}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <UserRound size={14} />
                        {incident.staff_name}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} />
                        {new Date(incident.created_at).toLocaleString("en-GB")}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-slate-500">
                    Review →
                  </span>
                </div>
              </CastodiaCard>
            </Link>
          ))}
      </section>
    </CastodiaPageShell>
  );
}
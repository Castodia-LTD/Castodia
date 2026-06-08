"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, UserRound } from "lucide-react";
import { PageContainer, PageHeader, SectionCard } from "@/components/layouts";
import { supabase } from "@/lib/supabase";
import type { Incident } from "./types";

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
    <PageContainer>
      <PageHeader
        title="Behaviour Incidents"
        subtitle="Review behaviour incidents and record management oversight."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard>
          <p className="text-sm text-slate-400">Awaiting review</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">
            {unreviewedCount}
          </p>
        </SectionCard>

        <SectionCard>
          <p className="text-sm text-slate-400">Reviewed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">
            {reviewedCount}
          </p>
        </SectionCard>

        <SectionCard>
          <p className="text-sm text-slate-400">Total behaviour incidents</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {incidents.length}
          </p>
        </SectionCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { key: "unreviewed", label: "Awaiting review" },
          { key: "reviewed", label: "Reviewed" },
          { key: "all", label: "All" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as typeof filter)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === item.key
                ? "bg-gradient-to-r from-blue-500 to-teal-400 text-white"
                : "bg-white/10 text-slate-300 hover:bg-white/20"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-6 space-y-4">
        {loading && (
          <SectionCard>
            <p className="text-sm text-slate-400">
              Loading behaviour incidents...
            </p>
          </SectionCard>
        )}

        {!loading && filteredIncidents.length === 0 && (
          <SectionCard>
            <p className="text-sm text-slate-400">
              No behaviour incidents found for this filter.
            </p>
          </SectionCard>
        )}

        {!loading &&
          filteredIncidents.map((incident) => (
            <Link
              key={incident.id}
              href={`/manager/incidents/${incident.id}`}
              className="block rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur transition hover:bg-white/15"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        incident.reviewed
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {incident.reviewed ? (
                        <CheckCircle size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}

                      {incident.reviewed ? "Reviewed" : "Awaiting review"}
                    </span>

                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                      Behaviour Incident
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-bold text-white">
                    {incident.service_user_name}
                  </h2>

                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-300">
                    {incident.content}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
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

                <span className="shrink-0 text-sm font-semibold text-cyan-300">
                  Review →
                </span>
              </div>
            </Link>
          ))}
      </section>
    </PageContainer>
  );
}
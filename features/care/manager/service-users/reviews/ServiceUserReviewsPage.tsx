"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  UserRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

type Incident = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  created_at: string;
  event_time: string | null;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  staff_name: string;
  service_user_name: string;
};

export default function IncidentsPage() {
  const params = useParams<{ id: string }>();
  const serviceUserId = params.id;

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "unreviewed" | "reviewed" | "all"
  >("unreviewed");

  useEffect(() => {
    async function loadIncidents() {
      if (!serviceUserId) {
        setIncidents([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: entries, error: entriesError } = await supabase
        .from("timeline_entries")
        .select(`
          id,
          service_user_id,
          created_by,
          entry_type,
          content,
          created_at,
          event_time,
          reviewed,
          reviewed_by,
          reviewed_at,
          review_comment
        `)
        .eq("service_user_id", serviceUserId)
        .eq("entry_type", "Behaviour Incident")
        .order("created_at", { ascending: false });

      if (entriesError) {
        alert(entriesError.message);
        setIncidents([]);
        setLoading(false);
        return;
      }

      const { data: serviceUser, error: serviceUserError } =
        await supabase
          .from("service_users")
          .select("full_name")
          .eq("id", serviceUserId)
          .maybeSingle();

      if (serviceUserError) {
        console.error(
          "Could not load service user:",
          serviceUserError
        );
      }

      const staffIds = Array.from(
        new Set(
          (entries ?? [])
            .map((entry) => entry.created_by)
            .filter((id): id is string => Boolean(id))
        )
      );

      let staffNames = new Map<string, string>();

      if (staffIds.length > 0) {
        const { data: profiles, error: profilesError } =
          await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", staffIds);

        if (profilesError) {
          console.error(
            "Could not load staff profiles:",
            profilesError
          );
        }

        staffNames = new Map(
          (profiles ?? []).map((profile) => [
            profile.id,
            profile.full_name || "Unknown staff member",
          ])
        );
      }

      const enriched: Incident[] = (entries ?? []).map((entry) => ({
        ...entry,
        staff_name:
          staffNames.get(entry.created_by) ||
          "Unknown staff member",
        service_user_name:
          serviceUser?.full_name || "Unknown service user",
      }));

      setIncidents(enriched);
      setLoading(false);
    }

    void loadIncidents();
  }, [serviceUserId]);

  const filteredIncidents = incidents.filter((incident) => {
    if (filter === "unreviewed") {
      return !incident.reviewed;
    }

    if (filter === "reviewed") {
      return incident.reviewed;
    }

    return true;
  });

  const unreviewedCount = incidents.filter(
    (incident) => !incident.reviewed
  ).length;

  const reviewedCount = incidents.filter(
    (incident) => incident.reviewed
  ).length;

  return (
    <CastodiaPageShell
      title="Behaviour Incidents"
      description="Review behaviour incidents and record management oversight."
      maxWidth="wide"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            Awaiting review
          </p>

          <p className="mt-2 text-3xl font-bold text-amber-600">
            {unreviewedCount}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            Reviewed
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {reviewedCount}
          </p>
        </CastodiaCard>

        <CastodiaCard padding="md">
          <p className="text-sm text-slate-500">
            Total behaviour incidents
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {incidents.length}
          </p>
        </CastodiaCard>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          {
            key: "unreviewed",
            label: "Awaiting review",
          },
          {
            key: "reviewed",
            label: "Reviewed",
          },
          {
            key: "all",
            label: "All",
          },
        ].map((item) => (
          <CastodiaButton
            key={item.key}
            variant={
              filter === item.key ? "primary" : "secondary"
            }
            size="sm"
            onClick={() =>
              setFilter(item.key as typeof filter)
            }
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
            <Link
  key={incident.id}
  href={`/care/manager/incidents/${incident.id}/reviews`}
  className="block"
>
              <CastodiaCard interactive>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <CastodiaBadge
                        variant={
                          incident.reviewed
                            ? "success"
                            : "warning"
                        }
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
                        {new Date(
                          incident.created_at
                        ).toLocaleString("en-GB")}
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
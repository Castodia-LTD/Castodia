"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import ReportStatCard from "@/components/admin/reports/ReportStatCard";
import CareAuditCard from "@/components/admin/reports/CareAuditCard";
import type { CareAudit } from "@/lib/admin/reports/types";
import { daysSince } from "@/lib/admin/reports/date";
import { supabase } from "@/lib/supabase";

const washingTypes = ["Shower", "Bath", "Strip wash"];

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);

  const [timelineCount, setTimelineCount] = useState(0);
  const [incidentCount, setIncidentCount] = useState(0);
  const [sleepCount, setSleepCount] = useState(0);
  const [prnCount, setPrnCount] = useState(0);
  const [missedMedicationCount, setMissedMedicationCount] = useState(0);
  const [toiletingCount, setToiletingCount] = useState(0);
  const [personalCareCount, setPersonalCareCount] = useState(0);

  const [careAudits, setCareAudits] = useState<CareAudit[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function getCount(table: string, filters?: (query: any) => any) {
    let query = supabase.from(table).select("*", {
      count: "exact",
      head: true,
    });

    if (filters) {
      query = filters(query);
    }

    const { count, error } = await query;

    if (error) {
      console.error(error);
      return 0;
    }

    return count || 0;
  }

  async function loadReports() {
    setLoading(true);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const startIso = monthStart.toISOString();
    const endIso = monthEnd.toISOString();

    const [
      timeline,
      incidents,
      sleep,
      prn,
      missedMedication,
      toileting,
      personalCare,
    ] = await Promise.all([
      getCount("timeline_entries", (query) =>
        query.gte("event_time", startIso).lte("event_time", endIso)
      ),

      getCount("timeline_entries", (query) =>
        query
          .eq("entry_type", "Incident")
          .gte("event_time", startIso)
          .lte("event_time", endIso)
      ),

      getCount("timeline_entries", (query) =>
        query
          .eq("entry_type", "Sleep")
          .gte("event_time", startIso)
          .lte("event_time", endIso)
      ),

      getCount("medication_administrations", (query) =>
        query
          .eq("round", "PRN")
          .gte("administered_at", startIso)
          .lte("administered_at", endIso)
      ),

      getCount("medication_administrations", (query) =>
        query
          .neq("status", "Administered")
          .gte("administered_at", startIso)
          .lte("administered_at", endIso)
      ),

      getCount("toileting_records", (query) =>
        query.gte("occurred_at", startIso).lte("occurred_at", endIso)
      ),

      getCount("personal_care_records", (query) =>
        query.gte("occurred_at", startIso).lte("occurred_at", endIso)
      ),
    ]);

    setTimelineCount(timeline);
    setIncidentCount(incidents);
    setSleepCount(sleep);
    setPrnCount(prn);
    setMissedMedicationCount(missedMedication);
    setToiletingCount(toileting);
    setPersonalCareCount(personalCare);

    await loadCareAudits();

    setLoading(false);
  }

  async function loadCareAudits() {
    const { data: serviceUsers, error: serviceUsersError } = await supabase
      .from("service_users")
      .select("id, first_name, surname")
      .order("first_name", { ascending: true });

    if (serviceUsersError) {
      console.error(serviceUsersError);
      return;
    }

    const { data: personalCareRecords, error: careError } = await supabase
      .from("personal_care_records")
      .select("id, service_user_id, care_type, occurred_at")
      .order("occurred_at", { ascending: false });

    if (careError) {
      console.error(careError);
      return;
    }

    const audits =
      serviceUsers?.map((serviceUser) => {
        const records =
          personalCareRecords?.filter(
            (record) => record.service_user_id === serviceUser.id
          ) || [];

        const lastWashed = records.find((record) =>
          washingTypes.includes(record.care_type)
        );

        const lastClothingChange = records.find(
          (record) => record.care_type === "Clothing changed"
        );

        const washedDays = daysSince(lastWashed?.occurred_at || null);
        const clothingDays = daysSince(lastClothingChange?.occurred_at || null);

        return {
          id: serviceUser.id,
          name:
            `${serviceUser.first_name ?? ""} ${
              serviceUser.surname ?? ""
            }`.trim() || "Unnamed service user",
          lastWashed:
            washedDays === null ? "No record" : `${washedDays} days ago`,
          lastClothingChange:
            clothingDays === null ? "No record" : `${clothingDays} days ago`,
        };
      }) || [];

    setCareAudits(audits);
  }

  return (
    <AppShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Reports & Auditing</h1>

          <p className="mt-2 text-slate-400">
            View monthly service data and manager oversight reports.
          </p>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-300">
              Loading reports...
            </div>
          ) : (
            <>
              <section className="mt-8">
                <h2 className="text-xl font-semibold">Monthly Overview</h2>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <ReportStatCard
                    title="Timeline Entries"
                    value={timelineCount}
                  />

                  <ReportStatCard title="Incidents" value={incidentCount} />

                  <ReportStatCard title="Sleep Records" value={sleepCount} />

                  <ReportStatCard title="PRN Medication" value={prnCount} />

                  <ReportStatCard
                    title="Missed Medication"
                    value={missedMedicationCount}
                  />

                  <ReportStatCard
                    title="Toileting Records"
                    value={toiletingCount}
                  />

                  <ReportStatCard
                    title="Personal Care"
                    value={personalCareCount}
                  />
                </div>
              </section>

              <section className="mt-10">
                <h2 className="text-xl font-semibold">Care Audit</h2>

                <p className="mt-2 text-sm text-slate-400">
                  Review recent personal care records for each service user.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {careAudits.map((audit) => (
                    <CareAuditCard key={audit.id} audit={audit} />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </AppShell>
  );
}
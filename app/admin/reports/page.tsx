"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import ReportStatCard from "@/components/admin/reports/ReportStatCard";
import CareAuditCard from "@/components/admin/reports/CareAuditCard";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import { supabase } from "@/lib/supabase";
import type { CareAudit } from "@/lib/admin/reports/types";
import { daysSince } from "@/lib/admin/reports/date";
import { downloadCsv, printReport } from "@/lib/admin/reports/export";
import { loadReportEntries } from "@/lib/admin/reports/queries";

type ServiceUserOption = {
  id: string;
  full_name: string;
};

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

  const [serviceUsers, setServiceUsers] = useState<ServiceUserOption[]>([]);
  const [careAudits, setCareAudits] = useState<CareAudit[]>([]);

  const [selectedServiceUser, setSelectedServiceUser] = useState("all");
  const [selectedEntryType, setSelectedEntryType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportEntries, setReportEntries] = useState<any[]>([]);

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
    const { data: serviceUserData, error: serviceUsersError } = await supabase
      .from("service_users")
      .select("id, first_name, surname")
      .eq("is_active", true)
      .order("first_name", { ascending: true });

    if (serviceUsersError) {
      console.error(serviceUsersError);
      return;
    }

    const formattedServiceUsers =
      serviceUserData?.map((serviceUser) => ({
        id: serviceUser.id,
        full_name:
          `${serviceUser.first_name ?? ""} ${
            serviceUser.surname ?? ""
          }`.trim() || "Unnamed service user",
      })) || [];

    setServiceUsers(formattedServiceUsers);

    const { data: personalCareRecords, error: careError } = await supabase
      .from("personal_care_records")
      .select("id, service_user_id, care_type, occurred_at")
      .order("occurred_at", { ascending: false });

    if (careError) {
      console.error(careError);
      return;
    }

    const audits =
      serviceUserData?.map((serviceUser) => {
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

  async function runReport() {
    try {
      const data = await loadReportEntries({
        serviceUserId: selectedServiceUser,
        entryType: selectedEntryType,
        dateFrom,
        dateTo,
      });

      setReportEntries(data);
    } catch (error) {
      console.error(error);
      alert("Unable to generate report.");
    }
  }

  function exportCurrentReport() {
    downloadCsv(
      "castodia-report.csv",
      reportEntries.map((entry) => ({
        Date: entry.event_time,
        Type: entry.entry_type,
        Content: entry.content,
        ServiceUser: entry.service_user_id,
        Staff: entry.created_by,
      }))
    );
  }

  return (
    <AppShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Reports & Auditing</h1>

          <p className="mt-2 text-slate-400">
            View monthly service data, care audits and export filtered records.
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
                <ReportFilters
                  serviceUsers={serviceUsers.map((serviceUser) => ({
                    id: serviceUser.id,
                    name: serviceUser.full_name,
                  }))}
                  selectedServiceUserId={selectedServiceUser}
                  setSelectedServiceUserId={setSelectedServiceUser}
                  selectedEntryType={selectedEntryType}
                  setSelectedEntryType={setSelectedEntryType}
                  dateFrom={dateFrom}
                  setDateFrom={setDateFrom}
                  dateTo={dateTo}
                  setDateTo={setDateTo}
                  onApply={runReport}
                />

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={exportCurrentReport}
                    className="rounded-2xl bg-green-600 px-5 py-3 font-semibold"
                  >
                    Export CSV
                  </button>

                  <button
                    onClick={printReport}
                    className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold"
                  >
                    Print / Save PDF
                  </button>
                </div>

                {reportEntries.length > 0 && (
                  <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                    <h2 className="text-2xl font-bold">Report Results</h2>

                    <div className="mt-4 space-y-3">
                      {reportEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-slate-950/50 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-xs font-semibold text-cyan-300">
                              {entry.entry_type}
                            </p>

                            <p className="text-xs text-slate-400">
                              {new Date(entry.event_time).toLocaleString(
                                "en-GB"
                              )}
                            </p>
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-slate-100">
                            {entry.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
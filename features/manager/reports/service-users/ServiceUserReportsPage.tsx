"use client";

import { useEffect, useState } from "react";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import { supabase } from "@/lib/supabase";
import type { CareAudit } from "@/lib/admin/reports/service-user/types";
import { daysSince } from "@/lib/admin/reports/service-user/date";
import {
  downloadCsv,
  printReport,
} from "@/lib/admin/reports/service-user/export";
import { loadReportEntries } from "@/lib/admin/reports/service-user/queries";
import ReportStatsGrid from "./components/ReportStatsGrid";
import CareAuditList from "./components/CareAuditList";
import ReportEntriesPanel from "./components/ReportEntriesPanel";

import {
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

type ServiceUserOption = {
  id: string;
  full_name: string;
};

type ReportEntry = {
  id: string;
  event_time: string;
  entry_type: string;
  content: string;
  service_user_id: string;
  created_by: string;
};

const washingTypes = ["Shower", "Bath", "Strip wash"];

export default function ServiceUserReportsPage() {
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
  const [reportEntries, setReportEntries] = useState<ReportEntry[]>([]);

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
          .eq("entry_type", "Behaviour Incident")
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

      setReportEntries(data as ReportEntry[]);
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

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <CastodiaPageShell
      title="Reports & Auditing"
      description="View monthly service data, care audits and export filtered records."
      maxWidth="wide"
    >
      {loading ? (
        <CastodiaCard>
          <p className="text-sm text-slate-500">Loading reports...</p>
        </CastodiaCard>
      ) : (
        <>
          <ReportStatsGrid
            timelineCount={timelineCount}
            incidentCount={incidentCount}
            sleepCount={sleepCount}
            prnCount={prnCount}
            missedMedicationCount={missedMedicationCount}
            toiletingCount={toiletingCount}
            personalCareCount={personalCareCount}
          />

          <CastodiaSection title="Filtered Report">
            <CastodiaCard>
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
            </CastodiaCard>

            <ReportEntriesPanel
              reportEntries={reportEntries}
              onExport={exportCurrentReport}
              onPrint={printReport}
            />
          </CastodiaSection>

          <CareAuditList careAudits={careAudits} />
        </>
      )}
    </CastodiaPageShell>
  );
}
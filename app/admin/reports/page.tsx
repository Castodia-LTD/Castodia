"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bath,
  ClipboardList,
  Moon,
  Pill,
  Shirt,
  Toilet,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
};

type CareAudit = {
  id: string;
  name: string;
  lastWashed: string;
  lastClothingChange: string;
};

const washingTypes = ["Shower", "Bath", "Strip wash"];

function daysSince(dateString: string | null) {
  if (!dateString) return "No record";

  const then = new Date(dateString);
  const now = new Date();

  const diff = Math.floor(
    (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return `${diff} days ago`;
}

export default function ReportsPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUser, setSelectedServiceUser] = useState("all");

  const [timelineCount, setTimelineCount] = useState(0);
  const [toiletingCount, setToiletingCount] = useState(0);
  const [washingCount, setWashingCount] = useState(0);
  const [incidentCount, setIncidentCount] = useState(0);
  const [prnCount, setPrnCount] = useState(0);
  const [missedMedicationCount, setMissedMedicationCount] = useState(0);
  const [sleepCount, setSleepCount] = useState(0);

  const [careAudit, setCareAudit] = useState<CareAudit[]>([]);

  async function loadReports() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (!currentProfile?.organisation_id) return;

    const { data: serviceUserData } = await supabase
      .from("service_users")
      .select("id, full_name")
      .eq("organisation_id", currentProfile.organisation_id)
      .eq("is_active", true)
      .order("full_name");

    setServiceUsers(serviceUserData || []);

    let visibleServiceUsers = serviceUserData || [];

    if (selectedServiceUser !== "all") {
      visibleServiceUsers = visibleServiceUsers.filter(
        (su) => su.id === selectedServiceUser
      );
    }

    const serviceUserIds = visibleServiceUsers.map((su) => su.id);

    if (serviceUserIds.length === 0) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startIso = startOfMonth.toISOString();

    const { data: timelineRows } = await supabase
      .from("timeline_entries")
      .select("entry_type")
      .in("service_user_id", serviceUserIds)
      .gte("created_at", startIso);

    setTimelineCount(timelineRows?.length || 0);
    setIncidentCount(
      timelineRows?.filter((row) => row.entry_type === "Incident").length || 0
    );
    setSleepCount(
      timelineRows?.filter((row) => row.entry_type === "Sleep").length || 0
    );

    const { data: toiletingRows } = await supabase
      .from("toileting_records")
      .select("id")
      .in("service_user_id", serviceUserIds)
      .gte("created_at", startIso);

    setToiletingCount(toiletingRows?.length || 0);

    const { data: monthlyCareRows } = await supabase
      .from("personal_care_records")
      .select("care_type")
      .in("service_user_id", serviceUserIds)
      .gte("created_at", startIso);

    setWashingCount(
      monthlyCareRows?.filter((row) => washingTypes.includes(row.care_type))
        .length || 0
    );

    const { data: allCareRows } = await supabase
      .from("personal_care_records")
      .select("service_user_id, care_type, occurred_at")
      .in("service_user_id", serviceUserIds)
      .order("occurred_at", { ascending: false });

    const auditRows = visibleServiceUsers.map((su) => {
      const lastWash =
        allCareRows?.find(
          (row) =>
            row.service_user_id === su.id && washingTypes.includes(row.care_type)
        )?.occurred_at || null;

      const lastClothing =
        allCareRows?.find(
          (row) =>
            row.service_user_id === su.id && row.care_type === "Clothing changed"
        )?.occurred_at || null;

      return {
        id: su.id,
        name: su.full_name,
        lastWashed: daysSince(lastWash),
        lastClothingChange: daysSince(lastClothing),
      };
    });

    setCareAudit(auditRows);

    const { data: medicationRows } = await supabase
      .from("medication_administrations")
      .select("status, medication_profile_id")
      .in("service_user_id", serviceUserIds)
      .gte("created_at", startIso);

    setMissedMedicationCount(
      medicationRows?.filter((row) =>
        ["Refused", "Unavailable", "Omitted", "Not Administered"].includes(
          row.status
        )
      ).length || 0
    );

    const medicationProfileIds =
      medicationRows?.map((row) => row.medication_profile_id).filter(Boolean) ||
      [];

    if (medicationProfileIds.length > 0) {
      const { data: prnProfiles } = await supabase
        .from("medication_profiles")
        .select("id")
        .in("id", medicationProfileIds)
        .eq("is_prn", true);

      const prnIds = new Set(prnProfiles?.map((profile) => profile.id) || []);

      setPrnCount(
        medicationRows?.filter((row) => prnIds.has(row.medication_profile_id))
          .length || 0
      );
    } else {
      setPrnCount(0);
    }
  }

  useEffect(() => {
    loadReports();
  }, [selectedServiceUser]);

  const statCards = [
    ["Timeline Entries", timelineCount, ClipboardList],
    ["Toileting", toiletingCount, Toilet],
    ["Washing", washingCount, Bath],
    ["Incidents", incidentCount, AlertTriangle],
    ["PRN", prnCount, Pill],
    ["Missed Meds", missedMedicationCount, AlertTriangle],
    ["Sleep", sleepCount, Moon],
  ] as const;

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <Link href="/admin" className="text-slate-400 hover:text-white">
            ← Admin Portal
          </Link>

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Reports & Auditing</h1>
              <p className="mt-2 text-slate-400">
                Monthly overview and manager audit checks.
              </p>
            </div>

            <select
              value={selectedServiceUser}
              onChange={(e) => setSelectedServiceUser(e.target.value)}
              className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-white outline-none"
            >
              <option value="all" className="bg-slate-900">
                All Service Users
              </option>

              {serviceUsers.map((su) => (
                <option key={su.id} value={su.id} className="bg-slate-900">
                  {su.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(([label, value, Icon]) => (
              <div
                key={label}
                className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-cyan-300" />
                  <span className="text-xs uppercase text-slate-400">
                    This Month
                  </span>
                </div>

                <p className="mt-6 text-sm text-slate-300">{label}</p>
                <h2 className="mt-2 text-5xl font-bold">{value}</h2>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <Bath className="h-7 w-7 text-pink-300" />
                <div>
                  <h2 className="text-2xl font-bold">Personal Care Audit</h2>
                  <p className="text-sm text-slate-400">
                    Shower, bath and strip wash count as washing.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {careAudit.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <p className="font-semibold">{row.name}</p>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-xs text-slate-400">Last washed</p>
                        <p className="mt-1 font-bold">{row.lastWashed}</p>
                      </div>

                      <div className="rounded-xl bg-white/10 p-3">
                        <p className="text-xs text-slate-400">
                          Last clothing change
                        </p>
                        <p className="mt-1 font-bold">
                          {row.lastClothingChange}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-yellow-300" />
                <div>
                  <h2 className="text-2xl font-bold">Manager Attention</h2>
                  <p className="text-sm text-yellow-100/70">
                    Items that may need review.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {missedMedicationCount > 0 && (
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
                    Missed, refused or omitted medications recorded.
                  </div>
                )}

                {incidentCount > 0 && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    Incidents recorded this month.
                  </div>
                )}

                {careAudit.some((row) => row.lastWashed.includes("days")) && (
                  <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
                    One or more service users may be due a wash review.
                  </div>
                )}

                {missedMedicationCount === 0 &&
                  incidentCount === 0 &&
                  !careAudit.some((row) => row.lastWashed.includes("days")) && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      No current manager attention flags.
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
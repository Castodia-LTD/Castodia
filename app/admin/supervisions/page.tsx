"use client";

import { useEffect, useState } from "react";
import ManagerShell from "@/components/layouts/ManagerShell";
import SupervisionCard from "@/components/admin/supervisions/SupervisionCard";
import SupervisionForm from "@/components/admin/supervisions/SupervisionForm";
import { supabase } from "@/lib/supabase";
import type {
  StaffMember,
  StaffSupervision,
  SupervisionAction,
} from "@/lib/admin/supervisions/types";

export default function SupervisionsPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [supervisions, setSupervisions] = useState<StaffSupervision[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function getCurrentUserProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, organisation_id, full_name, role")
      .eq("id", user.id)
      .single();

    if (error || !data?.organisation_id) {
      alert("Organisation not found.");
      return null;
    }

    return data;
  }

  async function loadStaff() {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("organisation_id", profile.organisation_id)
      .order("full_name");

    if (error) {
      alert(error.message);
      return;
    }

    setStaff(data || []);
  }

  async function loadSupervisions() {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

   const { data, error } = await supabase
  .from("staff_supervisions")
  .select("*")
  .eq("organisation_id", profile.organisation_id)
  .order("supervision_date", { ascending: false })
  .limit(10);

    if (error) {
      alert(error.message);
      return;
    }

    setSupervisions((data || []) as StaffSupervision[]);
  }

  async function createSupervision(values: {
    staffId: string;
    supervisionDate: string;
    supervisionType: string;
    wellbeingNotes: string;
    performanceNotes: string;
    trainingDiscussed: string;
    concernsDiscussed: string;
    previousActionsReview: string;
    staffComments: string;
    managerSummary: string;
    nextSupervisionDate: string;
    actions: SupervisionAction[];
  }) {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

    if (!values.staffId) {
      alert("Please select a staff member.");
      return;
    }

    if (!values.supervisionDate) {
      alert("Please enter a supervision date.");
      return;
    }

    const { error } = await supabase.from("staff_supervisions").insert({
      organisation_id: profile.organisation_id,
      staff_id: values.staffId,
      supervisor_id: profile.id,
      supervision_date: values.supervisionDate,
      supervision_type: values.supervisionType,
      wellbeing_notes: values.wellbeingNotes.trim() || null,
      performance_notes: values.performanceNotes.trim() || null,
      training_discussed: values.trainingDiscussed.trim() || null,
      concerns_discussed: values.concernsDiscussed.trim() || null,
      previous_actions_review: values.previousActionsReview.trim() || null,
      staff_comments: values.staffComments.trim() || null,
      manager_summary: values.managerSummary.trim() || null,
      next_supervision_date: values.nextSupervisionDate || null,
      actions: values.actions.filter((action) => action.action.trim()),
      signed_by_supervisor: true,
      signed_by_staff: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await loadSupervisions();
  }

  useEffect(() => {
    loadStaff();
    loadSupervisions();
  }, []);
async function searchSupervisions() {
  const profile = await getCurrentUserProfile();

  if (!profile) return;

  let query = supabase
    .from("staff_supervisions")
    .select("*")
    .eq("organisation_id", profile.organisation_id)
    .order("supervision_date", { ascending: false });

  if (selectedStaffId) {
    query = query.eq("staff_id", selectedStaffId);
  }

  if (dateFrom) {
    query = query.gte("supervision_date", dateFrom);
  }

  if (dateTo) {
    query = query.lte("supervision_date", dateTo);
  }

  const { data, error } = await query;

  if (error) {
    alert(error.message);
    return;
  }

  setSupervisions((data || []) as StaffSupervision[]);
  setHasSearched(true);
}
  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Supervisions</h1>

          <p className="mt-2 text-slate-400">
            Record staff supervisions, agreed actions and follow-up dates.
          </p>

          <div className="mt-8">
            <SupervisionForm staff={staff} onCreate={createSupervision} />
          </div>

          <section className="mt-10">
  <h2 className="text-xl font-semibold">
    Search Supervisions
  </h2>

  <div className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
    <div className="grid gap-4 md:grid-cols-3">

      <select
        value={selectedStaffId}
        onChange={(e) => setSelectedStaffId(e.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white"
      >
        <option value="">All staff</option>

        {staff.map((person) => (
          <option key={person.id} value={person.id}>
            {person.full_name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white"
      />

      <input
        type="date"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white"
      />
    </div>

    <div className="mt-4 flex gap-3">
  <button
    onClick={searchSupervisions}
    className="rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-6 py-3 font-semibold"
  >
    Search
  </button>

  <button
    onClick={() => {
      setSelectedStaffId("");
      setDateFrom("");
      setDateTo("");
      setHasSearched(false);
      loadSupervisions();
    }}
    className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-semibold"
  >
    Clear
  </button>
</div>
  </div>

  <h2 className="mt-8 text-xl font-semibold">
    {hasSearched ? "Search Results" : "Recent Supervisions"}
  </h2>

            <div className="mt-4 space-y-4">
              {supervisions.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400">
                  No supervision records yet.
                </div>
              )}

              {supervisions.map((supervision) => (
                <SupervisionCard
                  key={supervision.id}
                  supervision={supervision}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </ManagerShell>
  );
}
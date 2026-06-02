"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import CompetencyForm from "@/components/admin/competencies/CompetencyForm";
import CompetencyCard from "@/components/admin/competencies/CompetencyCard";
import { supabase } from "@/lib/supabase";
import type {
  CompetencyAction,
  StaffCompetency,
  StaffMember,
} from "@/lib/admin/competencies/types";

export default function CompetenciesPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [competencies, setCompetencies] = useState<StaffCompetency[]>([]);

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

  async function loadRecentCompetencies() {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

    const { data, error } = await supabase
      .from("staff_competencies")
      .select("*")
      .eq("organisation_id", profile.organisation_id)
      .order("assessment_date", { ascending: false })
      .limit(30);

    if (error) {
      alert(error.message);
      return;
    }

    setCompetencies((data || []) as StaffCompetency[]);
  }

  async function searchCompetencies() {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

    let query = supabase
      .from("staff_competencies")
      .select("*")
      .eq("organisation_id", profile.organisation_id)
      .order("assessment_date", { ascending: false });

    if (selectedStaffId) {
      query = query.eq("staff_id", selectedStaffId);
    }

    if (dateFrom) {
      query = query.gte("assessment_date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("assessment_date", dateTo);
    }

    const { data, error } = await query;

    if (error) {
      alert(error.message);
      return;
    }

    setCompetencies((data || []) as StaffCompetency[]);
    setHasSearched(true);
  }

  async function createCompetency(values: {
    staffId: string;
    assessmentDate: string;
    reviewDate: string;
    outcome: string;
    strengths: string;
    developmentAreas: string;
    actions: CompetencyAction[];
    knowledgeResults: Record<string, boolean>;
    practicalResults: Record<string, boolean>;
  }) {
    const profile = await getCurrentUserProfile();

    if (!profile) return;

    if (!values.staffId) {
      alert("Please select a staff member.");
      return;
    }

    if (!values.assessmentDate) {
      alert("Please enter an assessment date.");
      return;
    }

    const { error } = await supabase.from("staff_competencies").insert({
      organisation_id: profile.organisation_id,
      staff_id: values.staffId,
      assessor_id: profile.id,
      competency_type: "Medication Administration",
      assessment_date: values.assessmentDate,
      review_date: values.reviewDate || null,
      knowledge_checks: values.knowledgeResults,
      practical_checks: values.practicalResults,
      strengths: values.strengths.trim() || null,
      development_areas: values.developmentAreas.trim() || null,
      actions: values.actions.filter((action) => action.action.trim()),
      outcome: values.outcome,
      assessor_signed: true,
      staff_signed: false,
    });

    if (error) {
      alert(error.message);
      return;
    }

    await loadRecentCompetencies();
  }

  function getStaffName(staffId: string) {
    return (
      staff.find((person) => person.id === staffId)?.full_name ||
      "Unknown staff member"
    );
  }

  useEffect(() => {
    loadStaff();
    loadRecentCompetencies();
  }, []);

  return (
    <AppShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Competencies</h1>

          <p className="mt-2 text-slate-400">
            Record staff competency assessments and review dates.
          </p>

          <div className="mt-8">
            <CompetencyForm staff={staff} onCreate={createCompetency} />
          </div>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">Search Competencies</h2>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="grid gap-4 md:grid-cols-3">
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
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
                  className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
                />

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
                />
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={searchCompetencies}
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
                    loadRecentCompetencies();
                  }}
                  className="rounded-2xl border border-white/10 bg-white/10 px-6 py-3 font-semibold"
                >
                  Clear
                </button>
              </div>
            </div>

            <h2 className="mt-8 text-xl font-semibold">
              {hasSearched
                ? `Search Results (${competencies.length})`
                : `Recent Competencies (${competencies.length})`}
            </h2>

            <div className="mt-4 space-y-4">
              {competencies.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400">
                  No competency records found.
                </div>
              )}

              {competencies.map((competency) => (
                <CompetencyCard
                  key={competency.id}
                  competency={competency}
                  staffName={getStaffName(competency.staff_id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  );
}
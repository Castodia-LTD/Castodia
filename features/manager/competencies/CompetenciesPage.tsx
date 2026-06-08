"use client";

import { useEffect, useState } from "react";
import CompetencyForm from "@/components/admin/competencies/CompetencyForm";
import CompetencyCard from "@/components/admin/competencies/CompetencyCard";
import { PageContainer, PageHeader, SectionCard } from "@/components/layouts";
import { supabase } from "@/lib/supabase";
import type {
  CompetencyAction,
  StaffCompetency,
  StaffMember,
} from "@/lib/admin/competencies/types";
import CompetencySearchPanel from "./components/CompetencySearchPanel";

type CurrentUserProfile = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: string;
};

export default function CompetenciesPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [competencies, setCompetencies] = useState<StaffCompetency[]>([]);

  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);

  async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
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

  async function loadStaff(profile: CurrentUserProfile) {
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

  async function loadRecentCompetencies(profile?: CurrentUserProfile) {
    const currentProfile = profile || (await getCurrentUserProfile());

    if (!currentProfile) return;

    const { data, error } = await supabase
      .from("staff_competencies")
      .select("*")
      .eq("organisation_id", currentProfile.organisation_id)
      .order("assessment_date", { ascending: false })
      .limit(30);

    if (error) {
      alert(error.message);
      return;
    }

    setCompetencies((data || []) as StaffCompetency[]);
  }

  async function loadPageData() {
    setLoading(true);

    const profile = await getCurrentUserProfile();

    if (!profile) {
      setLoading(false);
      return;
    }

    await Promise.all([loadStaff(profile), loadRecentCompetencies(profile)]);

    setLoading(false);
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

    setHasSearched(false);
    await loadRecentCompetencies(profile);
  }

  function clearSearch() {
    setSelectedStaffId("");
    setDateFrom("");
    setDateTo("");
    setHasSearched(false);
    loadRecentCompetencies();
  }

  function getStaffName(staffId: string) {
    return (
      staff.find((person) => person.id === staffId)?.full_name ||
      "Unknown staff member"
    );
  }

  useEffect(() => {
    loadPageData();
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Competencies"
        subtitle="Record staff competency assessments and review dates."
      />

      <section>
        <CompetencyForm staff={staff} onCreate={createCompetency} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-white">
          Search Competencies
        </h2>

        <div className="mt-4">
          <SectionCard>
            <CompetencySearchPanel
              staff={staff}
              selectedStaffId={selectedStaffId}
              dateFrom={dateFrom}
              dateTo={dateTo}
              setSelectedStaffId={setSelectedStaffId}
              setDateFrom={setDateFrom}
              setDateTo={setDateTo}
              onSearch={searchCompetencies}
              onClear={clearSearch}
            />
          </SectionCard>
        </div>

        <h2 className="mt-8 text-xl font-semibold text-white">
          {hasSearched
            ? `Search Results (${competencies.length})`
            : `Recent Competencies (${competencies.length})`}
        </h2>

        <div className="mt-4 space-y-4">
          {loading && (
            <SectionCard>
              <p className="text-slate-400">Loading competencies...</p>
            </SectionCard>
          )}

          {!loading && competencies.length === 0 && (
            <SectionCard>
              <p className="text-slate-400">No competency records found.</p>
            </SectionCard>
          )}

          {!loading &&
            competencies.map((competency) => (
              <CompetencyCard
                key={competency.id}
                competency={competency}
                staffName={getStaffName(competency.staff_id)}
              />
            ))}
        </div>
      </section>
    </PageContainer>
  );
}
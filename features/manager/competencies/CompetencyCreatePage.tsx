"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import CompetencyForm from "@/components/admin/competencies/CompetencyForm";

import {
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

import type {
  CompetencyAction,
  StaffMember,
} from "@/lib/admin/competencies/types";

type CurrentUserProfile = {
  id: string;
  organisation_id: string;
};

type CreateCompetencyValues = {
  staffId: string;
  assessmentDate: string;
  reviewDate: string;
  outcome: string;
  strengths: string;
  developmentAreas: string;
  actions: CompetencyAction[];
  knowledgeResults: Record<string, boolean>;
  practicalResults: Record<string, boolean>;
};

export default function CompetencyCreatePage() {
  const router = useRouter();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  async function getCurrentUserProfile(): Promise<CurrentUserProfile | null> {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert("You must be logged in.");
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, organisation_id")
      .eq("id", user.id)
      .single();

    if (error || !data?.organisation_id) {
      alert(error?.message || "Organisation not found.");
      return null;
    }

    return data;
  }

  async function loadStaff() {
    setLoading(true);

    const profile = await getCurrentUserProfile();

    if (!profile) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("organisation_id", profile.organisation_id)
      .order("full_name");

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setStaff((data || []) as StaffMember[]);
    setLoading(false);
  }

  async function handleCreateCompetency(values: CreateCompetencyValues) {
    if (!values.staffId) {
      alert("Select a staff member.");
      return;
    }

    if (!values.assessmentDate) {
      alert("Enter an assessment date.");
      return;
    }

    const profile = await getCurrentUserProfile();

    if (!profile) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const { error } = await supabase.from("staff_competencies").insert({
      organisation_id: profile.organisation_id,
      staff_id: values.staffId,
      assessor_id: user.id,
      competency_type: "Medication Administration",
      assessment_date: values.assessmentDate,
      review_date: values.reviewDate || null,
      outcome: values.outcome,
      strengths: values.strengths || null,
      development_areas: values.developmentAreas || null,
      actions: values.actions,
      knowledge_results: values.knowledgeResults,
      practical_results: values.practicalResults,
    });

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/manager/staff/competencies");
    router.refresh();
  }

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <CastodiaPageShell
      title="Add Competency"
      description="Record a staff medication competency assessment."
      maxWidth="wide"
    >
      <CastodiaCard padding="lg">
        {loading ? (
          <p className="text-sm text-slate-500">Loading staff...</p>
        ) : (
          <CompetencyForm
            staff={staff}
            onCreate={handleCreateCompetency}
          />
        )}
      </CastodiaCard>
    </CastodiaPageShell>
  );
}
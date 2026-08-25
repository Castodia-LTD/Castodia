"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SupervisionForm from "@/components/care/admin/supervisions/SupervisionForm";
import { supabase } from "@/lib/supabase";

import {
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

import type {
  StaffMember,
  SupervisionAction,
} from "@/lib/care/admin/supervisions/types";

type CurrentUserProfile = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: string;
};

export default function SupervisionCreatePage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);

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

    window.location.href = "/care/manager/staff/supervisions";
  }

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <CastodiaPageShell
      title="New Supervision"
      description="Record a staff supervision, agreed actions and follow-up date."
      maxWidth="wide"
      actions={
        <Link href="/care/manager/staff/supervisions">
          <CastodiaButton variant="secondary">
            <ArrowLeft size={16} />
            Back
          </CastodiaButton>
        </Link>
      }
    >
      <CastodiaCard>
        <SupervisionForm staff={staff} onCreate={createSupervision} />
      </CastodiaCard>
    </CastodiaPageShell>
  );
}
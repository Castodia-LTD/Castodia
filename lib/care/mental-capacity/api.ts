import { supabase } from "@/lib/supabase";

import {
  CAPACITY_ABILITIES,
  CAPACITY_OUTCOMES,
  type CapacityAbility,
  type CapacityOutcome,
  type MentalCapacityAssessmentInput,
  type MentalCapacityAssessmentRecord,
} from "./types";

type CurrentManager = {
  id: string;
  organisation_id: string;
  full_name: string | null;
  role: string;
};

function requiredText(value: string, label: string) {
  const cleanValue = value.trim();
  if (!cleanValue) throw new Error(`${label} is required.`);
  return cleanValue;
}

function requiredAbility(value: CapacityAbility | "", label: string) {
  if (!value || !CAPACITY_ABILITIES.includes(value)) {
    throw new Error(`Select a valid result for ${label}.`);
  }
  return value;
}

function requiredDate(value: string, label: string) {
  const cleanValue = requiredText(value, label);
  const date = new Date(`${cleanValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`${label} is invalid.`);
  return cleanValue;
}

async function getCurrentManager(): Promise<CurrentManager> {
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(authError.message);
  if (!auth.user) throw new Error("You must be signed in to complete an MCA.");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, organisation_id, full_name, role")
    .eq("id", auth.user.id)
    .single();

  if (error) throw new Error(error.message);
  if (!data?.organisation_id || data.role !== "manager") {
    throw new Error("Only organisation managers can complete an MCA.");
  }

  return data as CurrentManager;
}

export async function getMentalCapacityAssessments(serviceUserId: string) {
  const { data, error } = await supabase
    .from("mental_capacity_assessments")
    .select("*")
    .eq("service_user_id", requiredText(serviceUserId, "Service user ID"))
    .in("status", ["completed", "superseded"])
    .order("assessment_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as MentalCapacityAssessmentRecord[];
}

export async function getMentalCapacityAssessment(assessmentId: string) {
  const { data, error } = await supabase
    .from("mental_capacity_assessments")
    .select("*")
    .eq("id", requiredText(assessmentId, "Assessment ID"))
    .single();

  if (error) throw new Error(error.message);
  return data as MentalCapacityAssessmentRecord;
}

export async function createMentalCapacityAssessment(
  input: MentalCapacityAssessmentInput,
) {
  const manager = await getCurrentManager();
  const assessmentDate = requiredDate(input.assessmentDate, "Assessment date");
  const reviewDate = input.reviewDate
    ? requiredDate(input.reviewDate, "Review date")
    : null;

  if (reviewDate && reviewDate < assessmentDate) {
    throw new Error("Review date cannot be before the assessment date.");
  }
  if (!CAPACITY_OUTCOMES.includes(input.outcome as CapacityOutcome)) {
    throw new Error("Select the assessor's conclusion.");
  }
  if (input.data.capacityMayFluctuate === null) {
    throw new Error("Record whether the person's capacity may fluctuate.");
  }
  if (
    !["temporary", "permanent", "fluctuating", "unknown"].includes(
      input.data.impairmentNature,
    )
  ) {
    throw new Error("Select the nature of the impairment or disturbance.");
  }

  const data = {
    reasonForAssessment: requiredText(
      input.data.reasonForAssessment,
      "Reason for assessment",
    ),
    practicableSupport: requiredText(
      input.data.practicableSupport,
      "Practicable support",
    ),
    impairmentDetails: requiredText(
      input.data.impairmentDetails,
      "Impairment or disturbance evidence",
    ),
    impairmentNature: requiredText(
      input.data.impairmentNature,
      "Nature of impairment",
    ),
    relevantInformation: requiredText(
      input.data.relevantInformation,
      "Relevant information",
    ),
    understand: {
      result: requiredAbility(input.data.understand.result, "understanding"),
      evidence: requiredText(input.data.understand.evidence, "Understanding evidence"),
    },
    retain: {
      result: requiredAbility(input.data.retain.result, "retaining information"),
      evidence: requiredText(input.data.retain.evidence, "Retention evidence"),
    },
    useOrWeigh: {
      result: requiredAbility(input.data.useOrWeigh.result, "using or weighing information"),
      evidence: requiredText(input.data.useOrWeigh.evidence, "Use or weigh evidence"),
    },
    communicate: {
      result: requiredAbility(input.data.communicate.result, "communication"),
      evidence: requiredText(input.data.communicate.evidence, "Communication evidence"),
    },
    causalLink: requiredText(input.data.causalLink, "Causal link reasoning"),
    conclusionReasoning: requiredText(
      input.data.conclusionReasoning,
      "Conclusion reasoning",
    ),
    capacityMayFluctuate: input.data.capacityMayFluctuate,
    personViews: input.data.personViews.trim(),
  };

  const { data: created, error } = await supabase
    .from("mental_capacity_assessments")
    .insert({
      organisation_id: manager.organisation_id,
      service_user_id: requiredText(input.serviceUserId, "Service user ID"),
      title: requiredText(input.title, "Assessment title"),
      decision: requiredText(input.decision, "Exact decision"),
      assessment_date: assessmentDate,
      review_date: reviewDate,
      outcome: input.outcome,
      status: "completed",
      version: 1,
      assessment_data: data,
      template_snapshot: {
        framework: "castodia_mca_v1",
        title: "Castodia decision-specific capacity assessment",
      },
      assessor_id: manager.id,
      assessor_name: manager.full_name?.trim() || "Organisation manager",
      completed_at: new Date().toISOString(),
      created_by: manager.id,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created as MentalCapacityAssessmentRecord;
}

import { supabase } from "@/lib/supabase";

import {
  isRiskLevel,
  type CreateRiskAssessmentInput,
  type RiskAssessmentRecord,
  type RiskAssessmentWithOwner,
  type UpdateRiskAssessmentInput,
} from "./types";

type SupabaseErrorLike = {
  message: string;
} | null;

type CurrentRiskRegisterManager = {
  id: string;
  organisation_id: string;
  full_name: string | null;
  role: string;
};

function throwIfError(error: SupabaseErrorLike) {
  if (error) {
    throw new Error(error.message);
  }
}

function requiredText(value: string, fieldName: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleanValue;
}

function optionalText(value: string | null | undefined) {
  const cleanValue = value?.trim();

  return cleanValue ? cleanValue : null;
}

function optionalDate(value: string | null | undefined) {
  const cleanValue = value?.trim();

  if (!cleanValue) {
    return null;
  }

  const date = new Date(`${cleanValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Next review date is invalid.");
  }

  return cleanValue;
}

function validateRiskLevel(value: string) {
  if (!isRiskLevel(value)) {
    throw new Error("Select a valid overall risk rating.");
  }

  return value;
}

function validateCreateInput(input: CreateRiskAssessmentInput) {
  return {
    serviceUserId: requiredText(
      input.serviceUserId,
      "Service user ID",
    ),
    title: requiredText(input.title, "Risk title"),
    riskDescription: requiredText(
      input.riskDescription,
      "Risk description",
    ),
    personalRiskFactors: requiredText(
      input.personalRiskFactors,
      "Personal risk factors",
    ),
    controlMeasures: requiredText(
      input.controlMeasures,
      "Control measures",
    ),
    earlyWarningSigns: optionalText(input.earlyWarningSigns),
    actionsIfOccurs: requiredText(
      input.actionsIfOccurs,
      "Actions if the risk occurs",
    ),
    planOwnerId: optionalText(input.planOwnerId),
    reviewFrequency: optionalText(input.reviewFrequency),
    nextReviewDate: optionalDate(input.nextReviewDate),
    overallRisk: validateRiskLevel(input.overallRisk),
  };
}

function validateUpdateInput(input: UpdateRiskAssessmentInput) {
  return {
    title: requiredText(input.title, "Risk title"),
    riskDescription: requiredText(
      input.riskDescription,
      "Risk description",
    ),
    personalRiskFactors: requiredText(
      input.personalRiskFactors,
      "Personal risk factors",
    ),
    controlMeasures: requiredText(
      input.controlMeasures,
      "Control measures",
    ),
    earlyWarningSigns: optionalText(input.earlyWarningSigns),
    actionsIfOccurs: requiredText(
      input.actionsIfOccurs,
      "Actions if the risk occurs",
    ),
    planOwnerId: optionalText(input.planOwnerId),
    reviewFrequency: optionalText(input.reviewFrequency),
    nextReviewDate: optionalDate(input.nextReviewDate),
    overallRisk: validateRiskLevel(input.overallRisk),
  };
}

async function loadOwnerNames(
  assessments: RiskAssessmentRecord[],
): Promise<RiskAssessmentWithOwner[]> {
  const ownerIds = Array.from(
    new Set(
      assessments
        .map((assessment) => assessment.plan_owner_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  if (ownerIds.length === 0) {
    return assessments.map((assessment) => ({
      ...assessment,
      planOwnerName: null,
    }));
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", ownerIds);

  throwIfError(error);

  const ownerNames = new Map(
    (data ?? []).map((profile) => [
      profile.id,
      profile.full_name ?? null,
    ]),
  );

  return assessments.map((assessment) => ({
    ...assessment,
    planOwnerName: assessment.plan_owner_id
      ? ownerNames.get(assessment.plan_owner_id) ?? null
      : null,
  }));
}

export async function getCurrentRiskRegisterManager(): Promise<CurrentRiskRegisterManager> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  throwIfError(authError);

  if (!user) {
    throw new Error(
      "You must be signed in to manage risk assessments.",
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, organisation_id, full_name, role")
    .eq("id", user.id)
    .single();

  throwIfError(error);

  if (!data?.organisation_id || data.role !== "manager") {
    throw new Error(
      "Risk-assessment editing is restricted to organisation managers.",
    );
  }

  return data as CurrentRiskRegisterManager;
}

export async function getRiskRegister(
  serviceUserId: string,
  options?: {
    includeArchived?: boolean;
  },
): Promise<RiskAssessmentWithOwner[]> {
  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  let query = supabase
    .from("risk_assessments")
    .select("*")
    .eq("service_user_id", cleanServiceUserId)
    .order("updated_at", { ascending: false });

  if (!options?.includeArchived) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  throwIfError(error);

  return loadOwnerNames(
    (data ?? []) as RiskAssessmentRecord[],
  );
}

export async function getRiskAssessmentById(
  riskAssessmentId: string,
): Promise<RiskAssessmentWithOwner> {
  const cleanRiskAssessmentId = requiredText(
    riskAssessmentId,
    "Risk assessment ID",
  );

  const { data, error } = await supabase
    .from("risk_assessments")
    .select("*")
    .eq("id", cleanRiskAssessmentId)
    .single();

  throwIfError(error);

  const [assessment] = await loadOwnerNames([
    data as RiskAssessmentRecord,
  ]);

  if (!assessment) {
    throw new Error("The risk assessment could not be loaded.");
  }

  return assessment;
}

export async function createRiskAssessment(
  input: CreateRiskAssessmentInput,
): Promise<RiskAssessmentWithOwner> {
  const manager = await getCurrentRiskRegisterManager();
  const values = validateCreateInput(input);

  const { data, error } = await supabase
    .from("risk_assessments")
    .insert({
      organisation_id: manager.organisation_id,
      service_user_id: values.serviceUserId,

      title: values.title,
      risk_description: values.riskDescription,
      personal_risk_factors: values.personalRiskFactors,
      control_measures: values.controlMeasures,
      early_warning_signs: values.earlyWarningSigns,
      actions_if_occurs: values.actionsIfOccurs,

      plan_owner_id: values.planOwnerId ?? manager.id,
      review_frequency: values.reviewFrequency,
      next_review_date: values.nextReviewDate,

      overall_risk: values.overallRisk,
      status: "active",

      created_by: manager.id,
      updated_by: manager.id,
    })
    .select("*")
    .single();

  throwIfError(error);

  const [assessment] = await loadOwnerNames([
    data as RiskAssessmentRecord,
  ]);

  if (!assessment) {
    throw new Error(
      "The risk assessment was created but could not be returned.",
    );
  }

  return assessment;
}

export async function updateRiskAssessment(
  riskAssessmentId: string,
  input: UpdateRiskAssessmentInput,
): Promise<RiskAssessmentWithOwner> {
  const manager = await getCurrentRiskRegisterManager();

  const cleanRiskAssessmentId = requiredText(
    riskAssessmentId,
    "Risk assessment ID",
  );

  const values = validateUpdateInput(input);

  const { data, error } = await supabase
    .from("risk_assessments")
    .update({
      title: values.title,
      risk_description: values.riskDescription,
      personal_risk_factors: values.personalRiskFactors,
      control_measures: values.controlMeasures,
      early_warning_signs: values.earlyWarningSigns,
      actions_if_occurs: values.actionsIfOccurs,

      plan_owner_id: values.planOwnerId,
      review_frequency: values.reviewFrequency,
      next_review_date: values.nextReviewDate,

      overall_risk: values.overallRisk,
      updated_by: manager.id,
    })
    .eq("id", cleanRiskAssessmentId)
    .eq("status", "active")
    .select("*")
    .single();

  throwIfError(error);

  const [assessment] = await loadOwnerNames([
    data as RiskAssessmentRecord,
  ]);

  if (!assessment) {
    throw new Error(
      "The risk assessment was updated but could not be returned.",
    );
  }

  return assessment;
}

export async function reviewRiskAssessment(
  riskAssessmentId: string,
  input: UpdateRiskAssessmentInput,
): Promise<RiskAssessmentWithOwner> {
  const manager = await getCurrentRiskRegisterManager();

  const cleanRiskAssessmentId = requiredText(
    riskAssessmentId,
    "Risk assessment ID",
  );

  const values = validateUpdateInput(input);

  const { data, error } = await supabase
    .from("risk_assessments")
    .update({
      title: values.title,
      risk_description: values.riskDescription,
      personal_risk_factors: values.personalRiskFactors,
      control_measures: values.controlMeasures,
      early_warning_signs: values.earlyWarningSigns,
      actions_if_occurs: values.actionsIfOccurs,

      plan_owner_id: values.planOwnerId,
      review_frequency: values.reviewFrequency,
      next_review_date: values.nextReviewDate,

      overall_risk: values.overallRisk,
      reviewed_at: new Date().toISOString(),
      updated_by: manager.id,
    })
    .eq("id", cleanRiskAssessmentId)
    .eq("status", "active")
    .select("*")
    .single();

  throwIfError(error);

  const [assessment] = await loadOwnerNames([
    data as RiskAssessmentRecord,
  ]);

  if (!assessment) {
    throw new Error(
      "The risk assessment was reviewed but could not be returned.",
    );
  }

  return assessment;
}

export async function archiveRiskAssessment(
  riskAssessmentId: string,
): Promise<void> {
  const manager = await getCurrentRiskRegisterManager();

  const cleanRiskAssessmentId = requiredText(
    riskAssessmentId,
    "Risk assessment ID",
  );

  const { error } = await supabase
    .from("risk_assessments")
    .update({
      status: "archived",
      updated_by: manager.id,
    })
    .eq("id", cleanRiskAssessmentId)
    .eq("status", "active");

  throwIfError(error);
}
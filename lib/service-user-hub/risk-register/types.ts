export const RISK_LEVELS = [
  "low",
  "medium",
  "high",
] as const;

export type RiskLevel = (typeof RISK_LEVELS)[number];

export const RISK_STATUSES = [
  "active",
  "archived",
] as const;

export type RiskStatus = (typeof RISK_STATUSES)[number];

export type RiskAssessmentRecord = {
  id: string;
  organisation_id: string;
  service_user_id: string;

  title: string;
  risk_description: string;
  personal_risk_factors: string;
  control_measures: string;
  early_warning_signs: string | null;
  actions_if_occurs: string;

  plan_owner_id: string | null;
  review_frequency: string | null;
  next_review_date: string | null;

  overall_risk: RiskLevel;
  status: RiskStatus;
  reviewed_at: string | null;

  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type RiskAssessmentEditorValues = {
  title: string;
  riskDescription: string;
  personalRiskFactors: string;
  controlMeasures: string;
  earlyWarningSigns: string;
  actionsIfOccurs: string;

  planOwnerId: string | null;
  reviewFrequency: string;
  nextReviewDate: string;

  overallRisk: RiskLevel | "";
};

export type CreateRiskAssessmentInput = {
  serviceUserId: string;

  title: string;
  riskDescription: string;
  personalRiskFactors: string;
  controlMeasures: string;
  earlyWarningSigns: string | null;
  actionsIfOccurs: string;

  planOwnerId: string | null;
  reviewFrequency: string | null;
  nextReviewDate: string | null;

  overallRisk: RiskLevel;
};

export type UpdateRiskAssessmentInput = {
  title: string;
  riskDescription: string;
  personalRiskFactors: string;
  controlMeasures: string;
  earlyWarningSigns: string | null;
  actionsIfOccurs: string;

  planOwnerId: string | null;
  reviewFrequency: string | null;
  nextReviewDate: string | null;

  overallRisk: RiskLevel;
};

export type RiskAssessmentWithOwner = RiskAssessmentRecord & {
  planOwnerName: string | null;
};

export type RiskAssessmentCardState =
  | "empty"
  | "saved"
  | "editing";

export function isRiskLevel(value: string): value is RiskLevel {
  return RISK_LEVELS.includes(value as RiskLevel);
}

export function isRiskStatus(value: string): value is RiskStatus {
  return RISK_STATUSES.includes(value as RiskStatus);
}

export function createEmptyRiskAssessmentValues(
  planOwnerId: string | null = null,
): RiskAssessmentEditorValues {
  return {
    title: "",
    riskDescription: "",
    personalRiskFactors: "",
    controlMeasures: "",
    earlyWarningSigns: "",
    actionsIfOccurs: "",

    planOwnerId,
    reviewFrequency: "",
    nextReviewDate: "",

    overallRisk: "",
  };
}

export function mapRiskAssessmentToEditorValues(
  assessment: RiskAssessmentRecord,
): RiskAssessmentEditorValues {
  return {
    title: assessment.title,
    riskDescription: assessment.risk_description,
    personalRiskFactors: assessment.personal_risk_factors,
    controlMeasures: assessment.control_measures,
    earlyWarningSigns: assessment.early_warning_signs ?? "",
    actionsIfOccurs: assessment.actions_if_occurs,

    planOwnerId: assessment.plan_owner_id,
    reviewFrequency: assessment.review_frequency ?? "",
    nextReviewDate: assessment.next_review_date ?? "",

    overallRisk: assessment.overall_risk,
  };
}
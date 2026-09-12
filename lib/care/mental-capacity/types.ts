export const CAPACITY_ABILITIES = [
  "demonstrated",
  "not_demonstrated",
  "unclear",
] as const;

export type CapacityAbility = (typeof CAPACITY_ABILITIES)[number];

export const CAPACITY_OUTCOMES = [
  "has_capacity",
  "lacks_capacity",
  "inconclusive",
] as const;

export type CapacityOutcome = (typeof CAPACITY_OUTCOMES)[number];
export type CapacityStatus = "completed" | "superseded" | "archived";

export type FunctionalEvidence = {
  result: CapacityAbility;
  evidence: string;
};

export type MentalCapacityAssessmentData = {
  reasonForAssessment: string;
  practicableSupport: string;
  impairmentDetails: string;
  impairmentNature: "temporary" | "permanent" | "fluctuating" | "unknown";
  relevantInformation: string;
  understand: FunctionalEvidence;
  retain: FunctionalEvidence;
  useOrWeigh: FunctionalEvidence;
  communicate: FunctionalEvidence;
  causalLink: string;
  conclusionReasoning: string;
  capacityMayFluctuate: boolean;
  personViews: string;
};

export type MentalCapacityAssessmentRecord = {
  id: string;
  organisation_id: string;
  service_user_id: string;
  title: string;
  decision: string;
  assessment_date: string;
  review_date: string | null;
  outcome: CapacityOutcome;
  status: CapacityStatus;
  version: number;
  supersedes_assessment_id: string | null;
  assessment_data: MentalCapacityAssessmentData;
  template_snapshot: {
    framework: "castodia_mca_v1";
    title: string;
  };
  assessor_id: string;
  assessor_name: string;
  completed_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type MentalCapacityAssessmentInput = {
  serviceUserId: string;
  title: string;
  decision: string;
  assessmentDate: string;
  reviewDate: string;
  outcome: CapacityOutcome | "";
  data: {
    reasonForAssessment: string;
    practicableSupport: string;
    impairmentDetails: string;
    impairmentNature: MentalCapacityAssessmentData["impairmentNature"] | "";
    relevantInformation: string;
    understand: { result: CapacityAbility | ""; evidence: string };
    retain: { result: CapacityAbility | ""; evidence: string };
    useOrWeigh: { result: CapacityAbility | ""; evidence: string };
    communicate: { result: CapacityAbility | ""; evidence: string };
    causalLink: string;
    conclusionReasoning: string;
    capacityMayFluctuate: boolean | null;
    personViews: string;
  };
};

export type MentalCapacityDocumentRecord = {
  id: string;
  organisation_id: string;
  service_user_id: string;
  title: string;
  decision: string;
  assessment_date: string;
  review_date: string | null;
  completed_by: string;
  notes: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_by: string;
  uploaded_at: string;
};

export type MentalCapacityDocumentInput = {
  serviceUserId: string;
  title: string;
  decision: string;
  assessmentDate: string;
  reviewDate: string;
  completedBy: string;
  notes: string;
  file: File;
};

export function createEmptyMentalCapacityAssessment(
  serviceUserId: string,
): MentalCapacityAssessmentInput {
  const today = new Date().toISOString().slice(0, 10);
  const emptyEvidence = { result: "" as const, evidence: "" };

  return {
    serviceUserId,
    title: "",
    decision: "",
    assessmentDate: today,
    reviewDate: "",
    outcome: "",
    data: {
      reasonForAssessment: "",
      practicableSupport: "",
      impairmentDetails: "",
      impairmentNature: "",
      relevantInformation: "",
      understand: { ...emptyEvidence },
      retain: { ...emptyEvidence },
      useOrWeigh: { ...emptyEvidence },
      communicate: { ...emptyEvidence },
      causalLink: "",
      conclusionReasoning: "",
      capacityMayFluctuate: null,
      personViews: "",
    },
  };
}

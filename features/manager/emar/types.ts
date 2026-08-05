export type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
};

export type MedicationProfile = {
  id: string;
  service_user_id: string;
  medication_name: string;
  dose: string;
  route: string | null;
  round: string;
  instructions: string | null;
  is_prn: boolean;

  titration_plan_available: boolean;
  titration_trigger_missed_rounds: number | null;
  titration_instructions: string | null;

  manager_unlock_required: boolean;
  locked: boolean;
  active: boolean;

  created_at?: string;
};

export const roundOptions = ["Morning", "Lunch", "Tea", "Night"];
export type DosePlanStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

export type DosePlanType =
  | "titration"
  | "dose_reduction"
  | "temporary_change"
  | "taper"
  | "planned_discontinuation"
  | "restart";

export type DoseStageStatus =
  | "planned"
  | "current"
  | "completed"
  | "skipped"
  | "cancelled";

export type MedicationDosePlan = {
  id: string;
  medication_id: string;
  service_user_id: string;
  organisation_id: string;

  status: DosePlanStatus;
  plan_type: DosePlanType;

  reason: string | null;
  clinical_instructions: string | null;

  authorised_by: string | null;
  authorisation_source: string | null;
  authorised_at: string | null;

  start_date: string | null;
  review_date: string | null;

  current_stage_number: number | null;
  automatic_progression: boolean;

  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type MedicationDosePlanStage = {
  id: string;
  plan_id: string;
  stage_number: number;

  dose: string;
  frequency: string | null;
  route: string | null;

  start_date: string | null;
  end_date: string | null;
  review_date: string | null;

  instructions: string | null;
  status: DoseStageStatus;

  created_at: string;
};

export type MedicationDosePlanHistory = {
  id: string;
  plan_id: string;

  action: string;
  detail: string | null;

  previous_stage_number: number | null;
  new_stage_number: number | null;

  created_by: string | null;
  created_at: string;
};
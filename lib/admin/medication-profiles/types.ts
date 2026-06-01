export type ServiceUser = {
  id: string;
  full_name: string;
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
};
export type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
};

export type MedicationProfile = {
  id: string;
  service_user_id: string;
  medication_name: string;
  strength: string | null;
  dose: string;
  route: string;
  medication_type: string;
  rounds: string[] | null;
  instructions: string | null;
  prn_reason_required: boolean;
  prn_incident_recommended: boolean;
  active: boolean;
};

export const roundOptions = ["Morning", "Lunch", "Tea", "Night"];
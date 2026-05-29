export type OverallPresentationOption = {
  score: number;
  label: string;
};

export type ServiceUserWellbeingIndicator = {
  id: string;
  service_user_id: string;
  label: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export type WellbeingObservation = {
  id: string;
  service_user_id: string;
  overall_presentation_score: number;
  overall_presentation_label: string;
  observed_indicators: string[];
  notes: string | null;
  recorded_by: string;
  created_at: string;
};
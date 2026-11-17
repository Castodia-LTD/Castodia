export type ServiceUser = {
  id: string;
  first_name: string;
  surname: string;
  gender: string | null;
  house_name: string | null;
  care_model: "supported_living" | "domiciliary" | "residential";
  photo_url: string | null;
  key_notes: string | null;
  allergies: string | null;
  communication_needs: string | null;
  risk_notes: string | null;
  continence_care_enabled: boolean;
  track_pad_changes: boolean;
  track_bristol_stool_chart: boolean;
  is_active: boolean;
};
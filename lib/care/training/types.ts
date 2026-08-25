export type TrainingRecord = {
  id: string;
  organisation_id: string;
  staff_id: string;
  course_name: string;
  provider: string | null;
  completion_date: string;
  expiry_date: string | null;
  certificate_storage_path: string | null;
  certificate_file_name: string | null;
  certificate_mime_type: string | null;
  certificate_file_size: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainingStaffMember = {
  id: string;
  full_name: string;
  role: string;
};

export type TrainingStatus =
  | "current"
  | "due-soon"
  | "expired"
  | "no-expiry";
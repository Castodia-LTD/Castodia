export type Incident = {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
  service_user_id: string;
  reviewed: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  staff_name?: string;
  service_user_name?: string;
  reviewer_name?: string;
};
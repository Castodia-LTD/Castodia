export type Incident = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  created_at: string;
  reviewed: boolean;
  staff_name?: string;
  service_user_name?: string;
  house_name?: string;
};
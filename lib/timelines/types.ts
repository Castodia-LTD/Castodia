export type TimelineEntry = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  created_at: string;
  event_time: string;
  reviewed: boolean;
  staff_name?: string;
};

export type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
};
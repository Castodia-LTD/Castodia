export type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

export type Handover = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  active: boolean;
  staff_name?: string;
  read?: boolean;
  read_by?: string[];
  service_users?: ServiceUser[];
};
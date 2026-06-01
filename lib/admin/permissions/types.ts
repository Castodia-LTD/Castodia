export type Staff = {
  id: string;
  full_name: string;
  role: string;
};

export type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string;
};

export type AccessRow = {
  id: string;
  staff_id: string;
  service_user_id: string;
};
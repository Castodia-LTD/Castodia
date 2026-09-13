export type RotaPerson = {
  id: string;
  first_name: string;
  surname: string;
  full_name?: string | null;
  house_name?: string | null;
};

export type RotaStaff = {
  id: string;
  full_name: string | null;
  role: string | null;
};

export type RotaAssignment = {
  id: string;
  staff_user_id: string;
  profiles?: { full_name: string | null } | null;
};

export type RotaShift = {
  id: string;
  organisation_id: string;
  service_user_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  notes: string | null;
  status: "planned" | "cancelled";
  service_users?: {
    first_name: string;
    surname: string;
    full_name?: string | null;
    house_name?: string | null;
  } | null;
  rota_shift_assignments?: RotaAssignment[];
};

export type RotaConflict = {
  staffUserId: string;
  staffName: string;
  firstShiftId: string;
  secondShiftId: string;
};

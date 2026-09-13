export type RotaPerson = {
  id: string;
  full_name: string;
  house_name: string;
};

export type RotaStaff = {
  id: string;
  full_name: string | null;
  role: string | null;
};

export type RotaAssignmentType = "working" | "annual_leave";
export type RotaShiftPeriod = "day" | "night";

export type RotaAssignment = {
  id: string;
  staff_user_id: string;
  assignment_type: RotaAssignmentType;
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
  shift_period: RotaShiftPeriod;
  is_sleep_in: boolean;
  notes: string | null;
  status: "planned" | "cancelled";
  service_users?: {
    full_name: string;
    house_name: string;
  } | null;
  rota_shift_assignments?: RotaAssignment[];
};

export type RotaConflict = {
  staffUserId: string;
  staffName: string;
  firstShiftId: string;
  secondShiftId: string;
};

export type EmploymentStatus =
  | "active"
  | "probation"
  | "suspended"
  | "maternity_leave"
  | "long_term_leave"
  | "left";

export type ContractType =
  | "permanent"
  | "fixed_term"
  | "zero_hours"
  | "bank"
  | "agency"
  | "volunteer"
  | "other";

export type RightToWorkStatus =
  | "verified"
  | "pending"
  | "expired"
  | "not_required";

export type DbsStatus =
  | "clear"
  | "risk_assessed"
  | "pending"
  | "expired"
  | "not_required";

export type DbsLevel =
  | "basic"
  | "standard"
  | "enhanced"
  | "enhanced_with_barred_list";

export type OccupationalHealthStatus =
  | "cleared"
  | "cleared_with_adjustments"
  | "pending"
  | "review_required"
  | "not_required";

export type StaffEmployment = {
  id: string;
  organisation_id: string;
  staff_id: string;

  job_title: string | null;
  department: string | null;
  house_name: string | null;
  manager_id: string | null;

  employment_status: EmploymentStatus;
  contract_type: ContractType | null;
  contracted_hours: number | null;
  start_date: string | null;
  probation_end_date: string | null;
  end_date: string | null;

  work_email: string | null;
  work_phone: string | null;

  emergency_contact_name: string | null;
  emergency_contact_relationship: string | null;
  emergency_contact_phone: string | null;

  right_to_work_status: RightToWorkStatus | null;
  right_to_work_checked_at: string | null;
  right_to_work_expiry_date: string | null;

  dbs_status: DbsStatus | null;
  dbs_level: DbsLevel | null;
  dbs_certificate_number: string | null;
  dbs_issue_date: string | null;
  dbs_update_service: boolean;
  dbs_last_checked_at: string | null;
  dbs_next_check_date: string | null;

  occupational_health_status: OccupationalHealthStatus | null;
  occupational_health_review_date: string | null;
  workplace_adjustments: string | null;

  notes: string | null;

  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EmploymentManager = {
  id: string;
  full_name: string;
};

export type EmploymentFormValues = {
  job_title: string;
  department: string;
  house_name: string;
  manager_id: string;

  employment_status: EmploymentStatus;
  contract_type: ContractType | "";
  contracted_hours: string;
  start_date: string;
  probation_end_date: string;
  end_date: string;

  work_email: string;
  work_phone: string;

  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_phone: string;

  right_to_work_status: RightToWorkStatus | "";
  right_to_work_checked_at: string;
  right_to_work_expiry_date: string;

  dbs_status: DbsStatus | "";
  dbs_level: DbsLevel | "";
  dbs_certificate_number: string;
  dbs_issue_date: string;
  dbs_update_service: boolean;
  dbs_last_checked_at: string;
  dbs_next_check_date: string;

  occupational_health_status: OccupationalHealthStatus | "";
  occupational_health_review_date: string;
  workplace_adjustments: string;

  notes: string;
};
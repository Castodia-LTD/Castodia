import type {
  ContractType,
  DbsLevel,
  DbsStatus,
  EmploymentFormValues,
  EmploymentStatus,
  OccupationalHealthStatus,
  RightToWorkStatus,
  StaffEmployment,
} from "./types";

export function formatEmploymentDate(value: string | null) {
  if (!value) return "Not recorded";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

export function getEmploymentStatusLabel(
  status: EmploymentStatus
) {
  const labels: Record<EmploymentStatus, string> = {
    active: "Active",
    probation: "Probation",
    suspended: "Suspended",
    maternity_leave: "Maternity leave",
    long_term_leave: "Long-term leave",
    left: "Left employment",
  };

  return labels[status];
}

export function getEmploymentStatusVariant(
  status: EmploymentStatus
) {
  if (status === "active") return "success" as const;
  if (status === "probation") return "warning" as const;
  if (status === "left") return "neutral" as const;

  return "danger" as const;
}

export function getContractTypeLabel(
  value: ContractType | null
) {
  if (!value) return "Not recorded";

  const labels: Record<ContractType, string> = {
    permanent: "Permanent",
    fixed_term: "Fixed term",
    zero_hours: "Zero hours",
    bank: "Bank",
    agency: "Agency",
    volunteer: "Volunteer",
    other: "Other",
  };

  return labels[value];
}

export function getRightToWorkLabel(
  value: RightToWorkStatus | null
) {
  if (!value) return "Not recorded";

  const labels: Record<RightToWorkStatus, string> = {
    verified: "Verified",
    pending: "Pending",
    expired: "Expired",
    not_required: "Not required",
  };

  return labels[value];
}

export function getDbsStatusLabel(
  value: DbsStatus | null
) {
  if (!value) return "Not recorded";

  const labels: Record<DbsStatus, string> = {
    clear: "Clear",
    risk_assessed: "Risk assessed",
    pending: "Pending",
    expired: "Expired",
    not_required: "Not required",
  };

  return labels[value];
}

export function getDbsLevelLabel(
  value: DbsLevel | null
) {
  if (!value) return "Not recorded";

  const labels: Record<DbsLevel, string> = {
    basic: "Basic",
    standard: "Standard",
    enhanced: "Enhanced",
    enhanced_with_barred_list: "Enhanced with barred list",
  };

  return labels[value];
}

export function getOccupationalHealthLabel(
  value: OccupationalHealthStatus | null
) {
  if (!value) return "Not recorded";

  const labels: Record<OccupationalHealthStatus, string> = {
    cleared: "Cleared",
    cleared_with_adjustments: "Cleared with adjustments",
    pending: "Pending",
    review_required: "Review required",
    not_required: "Not required",
  };

  return labels[value];
}

export function createEmptyEmploymentForm(): EmploymentFormValues {
  return {
    job_title: "",
    department: "",
    house_name: "",
    manager_id: "",

    employment_status: "active",
    contract_type: "",
    contracted_hours: "",
    start_date: "",
    probation_end_date: "",
    end_date: "",

    work_email: "",
    work_phone: "",

    emergency_contact_name: "",
    emergency_contact_relationship: "",
    emergency_contact_phone: "",

    right_to_work_status: "",
    right_to_work_checked_at: "",
    right_to_work_expiry_date: "",

    dbs_status: "",
    dbs_level: "",
    dbs_certificate_number: "",
    dbs_issue_date: "",
    dbs_update_service: false,
    dbs_last_checked_at: "",
    dbs_next_check_date: "",

    occupational_health_status: "",
    occupational_health_review_date: "",
    workplace_adjustments: "",

    notes: "",
  };
}

export function employmentToFormValues(
  employment: StaffEmployment
): EmploymentFormValues {
  return {
    job_title: employment.job_title ?? "",
    department: employment.department ?? "",
    house_name: employment.house_name ?? "",
    manager_id: employment.manager_id ?? "",

    employment_status: employment.employment_status,
    contract_type: employment.contract_type ?? "",
    contracted_hours:
      employment.contracted_hours?.toString() ?? "",
    start_date: employment.start_date ?? "",
    probation_end_date: employment.probation_end_date ?? "",
    end_date: employment.end_date ?? "",

    work_email: employment.work_email ?? "",
    work_phone: employment.work_phone ?? "",

    emergency_contact_name:
      employment.emergency_contact_name ?? "",
    emergency_contact_relationship:
      employment.emergency_contact_relationship ?? "",
    emergency_contact_phone:
      employment.emergency_contact_phone ?? "",

    right_to_work_status:
      employment.right_to_work_status ?? "",
    right_to_work_checked_at:
      employment.right_to_work_checked_at ?? "",
    right_to_work_expiry_date:
      employment.right_to_work_expiry_date ?? "",

    dbs_status: employment.dbs_status ?? "",
    dbs_level: employment.dbs_level ?? "",
    dbs_certificate_number:
      employment.dbs_certificate_number ?? "",
    dbs_issue_date: employment.dbs_issue_date ?? "",
    dbs_update_service: employment.dbs_update_service,
    dbs_last_checked_at:
      employment.dbs_last_checked_at ?? "",
    dbs_next_check_date:
      employment.dbs_next_check_date ?? "",

    occupational_health_status:
      employment.occupational_health_status ?? "",
    occupational_health_review_date:
      employment.occupational_health_review_date ?? "",
    workplace_adjustments:
      employment.workplace_adjustments ?? "",

    notes: employment.notes ?? "",
  };
}
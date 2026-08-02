import type {
  ActionPriority,
  ActionStatus,
  CaseCategory,
  CaseRiskLevel,
  CaseStatus,
  ChronologyEntryType,
  DocumentCategory,
  ReferralStatus,
} from "./types";

export const CASE_CATEGORIES: Array<{ value: CaseCategory; label: string }> = [
  { value: "physical", label: "Physical abuse" },
  { value: "sexual", label: "Sexual abuse" },
  { value: "emotional", label: "Emotional or psychological abuse" },
  { value: "financial", label: "Financial or material abuse" },
  { value: "discriminatory", label: "Discriminatory abuse" },
  { value: "neglect", label: "Neglect or acts of omission" },
  { value: "organisational", label: "Organisational abuse" },
  { value: "self_neglect", label: "Self-neglect" },
  { value: "domestic_abuse", label: "Domestic abuse" },
  { value: "modern_slavery", label: "Modern slavery" },
  { value: "other", label: "Other" },
];

export const CASE_RISK_LEVELS: Array<{ value: CaseRiskLevel; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const CASE_STATUSES: Array<{ value: CaseStatus; label: string }> = [
  { value: "open", label: "Open" },
  { value: "referred", label: "Referred" },
  { value: "investigating", label: "Investigating" },
  { value: "monitoring", label: "Monitoring" },
  { value: "closed", label: "Closed" },
];

export const CHRONOLOGY_TYPES: Array<{
  value: ChronologyEntryType;
  label: string;
}> = [
  { value: "note", label: "Case note" },
  { value: "update", label: "Update" },
  { value: "contact", label: "Contact" },
  { value: "decision", label: "Decision" },
  { value: "meeting", label: "Meeting" },
  { value: "evidence", label: "Evidence" },
];

export const ACTION_PRIORITIES: Array<{ value: ActionPriority; label: string }> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const ACTION_STATUSES: Array<{ value: ActionStatus; label: string }> = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const REFERRAL_STATUSES: Array<{ value: ReferralStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "closed", label: "Closed" },
];

export const DOCUMENT_CATEGORIES: Array<{
  value: DocumentCategory;
  label: string;
}> = [
  { value: "evidence", label: "Evidence" },
  { value: "referral", label: "Referral" },
  { value: "correspondence", label: "Correspondence" },
  { value: "meeting", label: "Meeting record" },
  { value: "assessment", label: "Assessment" },
  { value: "closure", label: "Closure" },
  { value: "other", label: "Other" },
];

export const MAX_SAFEGUARDING_FILE_BYTES = 20 * 1024 * 1024;
export const SAFEGUARDING_BUCKET = "safeguarding-documents";

export function optionLabel<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

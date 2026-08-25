export type CaseCategory =
  | "physical"
  | "sexual"
  | "emotional"
  | "financial"
  | "discriminatory"
  | "neglect"
  | "organisational"
  | "self_neglect"
  | "domestic_abuse"
  | "modern_slavery"
  | "other";

export type CaseRiskLevel = "low" | "medium" | "high" | "critical";
export type CaseStatus = "open" | "referred" | "investigating" | "monitoring" | "closed";
export type ActionPriority = "low" | "medium" | "high" | "urgent";
export type ActionStatus = "todo" | "in_progress" | "blocked" | "completed" | "cancelled";
export type ReferralStatus = "draft" | "submitted" | "acknowledged" | "accepted" | "declined" | "closed";
export type DocumentCategory = "evidence" | "referral" | "correspondence" | "meeting" | "assessment" | "closure" | "other";
export type ChronologyEntryType =
  | "case_opened"
  | "note"
  | "update"
  | "contact"
  | "decision"
  | "meeting"
  | "evidence"
  | "timeline_link"
  | "status_change"
  | "risk_change"
  | "assignment_change"
  | "referral"
  | "action"
  | "document"
  | "closure";

export type CurrentManager = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: "manager";
};

export type ServiceUserOption = {
  id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  house_name: string;
  photo_url?: string | null;
};

export type StaffOption = {
  id: string;
  full_name: string;
  role: "manager" | "support";
};

export type SafeguardingCase = {
  id: string;
  organisation_id: string;
  service_user_id: string;
  case_reference: string;
  title: string;
  category: CaseCategory;
  risk_level: CaseRiskLevel;
  status: CaseStatus;
  concern_source: string;
  concern_summary: string;
  immediate_actions: string | null;
  desired_outcomes: string | null;
  reported_by_name: string | null;
  person_alleged_responsible: string | null;
  location: string | null;
  external_reference: string | null;
  local_authority_reference: string | null;
  police_reference: string | null;
  date_concern_raised: string;
  raised_by: string;
  assigned_manager_id: string | null;
  closure_reason: string | null;
  closure_outcome: string | null;
  lessons_learned: string | null;
  closed_at: string | null;
  closed_by: string | null;
  created_at: string;
  updated_at: string;
  service_user?: ServiceUserOption | null;
};

export type SafeguardingChronology = {
  id: string;
  case_id: string;
  organisation_id: string;
  entry_type: ChronologyEntryType;
  description: string;
  occurred_at: string;
  linked_timeline_entry_id: string | null;
  linked_timeline_snapshot: TimelineEntrySnapshot | null;
  created_by: string;
  created_at: string;
};

export type SafeguardingAction = {
  id: string;
  case_id: string;
  organisation_id: string;
  title: string;
  details: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: ActionPriority;
  status: ActionStatus;
  completion_note: string | null;
  completed_at: string | null;
  completed_by: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SafeguardingReferral = {
  id: string;
  case_id: string;
  organisation_id: string;
  agency: string;
  contact_name: string | null;
  contact_details: string | null;
  referral_method: string | null;
  referral_reference: string | null;
  referred_at: string;
  status: ReferralStatus;
  outcome: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SafeguardingDocument = {
  id: string;
  case_id: string;
  organisation_id: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size_bytes: number;
  category: DocumentCategory;
  description: string | null;
  uploaded_by: string;
  uploaded_at: string;
};

export type SafeguardingAuditEvent = {
  id: string;
  case_id: string | null;
  organisation_id: string;
  entity_type: string;
  entity_id: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  actor_id: string | null;
  occurred_at: string;
};

export type TimelineEntrySnapshot = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  created_at: string;
  event_time: string;
  metadata: Record<string, unknown> | null;
};

export type SafeguardingCaseBundle = {
  currentManager: CurrentManager;
  safeguardingCase: SafeguardingCase;
  chronology: SafeguardingChronology[];
  actions: SafeguardingAction[];
  referrals: SafeguardingReferral[];
  documents: SafeguardingDocument[];
  audit: SafeguardingAuditEvent[];
  staff: StaffOption[];
};

export type NewSafeguardingCaseInput = {
  serviceUserId: string;
  title: string;
  category: CaseCategory;
  riskLevel: CaseRiskLevel;
  concernSummary: string;
  dateConcernRaised: string;
  concernSource: string;
  immediateActions?: string;
  desiredOutcomes?: string;
  reportedByName?: string;
  personAllegedResponsible?: string;
  location?: string;
};

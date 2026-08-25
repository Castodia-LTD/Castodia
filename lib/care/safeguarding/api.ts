import { supabase } from "@/lib/supabase";

import {
  MAX_SAFEGUARDING_FILE_BYTES,
  SAFEGUARDING_BUCKET,
} from "./constants";
import type {
  ActionPriority,
  ActionStatus,
  CaseCategory,
  CaseRiskLevel,
  CaseStatus,
  ChronologyEntryType,
  CurrentManager,
  DocumentCategory,
  NewSafeguardingCaseInput,
  ReferralStatus,
  SafeguardingAction,
  SafeguardingAuditEvent,
  SafeguardingCase,
  SafeguardingCaseBundle,
  SafeguardingChronology,
  SafeguardingDocument,
  SafeguardingReferral,
  ServiceUserOption,
  StaffOption,
  TimelineEntrySnapshot,
} from "./types";

type SupabaseErrorLike = { message: string } | null;

function throwIfError(error: SupabaseErrorLike) {
  if (error) {
    throw new Error(error.message);
  }
}

function optionalText(value: string | null | undefined) {
  const cleanValue = value?.trim();
  return cleanValue ? cleanValue : null;
}

export async function getCurrentManager(): Promise<CurrentManager> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  throwIfError(authError);

  if (!user) {
    throw new Error("You must be signed in to open safeguarding.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, organisation_id, full_name, role")
    .eq("id", user.id)
    .single();

  throwIfError(error);

  if (!data?.organisation_id || data.role !== "manager") {
    throw new Error("Safeguarding is restricted to organisation managers.");
  }

  return data as CurrentManager;
}

export async function listSafeguardingServiceUsers(): Promise<ServiceUserOption[]> {
  const manager = await getCurrentManager();
  const { data, error } = await supabase
    .from("service_users")
    .select("id, full_name, first_name, surname, house_name, photo_url")
    .eq("organisation_id", manager.organisation_id)
    .eq("is_active", true)
    .order("full_name");

  throwIfError(error);
  return (data ?? []) as ServiceUserOption[];
}

export async function listSafeguardingCases(): Promise<SafeguardingCase[]> {
  await getCurrentManager();
  const { data, error } = await supabase
    .from("safeguarding_cases")
    .select(`
      *,
      service_user:service_users!safeguarding_cases_service_user_id_fkey(
        id,
        full_name,
        first_name,
        surname,
        house_name,
        photo_url
      )
    `)
    .order("updated_at", { ascending: false });

  throwIfError(error);
  return (data ?? []) as unknown as SafeguardingCase[];
}

export async function createSafeguardingCase(
  input: NewSafeguardingCaseInput,
): Promise<string> {
  await getCurrentManager();
  const { data, error } = await supabase.rpc("create_safeguarding_case", {
    p_service_user_id: input.serviceUserId,
    p_title: input.title.trim(),
    p_category: input.category,
    p_risk_level: input.riskLevel,
    p_concern_summary: input.concernSummary.trim(),
    p_date_concern_raised: input.dateConcernRaised,
    p_concern_source: input.concernSource,
    p_immediate_actions: optionalText(input.immediateActions),
    p_desired_outcomes: optionalText(input.desiredOutcomes),
    p_reported_by_name: optionalText(input.reportedByName),
    p_person_alleged_responsible: optionalText(input.personAllegedResponsible),
    p_location: optionalText(input.location),
  });

  throwIfError(error);

  if (typeof data !== "string") {
    throw new Error("The safeguarding case was created but no case ID was returned.");
  }

  return data;
}

export async function getSafeguardingCaseBundle(
  caseId: string,
): Promise<SafeguardingCaseBundle> {
  const currentManager = await getCurrentManager();

  const [
    caseResult,
    chronologyResult,
    actionsResult,
    referralsResult,
    documentsResult,
    auditResult,
    staffResult,
  ] = await Promise.all([
    supabase
      .from("safeguarding_cases")
      .select(`
        *,
        service_user:service_users!safeguarding_cases_service_user_id_fkey(
          id,
          full_name,
          first_name,
          surname,
          house_name,
          photo_url
        )
      `)
      .eq("id", caseId)
      .single(),
    supabase
      .from("safeguarding_chronology")
      .select("*")
      .eq("case_id", caseId)
      .order("occurred_at", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("safeguarding_actions")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false }),
    supabase
      .from("safeguarding_referrals")
      .select("*")
      .eq("case_id", caseId)
      .order("referred_at", { ascending: false }),
    supabase
      .from("safeguarding_documents")
      .select("*")
      .eq("case_id", caseId)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("safeguarding_audit_log")
      .select("*")
      .eq("case_id", caseId)
      .order("occurred_at", { ascending: false })
      .limit(250),
    supabase.rpc("get_safeguarding_staff_options"),
  ]);

  throwIfError(caseResult.error);
  throwIfError(chronologyResult.error);
  throwIfError(actionsResult.error);
  throwIfError(referralsResult.error);
  throwIfError(documentsResult.error);
  throwIfError(auditResult.error);
  throwIfError(staffResult.error);

  return {
    currentManager,
    safeguardingCase: caseResult.data as unknown as SafeguardingCase,
    chronology: (chronologyResult.data ?? []) as SafeguardingChronology[],
    actions: (actionsResult.data ?? []) as SafeguardingAction[],
    referrals: (referralsResult.data ?? []) as SafeguardingReferral[],
    documents: (documentsResult.data ?? []) as SafeguardingDocument[],
    audit: (auditResult.data ?? []) as SafeguardingAuditEvent[],
    staff: (staffResult.data ?? []) as StaffOption[],
  };
}

export type SafeguardingCasePatch = Partial<{
  title: string;
  category: CaseCategory;
  risk_level: CaseRiskLevel;
  status: Exclude<CaseStatus, "closed">;
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
  assigned_manager_id: string | null;
}>;

export async function updateSafeguardingCase(
  caseId: string,
  patch: SafeguardingCasePatch,
) {
  await getCurrentManager();
  const { error } = await supabase
    .from("safeguarding_cases")
    .update(patch)
    .eq("id", caseId);
  throwIfError(error);
}

export async function addChronologyEntry(args: {
  safeguardingCase: SafeguardingCase;
  entryType: ChronologyEntryType;
  description: string;
  occurredAt: string;
}) {
  const manager = await getCurrentManager();
  const { error } = await supabase.from("safeguarding_chronology").insert({
    case_id: args.safeguardingCase.id,
    organisation_id: args.safeguardingCase.organisation_id,
    entry_type: args.entryType,
    description: args.description.trim(),
    occurred_at: args.occurredAt,
    created_by: manager.id,
  });
  throwIfError(error);
}

export async function listTimelineEntriesForCase(
  safeguardingCase: SafeguardingCase,
): Promise<TimelineEntrySnapshot[]> {
  await getCurrentManager();
  const { data, error } = await supabase
    .from("timeline_entries")
    // `timeline_entries` does not have a metadata column in Castodia's current
    // schema. Keep the snapshot shape stable below without querying a missing
    // field, which previously prevented the selector from loading at all.
    .select("id, service_user_id, created_by, entry_type, content, created_at, event_time")
    .eq("service_user_id", safeguardingCase.service_user_id)
    .order("event_time", { ascending: false })
    .limit(100);

  throwIfError(error);
  return (data ?? []).map((entry) => ({
    ...entry,
    metadata: null,
  })) as TimelineEntrySnapshot[];
}

export async function linkTimelineEntry(args: {
  safeguardingCase: SafeguardingCase;
  timelineEntry: TimelineEntrySnapshot;
}) {
  const manager = await getCurrentManager();

  if (args.timelineEntry.service_user_id !== args.safeguardingCase.service_user_id) {
    throw new Error("That timeline entry belongs to a different service user.");
  }

  const { error } = await supabase.from("safeguarding_chronology").insert({
    case_id: args.safeguardingCase.id,
    organisation_id: args.safeguardingCase.organisation_id,
    entry_type: "timeline_link",
    description: `Linked timeline entry: ${args.timelineEntry.entry_type}`,
    occurred_at: args.timelineEntry.event_time,
    linked_timeline_entry_id: args.timelineEntry.id,
    linked_timeline_snapshot: args.timelineEntry,
    created_by: manager.id,
  });
  throwIfError(error);
}

export async function createSafeguardingAction(args: {
  safeguardingCase: SafeguardingCase;
  title: string;
  details?: string;
  assignedTo?: string;
  dueDate?: string;
  priority: ActionPriority;
}) {
  const manager = await getCurrentManager();
  const { error } = await supabase.from("safeguarding_actions").insert({
    case_id: args.safeguardingCase.id,
    organisation_id: args.safeguardingCase.organisation_id,
    title: args.title.trim(),
    details: optionalText(args.details),
    assigned_to: optionalText(args.assignedTo),
    due_date: optionalText(args.dueDate),
    priority: args.priority,
    created_by: manager.id,
  });
  throwIfError(error);
}

export async function updateSafeguardingAction(
  actionId: string,
  patch: Partial<{
    title: string;
    details: string | null;
    assigned_to: string | null;
    due_date: string | null;
    priority: ActionPriority;
    status: ActionStatus;
    completion_note: string | null;
  }>,
) {
  await getCurrentManager();
  const { error } = await supabase
    .from("safeguarding_actions")
    .update(patch)
    .eq("id", actionId);
  throwIfError(error);
}

export async function createSafeguardingReferral(args: {
  safeguardingCase: SafeguardingCase;
  agency: string;
  contactName?: string;
  contactDetails?: string;
  referralMethod?: string;
  referralReference?: string;
  referredAt: string;
  status: ReferralStatus;
  outcome?: string;
}) {
  const manager = await getCurrentManager();
  const { error } = await supabase.from("safeguarding_referrals").insert({
    case_id: args.safeguardingCase.id,
    organisation_id: args.safeguardingCase.organisation_id,
    agency: args.agency.trim(),
    contact_name: optionalText(args.contactName),
    contact_details: optionalText(args.contactDetails),
    referral_method: optionalText(args.referralMethod),
    referral_reference: optionalText(args.referralReference),
    referred_at: args.referredAt,
    status: args.status,
    outcome: optionalText(args.outcome),
    created_by: manager.id,
  });
  throwIfError(error);
}

export async function updateSafeguardingReferral(
  referralId: string,
  patch: Partial<{ status: ReferralStatus; outcome: string | null }>,
) {
  await getCurrentManager();
  const { error } = await supabase
    .from("safeguarding_referrals")
    .update(patch)
    .eq("id", referralId);
  throwIfError(error);
}

function safeFileName(fileName: string) {
  const cleanName = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleanName || "document";
}

export async function uploadSafeguardingDocument(args: {
  safeguardingCase: SafeguardingCase;
  file: File;
  category: DocumentCategory;
  description?: string;
}) {
  const manager = await getCurrentManager();

  if (args.file.size <= 0 || args.file.size > MAX_SAFEGUARDING_FILE_BYTES) {
    throw new Error("Safeguarding documents must be between 1 byte and 20 MB.");
  }

  const storagePath = [
    args.safeguardingCase.organisation_id,
    args.safeguardingCase.id,
    `${crypto.randomUUID()}-${safeFileName(args.file.name)}`,
  ].join("/");

  const uploadResult = await supabase.storage
    .from(SAFEGUARDING_BUCKET)
    .upload(storagePath, args.file, {
      cacheControl: "3600",
      contentType: args.file.type || undefined,
      upsert: false,
    });

  throwIfError(uploadResult.error);

  const { error: metadataError } = await supabase
    .from("safeguarding_documents")
    .insert({
      case_id: args.safeguardingCase.id,
      organisation_id: args.safeguardingCase.organisation_id,
      file_name: args.file.name,
      storage_path: storagePath,
      mime_type: args.file.type || null,
      file_size_bytes: args.file.size,
      category: args.category,
      description: optionalText(args.description),
      uploaded_by: manager.id,
    });

  if (metadataError) {
    await supabase.storage.from(SAFEGUARDING_BUCKET).remove([storagePath]);
    throw new Error(metadataError.message);
  }
}

export async function openSafeguardingDocument(document: SafeguardingDocument) {
  await getCurrentManager();
  const { data, error } = await supabase.storage
    .from(SAFEGUARDING_BUCKET)
    .createSignedUrl(document.storage_path, 60);

  throwIfError(error);

  if (!data?.signedUrl) {
    throw new Error("A secure document link could not be created.");
  }

  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}

export async function deleteSafeguardingDocument(document: SafeguardingDocument) {
  await getCurrentManager();
  const storageResult = await supabase.storage
    .from(SAFEGUARDING_BUCKET)
    .remove([document.storage_path]);
  throwIfError(storageResult.error);

  const { error } = await supabase
    .from("safeguarding_documents")
    .delete()
    .eq("id", document.id);
  throwIfError(error);
}

export async function closeSafeguardingCase(args: {
  caseId: string;
  closureReason: string;
  closureOutcome: string;
  lessonsLearned?: string;
}) {
  await getCurrentManager();
  const { error } = await supabase.rpc("close_safeguarding_case", {
    p_case_id: args.caseId,
    p_closure_reason: args.closureReason.trim(),
    p_closure_outcome: args.closureOutcome.trim(),
    p_lessons_learned: optionalText(args.lessonsLearned),
  });
  throwIfError(error);
}

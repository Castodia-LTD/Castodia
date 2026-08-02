"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FilePlus2,
  Link2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { useSafeguardingCase } from "@/hooks/safeguarding/useSafeguardingCase";
import {
  addChronologyEntry,
  closeSafeguardingCase,
  createSafeguardingAction,
  createSafeguardingReferral,
  deleteSafeguardingDocument,
  linkTimelineEntry,
  listTimelineEntriesForCase,
  openSafeguardingDocument,
  updateSafeguardingAction,
  updateSafeguardingCase,
  updateSafeguardingReferral,
  uploadSafeguardingDocument,
} from "@/lib/safeguarding/api";
import {
  ACTION_PRIORITIES,
  ACTION_STATUSES,
  CASE_CATEGORIES,
  CASE_RISK_LEVELS,
  DOCUMENT_CATEGORIES,
  REFERRAL_STATUSES,
} from "@/lib/safeguarding/constants";
import type {
  ActionPriority,
  ActionStatus,
  CaseCategory,
  CaseRiskLevel,
  ChronologyEntryType,
  DocumentCategory,
  ReferralStatus,
  SafeguardingCase,
  SafeguardingCaseBundle,
  TimelineEntrySnapshot,
} from "@/lib/safeguarding/types";

import {
  Button,
  EmptyState,
  ErrorBanner,
  Field,
  Input,
  Panel,
  SectionHeading,
  Select,
  StatusPill,
  Textarea,
  formatDate,
  formatDateTime,
  humanise,
  staffName,
  toDateTimeLocal,
  toIsoDateTime,
} from "./ui";

type Tab = "overview" | "chronology" | "actions" | "referrals" | "documents" | "closure" | "audit";
type RunMutation = (operation: () => Promise<void>) => Promise<void>;

const tabs: Array<{ value: Tab; label: string }> = [
  { value: "overview", label: "Overview" },
  { value: "chronology", label: "Chronology" },
  { value: "actions", label: "Actions" },
  { value: "referrals", label: "Referrals" },
  { value: "documents", label: "Documents" },
  { value: "closure", label: "Closure" },
  { value: "audit", label: "Audit" },
];

export default function SafeguardingCaseWorkspace({ caseId }: { caseId: string }) {
  const { bundle, loading, saving, error, reload, mutate } = useSafeguardingCase(caseId);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const run: RunMutation = async (operation) => {
    try {
      await mutate(operation);
    } catch {
      // The hook keeps and displays the mutation error.
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1500px] space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        <ErrorBanner message={error ?? "Safeguarding case not found."} />
        <Link href="/manager/safeguarding" className="text-sm font-semibold text-teal-700 hover:underline">
          Return to safeguarding
        </Link>
      </div>
    );
  }

  const safeguardingCase = bundle.safeguardingCase;
  const isClosed = safeguardingCase.status === "closed";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link href="/manager/safeguarding" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-teal-700">
              <ArrowLeft size={16} aria-hidden="true" />
              Safeguarding register
            </Link>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <ShieldCheck size={23} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-teal-700">{safeguardingCase.case_reference}</span>
                  <StatusPill value={safeguardingCase.status} />
                  <StatusPill value={safeguardingCase.risk_level} />
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{safeguardingCase.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {safeguardingCase.service_user?.full_name ?? "Unknown service user"}
                  {safeguardingCase.service_user?.house_name ? ` · ${safeguardingCase.service_user.house_name}` : ""}
                </p>
              </div>
            </div>
          </div>
          <Button variant="secondary" onClick={() => void reload()} disabled={saving}>
            <RefreshCw size={15} className={saving ? "animate-spin" : ""} aria-hidden="true" />
            Refresh
          </Button>
        </div>

        {error ? <ErrorBanner message={error} /> : null}
        {isClosed ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
            This case is closed. Its record remains available for review and audit.
          </div>
        ) : null}
      </header>

      <div className="overflow-x-auto border-b border-slate-200" role="tablist" aria-label="Safeguarding case sections">
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${activeTab === tab.value ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
            >
              {tab.label}
              {tab.value === "actions" && bundle.actions.length ? ` (${bundle.actions.length})` : ""}
              {tab.value === "documents" && bundle.documents.length ? ` (${bundle.documents.length})` : ""}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? <OverviewTab key={safeguardingCase.updated_at} bundle={bundle} saving={saving} run={run} /> : null}
      {activeTab === "chronology" ? <ChronologyTab bundle={bundle} saving={saving} run={run} /> : null}
      {activeTab === "actions" ? <ActionsTab bundle={bundle} saving={saving} run={run} /> : null}
      {activeTab === "referrals" ? <ReferralsTab bundle={bundle} saving={saving} run={run} /> : null}
      {activeTab === "documents" ? <DocumentsTab bundle={bundle} saving={saving} run={run} /> : null}
      {activeTab === "closure" ? <ClosureTab bundle={bundle} saving={saving} run={run} /> : null}
      {activeTab === "audit" ? <AuditTab bundle={bundle} /> : null}
    </div>
  );
}

function OverviewTab({ bundle, saving, run }: { bundle: SafeguardingCaseBundle; saving: boolean; run: RunMutation }) {
  const item = bundle.safeguardingCase;
  const isClosed = item.status === "closed";
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState<CaseCategory>(item.category);
  const [risk, setRisk] = useState<CaseRiskLevel>(item.risk_level);
  const [status, setStatus] = useState<Exclude<typeof item.status, "closed">>(item.status === "closed" ? "monitoring" : item.status);
  const [source, setSource] = useState(item.concern_source);
  const [raisedAt, setRaisedAt] = useState(toDateTimeLocal(item.date_concern_raised));
  const [assignedManager, setAssignedManager] = useState(item.assigned_manager_id ?? "");
  const [summary, setSummary] = useState(item.concern_summary);
  const [immediateActions, setImmediateActions] = useState(item.immediate_actions ?? "");
  const [desiredOutcomes, setDesiredOutcomes] = useState(item.desired_outcomes ?? "");
  const [reportedBy, setReportedBy] = useState(item.reported_by_name ?? "");
  const [allegedResponsible, setAllegedResponsible] = useState(item.person_alleged_responsible ?? "");
  const [location, setLocation] = useState(item.location ?? "");
  const [externalReference, setExternalReference] = useState(item.external_reference ?? "");
  const [localAuthorityReference, setLocalAuthorityReference] = useState(item.local_authority_reference ?? "");
  const [policeReference, setPoliceReference] = useState(item.police_reference ?? "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await run(() => updateSafeguardingCase(item.id, {
      title: title.trim(),
      category,
      risk_level: risk,
      status,
      concern_source: source,
      concern_summary: summary.trim(),
      date_concern_raised: toIsoDateTime(raisedAt),
      assigned_manager_id: assignedManager || null,
      immediate_actions: immediateActions.trim() || null,
      desired_outcomes: desiredOutcomes.trim() || null,
      reported_by_name: reportedBy.trim() || null,
      person_alleged_responsible: allegedResponsible.trim() || null,
      location: location.trim() || null,
      external_reference: externalReference.trim() || null,
      local_authority_reference: localAuthorityReference.trim() || null,
      police_reference: policeReference.trim() || null,
    }));
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <Panel>
        <SectionHeading title="Case overview" description="Core details, ownership and current risk." />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Case reference"><Input value={item.case_reference} disabled /></Field>
          <Field label="Service user"><Input value={item.service_user?.full_name ?? "Unknown"} disabled /></Field>
          <Field label="Concern raised"><Input type="datetime-local" value={raisedAt} onChange={(event) => setRaisedAt(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Title" required><Input required value={title} onChange={(event) => setTitle(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Category" required>
            <Select value={category} onChange={(event) => setCategory(event.target.value as CaseCategory)} disabled={isClosed}>
              {CASE_CATEGORIES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </Field>
          <Field label="Risk" required>
            <Select value={risk} onChange={(event) => setRisk(event.target.value as CaseRiskLevel)} disabled={isClosed}>
              {CASE_RISK_LEVELS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
          </Field>
          <Field label="Status" required>
            <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} disabled={isClosed}>
              <option value="open">Open</option><option value="referred">Referred</option><option value="investigating">Investigating</option><option value="monitoring">Monitoring</option>
            </Select>
          </Field>
          <Field label="Assigned manager">
            <Select value={assignedManager} onChange={(event) => setAssignedManager(event.target.value)} disabled={isClosed}>
              <option value="">Unassigned</option>
              {bundle.staff.filter((person) => person.role === "manager").map((person) => <option key={person.id} value={person.id}>{person.full_name}</option>)}
            </Select>
          </Field>
          <Field label="Concern source"><Input value={source} onChange={(event) => setSource(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Reported by"><Input value={reportedBy} onChange={(event) => setReportedBy(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Location"><Input value={location} onChange={(event) => setLocation(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Person alleged responsible"><Input value={allegedResponsible} onChange={(event) => setAllegedResponsible(event.target.value)} disabled={isClosed} /></Field>
          <Field label="External reference"><Input value={externalReference} onChange={(event) => setExternalReference(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Local authority reference"><Input value={localAuthorityReference} onChange={(event) => setLocalAuthorityReference(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Police reference"><Input value={policeReference} onChange={(event) => setPoliceReference(event.target.value)} disabled={isClosed} /></Field>
        </div>
      </Panel>
      <Panel>
        <div className="space-y-5">
          <Field label="Concern summary" required><Textarea required value={summary} onChange={(event) => setSummary(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Immediate protective actions"><Textarea value={immediateActions} onChange={(event) => setImmediateActions(event.target.value)} disabled={isClosed} /></Field>
          <Field label="Desired outcomes"><Textarea value={desiredOutcomes} onChange={(event) => setDesiredOutcomes(event.target.value)} disabled={isClosed} /></Field>
        </div>
      </Panel>
      {!isClosed ? <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save overview"}</Button></div> : null}
    </form>
  );
}

function ChronologyTab({ bundle, saving, run }: { bundle: SafeguardingCaseBundle; saving: boolean; run: RunMutation }) {
  const [showForm, setShowForm] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntrySnapshot[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);
  const [timelineSearch, setTimelineSearch] = useState("");
  const linkedIds = useMemo(() => new Set(bundle.chronology.map((entry) => entry.linked_timeline_entry_id).filter(Boolean)), [bundle.chronology]);
  const availableTimelineEntries = timelineEntries.filter((entry) => !linkedIds.has(entry.id) && [entry.entry_type, entry.content].some((value) => value.toLowerCase().includes(timelineSearch.toLowerCase())));

  async function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await run(() => addChronologyEntry({
      safeguardingCase: bundle.safeguardingCase,
      entryType: form.get("entry_type") as ChronologyEntryType,
      description: String(form.get("description") ?? ""),
      occurredAt: toIsoDateTime(String(form.get("occurred_at") ?? "")),
    }));
    setShowForm(false);
  }

  async function loadTimeline() {
    setShowTimeline(true); setTimelineLoading(true); setTimelineError(null);
    try { setTimelineEntries(await listTimelineEntriesForCase(bundle.safeguardingCase)); }
    catch (loadError) { setTimelineError(loadError instanceof Error ? loadError.message : "Unable to load timeline entries."); }
    finally { setTimelineLoading(false); }
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHeading title="Private chronology" description="A permanent, newest-first record of case activity." action={
          bundle.safeguardingCase.status !== "closed" ? <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void loadTimeline()}><Link2 size={15} />Link timeline entry</Button><Button onClick={() => setShowForm((value) => !value)}><Plus size={15} />Add entry</Button></div> : undefined
        } />
        {showForm ? (
          <form onSubmit={addEntry} className="mb-6 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-2">
            <Field label="Entry type" required><Select name="entry_type" defaultValue="note"><option value="note">Case note</option><option value="update">Update</option><option value="contact">Contact</option><option value="decision">Decision</option><option value="meeting">Meeting</option><option value="evidence">Evidence</option></Select></Field>
            <Field label="Occurred at" required><Input name="occurred_at" type="datetime-local" defaultValue={toDateTimeLocal()} required /></Field>
            <div className="md:col-span-2"><Field label="Description" required><Textarea name="description" required /></Field></div>
            <div className="flex justify-end gap-2 md:col-span-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit" disabled={saving}>Save entry</Button></div>
          </form>
        ) : null}
        {showTimeline ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-900">Link an existing timeline entry</h3><Button variant="ghost" onClick={() => setShowTimeline(false)}>Close</Button></div>
            <Input value={timelineSearch} onChange={(event) => setTimelineSearch(event.target.value)} placeholder="Filter timeline entries" className="mt-3" />
            {timelineError ? <div className="mt-3"><ErrorBanner message={timelineError} /></div> : null}
            {timelineLoading ? <p className="mt-4 text-sm text-slate-500">Loading timeline entries…</p> : null}
            {!timelineLoading ? <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
              {availableTimelineEntries.map((entry) => <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><StatusPill value={entry.entry_type} /><span className="text-xs text-slate-500">{formatDateTime(entry.event_time)}</span></div><p className="mt-2 line-clamp-3 text-sm text-slate-700">{entry.content}</p></div><Button variant="secondary" disabled={saving} onClick={() => void run(() => linkTimelineEntry({ safeguardingCase: bundle.safeguardingCase, timelineEntry: entry }))}>Link</Button></div></div>)}
              {availableTimelineEntries.length === 0 ? <EmptyState>No unlinked timeline entries match.</EmptyState> : null}
            </div> : null}
          </div>
        ) : null}
        <div className="space-y-3">
          {bundle.chronology.map((entry) => <article key={entry.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-center gap-2"><StatusPill value={entry.entry_type} /><span className="text-xs text-slate-500">{formatDateTime(entry.occurred_at)}</span><span className="text-xs text-slate-400">by {staffName(bundle.staff, entry.created_by)}</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{entry.description}</p>{entry.linked_timeline_snapshot ? <blockquote className="mt-3 rounded-xl border-l-4 border-teal-400 bg-teal-50 p-3 text-sm text-slate-700"><p className="font-semibold text-teal-800">{humanise(entry.linked_timeline_snapshot.entry_type)}</p><p className="mt-1 whitespace-pre-wrap">{entry.linked_timeline_snapshot.content}</p></blockquote> : null}</article>)}
          {bundle.chronology.length === 0 ? <EmptyState>No chronology entries recorded.</EmptyState> : null}
        </div>
      </Panel>
    </div>
  );
}

function ActionsTab({ bundle, saving, run }: { bundle: SafeguardingCaseBundle; saving: boolean; run: RunMutation }) {
  const isClosed = bundle.safeguardingCase.status === "closed";
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); await run(() => createSafeguardingAction({ safeguardingCase: bundle.safeguardingCase, title: String(form.get("title") ?? ""), details: String(form.get("details") ?? ""), assignedTo: String(form.get("assigned_to") ?? ""), dueDate: String(form.get("due_date") ?? ""), priority: form.get("priority") as ActionPriority })); event.currentTarget.reset(); }
  return <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
    {!isClosed ? <Panel><SectionHeading title="Add action" /><form onSubmit={create} className="space-y-4"><Field label="Action" required><Input name="title" required /></Field><Field label="Details"><Textarea name="details" /></Field><Field label="Assigned to"><Select name="assigned_to" defaultValue={bundle.currentManager.id}><option value="">Unassigned</option>{bundle.staff.map((person) => <option key={person.id} value={person.id}>{person.full_name} · {person.role}</option>)}</Select></Field><Field label="Due date"><Input name="due_date" type="date" /></Field><Field label="Priority"><Select name="priority" defaultValue="medium">{ACTION_PRIORITIES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field><Button type="submit" disabled={saving} className="w-full">Add action</Button></form></Panel> : null}
    <Panel className={isClosed ? "xl:col-span-2" : ""}><SectionHeading title="Case actions" description="Complete or cancel every open action before closure." /><div className="space-y-3">{bundle.actions.map((action) => <article key={action.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap gap-2"><StatusPill value={action.priority} /><StatusPill value={action.status} />{action.due_date ? <span className="text-xs text-slate-500">Due {formatDate(action.due_date)}</span> : null}</div><h3 className="mt-2 font-semibold text-slate-950">{action.title}</h3>{action.details ? <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{action.details}</p> : null}<p className="mt-2 text-xs text-slate-500">Assigned to {staffName(bundle.staff, action.assigned_to)}</p></div>{!isClosed ? <Select aria-label={`Status for ${action.title}`} value={action.status} onChange={(event) => void run(() => updateSafeguardingAction(action.id, { status: event.target.value as ActionStatus }))} disabled={saving} className="md:w-44">{ACTION_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select> : null}</div></article>)}{bundle.actions.length === 0 ? <EmptyState>No actions recorded.</EmptyState> : null}</div></Panel>
  </div>;
}

function ReferralsTab({ bundle, saving, run }: { bundle: SafeguardingCaseBundle; saving: boolean; run: RunMutation }) {
  const isClosed = bundle.safeguardingCase.status === "closed";
  async function create(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); await run(() => createSafeguardingReferral({ safeguardingCase: bundle.safeguardingCase, agency: String(form.get("agency") ?? ""), contactName: String(form.get("contact_name") ?? ""), contactDetails: String(form.get("contact_details") ?? ""), referralMethod: String(form.get("method") ?? ""), referralReference: String(form.get("reference") ?? ""), referredAt: toIsoDateTime(String(form.get("referred_at") ?? "")), status: "submitted", outcome: String(form.get("outcome") ?? "") })); event.currentTarget.reset(); }
  return <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
    {!isClosed ? <Panel><SectionHeading title="Record referral" /><form onSubmit={create} className="space-y-4"><Field label="Agency" required><Input name="agency" required placeholder="Local authority, police, CQC…" /></Field><Field label="Contact name"><Input name="contact_name" /></Field><Field label="Contact details"><Input name="contact_details" /></Field><Field label="Method"><Input name="method" placeholder="Portal, email, phone" /></Field><Field label="Reference"><Input name="reference" /></Field><Field label="Referred at" required><Input name="referred_at" type="datetime-local" defaultValue={toDateTimeLocal()} required /></Field><Field label="Initial outcome"><Textarea name="outcome" /></Field><Button type="submit" disabled={saving} className="w-full">Save referral</Button></form></Panel> : null}
    <Panel className={isClosed ? "xl:col-span-2" : ""}><SectionHeading title="External referrals" /><div className="space-y-3">{bundle.referrals.map((referral) => <article key={referral.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><StatusPill value={referral.status} /><span className="text-xs text-slate-500">{formatDateTime(referral.referred_at)}</span></div><h3 className="mt-2 font-semibold text-slate-950">{referral.agency}</h3><p className="mt-1 text-sm text-slate-600">{[referral.contact_name, referral.referral_method, referral.referral_reference].filter(Boolean).join(" · ") || "No additional referral details"}</p>{referral.outcome ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{referral.outcome}</p> : null}</div>{!isClosed ? <Select aria-label={`Status for ${referral.agency}`} value={referral.status} onChange={(event) => void run(() => updateSafeguardingReferral(referral.id, { status: event.target.value as ReferralStatus }))} disabled={saving} className="md:w-44">{REFERRAL_STATUSES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select> : null}</div></article>)}{bundle.referrals.length === 0 ? <EmptyState>No external referrals recorded.</EmptyState> : null}</div></Panel>
  </div>;
}

function DocumentsTab({ bundle, saving, run }: { bundle: SafeguardingCaseBundle; saving: boolean; run: RunMutation }) {
  const isClosed = bundle.safeguardingCase.status === "closed";
  async function upload(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const file = form.get("file"); if (!(file instanceof File) || file.size === 0) return; await run(() => uploadSafeguardingDocument({ safeguardingCase: bundle.safeguardingCase, file, category: form.get("category") as DocumentCategory, description: String(form.get("description") ?? "") })); event.currentTarget.reset(); }
  return <div className="space-y-6">
    {!isClosed ? <Panel><SectionHeading title="Upload document" description="Private files, limited to 20 MB. PDF, images, Word and text files are accepted." /><form onSubmit={upload} className="grid gap-4 md:grid-cols-3"><Field label="File" required><Input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx" /></Field><Field label="Category"><Select name="category" defaultValue="evidence">{DOCUMENT_CATEGORIES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</Select></Field><Field label="Description"><Input name="description" /></Field><div className="md:col-span-3 flex justify-end"><Button type="submit" disabled={saving}><FilePlus2 size={15} />{saving ? "Uploading…" : "Upload securely"}</Button></div></form></Panel> : null}
    <Panel><SectionHeading title="Case documents" /><div className="space-y-3">{bundle.documents.map((document) => <article key={document.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><StatusPill value={document.category} /><span className="text-xs text-slate-500">{formatDateTime(document.uploaded_at)}</span></div><h3 className="mt-2 truncate font-semibold text-slate-950">{document.file_name}</h3><p className="mt-1 text-sm text-slate-600">{document.description || `${(document.file_size_bytes / 1024).toFixed(1)} KB`}</p></div><div className="flex shrink-0 gap-2"><Button variant="secondary" onClick={() => void openSafeguardingDocument(document)}><Download size={15} />Open</Button>{!isClosed ? <Button variant="danger" disabled={saving} onClick={() => { if (window.confirm(`Delete ${document.file_name}? This cannot be undone.`)) void run(() => deleteSafeguardingDocument(document)); }}><Trash2 size={15} />Delete</Button> : null}</div></article>)}{bundle.documents.length === 0 ? <EmptyState>No documents uploaded.</EmptyState> : null}</div></Panel>
  </div>;
}

function ClosureTab({ bundle, saving, run }: { bundle: SafeguardingCaseBundle; saving: boolean; run: RunMutation }) {
  const item = bundle.safeguardingCase;
  const openActions = bundle.actions.filter((action) => ["todo", "in_progress", "blocked"].includes(action.status));
  async function close(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); if (!window.confirm("Close this safeguarding case? The record will become read-only.")) return; await run(() => closeSafeguardingCase({ caseId: item.id, closureReason: String(form.get("reason") ?? ""), closureOutcome: String(form.get("outcome") ?? ""), lessonsLearned: String(form.get("lessons") ?? "") })); }
  if (item.status === "closed") return <Panel><SectionHeading title="Case closed" description={`Closed ${formatDateTime(item.closed_at)} by ${staffName(bundle.staff, item.closed_by)}`} /><dl className="grid gap-5 md:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</dt><dd className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{item.closure_reason}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Outcome</dt><dd className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{item.closure_outcome}</dd></div><div className="md:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lessons learned</dt><dd className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{item.lessons_learned || "None recorded."}</dd></div></dl></Panel>;
  return <Panel className="max-w-4xl"><SectionHeading title="Close safeguarding case" description="Closure is blocked until all actions are completed or cancelled." />{openActions.length ? <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">{openActions.length} open action{openActions.length === 1 ? "" : "s"} must be resolved.</p><ul className="mt-2 list-disc pl-5">{openActions.map((action) => <li key={action.id}>{action.title}</li>)}</ul></div> : null}<form onSubmit={close} className="space-y-5"><Field label="Closure reason" required><Textarea name="reason" required /></Field><Field label="Outcome" required><Textarea name="outcome" required /></Field><Field label="Lessons learned"><Textarea name="lessons" /></Field><div className="flex justify-end"><Button variant="danger" type="submit" disabled={saving || openActions.length > 0}>{saving ? "Closing…" : "Close safeguarding case"}</Button></div></form></Panel>;
}

function AuditTab({ bundle }: { bundle: SafeguardingCaseBundle }) {
  return <Panel><SectionHeading title="Audit history" description="Immutable database activity for this case. Chronology remains the readable case record." /><div className="space-y-3">{bundle.audit.map((event) => <details key={event.id} className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer list-none"><div className="flex flex-wrap items-center gap-2"><StatusPill value={event.operation.toLowerCase()} /><span className="font-semibold text-slate-900">{humanise(event.entity_type)}</span><span className="text-xs text-slate-500">{formatDateTime(event.occurred_at)} · {staffName(bundle.staff, event.actor_id)}</span></div></summary><div className="mt-4 grid gap-3 lg:grid-cols-2">{event.old_data ? <AuditJson title="Before" value={event.old_data} /> : null}{event.new_data ? <AuditJson title="After" value={event.new_data} /> : null}</div></details>)}{bundle.audit.length === 0 ? <EmptyState>No audit events found.</EmptyState> : null}</div></Panel>;
}

function AuditJson({ title, value }: { title: string; value: Record<string, unknown> }) {
  return <div><h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4><pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">{JSON.stringify(value, null, 2)}</pre></div>;
}

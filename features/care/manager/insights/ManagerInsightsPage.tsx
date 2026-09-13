"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  HeartPulse,
  Loader2,
  Pill,
  RefreshCw,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

type CurrentUserProfile = {
  id: string;
  organisation_id: string;
  full_name: string;
  role: string;
};

type TimelineEntry = {
  id: string;
  service_user_id: string;
  entry_type: string;
  content: string | null;
  created_at: string;
  event_time: string | null;
  reviewed: boolean | null;
};

type ServiceUser = {
  id: string;
  full_name: string;
};

type StaffCompetency = {
  id: string;
  organisation_id: string;
  staff_id: string;
  competency_type: string;
  outcome: string | null;
  assessment_date: string | null;
  review_date: string | null;
};

type MedicationAdministration = {
  id: string;
  service_user_id: string;
  status: string;
  reason: string | null;
  administered_at: string;
};

type RotaShift = {
  id: string;
  service_user_id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  rota_shift_assignments?: Array<{
    staff_user_id: string;
    assignment_type: "working" | "annual_leave";
  }>;
};

type MonthlyReview = {
  id: string;
  service_user_id: string;
  review_month: string;
  completed_at: string | null;
};

type ServiceInsight = {
  id: string;
  title: string;
  description: string;
  href: string;
  level: "warning" | "danger";
};

type ActionItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  count: number;
  href: string;
  tone: "red" | "amber" | "purple";
  onOpen: (href: string) => void;
};

const INCIDENT_ENTRY_TYPES = [
  "Accident / Injury",
  "Behaviour Incident",
  "Fall",
  "Medication Error",
  "Near Miss",
  "Safeguarding Concern",
];

const CONCERNING_MEDICATION_STATUSES = [
  "Refused",
  "Not Administered",
  "Omitted",
  "Missed",
];

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfToday(): Date {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getServiceUserName(serviceUserId: string, serviceUsersById: Map<string, ServiceUser>): string {
  return serviceUsersById.get(serviceUserId)?.full_name || "A person";
}

function extractWellbeingScore(content: string | null): number | null {
  if (!content) return null;
  const patterns = [
    /wellbeing(?:\s+score)?\s*:\s*([1-5])/i,
    /score\s*:\s*([1-5])(?:\s*\/\s*5)?/i,
    /rating\s*:\s*([1-5])/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

function getLatestCompetencies(competencies: StaffCompetency[]): StaffCompetency[] {
  const latest = new Map<string, StaffCompetency>();
  const sorted = [...competencies].sort((a, b) => {
    const aDate = new Date(a.assessment_date || a.review_date || 0).getTime();
    const bDate = new Date(b.assessment_date || b.review_date || 0).getTime();
    return bDate - aDate;
  });
  for (const competency of sorted) {
    const key = `${competency.staff_id}:${competency.competency_type}`;
    if (!latest.has(key)) latest.set(key, competency);
  }
  return Array.from(latest.values());
}

function intervalsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function shiftWindow(shift: RotaShift): { start: Date; end: Date } {
  const start = new Date(`${shift.shift_date}T${shift.start_time}`);
  const end = new Date(`${shift.shift_date}T${shift.end_time}`);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start, end };
}

function ActionItem({ icon, title, description, count, href, tone, onOpen }: ActionItemProps) {
  const toneClasses = {
    red: { icon: "bg-red-50 text-red-600", count: "bg-red-50 text-red-700" },
    amber: { icon: "bg-amber-50 text-amber-600", count: "bg-amber-50 text-amber-700" },
    purple: { icon: "bg-violet-50 text-violet-600", count: "bg-violet-50 text-violet-700" },
  };
  const styles = toneClasses[tone];
  return (
    <button type="button" onClick={() => onOpen(href)} className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${styles.icon}`}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-950">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-slate-500">{description}</span>
      </span>
      <span className={`inline-flex min-w-9 items-center justify-center rounded-full px-3 py-1 text-sm font-bold ${styles.count}`}>{count}</span>
      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
    </button>
  );
}

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [competencies, setCompetencies] = useState<StaffCompetency[]>([]);
  const [medicationAdministrations, setMedicationAdministrations] = useState<MedicationAdministration[]>([]);
  const [rotaShifts, setRotaShifts] = useState<RotaShift[]>([]);
  const [monthlyReviews, setMonthlyReviews] = useState<MonthlyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInsights = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setErrorMessage(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("You must be signed in to view insights.");

      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, organisation_id, full_name, role")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      setProfile(currentProfile as CurrentUserProfile);

      const thirtyDaysAgo = addDays(startOfToday(), -30).toISOString();
      const todayKey = toLocalDateKey(startOfToday());
      const fourteenDaysKey = toLocalDateKey(addDays(startOfToday(), 14));
      const failures: string[] = [];

      const [serviceUsersResult, timelineResult, competencyResult, medicationResult, rotaResult, reviewsResult] = await Promise.all([
        supabase.from("service_users").select("id, full_name").eq("organisation_id", currentProfile.organisation_id).eq("is_active", true).order("full_name"),
        supabase.from("timeline_entries").select("id, service_user_id, entry_type, content, created_at, event_time, reviewed").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }),
        supabase.from("staff_competencies").select("id, organisation_id, staff_id, competency_type, outcome, assessment_date, review_date").eq("organisation_id", currentProfile.organisation_id),
        supabase.from("medication_administrations").select("id, service_user_id, status, reason, administered_at").gte("administered_at", thirtyDaysAgo).order("administered_at", { ascending: false }),
        supabase.from("rota_shifts").select("id, service_user_id, shift_date, start_time, end_time, status, rota_shift_assignments(staff_user_id, assignment_type)").eq("organisation_id", currentProfile.organisation_id).eq("status", "planned").gte("shift_date", todayKey).lte("shift_date", fourteenDaysKey),
        supabase.from("monthly_service_user_reviews").select("id, service_user_id, review_month, completed_at").eq("organisation_id", currentProfile.organisation_id),
      ]);

      const setOrFail = <T,>(name: string, result: { data: T[] | null; error: { message: string } | null }, setter: (value: T[]) => void) => {
        if (result.error) {
          failures.push(`${name}: ${result.error.message}`);
          setter([]);
        } else setter(result.data ?? []);
      };

      setOrFail("People", serviceUsersResult as any, setServiceUsers as any);
      setOrFail("Timeline", timelineResult as any, setTimelineEntries as any);
      setOrFail("Competencies", competencyResult as any, setCompetencies as any);
      setOrFail("Medication", medicationResult as any, setMedicationAdministrations as any);
      setOrFail("Rotas", rotaResult as any, setRotaShifts as any);
      setOrFail("Monthly reviews", reviewsResult as any, setMonthlyReviews as any);

      if (failures.length) setErrorMessage(`Some insight sources are unavailable: ${failures.join(" | ")}`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadInsights(); }, [loadInsights]);

  const serviceUsersById = useMemo(() => new Map(serviceUsers.map((person) => [person.id, person])), [serviceUsers]);

  const unreviewedIncidents = useMemo(() => timelineEntries.filter((entry) => INCIDENT_ENTRY_TYPES.includes(entry.entry_type) && entry.reviewed !== true), [timelineEntries]);

  const latestCompetencies = useMemo(() => getLatestCompetencies(competencies), [competencies]);
  const competencySummary = useMemo(() => {
    const today = startOfToday();
    const sevenDaysFromNow = addDays(today, 7);
    let overdue = 0;
    let dueWithinSevenDays = 0;
    let actionsRequired = 0;
    for (const competency of latestCompetencies) {
      if (competency.outcome === "Competent With Actions") actionsRequired += 1;
      if (!competency.review_date) continue;
      const reviewDate = new Date(competency.review_date);
      if (Number.isNaN(reviewDate.getTime())) continue;
      if (reviewDate < today) overdue += 1;
      else if (reviewDate <= sevenDaysFromNow) dueWithinSevenDays += 1;
    }
    return { overdue, dueWithinSevenDays, actionsRequired };
  }, [latestCompetencies]);

  const medicationConcerns = useMemo(() => {
    const sevenDaysAgo = addDays(startOfToday(), -7);
    return medicationAdministrations.filter((administration) => new Date(administration.administered_at) >= sevenDaysAgo && CONCERNING_MEDICATION_STATUSES.includes(administration.status));
  }, [medicationAdministrations]);

  const rotaSummary = useMemo(() => {
    let unfilled = 0;
    let conflicts = 0;
    const byStaff = new Map<string, RotaShift[]>();
    for (const shift of rotaShifts) {
      const workingAssignments = (shift.rota_shift_assignments ?? []).filter((assignment) => assignment.assignment_type === "working");
      if (workingAssignments.length === 0) unfilled += 1;
      for (const assignment of workingAssignments) {
        const list = byStaff.get(assignment.staff_user_id) ?? [];
        list.push(shift);
        byStaff.set(assignment.staff_user_id, list);
      }
    }
    for (const shifts of byStaff.values()) {
      for (let i = 0; i < shifts.length; i += 1) {
        for (let j = i + 1; j < shifts.length; j += 1) {
          if (shifts[i].id === shifts[j].id) continue;
          const a = shiftWindow(shifts[i]);
          const b = shiftWindow(shifts[j]);
          if (intervalsOverlap(a.start, a.end, b.start, b.end)) conflicts += 1;
        }
      }
    }
    return { unfilled, conflicts };
  }, [rotaShifts]);

  const overdueMonthlyReviews = useMemo(() => {
    const previousMonth = new Date();
    previousMonth.setDate(1);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const monthKey = `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
    const completed = new Set(monthlyReviews.filter((review) => review.review_month?.startsWith(monthKey) && review.completed_at).map((review) => review.service_user_id));
    return serviceUsers.filter((person) => !completed.has(person.id));
  }, [monthlyReviews, serviceUsers]);

  const serviceInsights = useMemo<ServiceInsight[]>(() => {
    const insights: ServiceInsight[] = [];
    const wellbeingReadings = timelineEntries
      .filter((entry) => entry.entry_type === "Wellbeing")
      .map((entry) => ({ entry, score: extractWellbeingScore(entry.content) }))
      .filter((item): item is { entry: TimelineEntry; score: number } => item.score !== null);
    const byPerson = new Map<string, Array<{ entry: TimelineEntry; score: number }>>();
    for (const item of wellbeingReadings) {
      const list = byPerson.get(item.entry.service_user_id) ?? [];
      list.push(item);
      byPerson.set(item.entry.service_user_id, list);
    }
    for (const [personId, readings] of byPerson) {
      const latest = [...readings].sort((a, b) => new Date(b.entry.event_time || b.entry.created_at).getTime() - new Date(a.entry.event_time || a.entry.created_at).getTime()).slice(0, 5);
      if (latest.length < 3) continue;
      const low = latest.filter((reading) => reading.score <= 2).length;
      if (low >= 3) {
        insights.push({ id: `wellbeing-${personId}`, title: `${getServiceUserName(personId, serviceUsersById)} has repeatedly low wellbeing scores`, description: `${low} of the latest ${latest.length} wellbeing entries scored 2 or below.`, href: `/care/manager/service-users/${personId}/growth`, level: "danger" });
      }
    }
    const recentCutoff = addDays(startOfToday(), -7);
    const incidentCounts = new Map<string, number>();
    for (const entry of timelineEntries) {
      if (!INCIDENT_ENTRY_TYPES.includes(entry.entry_type)) continue;
      if (new Date(entry.event_time || entry.created_at) < recentCutoff) continue;
      incidentCounts.set(entry.service_user_id, (incidentCounts.get(entry.service_user_id) ?? 0) + 1);
    }
    for (const [personId, count] of incidentCounts) {
      if (count >= 3) insights.push({ id: `incidents-${personId}`, title: `${getServiceUserName(personId, serviceUsersById)} has had ${count} incidents this week`, description: "Review recent records, triggers and support strategies for a possible pattern.", href: `/care/manager/service-users/${personId}/growth`, level: "warning" });
    }
    return insights.slice(0, 6);
  }, [serviceUsersById, timelineEntries]);

  const actionItems = useMemo(() => [
    { key: "incident-reviews", title: "Incident reviews", description: `${unreviewedIncidents.length} incident${unreviewedIncidents.length === 1 ? " is" : "s are"} awaiting manager review.`, count: unreviewedIncidents.length, href: "/care/manager/incidents", tone: "red" as const, icon: <ShieldAlert className="h-5 w-5" /> },
    { key: "rota-conflicts", title: "Rota conflicts", description: `${rotaSummary.conflicts} overlapping staff assignment${rotaSummary.conflicts === 1 ? "" : "s"} found in the next 14 days.`, count: rotaSummary.conflicts, href: "/care/manager/rota", tone: "red" as const, icon: <AlertTriangle className="h-5 w-5" /> },
    { key: "unfilled-shifts", title: "Unfilled shifts", description: `${rotaSummary.unfilled} planned shift${rotaSummary.unfilled === 1 ? " has" : "s have"} no working staff assigned in the next 14 days.`, count: rotaSummary.unfilled, href: "/care/manager/rota", tone: "amber" as const, icon: <UserRoundCheck className="h-5 w-5" /> },
    { key: "monthly-reviews", title: "Monthly check-ins outstanding", description: `${overdueMonthlyReviews.length} person${overdueMonthlyReviews.length === 1 ? " does" : "s do"} not have a completed check-in recorded for last month.`, count: overdueMonthlyReviews.length, href: "/care/manager/service-users", tone: "amber" as const, icon: <ClipboardCheck className="h-5 w-5" /> },
    { key: "competencies-overdue", title: "Overdue competencies", description: `${competencySummary.overdue} competenc${competencySummary.overdue === 1 ? "y is" : "ies are"} past review date.`, count: competencySummary.overdue, href: "/care/manager/staff/competencies", tone: "red" as const, icon: <GraduationCap className="h-5 w-5" /> },
    { key: "competencies-due", title: "Competencies due within 7 days", description: `${competencySummary.dueWithinSevenDays} competenc${competencySummary.dueWithinSevenDays === 1 ? "y reaches" : "ies reach"} review date within seven days.`, count: competencySummary.dueWithinSevenDays, href: "/care/manager/staff/competencies", tone: "amber" as const, icon: <GraduationCap className="h-5 w-5" /> },
    { key: "medication", title: "Medication outcomes to review", description: `${medicationConcerns.length} medication outcome${medicationConcerns.length === 1 ? "" : "s"} was missed, refused, omitted or not administered this week.`, count: medicationConcerns.length, href: "/care/manager/emar", tone: "amber" as const, icon: <Pill className="h-5 w-5" /> },
  ].filter((item) => item.count > 0), [competencySummary, medicationConcerns.length, overdueMonthlyReviews.length, rotaSummary, unreviewedIncidents.length]);

  const totalActions = actionItems.reduce((sum, item) => sum + item.count, 0);
  const highPriorityCount = unreviewedIncidents.length + competencySummary.overdue + rotaSummary.conflicts;
  const dueSoonCount = competencySummary.dueWithinSevenDays + overdueMonthlyReviews.length + rotaSummary.unfilled;
  const monitorCount = medicationConcerns.length + serviceInsights.length;
  const goodNewsItems = useMemo(() => {
    const items: string[] = [];
    if (!unreviewedIncidents.length) items.push("No incidents are awaiting manager review.");
    if (!rotaSummary.conflicts) items.push("No staff rota clashes were found in the next 14 days.");
    if (!rotaSummary.unfilled) items.push("All planned shifts in the next 14 days currently have working staff assigned.");
    if (!competencySummary.overdue) items.push("No recorded competencies are currently overdue.");
    if (!medicationConcerns.length) items.push("No missed, refused or omitted medication outcomes were recorded in the last seven days.");
    return items;
  }, [competencySummary.overdue, medicationConcerns.length, rotaSummary, unreviewedIncidents.length]);

  const openPage = (href: string) => router.push(href);

  return (
    <CastodiaPageShell title="Insights" description="A live management briefing built from the records Castodia already holds." maxWidth="wide" actions={<CastodiaButton variant="secondary" onClick={() => void loadInsights(true)} disabled={refreshing}>{refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Refresh</CastodiaButton>}>
      {errorMessage ? <CastodiaCard><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" /><div><h2 className="font-semibold text-slate-950">Some insights are unavailable</h2><p className="mt-1 text-sm text-slate-500">{errorMessage}</p></div></div></CastodiaCard> : null}

      <CastodiaCard>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">{loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ClipboardCheck className="h-6 w-6" />}</span><div><p className="text-xl font-bold text-slate-950">{loading ? "Preparing your briefing" : totalActions === 0 ? "No actions currently require your attention" : `${totalActions} ${totalActions === 1 ? "item requires" : "items require"} your attention`}</p><p className="mt-1 text-sm text-slate-500">{profile?.full_name ? `Live oversight for ${profile.full_name}'s organisation.` : "Live oversight across your organisation."}</p></div></div>
          {!loading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><SummaryValue value={highPriorityCount} label="High priority" tone="red" /><SummaryValue value={dueSoonCount} label="Due soon" tone="amber" /><SummaryValue value={monitorCount} label="Monitor" tone="blue" /><SummaryValue value={goodNewsItems.length} label="Good news" tone="green" /></div> : null}
        </div>
      </CastodiaCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <CastodiaCard padding="none"><section><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-bold text-slate-950">Needs Attention</h2></div>{loading ? <LoadingRows /> : actionItems.length === 0 ? <EmptyPanel icon={<CheckCircle2 className="h-6 w-6 text-emerald-600" />} title="Nothing needs immediate attention" description="Current records do not show outstanding rota, incident, medication, review or competency actions." /> : <div className="divide-y divide-slate-100">{actionItems.map((item) => <ActionItem key={item.key} {...item} onOpen={openPage} />)}</div>}</section></CastodiaCard>
        <CastodiaCard padding="none"><section><div className="border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-bold text-slate-950">Patterns to monitor</h2></div>{loading ? <LoadingRows /> : serviceInsights.length === 0 ? <EmptyPanel icon={<HeartPulse className="h-6 w-6 text-emerald-600" />} title="No concerning patterns identified" description="Recent wellbeing and incident records do not currently show a significant repeated pattern." /> : <div className="divide-y divide-slate-100">{serviceInsights.map((insight) => <button key={insight.id} type="button" onClick={() => openPage(insight.href)} className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-slate-50"><span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${insight.level === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}><HeartPulse className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-slate-950">{insight.title}</span><span className="mt-1 block text-sm text-slate-500">{insight.description}</span></span><ArrowRight className="h-4 w-4 text-slate-400" /></button>)}</div>}</section></CastodiaCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <MetricCard title="Workforce" icon={<UserRoundCheck className="h-5 w-5" />} items={[['Overdue competencies', competencySummary.overdue], ['Due in 7 days', competencySummary.dueWithinSevenDays], ['Actions required', competencySummary.actionsRequired]]} href="/care/manager/staff/competencies" onOpen={openPage} />
        <MetricCard title="Rota readiness" icon={<ClipboardCheck className="h-5 w-5" />} items={[['Conflicts', rotaSummary.conflicts], ['Unfilled next 14 days', rotaSummary.unfilled], ['Planned shifts', rotaShifts.length]]} href="/care/manager/rota" onOpen={openPage} />
        <MetricCard title="Monthly reviews" icon={<CheckCircle2 className="h-5 w-5" />} items={[['Outstanding last month', overdueMonthlyReviews.length], ['People monitored', serviceUsers.length], ['Reviews recorded', monthlyReviews.length]]} href="/care/manager/service-users" onOpen={openPage} />
      </div>

      <CastodiaCard><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><div><h2 className="text-lg font-bold text-slate-950">Good News</h2><p className="text-sm text-slate-500">Areas that currently show no immediate governance concern.</p></div></div>{loading ? <div className="mt-5 h-24 animate-pulse rounded-2xl bg-slate-100" /> : goodNewsItems.length === 0 ? <p className="mt-5 text-sm text-slate-500">Current records contain active actions requiring review.</p> : <ul className="mt-5 grid gap-3 md:grid-cols-2">{goodNewsItems.map((item) => <li key={item} className="flex items-start gap-3 rounded-2xl bg-emerald-50/60 p-4 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><span>{item}</span></li>)}</ul>}</CastodiaCard>
    </CastodiaPageShell>
  );
}

function SummaryValue({ value, label, tone }: { value: number; label: string; tone: "red" | "amber" | "blue" | "green" }) {
  const styles = { red: "bg-red-50 text-red-700", amber: "bg-amber-50 text-amber-700", blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700" };
  return <div className={`rounded-2xl px-4 py-3 text-center ${styles[tone]}`}><div className="text-xl font-bold">{value}</div><div className="mt-0.5 text-xs font-semibold">{label}</div></div>;
}

function LoadingRows() {
  return <div className="space-y-3 p-5">{[0,1,2].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}</div>;
}

function EmptyPanel({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="flex items-start gap-3 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">{icon}</span><div><p className="font-semibold text-slate-950">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div></div>;
}

function MetricCard({ title, icon, items, href, onOpen }: { title: string; icon: React.ReactNode; items: [string, number][]; href: string; onOpen: (href: string) => void }) {
  return <CastodiaCard><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">{icon}</span><h2 className="text-lg font-bold text-slate-950">{title}</h2></div><dl className="mt-5 grid grid-cols-3 gap-3">{items.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-3 text-center"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-xl font-bold text-slate-950">{value}</dd></div>)}</dl><button type="button" onClick={() => onOpen(href)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800">Open <ArrowRight className="h-4 w-4" /></button></CastodiaCard>;
}

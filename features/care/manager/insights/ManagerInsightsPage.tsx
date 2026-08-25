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
  first_name: string | null;
  surname: string | null;
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

type WellbeingReading = {
  entryId: string;
  serviceUserId: string;
  score: number;
  recordedAt: string;
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

function getServiceUserName(
  serviceUserId: string,
  serviceUsersById: Map<string, ServiceUser>,
): string {
  const person = serviceUsersById.get(serviceUserId);

  if (!person) return "A service user";

  return (
    person.full_name ||
    [person.first_name, person.surname].filter(Boolean).join(" ") ||
    "A service user"
  );
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

    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

function isWithinDateRange(
  value: string | null,
  minimum: Date,
  maximum: Date,
): boolean {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  return date >= minimum && date <= maximum;
}

function getLatestCompetencies(
  competencies: StaffCompetency[],
): StaffCompetency[] {
  const latest = new Map<string, StaffCompetency>();

  const sorted = [...competencies].sort((first, second) => {
    const firstDate = new Date(
      first.assessment_date || first.review_date || 0,
    ).getTime();

    const secondDate = new Date(
      second.assessment_date || second.review_date || 0,
    ).getTime();

    return secondDate - firstDate;
  });

  for (const competency of sorted) {
    const key = `${competency.staff_id}:${competency.competency_type}`;

    if (!latest.has(key)) {
      latest.set(key, competency);
    }
  }

  return Array.from(latest.values());
}

function ActionItem({
  icon,
  title,
  description,
  count,
  href,
  tone,
  onOpen,
}: ActionItemProps) {
  const toneClasses = {
    red: {
      icon: "bg-red-50 text-red-600",
      count: "bg-red-50 text-red-700",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      count: "bg-amber-50 text-amber-700",
    },
    purple: {
      icon: "bg-violet-50 text-violet-600",
      count: "bg-violet-50 text-violet-700",
    },
  };

  const styles = toneClasses[tone];

  return (
    <button
      type="button"
      onClick={() => onOpen(href)}
      className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset"
    >
      <span
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
          styles.icon,
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-950">
          {title}
        </span>

        <span className="mt-1 block text-sm leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span
        className={[
          "inline-flex min-w-9 items-center justify-center rounded-full px-3 py-1",
          "text-sm font-bold",
          styles.count,
        ].join(" ")}
      >
        {count}
      </span>

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
  const [medicationAdministrations, setMedicationAdministrations] = useState<
    MedicationAdministration[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadInsights = useCallback(async (isRefresh = false) => {
  if (isRefresh) {
    setRefreshing(true);
  } else {
    setLoading(true);
  }

  setErrorMessage(null);

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(
        `Authentication failed: ${userError.message}`,
      );
    }

    if (!user) {
      throw new Error("You must be signed in to view insights.");
    }

    /*
     * Do not query a guessed profile table here.
     *
     * The existing timeline RLS should already restrict records to the
     * signed-in user's organisation. We can therefore load the currently
     * implemented sources directly.
     */

    const thirtyDaysAgo = addDays(
      startOfToday(),
      -30,
    ).toISOString();

    const failures: string[] = [];

    /*
     * SERVICE USERS
     */
    const serviceUsersResult = await supabase
      .from("service_users")
      .select("id, full_name, first_name, surname")
      .order("full_name");

    if (serviceUsersResult.error) {
      console.error("Service users query failed:", {
        message: serviceUsersResult.error.message,
        code: serviceUsersResult.error.code,
        details: serviceUsersResult.error.details,
        hint: serviceUsersResult.error.hint,
      });

      failures.push(
        `Service users: ${serviceUsersResult.error.message}`,
      );

      setServiceUsers([]);
    } else {
      setServiceUsers(
        (serviceUsersResult.data ?? []) as ServiceUser[],
      );
    }

    /*
     * TIMELINE ENTRIES
     *
     * These columns are known to exist from the current Castodia timeline:
     * id
     * service_user_id
     * entry_type
     * content
     * created_at
     * event_time
     * reviewed
     */
    const timelineResult = await supabase
  .from("timeline_entries")
  .select(
    "id, service_user_id, entry_type, content, created_at, event_time, reviewed",
  )
  .gte("created_at", thirtyDaysAgo)
  .order("created_at", { ascending: false });

      
    if (timelineResult.error) {
      console.error("Timeline query failed:", {
        message: timelineResult.error.message,
        code: timelineResult.error.code,
        details: timelineResult.error.details,
        hint: timelineResult.error.hint,
      });

      failures.push(
  `Timeline entries: ${timelineResult.error.message}`,
);

setTimelineEntries([]);
} else {
  const timelineData =
    (timelineResult.data ?? []) as unknown as TimelineEntry[];

  setTimelineEntries(timelineData);
}

    /*
     * COMPETENCIES
     *
     * This query is kept separate because its exact schema may differ.
     * A failure here no longer prevents the Insights page from opening.
     */
    const competencyResult = await supabase
      .from("staff_competencies")
      .select("*");

    if (competencyResult.error) {
      console.error("Competencies query failed:", {
        message: competencyResult.error.message,
        code: competencyResult.error.code,
        details: competencyResult.error.details,
        hint: competencyResult.error.hint,
      });

      failures.push(
        `Competencies: ${competencyResult.error.message}`,
      );

      setCompetencies([]);
    } else {
      console.log(
        "Competency row example:",
        competencyResult.data?.[0] ?? "No competency rows",
      );

      setCompetencies(
        (competencyResult.data ?? []) as StaffCompetency[],
      );
    }

    /*
     * MEDICATION
     *
     * Also separated because the medication table name/schema needs to
     * match the implementation already used by the eMAR module.
     */
    const medicationResult = await supabase
      .from("medication_administrations")
      .select("*")
      .gte("administered_at", thirtyDaysAgo)
      .order("administered_at", { ascending: false });

    if (medicationResult.error) {
      console.error("Medication query failed:", {
        message: medicationResult.error.message,
        code: medicationResult.error.code,
        details: medicationResult.error.details,
        hint: medicationResult.error.hint,
      });

      failures.push(
        `Medication: ${medicationResult.error.message}`,
      );

      setMedicationAdministrations([]);
    } else {
      console.log(
        "Medication row example:",
        medicationResult.data?.[0] ?? "No medication rows",
      );

      setMedicationAdministrations(
        (medicationResult.data ??
          []) as MedicationAdministration[],
      );
    }

    if (failures.length > 0) {
      setErrorMessage(
        `Some insights are unavailable: ${failures.join(" | ")}`,
      );
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" &&
            error !== null &&
            "message" in error
          ? String(
              (error as { message?: unknown }).message ??
                "Unknown database error",
            )
          : String(error);

    console.error("Unable to load manager insights:", {
      error,
      message,
    });

    setErrorMessage(message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const serviceUsersById = useMemo(() => {
    return new Map(
      serviceUsers.map((serviceUser) => [
        serviceUser.id,
        serviceUser,
      ]),
    );
  }, [serviceUsers]);

  const unreviewedIncidents = useMemo(() => {
    return timelineEntries.filter(
      (entry) =>
        INCIDENT_ENTRY_TYPES.includes(entry.entry_type) &&
        entry.reviewed !== true,
    );
  }, [timelineEntries]);

  const latestCompetencies = useMemo(
    () => getLatestCompetencies(competencies),
    [competencies],
  );

  const competencySummary = useMemo(() => {
    const today = startOfToday();
    const sevenDaysFromNow = addDays(today, 7);

    let overdue = 0;
    let dueWithinSevenDays = 0;
    let actionsRequired = 0;

    for (const competency of latestCompetencies) {
      if (competency.outcome === "Competent With Actions") {
        actionsRequired += 1;
      }

      if (!competency.review_date) continue;

      const reviewDate = new Date(competency.review_date);

      if (Number.isNaN(reviewDate.getTime())) continue;

      if (reviewDate < today) {
        overdue += 1;
        continue;
      }

      if (reviewDate <= sevenDaysFromNow) {
        dueWithinSevenDays += 1;
      }
    }

    return {
      overdue,
      dueWithinSevenDays,
      actionsRequired,
    };
  }, [latestCompetencies]);

  const medicationConcerns = useMemo(() => {
    const sevenDaysAgo = addDays(startOfToday(), -7);

    return medicationAdministrations.filter((administration) => {
      const recordedAt = new Date(administration.administered_at);

      return (
        recordedAt >= sevenDaysAgo &&
        CONCERNING_MEDICATION_STATUSES.includes(
          administration.status,
        )
      );
    });
  }, [medicationAdministrations]);

  const serviceInsights = useMemo<ServiceInsight[]>(() => {
    const wellbeingReadings: WellbeingReading[] = timelineEntries
      .filter((entry) => entry.entry_type === "Wellbeing")
      .map((entry) => {
        const score = extractWellbeingScore(entry.content);

        if (score === null) return null;

        return {
          entryId: entry.id,
          serviceUserId: entry.service_user_id,
          score,
          recordedAt: entry.event_time || entry.created_at,
        };
      })
      .filter(
        (reading): reading is WellbeingReading => reading !== null,
      );

    const readingsByServiceUser = new Map<
      string,
      WellbeingReading[]
    >();

    for (const reading of wellbeingReadings) {
      const current =
        readingsByServiceUser.get(reading.serviceUserId) || [];

      current.push(reading);
      readingsByServiceUser.set(reading.serviceUserId, current);
    }

    const insights: ServiceInsight[] = [];

    for (const [serviceUserId, readings] of readingsByServiceUser) {
      const ordered = [...readings].sort(
        (first, second) =>
          new Date(second.recordedAt).getTime() -
          new Date(first.recordedAt).getTime(),
      );

      const latestFive = ordered.slice(0, 5);

      if (latestFive.length < 3) continue;

      const newest = latestFive[0].score;
      const oldest = latestFive[latestFive.length - 1].score;
      const lowReadings = latestFive.filter(
        (reading) => reading.score <= 2,
      ).length;

      const name = getServiceUserName(
        serviceUserId,
        serviceUsersById,
      );

      if (lowReadings >= 3) {
        insights.push({
          id: `low-wellbeing-${serviceUserId}`,
          title: `${name} has repeatedly low wellbeing scores`,
          description: `${lowReadings} of the latest ${latestFive.length} wellbeing entries scored 2 or below.`,
          href: `/care/manager/service-user/${serviceUserId}`,
          level: "danger",
        });

        continue;
      }

      if (oldest - newest >= 2) {
        insights.push({
          id: `declining-wellbeing-${serviceUserId}`,
          title: `${name}'s wellbeing has declined`,
          description: `The recorded score has reduced across the latest ${latestFive.length} wellbeing entries.`,
          href: `/care/manager/service-user/${serviceUserId}`,
          level: "warning",
        });
      }
    }

    const incidentCutoff = addDays(startOfToday(), -7);

    const recentIncidentsByServiceUser = new Map<string, number>();

    for (const entry of timelineEntries) {
      if (!INCIDENT_ENTRY_TYPES.includes(entry.entry_type)) continue;

      const occurredAt = new Date(entry.event_time || entry.created_at);

      if (occurredAt < incidentCutoff) continue;

      recentIncidentsByServiceUser.set(
        entry.service_user_id,
        (recentIncidentsByServiceUser.get(entry.service_user_id) || 0) +
          1,
      );
    }

    for (const [serviceUserId, count] of recentIncidentsByServiceUser) {
      if (count < 3) continue;

      const name = getServiceUserName(
        serviceUserId,
        serviceUsersById,
      );

      insights.push({
        id: `incident-pattern-${serviceUserId}`,
        title: `${name} has had ${count} incidents this week`,
        description:
          "This may require a review of recent records, triggers and support strategies.",
        href: `/care/manager/service-user/${serviceUserId}`,
        level: "warning",
      });
    }

    return insights.slice(0, 5);
  }, [serviceUsersById, timelineEntries]);

  const actionItems = useMemo(() => {
    return [
      {
        key: "incident-reviews",
        title: "Incident reviews",
        description:
          unreviewedIncidents.length === 1
            ? "1 incident is awaiting manager review."
            : `${unreviewedIncidents.length} incidents are awaiting manager review.`,
        count: unreviewedIncidents.length,
        href: "/care/manager/incidents",
        tone: "red" as const,
        icon: <ShieldAlert className="h-5 w-5" />,
      },
      {
        key: "competencies-due",
        title: "Competencies due within 7 days",
        description:
          competencySummary.dueWithinSevenDays === 1
            ? "1 competency reaches its review date within seven days."
            : `${competencySummary.dueWithinSevenDays} competencies reach their review date within seven days.`,
        count: competencySummary.dueWithinSevenDays,
        href: "/care/manager/staff/competencies",
        tone: "amber" as const,
        icon: <GraduationCap className="h-5 w-5" />,
      },
      {
        key: "competencies-overdue",
        title: "Overdue competencies",
        description:
          competencySummary.overdue === 1
            ? "1 competency is past its review date."
            : `${competencySummary.overdue} competencies are past their review date.`,
        count: competencySummary.overdue,
        href: "/care/manager/staff/competencies",
        tone: "red" as const,
        icon: <AlertTriangle className="h-5 w-5" />,
      },
      {
        key: "competency-actions",
        title: "Competency actions",
        description:
          competencySummary.actionsRequired === 1
            ? "1 competency assessment has outstanding actions."
            : `${competencySummary.actionsRequired} competency assessments have outstanding actions.`,
        count: competencySummary.actionsRequired,
        href: "/care/manager/staff/competencies",
        tone: "purple" as const,
        icon: <ClipboardCheck className="h-5 w-5" />,
      },
      {
        key: "medication-concerns",
        title: "Medication outcomes to review",
        description:
          medicationConcerns.length === 1
            ? "1 medication was refused, missed or not administered this week."
            : `${medicationConcerns.length} medications were refused, missed or not administered this week.`,
        count: medicationConcerns.length,
        href: "/care/manager/emar",
        tone: "amber" as const,
        icon: <Pill className="h-5 w-5" />,
      },
    ].filter((item) => item.count > 0);
  }, [
    competencySummary,
    medicationConcerns.length,
    unreviewedIncidents.length,
  ]);

  const totalActions = useMemo(() => {
    return actionItems.reduce(
      (total, item) => total + item.count,
      0,
    );
  }, [actionItems]);

  const highPriorityCount =
    unreviewedIncidents.length +
    competencySummary.overdue;

  const dueSoonCount =
    competencySummary.dueWithinSevenDays +
    competencySummary.actionsRequired;

  const monitorCount =
    medicationConcerns.length + serviceInsights.length;

  const goodNewsItems = useMemo(() => {
    const items: string[] = [];

    if (unreviewedIncidents.length === 0) {
      items.push("There are no incidents awaiting manager review.");
    }

    if (competencySummary.overdue === 0) {
      items.push("No recorded competencies are currently overdue.");
    }

    if (medicationConcerns.length === 0) {
      items.push(
        "No missed, refused or omitted medication outcomes were recorded in the last seven days.",
      );
    }

    if (serviceInsights.length === 0 && !loading) {
      items.push(
        "No significant wellbeing decline or repeated incident pattern was identified.",
      );
    }

    return items;
  }, [
    competencySummary.overdue,
    loading,
    medicationConcerns.length,
    serviceInsights.length,
    unreviewedIncidents.length,
  ]);

  function openPage(href: string) {
    router.push(href);
  }

  return (
    <CastodiaPageShell
      title="Insights"
      description="Your briefing of key actions and important updates."
      maxWidth="wide"
      actions={
        <CastodiaButton
          variant="secondary"
          onClick={() => void loadInsights(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}

          Refresh
        </CastodiaButton>
      }
    >
      {errorMessage ? (
        <CastodiaCard>
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </span>

            <div>
              <h2 className="font-semibold text-slate-950">
                Insights could not be loaded
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => void loadInsights()}
                className="mt-3 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
              >
                Try again
              </button>
            </div>
          </div>
        </CastodiaCard>
      ) : null}

      <CastodiaCard>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <ClipboardCheck className="h-6 w-6" />
              )}
            </span>

            <div>
              <p className="text-xl font-bold text-slate-950">
                {loading
                  ? "Preparing your briefing"
                  : totalActions === 0
                    ? "No actions currently require your attention"
                    : `${totalActions} ${
                        totalActions === 1 ? "item requires" : "items require"
                      } your attention`}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {profile?.full_name
                  ? `Live oversight for ${profile.full_name}'s organisation.`
                  : "Live oversight across your organisation."}
              </p>
            </div>
          </div>

          {!loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SummaryValue
                value={highPriorityCount}
                label="High priority"
                tone="red"
              />

              <SummaryValue
                value={dueSoonCount}
                label="Due soon"
                tone="amber"
              />

              <SummaryValue
                value={monitorCount}
                label="Monitor"
                tone="blue"
              />

              <SummaryValue
                value={goodNewsItems.length}
                label="Good news"
                tone="green"
              />
            </div>
          ) : null}
        </div>
      </CastodiaCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <CastodiaCard padding="none">
          <section aria-labelledby="needs-attention-heading">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <h2
                  id="needs-attention-heading"
                  className="text-lg font-bold text-slate-950"
                >
                  Needs Attention
                </h2>

                {!loading && totalActions > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                    {totalActions}
                  </span>
                ) : null}
              </div>
            </div>

            {loading ? (
              <LoadingRows />
            ) : actionItems.length === 0 ? (
              <EmptyPanel
                icon={
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                }
                title="Nothing needs immediate attention"
                description="No outstanding incident, competency or medication actions were found."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {actionItems.map((item) => (
                  <ActionItem
                    key={item.key}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    count={item.count}
                    href={item.href}
                    tone={item.tone}
                    onOpen={openPage}
                  />
                ))}
              </div>
            )}
          </section>
        </CastodiaCard>

        <CastodiaCard padding="none">
          <section aria-labelledby="service-insights-heading">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <h2
                  id="service-insights-heading"
                  className="text-lg font-bold text-slate-950"
                >
                  Service Insights
                </h2>

                {!loading && serviceInsights.length > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                    {serviceInsights.length}
                  </span>
                ) : null}
              </div>
            </div>

            {loading ? (
              <LoadingRows />
            ) : serviceInsights.length === 0 ? (
              <EmptyPanel
                icon={
                  <HeartPulse className="h-6 w-6 text-emerald-600" />
                }
                title="No concerning patterns identified"
                description="Recent wellbeing and incident records do not currently show a significant pattern."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {serviceInsights.map((insight) => (
                  <button
                    key={insight.id}
                    type="button"
                    onClick={() => openPage(insight.href)}
                    className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-inset"
                  >
                    <span
                      className={[
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        insight.level === "danger"
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600",
                      ].join(" ")}
                    >
                      {insight.level === "danger" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <HeartPulse className="h-5 w-5" />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-slate-950">
                        {insight.title}
                      </span>

                      <span className="mt-1 block text-sm leading-5 text-slate-500">
                        {insight.description}
                      </span>
                    </span>

                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </CastodiaCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CastodiaCard>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <UserRoundCheck className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Workforce summary
              </h2>

              <p className="text-sm text-slate-500">
                Current competency actions requiring management oversight.
              </p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3">
            <MetricBox
              value={competencySummary.overdue}
              label="Overdue"
            />

            <MetricBox
              value={competencySummary.dueWithinSevenDays}
              label="Due in 7 days"
            />

            <MetricBox
              value={competencySummary.actionsRequired}
              label="With actions"
            />
          </dl>

          <button
            type="button"
            onClick={() =>
              openPage("/care/manager/staff/competencies")
            }
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Open competencies
            <ArrowRight className="h-4 w-4" />
          </button>
        </CastodiaCard>

        <CastodiaCard>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Good News
              </h2>

              <p className="text-sm text-slate-500">
                Areas that currently require no further action.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="mt-5 h-24 animate-pulse rounded-2xl bg-slate-100" />
          ) : goodNewsItems.length === 0 ? (
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Current records contain active actions requiring review.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {goodNewsItems.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-6 text-slate-700"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </CastodiaCard>
      </div>
    </CastodiaPageShell>
  );
}

function SummaryValue({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "red" | "amber" | "blue" | "green";
}) {
  const toneClasses = {
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="min-w-28 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={[
            "inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1",
            "text-sm font-bold",
            toneClasses[tone],
          ].join(" ")}
        >
          {value}
        </span>

        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}

function MetricBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-2xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs font-medium text-slate-500">
        {label}
      </p>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex items-center gap-4 px-4 py-4"
        >
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-100" />

          <div className="flex-1">
            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
            <div className="mt-2 h-3 w-64 max-w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
        {icon}
      </span>

      <h3 className="mt-4 font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
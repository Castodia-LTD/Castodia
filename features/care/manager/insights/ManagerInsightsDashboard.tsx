"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Loader2,
  Pill,
  RefreshCw,
  ShieldAlert,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import {
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

type Timeline = {
  entry_type: string;
  reviewed: boolean | null;
  created_at: string;
};

type Competency = {
  staff_id: string;
  competency_type: string;
  outcome: string | null;
  assessment_date: string | null;
  review_date: string | null;
};

type Medication = {
  status: string;
  administered_at: string;
};

type ShiftAssignment = {
  staff_user_id: string;
  assignment_type: string;
};

type Shift = {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  rota_shift_assignments?: ShiftAssignment[];
};

type Item = {
  key: string;
  title: string;
  description: string;
  count: number;
  href: string;
  tone: "red" | "amber";
  icon: React.ReactNode;
};

const INCIDENTS = [
  "Accident / Injury",
  "Behaviour Incident",
  "Fall",
  "Medication Error",
  "Near Miss",
  "Safeguarding Concern",
];

const MEDICATION_CONCERNS = [
  "Refused",
  "Not Administered",
  "Not given",
  "Omitted",
  "Missed",
  "Unavailable",
  "Withheld",
];

const DAY_MS = 86_400_000;

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function startToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * DAY_MS);
}

function shiftWindow(shift: Shift): { start: Date; end: Date } {
  const start = new Date(`${shift.shift_date}T${shift.start_time}`);
  const end = new Date(`${shift.shift_date}T${shift.end_time}`);
  if (end <= start) end.setDate(end.getDate() + 1);
  return { start, end };
}

export default function ManagerInsightsDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("You must be signed in to view insights.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("organisation_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile?.organisation_id) {
        throw new Error("Your organisation could not be identified.");
      }

      const organisationId = profile.organisation_id;
      const today = startToday();
      const failures: string[] = [];

      const [timelineResult, competencyResult, medicationResult, rotaResult] =
        await Promise.all([
          supabase
            .from("timeline_entries")
            .select("entry_type, reviewed, created_at")
            .gte("created_at", addDays(today, -30).toISOString()),
          supabase
            .from("staff_competencies")
            .select(
              "staff_id, competency_type, outcome, assessment_date, review_date",
            )
            .eq("organisation_id", organisationId),
          supabase
            .from("medication_administrations")
            .select("status, administered_at")
            .gte("administered_at", addDays(today, -30).toISOString()),
          supabase
            .from("rota_shifts")
            .select(
              "id, shift_date, start_time, end_time, rota_shift_assignments(staff_user_id, assignment_type)",
            )
            .eq("organisation_id", organisationId)
            .eq("status", "planned")
            .gte("shift_date", dateKey(today))
            .lte("shift_date", dateKey(addDays(today, 14))),
        ]);

      if (timelineResult.error) {
        failures.push(`Timeline: ${timelineResult.error.message}`);
        setTimeline([]);
      } else {
        setTimeline((timelineResult.data ?? []) as Timeline[]);
      }

      if (competencyResult.error) {
        failures.push(`Competencies: ${competencyResult.error.message}`);
        setCompetencies([]);
      } else {
        setCompetencies((competencyResult.data ?? []) as Competency[]);
      }

      if (medicationResult.error) {
        failures.push(`Medication: ${medicationResult.error.message}`);
        setMedications([]);
      } else {
        setMedications((medicationResult.data ?? []) as Medication[]);
      }

      if (rotaResult.error) {
        failures.push(`Rotas: ${rotaResult.error.message}`);
        setShifts([]);
      } else {
        setShifts((rotaResult.data ?? []) as unknown as Shift[]);
      }

      if (failures.length > 0) {
        setError(`Some insight sources are unavailable: ${failures.join(" | ")}`);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const today = startToday();
    const weekAhead = addDays(today, 7);
    const weekAgo = addDays(today, -7);

    const incidents = timeline.filter(
      (entry) =>
        INCIDENTS.includes(entry.entry_type) && entry.reviewed !== true,
    ).length;

    const latestCompetencies = new Map<string, Competency>();
    [...competencies]
      .sort((a, b) => {
        const aDate = new Date(a.assessment_date ?? a.review_date ?? 0).getTime();
        const bDate = new Date(b.assessment_date ?? b.review_date ?? 0).getTime();
        return bDate - aDate;
      })
      .forEach((competency) => {
        const key = `${competency.staff_id}:${competency.competency_type}`;
        if (!latestCompetencies.has(key)) latestCompetencies.set(key, competency);
      });

    let overdue = 0;
    let dueSoon = 0;
    let competencyActions = 0;

    for (const competency of latestCompetencies.values()) {
      if (competency.outcome === "Competent With Actions") competencyActions += 1;
      if (!competency.review_date) continue;
      const reviewDate = new Date(competency.review_date);
      if (reviewDate < today) overdue += 1;
      else if (reviewDate <= weekAhead) dueSoon += 1;
    }

    const medicationConcerns = medications.filter(
      (medication) =>
        new Date(medication.administered_at) >= weekAgo &&
        MEDICATION_CONCERNS.includes(medication.status),
    ).length;

    let unfilled = 0;
    let conflicts = 0;
    const shiftsByStaff = new Map<string, Shift[]>();

    for (const shift of shifts) {
      const workingAssignments = (shift.rota_shift_assignments ?? []).filter(
        (assignment) => assignment.assignment_type === "working",
      );

      if (workingAssignments.length === 0) unfilled += 1;

      for (const assignment of workingAssignments) {
        const staffShifts = shiftsByStaff.get(assignment.staff_user_id) ?? [];
        staffShifts.push(shift);
        shiftsByStaff.set(assignment.staff_user_id, staffShifts);
      }
    }

    for (const staffShifts of shiftsByStaff.values()) {
      for (let firstIndex = 0; firstIndex < staffShifts.length; firstIndex += 1) {
        for (
          let secondIndex = firstIndex + 1;
          secondIndex < staffShifts.length;
          secondIndex += 1
        ) {
          const first = shiftWindow(staffShifts[firstIndex]);
          const second = shiftWindow(staffShifts[secondIndex]);
          if (first.start < second.end && second.start < first.end) conflicts += 1;
        }
      }
    }

    return {
      incidents,
      overdue,
      dueSoon,
      competencyActions,
      medicationConcerns,
      unfilled,
      conflicts,
    };
  }, [timeline, competencies, medications, shifts]);

  const allItems: Item[] = [
    {
      key: "incidents",
      title: "Incident reviews",
      description: "Incidents awaiting manager review.",
      count: stats.incidents,
      href: "/care/manager/incidents",
      tone: "red",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      key: "conflicts",
      title: "Rota conflicts",
      description: "Overlapping staff assignments in the next 14 days.",
      count: stats.conflicts,
      href: "/care/manager/rota",
      tone: "red",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      key: "unfilled",
      title: "Unfilled shifts",
      description: "Planned shifts with no working staff assigned.",
      count: stats.unfilled,
      href: "/care/manager/rota",
      tone: "amber",
      icon: <Users className="h-5 w-5" />,
    },
    {
      key: "overdue",
      title: "Overdue competencies",
      description: "Competencies past their review date.",
      count: stats.overdue,
      href: "/care/manager/staff/competencies",
      tone: "red",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      key: "due",
      title: "Competencies due soon",
      description: "Competencies reaching review date within seven days.",
      count: stats.dueSoon,
      href: "/care/manager/staff/competencies",
      tone: "amber",
      icon: <GraduationCap className="h-5 w-5" />,
    },
    {
      key: "medication",
      title: "Medication outcomes to review",
      description: "Missed, refused, withheld or unavailable outcomes this week.",
      count: stats.medicationConcerns,
      href: "/care/manager/emar",
      tone: "amber",
      icon: <Pill className="h-5 w-5" />,
    },
  ];

  const items = allItems.filter((item) => item.count > 0);
  const total = items.reduce((sum, item) => sum + item.count, 0);

  const positives = [
    stats.incidents === 0 && "No incidents are awaiting manager review.",
    stats.conflicts === 0 && "No rota clashes were found in the next 14 days.",
    stats.unfilled === 0 &&
      "All planned shifts in the next 14 days have working staff assigned.",
    stats.overdue === 0 && "No recorded competencies are overdue.",
    stats.medicationConcerns === 0 &&
      "No concerning medication outcomes were recorded in the last seven days.",
  ].filter((value): value is string => Boolean(value));

  return (
    <CastodiaPageShell
      title="Insights"
      description="A live management briefing built from current Castodia records."
      maxWidth="wide"
      actions={
        <CastodiaButton
          variant="secondary"
          onClick={() => void load(true)}
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
      {error ? (
        <CastodiaCard>
          <p className="text-sm text-amber-700">{error}</p>
        </CastodiaCard>
      ) : null}

      <CastodiaCard>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <ClipboardCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-bold text-slate-950">
              {loading
                ? "Preparing your briefing"
                : total === 0
                  ? "No actions currently require your attention"
                  : `${total} ${total === 1 ? "item requires" : "items require"} your attention`}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Incidents, medication, staff competencies and rota readiness.
            </p>
          </div>
        </div>
      </CastodiaCard>

      <div className="grid gap-4 xl:grid-cols-2">
        <CastodiaCard padding="none">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-bold text-slate-950">Needs Attention</h2>
          </div>

          {loading ? (
            <div className="p-5 text-sm text-slate-500">Loading live records…</div>
          ) : items.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => router.push(item.href)}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left hover:bg-slate-50"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      item.tone === "red"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-950">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {item.description}
                    </span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
                    {item.count}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 p-5">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-950">
                  Nothing needs immediate attention
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Current records do not show outstanding incident, medication,
                  competency or rota actions.
                </p>
              </div>
            </div>
          )}
        </CastodiaCard>

        <CastodiaCard>
          <h2 className="text-lg font-bold text-slate-950">Service readiness</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["Rota conflicts", stats.conflicts],
              ["Unfilled shifts", stats.unfilled],
              ["Overdue competencies", stats.overdue],
              ["Competency actions", stats.competencyActions],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-2xl font-bold text-slate-950">{value}</div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </CastodiaCard>
      </div>

      <CastodiaCard>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-950">Good News</h2>
            <p className="text-sm text-slate-500">
              Areas where current records show no immediate governance concern.
            </p>
          </div>
        </div>
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {positives.map((item) => (
            <li
              key={item}
              className="rounded-2xl bg-emerald-50/60 p-4 text-sm text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </CastodiaCard>
    </CastodiaPageShell>
  );
}

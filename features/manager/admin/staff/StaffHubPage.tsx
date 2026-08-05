"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  Loader2,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
import { supabase } from "@/lib/supabase";

export type StaffMember = {
  id: string;
  full_name: string;
  role: string;
  photo_url: string | null;
};

type StaffHubPageProps = {
  staffId: string;
  staffMembers?: StaffMember[];
  onStaffChange?: (staffId: string) => void;
};

type StaffProfile = {
  id: string;
  full_name: string;
  role: string;
  photo_url: string | null;
  organisation_id: string;
};

type EmploymentRecord = {
  employment_status: string;
  job_title: string | null;
  department: string | null;
  house_name: string | null;
  manager_id: string | null;
  contract_type: string | null;
  contracted_hours: number | null;
  start_date: string | null;
  probation_end_date: string | null;
  right_to_work_status: string | null;
  right_to_work_expiry_date: string | null;
  dbs_status: string | null;
  dbs_next_check_date: string | null;
  occupational_health_status: string | null;
  occupational_health_review_date: string | null;
};

type TrainingRecord = {
  id: string;
  course_name: string;
  completion_date: string;
  expiry_date: string | null;
};

type CompetencyRecord = {
  id: string;
  competency_type?: string | null;
  status?: string | null;
  outcome?: string | null;
  assessment_date?: string | null;
  review_date?: string | null;
  expiry_date?: string | null;
  action_required?: boolean | null;
};

type SupervisionRecord = {
  id: string;
  supervision_date: string | null;
  next_supervision_date: string | null;
  created_at: string;
};

type StaffDocument = {
  id: string;
  document_type: string;
  expiry_date: string | null;
  created_at: string;
};

type ManagerProfile = {
  id: string;
  full_name: string;
};

const hubSections = [
  
  {
    label: "Employment",
    href: (id: string) =>
      `/manager/staff/${id}/employment`,
    icon: BriefcaseBusiness,
  },
  {
    label: "Training",
    href: () => "/manager/staff/training",
    icon: GraduationCap,
  },
  {
    label: "Competencies",
    href: () => "/manager/staff/competencies",
    icon: ClipboardCheck,
  },
  {
    label: "Supervisions",
    href: () => "/manager/staff/supervisions",
    icon: MessageSquareText,
  },
  {
    label: "Documents",
    href: (id: string) =>
      `/manager/staff/${id}/documents`,
    icon: FileText,
  },
  {
    label: "Access & Permissions",
    href: () => "/manager/admin/access",
    icon: ShieldCheck,
  },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getRoleLabel(role: string) {
  if (role === "manager") return "Manager";

  if (role === "staff" || role === "support") {
    return "Support Worker";
  }

  return role || "Role not recorded";
}

function formatLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";

  return new Date(`${value}T00:00:00`).toLocaleDateString(
    "en-GB"
  );
}

function daysUntil(value: string | null | undefined) {
  if (!value) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${value}T00:00:00`);

  return Math.ceil(
    (target.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function getExpiryStatus(
  expiryDate: string | null | undefined
) {
  const days = daysUntil(expiryDate);

  if (days === null) return "no-expiry";
  if (days < 0) return "expired";
  if (days <= 30) return "due-soon";

  return "current";
}

function getCompetencyStatus(
  competency: CompetencyRecord
) {
  if (competency.action_required) {
    return "action";
  }

  const recordedStatus = (
    competency.status ??
    competency.outcome ??
    ""
  ).toLowerCase();

  if (
    recordedStatus.includes("action") ||
    recordedStatus.includes("not competent")
  ) {
    return "action";
  }

  const reviewDate =
    competency.review_date ??
    competency.expiry_date ??
    null;

  const expiryStatus = getExpiryStatus(reviewDate);

  if (expiryStatus === "expired") return "overdue";
  if (expiryStatus === "due-soon") return "due-soon";

  if (
    recordedStatus.includes("competent") ||
    recordedStatus.includes("complete") ||
    recordedStatus.includes("passed")
  ) {
    return "competent";
  }

  return "recorded";
}

function SummaryMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-950">
        {value}
      </p>

      {detail ? (
        <p className="mt-1 text-sm text-slate-500">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export default function StaffHubPage({
  staffId,
  staffMembers = [],
  onStaffChange,
}: StaffHubPageProps) {
  const pathname = usePathname();

  const [staff, setStaff] =
    useState<StaffProfile | null>(null);

  const [employment, setEmployment] =
    useState<EmploymentRecord | null>(null);

  const [training, setTraining] = useState<
    TrainingRecord[]
  >([]);

  const [competencies, setCompetencies] = useState<
    CompetencyRecord[]
  >([]);

  const [supervisions, setSupervisions] = useState<
    SupervisionRecord[]
  >([]);

  const [documents, setDocuments] = useState<
    StaffDocument[]
  >([]);

  const [managers, setManagers] = useState<
    ManagerProfile[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<
    string | null
  >(null);

  const [partialWarnings, setPartialWarnings] =
    useState<string[]>([]);

  const initials = useMemo(() => {
    return staff?.full_name
      ? getInitials(staff.full_name)
      : "";
  }, [staff]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setPartialWarnings([]);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You must be signed in.");
      }

      const {
        data: currentProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("organisation_id")
        .eq("id", user.id)
        .single();

      if (
        profileError ||
        !currentProfile?.organisation_id
      ) {
        throw new Error(
          profileError?.message ||
            "Your organisation could not be identified."
        );
      }

      const organisationId =
        currentProfile.organisation_id;

      const [
        staffResult,
        employmentResult,
        trainingResult,
        competencyResult,
        supervisionResult,
        documentResult,
        managerResult,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "id, full_name, role, photo_url, organisation_id"
          )
          .eq("id", staffId)
          .eq("organisation_id", organisationId)
          .single(),

        supabase
          .from("staff_employment")
          .select("*")
          .eq("staff_id", staffId)
          .eq("organisation_id", organisationId)
          .maybeSingle(),

        supabase
          .from("staff_training_records")
          .select(
            "id, course_name, completion_date, expiry_date"
          )
          .eq("staff_id", staffId)
          .eq("organisation_id", organisationId)
          .order("completion_date", {
            ascending: false,
          }),

        supabase
          .from("staff_competencies")
          .select("*")
          .eq("staff_id", staffId)
          .eq("organisation_id", organisationId)
          .order("assessment_date", {
            ascending: false,
          }),

        supabase
          .from("staff_supervisions")
          .select(
            "id, supervision_date, next_supervision_date, created_at"
          )
          .eq("staff_id", staffId)
          .eq("organisation_id", organisationId)
          .order("supervision_date", {
            ascending: false,
          }),

        supabase
          .from("staff_documents")
          .select(
            "id, document_type, expiry_date, created_at"
          )
          .eq("staff_id", staffId)
          .eq("organisation_id", organisationId)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("profiles")
          .select("id, full_name")
          .eq("organisation_id", organisationId)
          .eq("role", "manager")
          .order("full_name"),
      ]);

      if (
        staffResult.error ||
        !staffResult.data
      ) {
        throw new Error(
          staffResult.error?.message ||
            "Staff member could not be found."
        );
      }

      const warnings: string[] = [];

      if (employmentResult.error) {
        warnings.push("Employment");
      }

      if (trainingResult.error) {
        warnings.push("Training");
      }

      if (competencyResult.error) {
        warnings.push("Competencies");
      }

      if (supervisionResult.error) {
        warnings.push("Supervisions");
      }

      if (documentResult.error) {
        warnings.push("Documents");
      }

      if (managerResult.error) {
        warnings.push("Managers");
      }

      setStaff(
        staffResult.data as StaffProfile
      );

      setEmployment(
        employmentResult.error
          ? null
          : (employmentResult.data as EmploymentRecord | null)
      );

      setTraining(
        trainingResult.error
          ? []
          : ((trainingResult.data ??
              []) as TrainingRecord[])
      );

      setCompetencies(
        competencyResult.error
          ? []
          : ((competencyResult.data ??
              []) as CompetencyRecord[])
      );

      setSupervisions(
        supervisionResult.error
          ? []
          : ((supervisionResult.data ??
              []) as SupervisionRecord[])
      );

      setDocuments(
        documentResult.error
          ? []
          : ((documentResult.data ??
              []) as StaffDocument[])
      );

      setManagers(
        managerResult.error
          ? []
          : ((managerResult.data ??
              []) as ManagerProfile[])
      );

      setPartialWarnings(warnings);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load the staff overview."
      );

      setStaff(null);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const trainingSummary = useMemo(() => {
    let current = 0;
    let dueSoon = 0;
    let expired = 0;
    let noExpiry = 0;

    training.forEach((record) => {
      const status = getExpiryStatus(
        record.expiry_date
      );

      if (status === "current") current += 1;
      if (status === "due-soon") dueSoon += 1;
      if (status === "expired") expired += 1;
      if (status === "no-expiry") noExpiry += 1;
    });

    return {
      total: training.length,
      current,
      dueSoon,
      expired,
      noExpiry,
    };
  }, [training]);

  const latestCompetencies = useMemo(() => {
    const map = new Map<string, CompetencyRecord>();

    competencies.forEach((competency) => {
      const type =
        competency.competency_type?.trim() ||
        "General competency";

      if (!map.has(type)) {
        map.set(type, competency);
      }
    });

    return Array.from(map.values());
  }, [competencies]);

  const competencySummary = useMemo(() => {
    let competent = 0;
    let dueSoon = 0;
    let overdue = 0;
    let actions = 0;
    let recorded = 0;

    latestCompetencies.forEach((competency) => {
      const status =
        getCompetencyStatus(competency);

      if (status === "competent") competent += 1;
      if (status === "due-soon") dueSoon += 1;
      if (status === "overdue") overdue += 1;
      if (status === "action") actions += 1;
      if (status === "recorded") recorded += 1;
    });

    return {
      total: latestCompetencies.length,
      competent,
      dueSoon,
      overdue,
      actions,
      recorded,
    };
  }, [latestCompetencies]);

  const supervisionSummary = useMemo(() => {
    const latest = supervisions[0] ?? null;

    return {
      total: supervisions.length,
      lastDate:
        latest?.supervision_date ?? null,
      nextDate:
        latest?.next_supervision_date ?? null,
      nextStatus: getExpiryStatus(
        latest?.next_supervision_date
      ),
    };
  }, [supervisions]);

  const documentSummary = useMemo(() => {
    let dueSoon = 0;
    let expired = 0;

    documents.forEach((document) => {
      const status = getExpiryStatus(
        document.expiry_date
      );

      if (status === "due-soon") dueSoon += 1;
      if (status === "expired") expired += 1;
    });

    return {
      total: documents.length,
      dueSoon,
      expired,
    };
  }, [documents]);

  const managerName = useMemo(() => {
    if (!employment?.manager_id) {
      return "Not assigned";
    }

    return (
      managers.find(
        (manager) =>
          manager.id === employment.manager_id
      )?.full_name ?? "Unknown manager"
    );
  }, [employment, managers]);

  const outstandingActions = useMemo(() => {
    const actions: {
      label: string;
      detail: string;
      href: string;
    }[] = [];

    if (!staff) return actions;

    if (!employment) {
      actions.push({
        label: "Employment record missing",
        detail:
          "Add contract, compliance and employment information.",
        href: `/manager/staff/${staff.id}/employment`,
      });
    }

    if (
      employment?.dbs_status === "expired" ||
      getExpiryStatus(
        employment?.dbs_next_check_date
      ) === "expired"
    ) {
      actions.push({
        label: "DBS requires attention",
        detail:
          "The DBS status or next check date is overdue.",
        href: `/manager/staff/${staff.id}/employment`,
      });
    }

    if (
      employment?.right_to_work_status ===
        "expired" ||
      getExpiryStatus(
        employment?.right_to_work_expiry_date
      ) === "expired"
    ) {
      actions.push({
        label: "Right to Work requires attention",
        detail:
          "Right to Work evidence has expired.",
        href: `/manager/staff/${staff.id}/employment`,
      });
    }

    if (trainingSummary.expired > 0) {
      actions.push({
        label: `${trainingSummary.expired} expired training record${
          trainingSummary.expired === 1 ? "" : "s"
        }`,
        detail:
          "Review and renew overdue staff training.",
        href: "/manager/staff/training",
      });
    }

    if (trainingSummary.dueSoon > 0) {
      actions.push({
        label: `${trainingSummary.dueSoon} training record${
          trainingSummary.dueSoon === 1 ? "" : "s"
        } due soon`,
        detail:
          "Training expires within the next 30 days.",
        href: "/manager/staff/training",
      });
    }

    if (
      competencySummary.overdue > 0 ||
      competencySummary.actions > 0
    ) {
      actions.push({
        label: "Competency action required",
        detail: `${competencySummary.overdue} overdue and ${competencySummary.actions} requiring action.`,
        href: "/manager/staff/competencies",
      });
    }

    if (
      supervisionSummary.nextStatus ===
      "expired"
    ) {
      actions.push({
        label: "Supervision overdue",
        detail:
          "The next recorded supervision date has passed.",
        href: "/manager/staff/supervisions",
      });
    }

    if (documentSummary.expired > 0) {
      actions.push({
        label: `${documentSummary.expired} expired document${
          documentSummary.expired === 1 ? "" : "s"
        }`,
        detail:
          "Review expired evidence and replace where necessary.",
        href: `/manager/staff/${staff.id}/documents`,
      });
    }

    return actions;
  }, [
    staff,
    employment,
    trainingSummary,
    competencySummary,
    supervisionSummary,
    documentSummary,
  ]);

  if (loading) {
    return (
      <CastodiaCard>
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading staff overview...
        </div>
      </CastodiaCard>
    );
  }

  if (loadError || !staff) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Staff member could not be loaded
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {loadError ??
              "The staff member could not be found."}
          </p>

          <Link
            href="/manager/staff"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white"
          >
            Return to staff
          </Link>
        </div>
      </CastodiaCard>
    );
  }

  const baseHref = `/manager/staff/${staff.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label
            htmlFor="staff-selector"
            className="text-sm font-semibold text-slate-700"
          >
            Staff member
          </label>

          <select
            id="staff-selector"
            value={staff.id}
            onChange={(event) => {
              const nextStaffId =
                event.target.value;

              if (
                nextStaffId &&
                nextStaffId !== staff.id
              ) {
                onStaffChange?.(nextStaffId);
              }
            }}
            disabled={
              !onStaffChange ||
              staffMembers.length === 0
            }
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {staffMembers.length > 0 ? (
              staffMembers.map((staffMember) => (
                <option
                  key={staffMember.id}
                  value={staffMember.id}
                >
                  {staffMember.full_name}
                </option>
              ))
            ) : (
              <option value={staff.id}>
                {staff.full_name}
              </option>
            )}
          </select>
        </div>

        <Link href="/manager/admin/staff">
          <CastodiaButton>
            <Plus className="h-4 w-4" />
            Add Staff Member
          </CastodiaButton>
        </Link>
      </div>

      {partialWarnings.length > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <p>
            Some overview information could not be
            loaded:{" "}
            {partialWarnings.join(", ")}.
          </p>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-sm ring-4 ring-white">
              {staff.photo_url ? (
                <Image
                  src={staff.photo_url}
                  alt={`${staff.full_name}'s profile`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : initials ? (
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              ) : (
                <UserRound className="h-10 w-10 text-white" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {staff.full_name}
                </h1>

                <CastodiaBadge
                  variant={
                    employment?.employment_status ===
                    "active"
                      ? "success"
                      : employment
                        ? "warning"
                        : "neutral"
                  }
                >
                  {employment
                    ? formatLabel(
                        employment.employment_status
                      )
                    : "Employment not recorded"}
                </CastodiaBadge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-cyan-700" />
                  {employment?.job_title ||
                    getRoleLabel(staff.role)}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-cyan-700" />
                  {employment?.house_name ||
                    "House not assigned"}
                </span>
              </div>
            </div>
          </div>

          <Link href={`${baseHref}/employment`}>
            <CastodiaButton variant="secondary">
              <Pencil className="h-4 w-4" />
              Edit details
            </CastodiaButton>
          </Link>
        </div>

        <div className="grid gap-3 border-t border-cyan-100/80 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
          <SummaryMetric
            label="Employment"
            value={
              employment
                ? formatLabel(
                    employment.employment_status
                  )
                : "Not recorded"
            }
          />

          <SummaryMetric
            label="Contract"
            value={formatLabel(
              employment?.contract_type
            )}
            detail={
              employment?.contracted_hours !== null &&
              employment?.contracted_hours !==
                undefined
                ? `${employment.contracted_hours} hours`
                : undefined
            }
          />

          <SummaryMetric
            label="Manager"
            value={managerName}
          />

          <SummaryMetric
            label="Start date"
            value={formatDate(
              employment?.start_date
            )}
          />
        </div>

        <nav
          aria-label="Staff workspace"
          className="border-t border-cyan-100/80 px-4 py-4 sm:px-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {hubSections.map((section) => {
              const Icon = section.icon;
              const href = section.href(staff.id);

              const isActive =
                pathname === href ||
                (href !== baseHref &&
                  pathname.startsWith(
                    `${href}/`
                  ));

              return (
                <Link
                  key={section.label}
                  href={href}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                    isActive
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/70"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4",
                      isActive
                        ? "text-cyan-700"
                        : "text-slate-400",
                    ].join(" ")}
                  />

                  {section.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Staff overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Employment, training, compliance and
          workforce information at a glance.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link href="/manager/staff/training">
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Training
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {trainingSummary.total}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {trainingSummary.expired} expired ·{" "}
                    {trainingSummary.dueSoon} due soon
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>

          <Link href="/manager/staff/competencies">
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Competencies
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {competencySummary.total}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {competencySummary.competent} competent ·{" "}
                    {competencySummary.actions} actions
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>

          <Link href="/manager/staff/supervisions">
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Supervisions
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    {formatDate(
                      supervisionSummary.lastDate
                    )}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Next:{" "}
                    {formatDate(
                      supervisionSummary.nextDate
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <MessageSquareText className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>

          <Link
            href={`/manager/staff/${staff.id}/documents`}
          >
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Documents
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {documentSummary.total}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {documentSummary.expired} expired ·{" "}
                    {documentSummary.dueSoon} due soon
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <FileCheck2 className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Compliance summary
              </h2>

              <p className="text-sm text-slate-500">
                Key checks recorded in Employment.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryMetric
              label="DBS"
              value={formatLabel(
                employment?.dbs_status
              )}
              detail={
                employment?.dbs_next_check_date
                  ? `Next check ${formatDate(
                      employment.dbs_next_check_date
                    )}`
                  : undefined
              }
            />

            <SummaryMetric
              label="Right to Work"
              value={formatLabel(
                employment?.right_to_work_status
              )}
              detail={
                employment?.right_to_work_expiry_date
                  ? `Expires ${formatDate(
                      employment.right_to_work_expiry_date
                    )}`
                  : undefined
              }
            />

            <SummaryMetric
              label="Occupational Health"
              value={formatLabel(
                employment?.occupational_health_status
              )}
              detail={
                employment?.occupational_health_review_date
                  ? `Review ${formatDate(
                      employment.occupational_health_review_date
                    )}`
                  : undefined
              }
            />
          </div>
        </CastodiaCard>

        <CastodiaCard>
          <div className="flex items-center gap-3">
            <div
              className={[
                "rounded-2xl p-3",
                outstandingActions.length > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {outstandingActions.length > 0 ? (
                <CalendarClock className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Outstanding actions
              </h2>

              <p className="text-sm text-slate-500">
                Items requiring manager attention.
              </p>
            </div>
          </div>

          {outstandingActions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />

              <p className="mt-3 text-sm font-semibold text-emerald-900">
                No outstanding actions
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                No overdue records were identified.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {outstandingActions
                .slice(0, 5)
                .map((action) => (
                  <Link
                    key={`${action.href}-${action.label}`}
                    href={action.href}
                    className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-cyan-200 hover:bg-cyan-50/50"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {action.label}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {action.detail}
                    </p>
                  </Link>
                ))}
            </div>
          )}
        </CastodiaCard>
      </div>
    </div>
  );
}
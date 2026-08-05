"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  History,
  Loader2,
  PackageSearch,
  Pill,
  ShieldCheck,
  SlidersHorizontal,
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

import type {
  MedicationProfile,
  ServiceUser,
} from "./types";

type EmarHubPageProps = {
  serviceUserId: string;
  serviceUsers?: ServiceUser[];
  onServiceUserChange?: (
    serviceUserId: string
  ) => void;
};

const hubSections = [
  {
    label: "Medications",
    href: (id: string) =>
      `/manager/emar/profiles?serviceUserId=${id}`,
    icon: Pill,
  },
  {
  label: "Dose Management",
  href: (id: string) =>
    `/manager/emar/dose?serviceUserId=${id}`,
  icon: SlidersHorizontal,
},
  {
    label: "Stock",
    href: (id: string) =>
      `/manager/emar/${id}/stock`,
    icon: PackageSearch,
  },
  {
    label: "Audit",
    href: (id: string) =>
      `/manager/emar/${id}/audit`,
    icon: FileClock,
  },
];

function getServiceUserName(
  serviceUser: ServiceUser
) {
  return (
    `${serviceUser.first_name ?? ""} ${
      serviceUser.surname ?? ""
    }`.trim() || "Unnamed service user"
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");
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

export default function EmarHubPage({
  serviceUserId,
  serviceUsers = [],
  onServiceUserChange,
}: EmarHubPageProps) {
  const pathname = usePathname();

  const [serviceUser, setServiceUser] =
    useState<ServiceUser | null>(null);

  const [medications, setMedications] = useState<
    MedicationProfile[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState<
    string | null
  >(null);

  const [partialWarnings, setPartialWarnings] =
    useState<string[]>([]);

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
        throw new Error(
          "You must be signed in."
        );
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
        serviceUserResult,
        medicationResult,
      ] = await Promise.all([
        supabase
          .from("service_users")
          .select(
            "id, first_name, surname"
          )
          .eq("id", serviceUserId)
          .eq(
            "organisation_id",
            organisationId
          )
          .single(),

        supabase
          .from("medication_profiles")
          .select("*")
          .eq(
            "service_user_id",
            serviceUserId
          )
          .order("active", {
            ascending: false,
          })
          .order("medication_name", {
            ascending: true,
          }),
      ]);

      if (
        serviceUserResult.error ||
        !serviceUserResult.data
      ) {
        throw new Error(
          serviceUserResult.error?.message ||
            "The service user could not be found."
        );
      }

      const warnings: string[] = [];

      if (medicationResult.error) {
        warnings.push("Medications");
      }

      setServiceUser(
        serviceUserResult.data as ServiceUser
      );

      setMedications(
        medicationResult.error
          ? []
          : ((medicationResult.data ??
              []) as MedicationProfile[])
      );

      setPartialWarnings(warnings);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load the medication overview."
      );

      setServiceUser(null);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  }, [serviceUserId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const serviceUserName = useMemo(() => {
    if (!serviceUser) {
      return "";
    }

    return getServiceUserName(serviceUser);
  }, [serviceUser]);

  const initials = useMemo(() => {
    return serviceUserName
      ? getInitials(serviceUserName)
      : "";
  }, [serviceUserName]);

  const medicationSummary = useMemo(() => {
    const active = medications.filter(
      (medication) => medication.active
    );

    const inactive = medications.filter(
      (medication) => !medication.active
    );

    const regular = active.filter(
      (medication) => !medication.is_prn
    );

    const prn = active.filter(
      (medication) => medication.is_prn
    );

    const titration = active.filter(
      (medication) =>
        medication.titration_plan_available
    );

    const locked = active.filter(
      (medication) => medication.locked
    );

    const managerUnlockRequired =
      active.filter(
        (medication) =>
          medication.manager_unlock_required
      );

    return {
      total: medications.length,
      active,
      inactive,
      regular,
      prn,
      titration,
      locked,
      managerUnlockRequired,
    };
  }, [medications]);

  const outstandingActions = useMemo(() => {
    const actions: {
      label: string;
      detail: string;
      href: string;
    }[] = [];

    if (!serviceUser) {
      return actions;
    }

    if (
      medicationSummary.active.length === 0
    ) {
      actions.push({
        label: "No active medications",
        detail:
          "Add prescribed medication or confirm that no medication support is required.",
        href: `/manager/emar/profiles?serviceUserId=${serviceUser.id}`,
      });
    }

    if (
      medicationSummary.titration.length > 0
    ) {
      actions.push({
        label: `${
          medicationSummary.titration.length
        } medication${
          medicationSummary.titration.length ===
          1
            ? ""
            : "s"
        } with titration information`,
        detail:
          "Review the recorded titration instructions and current medication status.",
        href: `/manager/emar/${serviceUser.id}/titration`,
      });
    }

    if (
      medicationSummary.managerUnlockRequired
        .length > 0
    ) {
      actions.push({
        label: `${
          medicationSummary
            .managerUnlockRequired.length
        } manager unlock${
          medicationSummary
            .managerUnlockRequired.length === 1
            ? ""
            : "s"
        } required`,
        detail:
          "A manager-controlled medication action requires review.",
        href: `/manager/emar/${serviceUser.id}/audit`,
      });
    }

    if (
      medicationSummary.locked.length > 0
    ) {
      actions.push({
        label: `${
          medicationSummary.locked.length
        } locked medication${
          medicationSummary.locked.length === 1
            ? ""
            : "s"
        }`,
        detail:
          "Review locked medications before making changes.",
        href: `/manager/emar/profiles?serviceUserId=${serviceUser.id}`,
      });
    }

    return actions;
  }, [serviceUser, medicationSummary]);

  if (loading) {
    return (
      <CastodiaCard>
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading medication overview...
        </div>
      </CastodiaCard>
    );
  }

  if (loadError || !serviceUser) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Medication overview could not be loaded
          </h1>

          <p className="mt-3 text-sm text-red-700">
            {loadError ??
              "The selected service user could not be found."}
          </p>

          <Link
            href="/manager/emar"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white"
          >
            Return to eMAR
          </Link>
        </div>
      </CastodiaCard>
    );
  }

  const baseHref = `/manager/emar/${serviceUser.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label
            htmlFor="service-user-selector"
            className="text-sm font-semibold text-slate-700"
          >
            Service user
          </label>

          <select
            id="service-user-selector"
            value={serviceUser.id}
            onChange={(event) => {
              const nextServiceUserId =
                event.target.value;

              if (
                nextServiceUserId &&
                nextServiceUserId !==
                  serviceUser.id
              ) {
                onServiceUserChange?.(
                  nextServiceUserId
                );
              }
            }}
            disabled={
              !onServiceUserChange ||
              serviceUsers.length === 0
            }
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {serviceUsers.length > 0 ? (
              serviceUsers.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {getServiceUserName(item)}
                </option>
              ))
            ) : (
              <option value={serviceUser.id}>
                {serviceUserName}
              </option>
            )}
          </select>
        </div>

        <Link
          href={`/manager/emar/profiles?serviceUserId=${serviceUser.id}`}
        >
          <CastodiaButton>
            <Pill className="h-4 w-4" />
            View medications
          </CastodiaButton>
        </Link>
      </div>

      {partialWarnings.length > 0 ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <p>
            Some medication information could not
            be loaded:{" "}
            {partialWarnings.join(", ")}.
          </p>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
        <div className="px-5 py-6 sm:px-7 sm:py-8">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-sm ring-4 ring-white">
              {initials ? (
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
                  {serviceUserName}
                </h1>

                <CastodiaBadge
                  variant={
                    medicationSummary.active.length >
                    0
                      ? "success"
                      : "neutral"
                  }
                >
                  {medicationSummary.active
                    .length > 0
                    ? "Medication active"
                    : "No active medication"}
                </CastodiaBadge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Pill className="h-4 w-4 text-cyan-700" />
                  Medication management
                </span>

                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-700" />
                  Manager oversight
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-cyan-100/80 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-4">
          <SummaryMetric
            label="Active medication"
            value={`${medicationSummary.active.length}`}
            detail={`${medicationSummary.regular.length} regular`}
          />

          <SummaryMetric
            label="PRN medication"
            value={`${medicationSummary.prn.length}`}
            detail={
              medicationSummary.prn.length === 1
                ? "1 PRN medication"
                : `${medicationSummary.prn.length} PRN medications`
            }
          />

          <SummaryMetric
            label="Titration"
            value={`${medicationSummary.titration.length}`}
            detail={
              medicationSummary.titration.length >
              0
                ? "Plan information recorded"
                : "No plan recorded"
            }
          />

          <SummaryMetric
            label="Inactive"
            value={`${medicationSummary.inactive.length}`}
            detail={`${medicationSummary.total} medications recorded`}
          />
        </div>

        <nav
          aria-label="Medication workspace"
          className="border-t border-cyan-100/80 px-4 py-4 sm:px-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {hubSections.map((section) => {
              const Icon = section.icon;
              const href = section.href(
                serviceUser.id
              );

              const cleanHref =
                href.split("?")[0];

              const isActive =
                pathname === cleanHref ||
                pathname.startsWith(
                  `${cleanHref}/`
                );

              return (
                <Link
                  key={section.label}
                  href={href}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
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
          Medication overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Medications, administration and clinical
          controls at a glance.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href={`/manager/emar/profiles?serviceUserId=${serviceUser.id}`}
          >
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Medications
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {medicationSummary.total}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {
                      medicationSummary.active
                        .length
                    }{" "}
                    active ·{" "}
                    {
                      medicationSummary.inactive
                        .length
                    }{" "}
                    inactive
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <Pill className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>

          <Link
            href={`/manager/emar/${serviceUser.id}/administration`}
          >
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Administration
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    View MAR
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Record and review medication
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>

          <Link
            href={`/manager/emar/${serviceUser.id}/titration`}
          >
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Titration
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-950">
                    {
                      medicationSummary.titration
                        .length
                    }
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Medications with titration plans
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
              </div>
            </CastodiaCard>
          </Link>

          <Link
            href={`/manager/emar/${serviceUser.id}/history`}
          >
            <CastodiaCard className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    MAR history
                  </p>

                  <p className="mt-2 text-lg font-semibold text-slate-950">
                    View history
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Administration records
                  </p>
                </div>

                <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                  <History className="h-5 w-5" />
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
                Clinical summary
              </h2>

              <p className="text-sm text-slate-500">
                Current medication controls and
                classifications.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryMetric
              label="Regular"
              value={`${medicationSummary.regular.length}`}
              detail="Active medications"
            />

            <SummaryMetric
              label="PRN"
              value={`${medicationSummary.prn.length}`}
              detail="Active medications"
            />

            <SummaryMetric
              label="Locked"
              value={`${medicationSummary.locked.length}`}
              detail="Manager controlled"
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
                Medication items requiring manager
                attention.
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
                No medication issues were identified.
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
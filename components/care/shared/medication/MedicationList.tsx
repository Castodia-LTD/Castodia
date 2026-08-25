"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  LockKeyhole,
  Pill,
} from "lucide-react";

import type { HubMedicationRecord } from "@/lib/care/service-user-hub/medication/api";

type Portal = "manager" | "support";

type MedicationListProps = {
  serviceUserId: string;
  medications: HubMedicationRecord[];
  portal: Portal;
};

function displayValue(
  value: string | null | undefined,
  fallback = "Not recorded",
) {
  const cleanValue = value?.trim();

  return cleanValue || fallback;
}

export function MedicationList({
  serviceUserId,
  medications,
  portal,
}: MedicationListProps) {
  const [expandedMedicationId, setExpandedMedicationId] =
    useState<string | null>(null);

  const [showInactive, setShowInactive] = useState(false);

  const activeMedications = useMemo(
    () =>
      medications.filter(
        (medication) => medication.active,
      ),
    [medications],
  );

  const inactiveMedications = useMemo(
    () =>
      medications.filter(
        (medication) => !medication.active,
      ),
    [medications],
  );

  function toggleMedication(medicationId: string) {
    setExpandedMedicationId((currentId) =>
      currentId === medicationId
        ? null
        : medicationId,
    );
  }

  if (medications.length === 0) {
    return (
      <MedicationEmptyState
        serviceUserId={serviceUserId}
        portal={portal}
      />
    );
  }

  return (
    <section
      aria-labelledby="medication-list-heading"
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id="medication-list-heading"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Medication
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Current prescribed medication and administration guidance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
            {activeMedications.length} active
          </span>

          {inactiveMedications.length > 0 ? (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
              {inactiveMedications.length} inactive
            </span>
          ) : null}
        </div>
      </div>

      {activeMedications.length > 0 ? (
        <div className="space-y-4">
          {activeMedications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              expanded={
                expandedMedicationId === medication.id
              }
              onToggle={() =>
                toggleMedication(medication.id)
              }
            />
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/85 to-teal-50/70 px-6 py-8 text-center shadow-sm backdrop-blur-md">
          <h2 className="text-lg font-semibold text-slate-900">
            No active medication
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            There is currently no active medication recorded
            for this person in eMAR.
          </p>
        </section>
      )}

      {inactiveMedications.length > 0 ? (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            aria-expanded={showInactive}
            onClick={() =>
              setShowInactive((current) => !current)
            }
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
          >
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Inactive medication
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {inactiveMedications.length} inactive{" "}
                {inactiveMedications.length === 1
                  ? "medication"
                  : "medications"}{" "}
                recorded
              </p>
            </div>

            {showInactive ? (
              <ChevronUp
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-slate-500"
              />
            ) : (
              <ChevronDown
                aria-hidden="true"
                className="h-5 w-5 shrink-0 text-slate-500"
              />
            )}
          </button>

          {showInactive ? (
            <div className="space-y-3 border-t border-slate-200 bg-slate-50/60 p-4">
              {inactiveMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  expanded={
                    expandedMedicationId === medication.id
                  }
                  onToggle={() =>
                    toggleMedication(medication.id)
                  }
                  inactive
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {portal === "manager" ? (
        <div className="flex justify-end">
          <Link
            href={`/care/manager/emar/profiles?serviceUserId=${serviceUserId}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            <Pill
              aria-hidden="true"
              className="h-4 w-4"
            />

            Manage medication in eMAR
          </Link>
        </div>
      ) : null}
    </section>
  );
}

type MedicationCardProps = {
  medication: HubMedicationRecord;
  expanded: boolean;
  onToggle: () => void;
  inactive?: boolean;
};

function MedicationCard({
  medication,
  expanded,
  onToggle,
  inactive = false,
}: MedicationCardProps) {
  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border transition-all duration-200",
        inactive
          ? "border-slate-200 bg-slate-100/80"
          : expanded
            ? "border-cyan-200 bg-gradient-to-br from-cyan-50/90 via-white/85 to-teal-50/90 shadow-md backdrop-blur-md"
            : "border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/80 to-teal-50/70 shadow-sm backdrop-blur-md hover:border-teal-200 hover:shadow-md",
      ].join(" ")}
    >
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-5 px-5 py-4 text-left sm:px-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              inactive
                ? "bg-slate-200 text-slate-500"
                : medication.is_prn
                  ? "bg-violet-100 text-violet-700"
                  : "bg-teal-100 text-teal-700",
            ].join(" ")}
          >
            <Pill
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={[
                  "text-base font-bold sm:text-lg",
                  inactive
                    ? "text-slate-600"
                    : "text-slate-950",
                ].join(" ")}
              >
                {medication.medication_name}
              </h2>

              {medication.is_prn ? (
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                  PRN
                </span>
              ) : (
                <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-700">
                  Regular
                </span>
              )}

              {inactive ? (
                <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                  Inactive
                </span>
              ) : null}

              {medication.locked ? (
                <span
                  title="Medication record locked in eMAR"
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-700"
                >
                  <LockKeyhole
                    aria-hidden="true"
                    className="h-3 w-3"
                  />
                  Locked
                </span>
              ) : null}
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>
                <span className="text-slate-500">
                  Dose:{" "}
                </span>

                <strong className="font-semibold text-slate-800">
                  {displayValue(
                    medication.dose,
                    "Not specified",
                  )}
                </strong>
              </span>

              <span>
                <span className="text-slate-500">
                  Route:{" "}
                </span>

                <strong className="font-semibold text-slate-800">
                  {displayValue(medication.route)}
                </strong>
              </span>

              {medication.round ? (
                <span>
                  <span className="text-slate-500">
                    Round:{" "}
                  </span>

                  <strong className="font-semibold text-slate-800">
                    {medication.round}
                  </strong>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {expanded ? (
          <ChevronUp
            aria-hidden="true"
            className="mt-1 h-5 w-5 shrink-0 text-teal-700"
          />
        ) : (
          <ChevronDown
            aria-hidden="true"
            className="mt-1 h-5 w-5 shrink-0 text-teal-700"
          />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-white/80 bg-white/50 px-5 py-5 backdrop-blur-sm sm:px-6">
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MedicationDetail
              label="Medication"
              value={medication.medication_name}
            />

            <MedicationDetail
              label="Dose"
              value={displayValue(
                medication.dose,
                "Not specified",
              )}
            />

            <MedicationDetail
              label="Route"
              value={displayValue(medication.route)}
            />

            <MedicationDetail
              label="Medication round"
              value={displayValue(medication.round)}
            />

            <MedicationDetail
              label="Medication type"
              value={
                medication.is_prn
                  ? "PRN medication"
                  : "Regular medication"
              }
            />

            <MedicationDetail
              label="Status"
              value={
                medication.active
                  ? "Active"
                  : "Inactive"
              }
            />
          </dl>

          <section className="mt-5 rounded-xl border border-white/80 bg-white/70 p-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Administration instructions
            </h3>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {displayValue(
                medication.instructions,
                "No additional instructions recorded.",
              )}
            </p>
          </section>
        </div>
      ) : null}
    </article>
  );
}

type MedicationDetailProps = {
  label: string;
  value: string;
};

function MedicationDetail({
  label,
  value,
}: MedicationDetailProps) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}

type MedicationEmptyStateProps = {
  serviceUserId: string;
  portal: Portal;
};

function MedicationEmptyState({
  serviceUserId,
  portal,
}: MedicationEmptyStateProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/85 to-teal-50/70 px-8 py-10 text-center shadow-sm backdrop-blur-md">
      <h1 className="text-2xl font-bold tracking-tight text-slate-950">
        Medication
      </h1>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700">
        This page provides a clear, read-only overview of
        medication currently recorded for this person in
        eMAR.
      </p>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
        Medication prescribing, administration and record
        management remain within the eMAR system.
      </p>

      <p className="mx-auto mt-5 max-w-xl text-sm font-semibold text-slate-700">
        No medication records are currently available for
        this person.
      </p>

      {portal === "manager" ? (
        <Link
          href={`/care/manager/emar/profiles?serviceUserId=${serviceUserId}`}
          className="mt-7 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
        >
          <Pill
            aria-hidden="true"
            className="h-4 w-4"
          />

          Open eMAR
        </Link>
      ) : null}
    </section>
  );
}
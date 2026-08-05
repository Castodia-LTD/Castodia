"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleSlash2,
  Clock3,
  Loader2,
  Pill,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
import { supabase } from "@/lib/supabase";

type Medication = {
  id: string;
  service_user_id: string;
  medication_name: string;
  dose: string;
  route: string | null;
  round: string;
  instructions: string | null;
  is_prn: boolean;
  active: boolean;
  locked: boolean;
};

type MedicationStatus =
  | ""
  | "Administered"
  | "Refused"
  | "Not given"
  | "Unavailable"
  | "Withheld";

type MedicationOutcome = {
  selected: boolean;
  status: MedicationStatus;
  reason: string;
};

type Props = {
  serviceUserId: string;
  onSaved?: () => void;
  onCreateTimelineEntry?: (
    summary: string
  ) => Promise<void>;
};

const STATUSES: {
  value: Exclude<MedicationStatus, "">;
  label: string;
  description: string;
}[] = [
  {
    value: "Administered",
    label: "Administered",
    description: "Medication was given as prescribed.",
  },
  {
    value: "Refused",
    label: "Refused",
    description: "The service user declined the medication.",
  },
  {
    value: "Not given",
    label: "Not given",
    description: "Medication was not administered.",
  },
  {
    value: "Unavailable",
    label: "Unavailable",
    description: "Medication was not available.",
  },
  {
    value: "Withheld",
    label: "Withheld",
    description: "Medication was withheld following instruction.",
  },
];

const REASONS = [
  "Service user declined",
  "Medication unavailable",
  "Health concern",
  "As directed by clinician",
  "Asleep",
  "Away from service",
  "Other",
];

function StatusIcon({
  status,
}: {
  status: MedicationStatus;
}) {
  if (status === "Administered") {
    return (
      <CheckCircle2 className="h-4 w-4" />
    );
  }

  if (status === "Refused") {
    return <XCircle className="h-4 w-4" />;
  }

  if (status === "Withheld") {
    return (
      <ShieldCheck className="h-4 w-4" />
    );
  }

  if (
    status === "Not given" ||
    status === "Unavailable"
  ) {
    return (
      <CircleSlash2 className="h-4 w-4" />
    );
  }

  return <Pill className="h-4 w-4" />;
}

function getStatusClasses(
  status: MedicationStatus
) {
  if (status === "Administered") {
    return "border-emerald-300 bg-emerald-50 text-emerald-800";
  }

  if (status === "Refused") {
    return "border-rose-300 bg-rose-50 text-rose-800";
  }

  if (
    status === "Not given" ||
    status === "Unavailable"
  ) {
    return "border-amber-300 bg-amber-50 text-amber-800";
  }

  if (status === "Withheld") {
    return "border-violet-300 bg-violet-50 text-violet-800";
  }

  return "border-slate-200 bg-white text-slate-600";
}

export default function MedicationAdministrationForm({
  serviceUserId,
  onSaved,
  onCreateTimelineEntry,
}: Props) {
  const [medications, setMedications] = useState<
    Medication[]
  >([]);

  const [selectedRound, setSelectedRound] =
    useState("");

  const [outcomes, setOutcomes] = useState<
    Record<string, MedicationOutcome>
  >({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const roundOptions = useMemo(() => {
    return Array.from(
      new Set(
        medications
          .map((medication) => medication.round)
          .filter(Boolean)
      )
    ).sort();
  }, [medications]);

  const selectedMedications = useMemo(() => {
    return medications.filter(
      (medication) =>
        medication.round === selectedRound
    );
  }, [medications, selectedRound]);

  const isPrnRound =
    selectedMedications.length > 0 &&
    selectedMedications.every(
      (medication) => medication.is_prn
    );

  const selectedRecords = useMemo(() => {
    return selectedMedications.filter(
      (medication) =>
        outcomes[medication.id]?.selected
    );
  }, [selectedMedications, outcomes]);

  const completedCount = useMemo(() => {
    return selectedRecords.filter(
      (medication) =>
        Boolean(outcomes[medication.id]?.status)
    ).length;
  }, [selectedRecords, outcomes]);

  const roundComplete =
    selectedRecords.length > 0 &&
    selectedRecords.every((medication) => {
      const outcome = outcomes[medication.id];

      if (!outcome?.status) {
        return false;
      }

      if (
        outcome.status !== "Administered" &&
        !outcome.reason
      ) {
        return false;
      }

      return true;
    });

  useEffect(() => {
    async function loadMedications() {
      if (!serviceUserId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from("medication_profiles")
        .select(
          `
            id,
            service_user_id,
            medication_name,
            dose,
            route,
            round,
            instructions,
            is_prn,
            active,
            locked
          `
        )
        .eq("service_user_id", serviceUserId)
        .eq("active", true)
        .order("round", {
          ascending: true,
        })
        .order("medication_name", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Medication load error:",
          error
        );

        setErrorMessage(error.message);
        setMedications([]);
        setLoading(false);
        return;
      }

      setMedications(
        (data ?? []) as Medication[]
      );

      setLoading(false);
    }

    void loadMedications();
  }, [serviceUserId]);

  useEffect(() => {
    const initialOutcomes: Record<
      string,
      MedicationOutcome
    > = {};

    selectedMedications.forEach(
      (medication) => {
        initialOutcomes[medication.id] = {
          selected: !isPrnRound,
          status: "",
          reason: "",
        };
      }
    );

    setOutcomes(initialOutcomes);
  }, [
    selectedRound,
    selectedMedications,
    isPrnRound,
  ]);

  function updateOutcome(
    medicationId: string,
    field: keyof MedicationOutcome,
    value: string | boolean
  ) {
    setOutcomes((current) => ({
      ...current,
      [medicationId]: {
        ...current[medicationId],
        [field]: value,
      },
    }));
  }

  function selectStatus(
    medicationId: string,
    status: MedicationStatus
  ) {
    setOutcomes((current) => ({
      ...current,
      [medicationId]: {
        ...current[medicationId],
        status,
        reason:
          status === "Administered"
            ? ""
            : current[medicationId]?.reason ?? "",
      },
    }));
  }

  async function handleSave() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert(
        "You must be signed in to record medication."
      );
      return;
    }

    if (!selectedRound) {
      alert("Please select a medication round.");
      return;
    }

    if (selectedRecords.length === 0) {
      alert(
        "Please select at least one medication."
      );
      return;
    }

    if (!roundComplete) {
      alert(
        "Please record an outcome for every selected medication. A reason is required when medication was not administered."
      );
      return;
    }

    const now = new Date();

    const recordsToSave = selectedRecords.map(
      (medication) => {
        const outcome =
          outcomes[medication.id];

        return {
          service_user_id: serviceUserId,

          medication_profile_id:
            medication.id,

          administered_by: user.id,

          round: medication.round,

          status: outcome.status,

          reason:
            outcome.status === "Administered"
              ? null
              : outcome.reason || null,

          administered_at:
            now.toISOString(),

          administration_date:
            now.toISOString().split("T")[0],
        };
      }
    );

    setSaving(true);

    try {
      const { error } = await supabase
        .from("medication_administrations")
        .insert(recordsToSave);

      if (error) {
        throw new Error(error.message);
      }

      const summaryLines =
        selectedRecords.map(
          (medication) => {
            const outcome =
              outcomes[medication.id];

            if (
              outcome.status ===
              "Administered"
            ) {
              return `${medication.medication_name} ${medication.dose} — administered.`;
            }

            return `${
              medication.medication_name
            } ${medication.dose} — ${outcome.status.toLowerCase()}${
              outcome.reason
                ? `: ${outcome.reason}`
                : ""
            }.`;
          }
        );

      const summary = [
        `${selectedRound} medication round completed.`,
        "",
        ...summaryLines,
        "",
        "Recorded via eMAR.",
      ].join("\n");

      if (onCreateTimelineEntry) {
        await onCreateTimelineEntry(summary);
      }

      setSelectedRound("");
      setOutcomes({});

      onSaved?.();
    } catch (error) {
      console.error(
        "Medication administration save error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "The medication round could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!serviceUserId) {
    return (
      <CastodiaCard>
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">
              Service user unavailable
            </p>

            <p className="mt-1">
              A service user must be selected
              before medication can be recorded.
            </p>
          </div>
        </div>
      </CastodiaCard>
    );
  }

  return (
    <CastodiaCard className="overflow-hidden p-0">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Pill className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Medication administration
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Select the medication round and
              record the outcome for each
              medication.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center px-6 py-10">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-700" />
            Loading medications...
          </div>
        </div>
      ) : errorMessage ? (
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Medication could not be loaded
              </p>

              <p className="mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      ) : medications.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Pill className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-950">
            No active medications
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            No active medications are currently
            available for administration.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5 sm:px-6">
          <div className="max-w-md">
            <label
              htmlFor="medication-round"
              className="text-sm font-semibold text-slate-700"
            >
              Medication round
            </label>

            <div className="relative mt-2">
              <select
                id="medication-round"
                value={selectedRound}
                onChange={(event) =>
                  setSelectedRound(
                    event.target.value
                  )
                }
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">
                  Select a round
                </option>

                {roundOptions.map((round) => (
                  <option
                    key={round}
                    value={round}
                  >
                    {round}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {selectedRound ? (
            <>
              <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-cyan-700" />

                    <p className="text-sm font-semibold text-cyan-950">
                      {selectedRound} round
                    </p>
                  </div>

                  <p className="mt-1 text-sm text-cyan-800">
                    {isPrnRound
                      ? "Select the PRN medication being administered."
                      : "Record an outcome for every medication in this round."}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl border border-cyan-200 bg-white px-3 py-2 text-sm font-semibold text-cyan-900">
                  {completedCount} of{" "}
                  {selectedRecords.length} completed
                </div>
              </div>

              <div className="space-y-4">
                {selectedMedications.map(
                  (medication) => {
                    const outcome =
                      outcomes[medication.id];

                    if (
                      isPrnRound &&
                      !outcome?.selected
                    ) {
                      return (
                        <button
                          key={medication.id}
                          type="button"
                          onClick={() =>
                            updateOutcome(
                              medication.id,
                              "selected",
                              true
                            )
                          }
                          className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                            <PlusIcon />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-slate-950">
                                {
                                  medication.medication_name
                                }
                              </p>

                              <CastodiaBadge variant="warning">
                                PRN
                              </CastodiaBadge>
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {medication.dose}
                            </p>
                          </div>

                          <span className="text-sm font-semibold text-cyan-700">
                            Select
                          </span>
                        </button>
                      );
                    }

                    return (
                      <div
                        key={medication.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                      >
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-semibold text-slate-950">
                                {
                                  medication.medication_name
                                }
                              </h3>

                              {medication.is_prn ? (
                                <CastodiaBadge variant="warning">
                                  PRN
                                </CastodiaBadge>
                              ) : null}

                              {medication.locked ? (
                                <CastodiaBadge variant="neutral">
                                  Locked
                                </CastodiaBadge>
                              ) : null}
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {medication.dose}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                              <span>
                                Route:{" "}
                                {medication.route ||
                                  "Not recorded"}
                              </span>

                              <span>
                                Round:{" "}
                                {medication.round}
                              </span>
                            </div>
                          </div>

                          {medication.is_prn ? (
                            <button
                              type="button"
                              onClick={() =>
                                updateOutcome(
                                  medication.id,
                                  "selected",
                                  false
                                )
                              }
                              className="text-sm font-semibold text-slate-500 transition hover:text-rose-700"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>

                        {medication.instructions ? (
                          <div className="border-b border-slate-100 bg-amber-50/70 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                              Instructions
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-900">
                              {
                                medication.instructions
                              }
                            </p>
                          </div>
                        ) : null}

                        <div className="space-y-4 px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Outcome
                            </p>

                            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                              {STATUSES.map(
                                (status) => {
                                  const active =
                                    outcome?.status ===
                                    status.value;

                                  return (
                                    <button
                                      key={
                                        status.value
                                      }
                                      type="button"
                                      onClick={() =>
                                        selectStatus(
                                          medication.id,
                                          status.value
                                        )
                                      }
                                      title={
                                        status.description
                                      }
                                      className={[
                                        "flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                                        active
                                          ? getStatusClasses(
                                              status.value
                                            )
                                          : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50",
                                      ].join(
                                        " "
                                      )}
                                    >
                                      <StatusIcon
                                        status={
                                          status.value
                                        }
                                      />

                                      {
                                        status.label
                                      }
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          </div>

                          {outcome?.status &&
                          outcome.status !==
                            "Administered" ? (
                            <div className="max-w-lg">
                              <label
                                htmlFor={`reason-${medication.id}`}
                                className="text-sm font-semibold text-slate-700"
                              >
                                Reason
                              </label>

                              <select
                                id={`reason-${medication.id}`}
                                value={
                                  outcome.reason
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateOutcome(
                                    medication.id,
                                    "reason",
                                    event.target
                                      .value
                                  )
                                }
                                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                              >
                                <option value="">
                                  Select a reason
                                </option>

                                {REASONS.map(
                                  (reason) => (
                                    <option
                                      key={
                                        reason
                                      }
                                      value={
                                        reason
                                      }
                                    >
                                      {reason}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          ) : null}

                          {outcome?.status ? (
                            <div
                              className={[
                                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
                                getStatusClasses(
                                  outcome.status
                                ),
                              ].join(" ")}
                            >
                              <StatusIcon
                                status={
                                  outcome.status
                                }
                              />

                              {outcome.status ===
                              "Administered"
                                ? "Ready to record as administered."
                                : outcome.reason
                                  ? `${outcome.status}: ${outcome.reason}`
                                  : "Select a reason to complete this medication."}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="sticky bottom-0 -mx-5 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {roundComplete
                        ? "Round ready to save"
                        : "Complete all medication outcomes"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedRecords.length} medication
                      {selectedRecords.length === 1
                        ? ""
                        : "s"}{" "}
                      selected.
                    </p>
                  </div>

                  <CastodiaButton
                    onClick={() =>
                      void handleSave()
                    }
                    disabled={
                      saving || !roundComplete
                    }
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}

                    {saving
                      ? "Saving round..."
                      : "Save medication round"}
                  </CastodiaButton>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <Clock3 className="mx-auto h-6 w-6 text-slate-400" />

              <p className="mt-3 text-sm font-semibold text-slate-900">
                Select a medication round
              </p>

              <p className="mt-1 text-sm text-slate-500">
                The medications scheduled for that
                round will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </CastodiaCard>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
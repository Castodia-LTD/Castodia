"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  CirclePause,
  CirclePlay,
  CircleStop,
  Clock3,
  Loader2,
  Pill,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
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
  CastodiaPageShell,
} from "@/components/castodia";

import { supabase } from "@/lib/supabase";

import type {
  MedicationDosePlan,
  MedicationDosePlanStage,
  MedicationProfile,
  ServiceUser,
} from "../types";

type DosePlanWithStages = MedicationDosePlan & {
  stages: MedicationDosePlanStage[];
};

function getServiceUserName(
  serviceUser: ServiceUser
) {
  return (
    `${serviceUser.first_name ?? ""} ${
      serviceUser.surname ?? ""
    }`.trim() || "Unnamed service user"
  );
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(
    `${value}T00:00:00`
  ).toLocaleDateString("en-GB");
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getStatusVariant(
  status: MedicationDosePlan["status"]
): "success" | "warning" | "neutral" {
  if (status === "active") {
    return "success";
  }

  if (
    status === "paused" ||
    status === "draft"
  ) {
    return "warning";
  }

  return "neutral";
}

function StageCard({
  stage,
  isLast,
}: {
  stage: MedicationDosePlanStage;
  isLast: boolean;
}) {
  const isCurrent =
    stage.status === "current";

  const isComplete =
    stage.status === "completed";

  return (
    <div>
      <div
        className={[
          "rounded-2xl border px-5 py-4",
          isCurrent
            ? "border-cyan-300 bg-cyan-50 shadow-sm"
            : isComplete
              ? "border-emerald-200 bg-emerald-50/70"
              : "border-slate-200 bg-white",
        ].join(" ")}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Stage {stage.stage_number}
              </p>

              {isCurrent ? (
                <CastodiaBadge variant="success">
                  Current
                </CastodiaBadge>
              ) : null}

              {isComplete ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Completed
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-xl font-semibold text-slate-950">
              {stage.dose}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span>
                Frequency:{" "}
                <strong className="font-medium text-slate-800">
                  {stage.frequency ||
                    "Not recorded"}
                </strong>
              </span>

              <span>
                Route:{" "}
                <strong className="font-medium text-slate-800">
                  {stage.route ||
                    "Not recorded"}
                </strong>
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-500 sm:text-right">
            <p>
              {formatDate(stage.start_date)}
              {stage.end_date
                ? ` – ${formatDate(stage.end_date)}`
                : ""}
            </p>

            {stage.review_date ? (
              <p className="mt-1">
                Review:{" "}
                {formatDate(stage.review_date)}
              </p>
            ) : null}
          </div>
        </div>

        {stage.instructions ? (
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm leading-6 text-slate-600">
            {stage.instructions}
          </div>
        ) : null}
      </div>

      {!isLast ? (
        <div className="flex justify-center py-2">
          <ArrowDown className="h-5 w-5 text-slate-300" />
        </div>
      ) : null}
    </div>
  );
}

export default function DoseManagementPage() {
  const searchParams = useSearchParams();

  const requestedServiceUserId =
    searchParams.get("serviceUserId") ?? "";

  const [serviceUsers, setServiceUsers] = useState<
    ServiceUser[]
  >([]);

  const [
    selectedServiceUserId,
    setSelectedServiceUserId,
  ] = useState(requestedServiceUserId);

  const [medications, setMedications] = useState<
    MedicationProfile[]
  >([]);

  const [
    selectedMedicationId,
    setSelectedMedicationId,
  ] = useState("");

  const [plans, setPlans] = useState<
    DosePlanWithStages[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [loadingPlans, setLoadingPlans] =
    useState(false);

  const [updatingPlan, setUpdatingPlan] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const selectedServiceUser = useMemo(() => {
    return (
      serviceUsers.find(
        (serviceUser) =>
          serviceUser.id ===
          selectedServiceUserId
      ) ?? null
    );
  }, [
    serviceUsers,
    selectedServiceUserId,
  ]);

  const selectedMedication = useMemo(() => {
    return (
      medications.find(
        (medication) =>
          medication.id ===
          selectedMedicationId
      ) ?? null
    );
  }, [
    medications,
    selectedMedicationId,
  ]);

  const selectedPlan = useMemo(() => {
    return (
      plans.find(
        (plan) =>
          plan.medication_id ===
          selectedMedicationId &&
          !["completed", "cancelled"].includes(
            plan.status
          )
      ) ??
      plans.find(
        (plan) =>
          plan.medication_id ===
          selectedMedicationId
      ) ??
      null
    );
  }, [plans, selectedMedicationId]);

  const currentStage = useMemo(() => {
    if (!selectedPlan) {
      return null;
    }

    return (
      selectedPlan.stages.find(
        (stage) =>
          stage.status === "current"
      ) ??
      selectedPlan.stages.find(
        (stage) =>
          stage.stage_number ===
          selectedPlan.current_stage_number
      ) ??
      null
    );
  }, [selectedPlan]);

  const nextStage = useMemo(() => {
    if (!selectedPlan || !currentStage) {
      return null;
    }

    return (
      selectedPlan.stages.find(
        (stage) =>
          stage.stage_number ===
          currentStage.stage_number + 1
      ) ?? null
    );
  }, [selectedPlan, currentStage]);

  const loadInitialData =
    useCallback(async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(
            userError.message
          );
        }

        if (!user) {
          throw new Error(
            "You must be signed in."
          );
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("organisation_id")
          .eq("id", user.id)
          .single();

        if (
          profileError ||
          !profile?.organisation_id
        ) {
          throw new Error(
            profileError?.message ||
              "Your organisation could not be identified."
          );
        }

        const { data, error } =
          await supabase
            .from("service_users")
            .select(
              "id, first_name, surname"
            )
            .eq(
              "organisation_id",
              profile.organisation_id
            )
            .eq("is_active", true)
            .order("first_name")
            .order("surname");

        if (error) {
          throw new Error(error.message);
        }

        const loadedUsers =
          (data ?? []) as ServiceUser[];

        setServiceUsers(loadedUsers);

        setSelectedServiceUserId(
          (currentId) => {
            const preferredId =
              requestedServiceUserId ||
              currentId;

            if (
              loadedUsers.some(
                (item) =>
                  item.id === preferredId
              )
            ) {
              return preferredId;
            }

            return loadedUsers[0]?.id ?? "";
          }
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load dose management."
        );
      } finally {
        setLoading(false);
      }
    }, [requestedServiceUserId]);

  const loadDoseManagement =
    useCallback(
      async (serviceUserId: string) => {
        if (!serviceUserId) {
          setMedications([]);
          setPlans([]);
          setSelectedMedicationId("");
          return;
        }

        setLoadingPlans(true);
        setErrorMessage(null);

        try {
          const [
            medicationResult,
            planResult,
          ] = await Promise.all([
            supabase
              .from("medication_profiles")
              .select("*")
              .eq(
                "service_user_id",
                serviceUserId
              )
              .eq("active", true)
              .order("medication_name"),

            supabase
              .from("medication_dose_plans")
              .select(
                `
                  *,
                  stages:medication_dose_plan_stages(*)
                `
              )
              .eq(
                "service_user_id",
                serviceUserId
              )
              .order("created_at", {
                ascending: false,
              }),
          ]);

          if (medicationResult.error) {
            throw new Error(
              medicationResult.error.message
            );
          }

          if (planResult.error) {
            throw new Error(
              planResult.error.message
            );
          }

          const loadedMedications =
            (medicationResult.data ??
              []) as MedicationProfile[];

          const loadedPlans = (
            planResult.data ?? []
          ).map((plan) => ({
            ...(plan as MedicationDosePlan),
            stages: (
              (plan as {
                stages?: MedicationDosePlanStage[];
              }).stages ?? []
            ).sort(
              (a, b) =>
                a.stage_number -
                b.stage_number
            ),
          }));

          setMedications(
            loadedMedications
          );

          setPlans(loadedPlans);

          setSelectedMedicationId(
            (currentId) => {
              if (
                loadedMedications.some(
                  (item) =>
                    item.id === currentId
                )
              ) {
                return currentId;
              }

              return (
                loadedPlans.find(
                  (plan) =>
                    plan.status === "active"
                )?.medication_id ??
                loadedMedications[0]?.id ??
                ""
              );
            }
          );
        } catch (error) {
          setMedications([]);
          setPlans([]);
          setSelectedMedicationId("");

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load dose plans."
          );
        } finally {
          setLoadingPlans(false);
        }
      },
      []
    );

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    void loadDoseManagement(
      selectedServiceUserId
    );
  }, [
    selectedServiceUserId,
    loadDoseManagement,
  ]);

  async function updatePlanStatus(
    status: MedicationDosePlan["status"]
  ) {
    if (!selectedPlan) {
      return;
    }

    setUpdatingPlan(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("medication_dose_plans")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", selectedPlan.id);

      if (error) {
        throw new Error(error.message);
      }

      await supabase
        .from(
          "medication_dose_plan_history"
        )
        .insert({
          plan_id: selectedPlan.id,
          action: `plan_${status}`,
          detail: `Dose plan status changed to ${status}.`,
          created_by: user?.id ?? null,
        });

      await loadDoseManagement(
        selectedServiceUserId
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "The plan could not be updated."
      );
    } finally {
      setUpdatingPlan(false);
    }
  }

  if (loading) {
    return (
      <CastodiaPageShell
        title="Dose Management"
        description="Loading planned medication dose changes."
        maxWidth="wide"
      >
        <CastodiaCard>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading dose management...
          </div>
        </CastodiaCard>
      </CastodiaPageShell>
    );
  }

  const serviceUserName =
    selectedServiceUser
      ? getServiceUserName(
          selectedServiceUser
        )
      : "";

  return (
    <CastodiaPageShell
      title="Dose Management"
      description={
        serviceUserName
          ? `Planned medication dose changes for ${serviceUserName}.`
          : "Planned medication dose changes."
      }
      maxWidth="wide"
      actions={
        <CastodiaButton
          disabled={
            !selectedMedicationId ||
            Boolean(selectedPlan)
          }
          onClick={() => {
            alert(
              "The create dose plan form is the next component to add."
            );
          }}
        >
          <Plus className="h-4 w-4" />
          Create dose plan
        </CastodiaButton>
      }
    >
      <div className="space-y-6">
        <Link
          href={
            selectedServiceUserId
              ? `/manager/emar/${selectedServiceUserId}`
              : "/manager/emar"
          }
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to eMAR
        </Link>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="dose-service-user"
              className="text-sm font-semibold text-slate-700"
            >
              Service user
            </label>

            <select
              id="dose-service-user"
              value={selectedServiceUserId}
              onChange={(event) =>
                setSelectedServiceUserId(
                  event.target.value
                )
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              {serviceUsers.map(
                (serviceUser) => (
                  <option
                    key={serviceUser.id}
                    value={serviceUser.id}
                  >
                    {getServiceUserName(
                      serviceUser
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="dose-medication"
              className="text-sm font-semibold text-slate-700"
            >
              Medication
            </label>

            <select
              id="dose-medication"
              value={selectedMedicationId}
              onChange={(event) =>
                setSelectedMedicationId(
                  event.target.value
                )
              }
              disabled={
                medications.length === 0
              }
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
            >
              {medications.length === 0 ? (
                <option value="">
                  No active medications
                </option>
              ) : (
                medications.map(
                  (medication) => (
                    <option
                      key={medication.id}
                      value={medication.id}
                    >
                      {
                        medication.medication_name
                      }{" "}
                      · {medication.dose}
                    </option>
                  )
                )
              )}
            </select>
          </div>
        </div>

        {errorMessage ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            {errorMessage}
          </div>
        ) : null}

        {loadingPlans ? (
          <CastodiaCard>
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading dose plans...
            </div>
          </CastodiaCard>
        ) : !selectedMedication ? (
          <CastodiaCard>
            <div className="px-6 py-12 text-center">
              <Pill className="mx-auto h-7 w-7 text-slate-400" />

              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                No medication selected
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Add an active medication before
                creating a dose plan.
              </p>
            </div>
          </CastodiaCard>
        ) : !selectedPlan ? (
          <CastodiaCard>
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <SlidersHorizontal className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                No dose plan recorded
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {selectedMedication.medication_name} does
                not currently have a planned dose change.
              </p>

              <CastodiaButton
                className="mt-6"
                onClick={() => {
                  alert(
                    "The create dose plan form is the next component to add."
                  );
                }}
              >
                <Plus className="h-4 w-4" />
                Create dose plan
              </CastodiaButton>
            </div>
          </CastodiaCard>
        ) : (
          <>
            <CastodiaCard>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {
                        selectedMedication.medication_name
                      }
                    </h2>

                    <CastodiaBadge
                      variant={getStatusVariant(
                        selectedPlan.status
                      )}
                    >
                      {formatLabel(
                        selectedPlan.status
                      )}
                    </CastodiaBadge>
                  </div>

                  <p className="mt-2 text-sm text-slate-500">
                    {formatLabel(
                      selectedPlan.plan_type
                    )}
                  </p>

                  {selectedPlan.reason ? (
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600">
                      {selectedPlan.reason}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedPlan.status ===
                  "draft" ? (
                    <CastodiaButton
                      onClick={() =>
                        void updatePlanStatus(
                          "active"
                        )
                      }
                      disabled={updatingPlan}
                    >
                      <CirclePlay className="h-4 w-4" />
                      Start plan
                    </CastodiaButton>
                  ) : null}

                  {selectedPlan.status ===
                  "active" ? (
                    <CastodiaButton
                      variant="secondary"
                      onClick={() =>
                        void updatePlanStatus(
                          "paused"
                        )
                      }
                      disabled={updatingPlan}
                    >
                      <CirclePause className="h-4 w-4" />
                      Pause
                    </CastodiaButton>
                  ) : null}

                  {selectedPlan.status ===
                  "paused" ? (
                    <CastodiaButton
                      onClick={() =>
                        void updatePlanStatus(
                          "active"
                        )
                      }
                      disabled={updatingPlan}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Resume
                    </CastodiaButton>
                  ) : null}

                  {![
                    "completed",
                    "cancelled",
                  ].includes(
                    selectedPlan.status
                  ) ? (
                    <>
                      <CastodiaButton
                        variant="secondary"
                        onClick={() =>
                          void updatePlanStatus(
                            "completed"
                          )
                        }
                        disabled={updatingPlan}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Complete
                      </CastodiaButton>

                      <button
                        type="button"
                        onClick={() =>
                          void updatePlanStatus(
                            "cancelled"
                          )
                        }
                        disabled={updatingPlan}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        <CircleStop className="h-4 w-4" />
                        Cancel
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </CastodiaCard>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <CastodiaCard>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current dose
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {currentStage?.dose ??
                    selectedMedication.dose}
                </p>
              </CastodiaCard>

              <CastodiaCard>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Current stage
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {currentStage
                    ? `${currentStage.stage_number} of ${selectedPlan.stages.length}`
                    : "Not started"}
                </p>
              </CastodiaCard>

              <CastodiaCard>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Next dose
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {nextStage?.dose ??
                    "No further stage"}
                </p>
              </CastodiaCard>

              <CastodiaCard>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Review date
                </p>

                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {formatDate(
                    currentStage?.review_date ??
                      selectedPlan.review_date
                  )}
                </p>
              </CastodiaCard>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
              <CastodiaCard>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">
                      Dose plan
                    </h2>

                    <p className="text-sm text-slate-500">
                      Planned dose stages in order.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  {selectedPlan.stages.length ===
                  0 ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
                      <AlertTriangle className="mx-auto h-6 w-6 text-amber-700" />

                      <p className="mt-3 text-sm font-semibold text-amber-900">
                        No stages recorded
                      </p>
                    </div>
                  ) : (
                    selectedPlan.stages.map(
                      (stage, index) => (
                        <StageCard
                          key={stage.id}
                          stage={stage}
                          isLast={
                            index ===
                            selectedPlan.stages
                              .length -
                              1
                          }
                        />
                      )
                    )
                  )}
                </div>
              </CastodiaCard>

              <div className="space-y-4">
                <CastodiaCard>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        Authorisation
                      </h2>

                      <p className="text-sm text-slate-500">
                        Recorded clinical authority.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Authorised by
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {selectedPlan.authorised_by ||
                          "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Source
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {selectedPlan.authorisation_source ||
                          "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Authorised
                      </p>

                      <p className="mt-1 font-medium text-slate-900">
                        {selectedPlan.authorised_at
                          ? new Date(
                              selectedPlan.authorised_at
                            ).toLocaleString(
                              "en-GB"
                            )
                          : "Not recorded"}
                      </p>
                    </div>
                  </div>
                </CastodiaCard>

                <CastodiaCard>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                      <CalendarClock className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        Clinical instructions
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-slate-600">
                    {selectedPlan.clinical_instructions ||
                      "No additional clinical instructions recorded."}
                  </p>
                </CastodiaCard>
              </div>
            </div>
          </>
        )}
      </div>
    </CastodiaPageShell>
  );
}
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CircleSlash2,
  Clock3,
  FileText,
  Filter,
  Loader2,
  LockKeyhole,
  MoreHorizontal,
  Pill,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import AddMedicationForm from "../components/AddMedicationForm";

import type {
  MedicationProfile as Medication,
  ServiceUser,
} from "../types";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
} from "@/components/castodia";

type MedicationFilter =
  | "all"
  | "regular"
  | "prn"
  | "titration"
  | "locked"
  | "inactive";

function getServiceUserName(
  serviceUser: ServiceUser
) {
  return (
    `${serviceUser.first_name ?? ""} ${
      serviceUser.surname ?? ""
    }`.trim() || "Unnamed service user"
  );
}

function formatDate(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Date(value).toLocaleDateString("en-GB");
}

function formatMedicationType(
  medication: Medication
) {
  return medication.is_prn ? "PRN" : "Regular";
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition",
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-cyan-50 hover:text-slate-950",
      ].join(" ")}
    >
      {label}

      {count !== undefined ? (
        <span
          className={[
            "rounded-full px-1.5 py-0.5 text-[11px]",
            active
              ? "bg-white/15 text-white"
              : "bg-slate-100 text-slate-500",
          ].join(" ")}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function RegisterStat({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span
        className={[
          "text-sm font-bold",
          warning
            ? "text-amber-700"
            : "text-slate-950",
        ].join(" ")}
      >
        {value}
      </span>

      <span className="text-sm text-slate-500">
        {label}
      </span>
    </div>
  );
}

function MedicationStatusBadges({
  medication,
}: {
  medication: Medication;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <CastodiaBadge
        variant={
          medication.active
            ? "success"
            : "neutral"
        }
      >
        {medication.active
          ? "Active"
          : "Inactive"}
      </CastodiaBadge>

      <CastodiaBadge
        variant={
          medication.is_prn
            ? "warning"
            : "neutral"
        }
      >
        {formatMedicationType(medication)}
      </CastodiaBadge>

      {medication.titration_plan_available ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Titration
        </span>
      ) : null}

      {medication.locked ? (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
          <LockKeyhole className="h-3.5 w-3.5" />
          Locked
        </span>
      ) : null}
    </div>
  );
}

function MedicationRegisterRow({
  medication,
  selected,
  onSelect,
}: {
  medication: Medication;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full text-left transition",
        selected
          ? "bg-cyan-50/70"
          : "bg-white hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex gap-4 px-5 py-5">
        <div
          className={[
            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            medication.active
              ? "bg-cyan-50 text-cyan-700"
              : "bg-slate-100 text-slate-400",
          ].join(" ")}
        >
          <Pill className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-950">
                {medication.medication_name}
              </h3>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {medication.dose}
              </p>
            </div>

            <MedicationStatusBadges
              medication={medication}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span>
              Route:{" "}
              <strong className="font-medium text-slate-700">
                {medication.route ||
                  "Not recorded"}
              </strong>
            </span>

            <span>
              Schedule:{" "}
              <strong className="font-medium text-slate-700">
                {medication.round ||
                  "Not recorded"}
              </strong>
            </span>
          </div>

          {medication.instructions ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
              {medication.instructions}
            </p>
          ) : null}
        </div>

        <ChevronRight
          className={[
            "mt-3 h-5 w-5 shrink-0",
            selected
              ? "text-cyan-700"
              : "text-slate-300",
          ].join(" ")}
        />
      </div>
    </button>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function MedicationProfilePage() {
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
    Medication[]
  >([]);

  const [
    selectedMedicationId,
    setSelectedMedicationId,
  ] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filter, setFilter] =
    useState<MedicationFilter>("all");

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [
    loadingMedications,
    setLoadingMedications,
  ] = useState(false);

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [panelOpen, setPanelOpen] =
    useState(false);

  const [medicationName, setMedicationName] =
    useState("");

  const [strength, setStrength] =
    useState("");

  const [dose, setDose] = useState("");
  const [route, setRoute] = useState("");

  const [medicationType, setMedicationType] =
    useState("Regular");

  const [rounds, setRounds] = useState<
    string[]
  >([]);

  const [instructions, setInstructions] =
    useState("");

  const [
    prnReasonRequired,
    setPrnReasonRequired,
  ] = useState(true);

  const [
    prnIncidentRecommended,
    setPrnIncidentRecommended,
  ] = useState(false);

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

  const selectedServiceUserName =
    selectedServiceUser
      ? getServiceUserName(
          selectedServiceUser
        )
      : "";

  const selectedMedication = useMemo(() => {
    return (
      medications.find(
        (medication) =>
          medication.id ===
          selectedMedicationId
      ) ?? null
    );
  }, [medications, selectedMedicationId]);

  const summary = useMemo(() => {
    const active = medications.filter(
      (medication) => medication.active
    );

    return {
      total: medications.length,

      active: active.length,

      regular: active.filter(
        (medication) => !medication.is_prn
      ).length,

      prn: active.filter(
        (medication) => medication.is_prn
      ).length,

      titration: active.filter(
        (medication) =>
          medication.titration_plan_available
      ).length,

      locked: active.filter(
        (medication) => medication.locked
      ).length,

      inactive: medications.filter(
        (medication) => !medication.active
      ).length,
    };
  }, [medications]);

  const visibleMedications = useMemo(() => {
    const normalisedSearch =
      searchTerm.trim().toLowerCase();

    return medications.filter(
      (medication) => {
        const matchesSearch =
          !normalisedSearch ||
          medication.medication_name
            .toLowerCase()
            .includes(normalisedSearch) ||
          medication.dose
            .toLowerCase()
            .includes(normalisedSearch) ||
          medication.route
            ?.toLowerCase()
            .includes(normalisedSearch) ||
          medication.instructions
            ?.toLowerCase()
            .includes(normalisedSearch);

        if (!matchesSearch) {
          return false;
        }

        if (filter === "all") {
          return medication.active;
        }

        if (filter === "regular") {
          return (
            medication.active &&
            !medication.is_prn
          );
        }

        if (filter === "prn") {
          return (
            medication.active &&
            medication.is_prn
          );
        }

        if (filter === "titration") {
          return (
            medication.active &&
            medication.titration_plan_available
          );
        }

        if (filter === "locked") {
          return (
            medication.active &&
            medication.locked
          );
        }

        if (filter === "inactive") {
          return !medication.active;
        }

        return true;
      }
    );
  }, [medications, searchTerm, filter]);

  const loadServiceUsers =
    useCallback(async () => {
      setLoadingUsers(true);
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
            "Your login session could not be confirmed."
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

        const { data, error } =
          await supabase
            .from("service_users")
            .select(
              "id, first_name, surname"
            )
            .eq(
              "organisation_id",
              currentProfile.organisation_id
            )
            .eq("is_active", true)
            .order("first_name")
            .order("surname");

        if (error) {
          throw new Error(error.message);
        }

        const loadedServiceUsers =
          (data ?? []) as ServiceUser[];

        setServiceUsers(
          loadedServiceUsers
        );

        setSelectedServiceUserId(
          (currentId) => {
            const preferredId =
              requestedServiceUserId ||
              currentId;

            const preferredExists =
              loadedServiceUsers.some(
                (serviceUser) =>
                  serviceUser.id ===
                  preferredId
              );

            if (preferredExists) {
              return preferredId;
            }

            return (
              loadedServiceUsers[0]?.id ??
              ""
            );
          }
        );
      } catch (error) {
        setServiceUsers([]);
        setSelectedServiceUserId("");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load service users."
        );
      } finally {
        setLoadingUsers(false);
      }
    }, [requestedServiceUserId]);

  const loadMedications = useCallback(
    async (serviceUserId: string) => {
      if (!serviceUserId) {
        setMedications([]);
        setSelectedMedicationId("");
        return;
      }

      setLoadingMedications(true);
      setErrorMessage(null);

      try {
        const { data, error } =
          await supabase
            .from("medication_profiles")
            .select("*")
            .eq(
              "service_user_id",
              serviceUserId
            )
            .order("active", {
              ascending: false,
            })
            .order("medication_name");

        if (error) {
          throw new Error(error.message);
        }

        const loadedMedications =
          (data ?? []) as Medication[];

        setMedications(
          loadedMedications
        );

        setSelectedMedicationId(
          (currentId) => {
            const currentExists =
              loadedMedications.some(
                (medication) =>
                  medication.id === currentId
              );

            if (currentExists) {
              return currentId;
            }

            return (
              loadedMedications.find(
                (medication) =>
                  medication.active
              )?.id ??
              loadedMedications[0]?.id ??
              ""
            );
          }
        );
      } catch (error) {
        setMedications([]);
        setSelectedMedicationId("");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load medications."
        );
      } finally {
        setLoadingMedications(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadServiceUsers();
  }, [loadServiceUsers]);

  useEffect(() => {
    void loadMedications(
      selectedServiceUserId
    );

    setSearchTerm("");
    setFilter("all");
  }, [
    selectedServiceUserId,
    loadMedications,
  ]);

  function resetForm() {
    setMedicationName("");
    setStrength("");
    setDose("");
    setRoute("");
    setMedicationType("Regular");
    setRounds([]);
    setInstructions("");
    setPrnReasonRequired(true);
    setPrnIncidentRecommended(false);
  }

  function toggleRound(round: string) {
    setRounds((current) =>
      current.includes(round)
        ? current.filter(
            (item) => item !== round
          )
        : [...current, round]
    );
  }

  function closeAddMedication() {
    resetForm();
    setPanelOpen(false);
  }

  async function saveMedication() {
    if (!selectedServiceUserId) {
      alert(
        "Please select a service user."
      );

      return;
    }

    if (
      !medicationName.trim() ||
      !strength.trim() ||
      !dose.trim() ||
      !route.trim()
    ) {
      alert(
        "Please complete medication name, strength, dose and route."
      );

      return;
    }

    if (
      medicationType === "Regular" &&
      rounds.length === 0
    ) {
      alert(
        "Please select at least one medication round."
      );

      return;
    }

    setSaving(true);

    try {
      const isPrn =
        medicationType === "PRN";

      const { error } = await supabase
        .from("medication_profiles")
        .insert({
          service_user_id:
            selectedServiceUserId,

          medication_name:
            medicationName.trim(),

          dose: `${strength.trim()} - ${dose.trim()}`,

          route: route.trim(),

          round: isPrn
            ? "PRN"
            : rounds.join(", "),

          instructions:
            instructions.trim() || null,

          is_prn: isPrn,

          titration_plan_available:
            false,

          titration_trigger_missed_rounds:
            null,

          titration_instructions: null,

          manager_unlock_required:
            false,

          locked: false,
          active: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      closeAddMedication();

      await loadMedications(
        selectedServiceUserId
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Medication could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleMedicationActive(
    medication: Medication
  ) {
    const action = medication.active
      ? "discontinue"
      : "reactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${medication.medication_name}?`
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("medication_profiles")
      .update({
        active: !medication.active,
      })
      .eq("id", medication.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadMedications(
      selectedServiceUserId
    );
  }

  if (loadingUsers) {
    return (
      <CastodiaPageShell
        title="Medication Profile"
        description="Loading medication record."
        maxWidth="wide"
      >
        <CastodiaCard>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading medication profile...
          </div>
        </CastodiaCard>
      </CastodiaPageShell>
    );
  }

  return (
    <CastodiaPageShell
      title="Medication Profile"
      description={
        selectedServiceUserName
          ? `Complete medication record for ${selectedServiceUserName}.`
          : "Complete medication record for the selected service user."
      }
      maxWidth="wide"
      actions={
        <CastodiaButton
          onClick={() =>
            setPanelOpen(true)
          }
          disabled={!selectedServiceUserId}
        >
          <Plus className="h-4 w-4" />
          Add medication
        </CastodiaButton>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href={
                selectedServiceUserId
                  ? `/care/manager/emar/${selectedServiceUserId}`
                  : "/care/manager/emar"
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to eMAR
            </Link>

            <div className="w-full max-w-md">
              <label
                htmlFor="medication-profile-service-user"
                className="text-sm font-semibold text-slate-700"
              >
                Service user
              </label>

              <select
                id="medication-profile-service-user"
                value={
                  selectedServiceUserId
                }
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
          </div>
        </div>

        <CastodiaCard className="overflow-hidden p-0">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Medication register
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Active and previous
                medications recorded for{" "}
                {selectedServiceUserName ||
                  "this service user"}.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <RegisterStat
                label="active"
                value={summary.active}
              />

              <RegisterStat
                label="regular"
                value={summary.regular}
              />

              <RegisterStat
                label="PRN"
                value={summary.prn}
              />

              <RegisterStat
                label="inactive"
                value={summary.inactive}
              />

              <RegisterStat
                label="locked"
                value={summary.locked}
                warning={
                  summary.locked > 0
                }
              />
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full max-w-lg">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Search medications, dose, route or instructions"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                />

                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
                <FilterButton
                  active={filter === "all"}
                  label="Active"
                  count={summary.active}
                  onClick={() =>
                    setFilter("all")
                  }
                />

                <FilterButton
                  active={
                    filter === "regular"
                  }
                  label="Regular"
                  count={summary.regular}
                  onClick={() =>
                    setFilter("regular")
                  }
                />

                <FilterButton
                  active={filter === "prn"}
                  label="PRN"
                  count={summary.prn}
                  onClick={() =>
                    setFilter("prn")
                  }
                />

                <FilterButton
                  active={
                    filter === "titration"
                  }
                  label="Titration"
                  count={summary.titration}
                  onClick={() =>
                    setFilter("titration")
                  }
                />

                <FilterButton
                  active={
                    filter === "locked"
                  }
                  label="Locked"
                  count={summary.locked}
                  onClick={() =>
                    setFilter("locked")
                  }
                />

                <FilterButton
                  active={
                    filter === "inactive"
                  }
                  label="Inactive"
                  count={summary.inactive}
                  onClick={() =>
                    setFilter("inactive")
                  }
                />
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="flex items-start gap-3 border-b border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              {errorMessage}
            </div>
          ) : null}

          <div className="grid min-h-[560px] xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.7fr)]">
            <div className="min-w-0 border-r border-slate-200">
              {loadingMedications ? (
                <div className="flex min-h-[360px] items-center justify-center px-6 py-12">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading medications...
                  </div>
                </div>
              ) : visibleMedications.length ===
                0 ? (
                <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    {filter === "inactive" ? (
                      <CircleSlash2 className="h-6 w-6" />
                    ) : (
                      <Pill className="h-6 w-6" />
                    )}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-950">
                    No medications found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    {searchTerm
                      ? "No medications match your search."
                      : filter === "inactive"
                        ? "There are no inactive medications recorded."
                        : "No medications have been recorded in this category."}
                  </p>

                  {filter === "all" &&
                  !searchTerm ? (
                    <CastodiaButton
                      className="mt-6"
                      onClick={() =>
                        setPanelOpen(true)
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add first medication
                    </CastodiaButton>
                  ) : null}
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {visibleMedications.map(
                    (medication) => (
                      <MedicationRegisterRow
                        key={medication.id}
                        medication={
                          medication
                        }
                        selected={
                          medication.id ===
                          selectedMedicationId
                        }
                        onSelect={() =>
                          setSelectedMedicationId(
                            medication.id
                          )
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>

            <aside className="bg-slate-50/60">
              {selectedMedication ? (
                <div className="sticky top-6">
                  <div className="border-b border-slate-200 bg-white px-5 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                          Selected medication
                        </p>

                        <h2 className="mt-2 text-xl font-semibold text-slate-950">
                          {
                            selectedMedication.medication_name
                          }
                        </h2>

                        <p className="mt-1 text-sm font-medium text-slate-600">
                          {
                            selectedMedication.dose
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                        aria-label="Medication actions"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <MedicationStatusBadges
                        medication={
                          selectedMedication
                        }
                      />
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">
                        Prescription details
                      </h3>

                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4">
                        <DetailItem
                          label="Dose"
                          value={
                            selectedMedication.dose
                          }
                        />

                        <DetailItem
                          label="Route"
                          value={
                            selectedMedication.route ||
                            "Not recorded"
                          }
                        />

                        <DetailItem
                          label="Schedule"
                          value={
                            selectedMedication.round ||
                            "Not recorded"
                          }
                        />

                        <DetailItem
                          label="Type"
                          value={formatMedicationType(
                            selectedMedication
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-slate-950">
                        Clinical instructions
                      </h3>

                      <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <p className="text-sm leading-6 text-slate-600">
                          {selectedMedication.instructions ||
                            "No additional instructions recorded."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <h3 className="text-sm font-semibold text-slate-950">
                        Controls
                      </h3>

                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-4 w-4 text-violet-600" />

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Titration
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {selectedMedication.titration_plan_available
                              ? "Plan recorded"
                              : "No plan"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                          <div className="flex items-center gap-2">
                            <LockKeyhole className="h-4 w-4 text-amber-600" />

                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                              Access
                            </p>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-slate-900">
                            {selectedMedication.locked
                              ? "Locked"
                              : selectedMedication.manager_unlock_required
                                ? "Manager unlock"
                                : "Standard"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4">
                      <DetailItem
                        label="Added"
                        value={formatDate(
                          selectedMedication.created_at
                        )}
                      />
                    </div>

                    <div className="mt-5 grid gap-3">
                      <CastodiaButton
                        variant="secondary"
                        onClick={() =>
                          alert(
                            "Medication editing will be added next."
                          )
                        }
                      >
                        <FileText className="h-4 w-4" />
                        Edit medication
                      </CastodiaButton>

                      <button
                        type="button"
                        onClick={() =>
                          void toggleMedicationActive(
                            selectedMedication
                          )
                        }
                        className={[
                          "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition",
                          selectedMedication.active
                            ? "border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                            : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50",
                        ].join(" ")}
                      >
                        {selectedMedication.active ? (
                          <>
                            <CircleSlash2 className="h-4 w-4" />
                            Discontinue medication
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Reactivate medication
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Pill className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-950">
                    Select a medication
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Choose a medication from the
                    register to view its full
                    details and controls.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </CastodiaCard>

        {summary.locked > 0 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />

            <p>
              {summary.locked} medication
              {summary.locked === 1
                ? " is"
                : "s are"}{" "}
              currently locked and may require
              manager intervention before changes
              can be made.
            </p>
          </div>
        ) : null}
      </div>

      {panelOpen ? (
        <AddMedicationForm
          selectedServiceUserName={
            selectedServiceUserName
          }
          medicationName={medicationName}
          strength={strength}
          dose={dose}
          route={route}
          medicationType={medicationType}
          rounds={rounds}
          instructions={instructions}
          prnReasonRequired={
            prnReasonRequired
          }
          prnIncidentRecommended={
            prnIncidentRecommended
          }
          setMedicationName={
            setMedicationName
          }
          setStrength={setStrength}
          setDose={setDose}
          setRoute={setRoute}
          setMedicationType={
            setMedicationType
          }
          setInstructions={
            setInstructions
          }
          setPrnReasonRequired={
            setPrnReasonRequired
          }
          setPrnIncidentRecommended={
            setPrnIncidentRecommended
          }
          toggleRound={toggleRound}
          onSave={saveMedication}
          onClose={closeAddMedication}
        />
      ) : null}

      {saving ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-700" />
            Saving medication...
          </div>
        </div>
      ) : null}
    </CastodiaPageShell>
  );
}
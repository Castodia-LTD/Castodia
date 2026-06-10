"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";

type MedicationProfile = {
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

type MedicationOutcome = {
  selected: boolean;
  status: string;
  reason: string;
};

type Props = {
  serviceUserId: string | null;
  onSaved?: () => void;
  onCreateTimelineEntry?: (summary: string) => Promise<void>;
};

const STATUSES = ["Administered", "Refused", "Not given", "Unavailable", "Withheld"];

const REASONS = [
  "Service user declined",
  "Medication unavailable",
  "Health concern",
  "As directed by clinician",
  "Asleep",
  "Away from service",
  "Other",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function MedicationAdministrationForm({
  serviceUserId,
  onSaved,
  onCreateTimelineEntry,
}: Props) {
  const [profiles, setProfiles] = useState<MedicationProfile[]>([]);
  const [selectedRound, setSelectedRound] = useState("");
  const [outcomes, setOutcomes] = useState<Record<string, MedicationOutcome>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  if (!serviceUserId) {
    return (
      <CastodiaCard>
        <p className="text-sm text-red-600">Missing service user ID.</p>
      </CastodiaCard>
    );
  }

  const roundOptions = useMemo(() => {
    return Array.from(new Set(profiles.map((profile) => profile.round))).sort();
  }, [profiles]);

  const selectedMedications = useMemo(() => {
    return profiles.filter((profile) => profile.round === selectedRound);
  }, [profiles, selectedRound]);

  const isPrnRound =
    selectedMedications.length > 0 &&
    selectedMedications.every((med) => med.is_prn);

  useEffect(() => {
    async function loadMedicationProfiles() {
      setLoading(true);

      const { data, error } = await supabase
        .from("medication_profiles")
        .select(
          "id, service_user_id, medication_name, dose, route, round, instructions, is_prn, active, locked"
        )
        .eq("service_user_id", serviceUserId)
        .eq("active", true)
        .order("round", { ascending: true });

      if (error) {
        console.error("Medication profile load error:", error);
        alert(error.message);
        setLoading(false);
        return;
      }

      setProfiles((data ?? []) as MedicationProfile[]);
      setLoading(false);
    }

    loadMedicationProfiles();
  }, [serviceUserId]);

  useEffect(() => {
    const initial: Record<string, MedicationOutcome> = {};

    selectedMedications.forEach((med) => {
      initial[med.id] = {
        selected: !isPrnRound,
        status: "",
        reason: "",
      };
    });

    setOutcomes(initial);
  }, [selectedRound, selectedMedications, isPrnRound]);

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

  async function handleSave() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be signed in to record medication.");
      return;
    }

    const selectedRecords = selectedMedications.filter(
      (med) => outcomes[med.id]?.selected
    );

    if (selectedRecords.length === 0) {
      alert("Please select at least one medication.");
      return;
    }

    const incomplete = selectedRecords.some((med) => {
      const outcome = outcomes[med.id];

      if (!outcome?.status) return true;

      if (outcome.status !== "Administered" && !outcome.reason) {
        return true;
      }

      return false;
    });

    if (incomplete) {
      alert(
        "Please complete status for all medication. A reason is only required if it was not administered."
      );
      return;
    }

    const now = new Date();

    const recordsToSave = selectedRecords.map((med) => ({
      service_user_id: serviceUserId,
      medication_profile_id: med.id,
      administered_by: user.id,
      round: med.round,
      status: outcomes[med.id].status,
      reason:
        outcomes[med.id].status === "Administered"
          ? null
          : outcomes[med.id].reason || null,
      administered_at: now.toISOString(),
      administration_date: now.toISOString().split("T")[0],
    }));

    setSaving(true);

    const { error } = await supabase
      .from("medication_administrations")
      .insert(recordsToSave);

    if (error) {
      console.error("Medication administration save error:", error);
      alert(error.message);
      setSaving(false);
      return;
    }

    const summaryLines = selectedRecords.map((med) => {
      const status = outcomes[med.id].status;
      const reason = outcomes[med.id].reason;

      if (status === "Administered") {
        return `${med.medication_name} ${med.dose} — administered.`;
      }

      return `${med.medication_name} ${med.dose} — ${status.toLowerCase()}${
        reason ? `: ${reason}` : ""
      }.`;
    });

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

    setSaving(false);
    onSaved?.();
  }

  return (
    <CastodiaCard>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-950">
          Medication Administration
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select a round and record each medication outcome.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading medication...</p>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Select round
            </label>

            <select
              value={selectedRound}
              onChange={(event) => setSelectedRound(event.target.value)}
              className={inputClass}
            >
              <option value="">Choose a round</option>

              {roundOptions.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>

          {selectedRound && (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3">
                <p className="text-sm font-semibold text-teal-800">
                  {selectedRound} round
                </p>

                <p className="mt-1 text-xs text-teal-700">
                  {isPrnRound
                    ? "Select only the PRN medication being given."
                    : "Complete an outcome for every medication in this round."}
                </p>
              </div>

              {selectedMedications.map((med) => {
                const outcome = outcomes[med.id];

                if (isPrnRound && !outcome?.selected) {
                  return (
                    <label
                      key={med.id}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={outcome?.selected ?? false}
                        onChange={(event) =>
                          updateOutcome(med.id, "selected", event.target.checked)
                        }
                        className="h-4 w-4"
                      />

                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {med.medication_name}
                        </p>
                        <p className="text-xs text-slate-500">{med.dose}</p>
                      </div>
                    </label>
                  );
                }

                return (
                  <div
                    key={med.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    {isPrnRound && (
                      <label className="mb-4 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <input
                          type="checkbox"
                          checked={outcome?.selected ?? false}
                          onChange={(event) =>
                            updateOutcome(
                              med.id,
                              "selected",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4"
                        />

                        <span className="text-xs font-medium text-slate-600">
                          Giving this PRN
                        </span>
                      </label>
                    )}

                    <div>
                      <p className="text-base font-semibold text-slate-950">
                        {med.medication_name}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">{med.dose}</p>

                      {med.route && (
                        <p className="mt-1 text-xs text-slate-500">
                          Route: {med.route}
                        </p>
                      )}

                      {med.instructions && (
                        <p className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                          {med.instructions}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700">
                          Status
                        </label>

                        <select
                          value={outcome?.status ?? ""}
                          onChange={(event) =>
                            updateOutcome(med.id, "status", event.target.value)
                          }
                          className={inputClass}
                        >
                          <option value="">Select status</option>

                          {STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {outcome?.status && outcome.status !== "Administered" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Reason
                          </label>

                          <select
                            value={outcome?.reason ?? ""}
                            onChange={(event) =>
                              updateOutcome(med.id, "reason", event.target.value)
                            }
                            className={inputClass}
                          >
                            <option value="">Select reason</option>

                            {REASONS.map((reason) => (
                              <option key={reason} value={reason}>
                                {reason}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <CastodiaButton
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save medication round"}
              </CastodiaButton>
            </div>
          )}
        </>
      )}
    </CastodiaCard>
  );
}
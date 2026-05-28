"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
};

type MedicationProfile = {
  id: string;
  service_user_id: string;
  medication_name: string;
  dose: string;
  route: string | null;
  round: string;
  instructions: string | null;
  is_prn: boolean;
  titration_plan_available: boolean;
  titration_trigger_missed_rounds: number | null;
  titration_instructions: string | null;
  manager_unlock_required: boolean;
  locked: boolean;
  active: boolean;
};

export default function AdminMedicationsPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUser, setSelectedServiceUser] = useState("");
  const [medications, setMedications] = useState<MedicationProfile[]>([]);

  const [medicationName, setMedicationName] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState("");
  const [round, setRound] = useState("Morning");
  const [instructions, setInstructions] = useState("");
  const [isPrn, setIsPrn] = useState(false);
  const [titrationAvailable, setTitrationAvailable] = useState(false);
  const [titrationTrigger, setTitrationTrigger] = useState("");
  const [titrationInstructions, setTitrationInstructions] = useState("");
  const [managerUnlockRequired, setManagerUnlockRequired] = useState(false);

  async function loadServiceUsers() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organisation_id) {
    alert("Organisation not found.");
    return;
  }

  const { data, error } = await supabase
    .from("service_users")
    .select("id, full_name")
    .eq("organisation_id", profile.organisation_id)
    .eq("is_active", true)
    .order("full_name");

  if (error) {
    alert(error.message);
    return;
  }

  setServiceUsers(data || []);
}

  async function loadMedications(serviceUserId: string) {
    if (!serviceUserId) {
      setMedications([]);
      return;
    }

    const { data, error } = await supabase
      .from("medication_profiles")
      .select("*")
      .eq("service_user_id", serviceUserId)
      .eq("active", true)
      .order("round");

    if (error) {
      alert(error.message);
      return;
    }

    setMedications(data || []);
  }

  async function createMedication() {
    if (!selectedServiceUser) {
      alert("Please select a service user.");
      return;
    }

    if (!medicationName.trim() || !dose.trim() || !round.trim()) {
      alert("Medication name, dose and round are required.");
      return;
    }

    const { error } = await supabase.from("medication_profiles").insert({
      service_user_id: selectedServiceUser,
      medication_name: medicationName.trim(),
      dose: dose.trim(),
      route: route.trim() || null,
      round,
      instructions: instructions.trim() || null,
      is_prn: isPrn,
      titration_plan_available: titrationAvailable,
      titration_trigger_missed_rounds: titrationTrigger
        ? Number(titrationTrigger)
        : null,
      titration_instructions: titrationInstructions.trim() || null,
      manager_unlock_required: managerUnlockRequired,
      locked: false,
      active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setMedicationName("");
    setDose("");
    setRoute("");
    setRound("Morning");
    setInstructions("");
    setIsPrn(false);
    setTitrationAvailable(false);
    setTitrationTrigger("");
    setTitrationInstructions("");
    setManagerUnlockRequired(false);

    await loadMedications(selectedServiceUser);
  }

  async function deactivateMedication(id: string) {
    const confirmed = confirm(
      "Deactivate this medication profile? Existing records will remain stored."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("medication_profiles")
      .update({ active: false })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadMedications(selectedServiceUser);
  }

  async function toggleLock(medication: MedicationProfile) {
    const { error } = await supabase
      .from("medication_profiles")
      .update({ locked: !medication.locked })
      .eq("id", medication.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadMedications(selectedServiceUser);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  useEffect(() => {
    loadMedications(selectedServiceUser);
  }, [selectedServiceUser]);

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-screen-lg px-4 py-6">
        <Link href="/admin" className="text-slate-400">
          ← Admin Portal
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Medication Profiles</h1>

        <p className="mt-2 text-slate-400">
          Create and manage medication profiles, rounds, PRN settings and
          titration rules.
        </p>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
          <label className="text-sm font-semibold text-slate-300">
            Select service user
          </label>

          <select
            value={selectedServiceUser}
            onChange={(e) => setSelectedServiceUser(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          >
            <option value="" className="bg-slate-900 text-white">
              Select service user
            </option>

            {serviceUsers.map((su) => (
              <option
                key={su.id}
                value={su.id}
                className="bg-slate-900 text-white"
              >
                {su.full_name}
              </option>
            ))}
          </select>
        </div>

        {selectedServiceUser && (
          <>
            <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
              <h2 className="text-xl font-bold">Add Medication</h2>

              <input
                value={medicationName}
                onChange={(e) => setMedicationName(e.target.value)}
                placeholder="Medication name"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <input
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Dose, e.g. 500mg"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <input
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="Route, e.g. Oral"
                className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              >
                <option className="bg-slate-900 text-white">Morning</option>
                <option className="bg-slate-900 text-white">Lunch</option>
                <option className="bg-slate-900 text-white">Tea</option>
                <option className="bg-slate-900 text-white">Night</option>
                <option className="bg-slate-900 text-white">PRN</option>
              </select>

              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Medication instructions"
                className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
              />

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
                <input
                  type="checkbox"
                  checked={isPrn}
                  onChange={(e) => setIsPrn(e.target.checked)}
                />
                <span>PRN medication</span>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
                <input
                  type="checkbox"
                  checked={titrationAvailable}
                  onChange={(e) => setTitrationAvailable(e.target.checked)}
                />
                <span>Titration plan available</span>
              </label>

              {titrationAvailable && (
                <div className="space-y-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <input
                    value={titrationTrigger}
                    onChange={(e) => setTitrationTrigger(e.target.value)}
                    type="number"
                    placeholder="Trigger after missed rounds, e.g. 3"
                    className="w-full rounded-2xl border border-amber-500/20 bg-slate-900 p-4 text-white outline-none"
                  />

                  <textarea
                    value={titrationInstructions}
                    onChange={(e) =>
                      setTitrationInstructions(e.target.value)
                    }
                    placeholder="Titration instructions"
                    className="min-h-24 w-full rounded-2xl border border-amber-500/20 bg-slate-900 p-4 text-white outline-none"
                  />

                  <label className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-slate-900 p-4">
                    <input
                      type="checkbox"
                      checked={managerUnlockRequired}
                      onChange={(e) =>
                        setManagerUnlockRequired(e.target.checked)
                      }
                    />
                    <span>Manager unlock required after trigger</span>
                  </label>
                </div>
              )}

              <button
                onClick={createMedication}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
              >
                Add Medication
              </button>
            </div>

            <div className="mt-8 space-y-4">
              {medications.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400 backdrop-blur">
                  No active medications for this service user.
                </div>
              )}

              {medications.map((med) => (
                <div
                  key={med.id}
                  className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-cyan-300">{med.round}</p>

                      <h2 className="mt-1 text-xl font-bold">
                        {med.medication_name}
                      </h2>

                      <p className="mt-1 text-slate-300">{med.dose}</p>

                      {med.route && (
                        <p className="mt-1 text-sm text-slate-400">
                          Route: {med.route}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {med.is_prn && (
                        <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
                          PRN
                        </span>
                      )}

                      {med.locked && (
                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                          Locked
                        </span>
                      )}

                      {med.titration_plan_available && (
                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
                          Titration
                        </span>
                      )}
                    </div>
                  </div>

                  {med.instructions && (
                    <p className="mt-4 whitespace-pre-line text-slate-300">
                      {med.instructions}
                    </p>
                  )}

                  {med.titration_plan_available && (
                    <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <p className="font-semibold text-amber-300">
                        Titration Plan
                      </p>

                      {med.titration_trigger_missed_rounds && (
                        <p className="mt-2 text-sm text-slate-300">
                          Trigger after {med.titration_trigger_missed_rounds}{" "}
                          missed rounds.
                        </p>
                      )}

                      {med.titration_instructions && (
                        <p className="mt-2 whitespace-pre-line text-sm text-slate-200">
                          {med.titration_instructions}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
                    <button
                      onClick={() => toggleLock(med)}
                      className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold"
                    >
                      {med.locked ? "Unlock" : "Lock"}
                    </button>

                    <button
                      onClick={() => deactivateMedication(med.id)}
                      className="rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-300"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
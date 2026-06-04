"use client";

import { useEffect, useState } from "react";
import ManagerShell from "@/components/layouts/ManagerShell";
import MedicationProfileCard from "@/components/admin/medication-profiles/MedicationProfileCard";
import { supabase } from "@/lib/supabase";
import type {
  MedicationProfile,
  ServiceUser,
} from "@/lib/admin/medication-profiles/types";

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

    const { data: profile } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organisation_id) {
      alert("Organisation not found.");
      return;
    }

    const { data, error } = await supabase
      .from("service_users")
      .select("id, full_name")
      .eq("organisation_id", profile.organisation_id)
      .eq("is_active", true)
      .order("full_name");

    if (error) return alert(error.message);

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

    if (error) return alert(error.message);

    setMedications(data || []);
  }

  async function createMedication() {
    if (!selectedServiceUser) return alert("Please select a service user.");

    if (!medicationName.trim() || !dose.trim() || !round.trim()) {
      return alert("Medication name, dose and round are required.");
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

    if (error) return alert(error.message);

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

    if (error) return alert(error.message);

    await loadMedications(selectedServiceUser);
  }

  async function toggleLock(medication: MedicationProfile) {
    const { error } = await supabase
      .from("medication_profiles")
      .update({ locked: !medication.locked })
      .eq("id", medication.id);

    if (error) return alert(error.message);

    await loadMedications(selectedServiceUser);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  useEffect(() => {
    loadMedications(selectedServiceUser);
  }, [selectedServiceUser]);

  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto w-full max-w-screen-lg">
          <h1 className="text-3xl font-bold">Medication Profiles</h1>

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

              {serviceUsers.map((serviceUser) => (
                <option
                  key={serviceUser.id}
                  value={serviceUser.id}
                  className="bg-slate-900 text-white"
                >
                  {serviceUser.full_name}
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
                  {["Morning", "Lunch", "Tea", "Night", "PRN"].map((item) => (
                    <option key={item} value={item} className="bg-slate-900 text-white">
                      {item}
                    </option>
                  ))}
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

                {medications.map((medication) => (
                  <MedicationProfileCard
                    key={medication.id}
                    medication={medication}
                    onToggleLock={toggleLock}
                    onDeactivate={deactivateMedication}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </ManagerShell>
  );
}
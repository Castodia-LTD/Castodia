"use client";

import { useEffect, useState } from "react";
import ManagerShell from "@/components/layouts/ManagerShell";
import { supabase } from "@/lib/supabase";
import { Pill, Plus, Power, RotateCcw, X } from "lucide-react";

type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
};

type MedicationProfile = {
  id: string;
  service_user_id: string;
  medication_name: string;
  strength: string | null;
  dose: string;
  route: string;
  medication_type: string;
  rounds: string[] | null;
  instructions: string | null;
  prn_reason_required: boolean;
  prn_incident_recommended: boolean;
  active: boolean;
};

const roundOptions = ["Morning", "Lunch", "Tea", "Night"];

export default function ManagerEmarPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUserId, setSelectedServiceUserId] = useState("");
  const [medications, setMedications] = useState<MedicationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);

  const [medicationName, setMedicationName] = useState("");
  const [strength, setStrength] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState("Oral");
  const [medicationType, setMedicationType] = useState("Regular");
  const [rounds, setRounds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [prnReasonRequired, setPrnReasonRequired] = useState(true);
  const [prnIncidentRecommended, setPrnIncidentRecommended] = useState(false);

  const selectedServiceUser = serviceUsers.find(
    (user) => user.id === selectedServiceUserId
  );

  const selectedServiceUserName = selectedServiceUser
    ? `${selectedServiceUser.first_name ?? ""} ${
        selectedServiceUser.surname ?? ""
      }`.trim()
    : "";

  function toggleRound(round: string) {
    setRounds((current) =>
      current.includes(round)
        ? current.filter((item) => item !== round)
        : [...current, round]
    );
  }

  function resetForm() {
    setMedicationName("");
    setStrength("");
    setDose("");
    setRoute("Oral");
    setMedicationType("Regular");
    setRounds([]);
    setInstructions("");
    setPrnReasonRequired(true);
    setPrnIncidentRecommended(false);
  }

  async function loadServiceUsers() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organisation_id) {
      alert("Organisation not found.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("service_users")
      .select("id, first_name, surname")
      .eq("organisation_id", profile.organisation_id)
      .order("first_name", { ascending: true });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setServiceUsers(data || []);
    setLoading(false);
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
      .order("medication_name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setMedications(data || []);
  }

  async function addMedication() {
    if (!selectedServiceUserId) return alert("Please select a service user.");
    if (!medicationName.trim()) return alert("Please enter medication name.");
    if (!dose.trim()) return alert("Please enter dose.");
    if (!route.trim()) return alert("Please enter route.");

    if (medicationType === "Regular" && rounds.length === 0) {
      return alert("Please select at least one round.");
    }

    const { error } = await supabase.from("medication_profiles").insert({
      service_user_id: selectedServiceUserId,
      medication_name: medicationName.trim(),
      strength: strength.trim() || null,
      dose: dose.trim(),
      route: route.trim(),
      medication_type: medicationType,
      rounds: medicationType === "Regular" ? rounds : [],
      instructions: instructions.trim() || null,
      prn_reason_required: medicationType === "PRN" ? prnReasonRequired : false,
      prn_incident_recommended:
        medicationType === "PRN" ? prnIncidentRecommended : false,
      active: true,
    });

    if (error) return alert(error.message);

    resetForm();
    setAddPanelOpen(false);
    await loadMedications(selectedServiceUserId);
  }

  async function toggleMedicationActive(medication: MedicationProfile) {
    const { error } = await supabase
      .from("medication_profiles")
      .update({ active: !medication.active })
      .eq("id", medication.id);

    if (error) return alert(error.message);

    await loadMedications(selectedServiceUserId);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  useEffect(() => {
    loadMedications(selectedServiceUserId);
    resetForm();
  }, [selectedServiceUserId]);

  return (
    <ManagerShell>
      <main className="min-h-screen p-6 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
                  <Pill size={24} />
                </div>

                <div>
                  <h1 className="text-3xl font-bold">eMAR</h1>
                  <p className="mt-1 text-slate-400">
                    Manage medication profiles for service users.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!selectedServiceUserId) {
                    alert("Please select a service user first.");
                    return;
                  }

                  setAddPanelOpen(true);
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-5 py-3 font-semibold"
              >
                <Plus size={20} />
                Add Medication
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Service user
              </label>

              <select
                value={selectedServiceUserId}
                onChange={(e) => setSelectedServiceUserId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-white outline-none"
              >
                <option value="">Choose a service user...</option>

                {serviceUsers.map((serviceUser) => (
                  <option key={serviceUser.id} value={serviceUser.id}>
                    {`${serviceUser.first_name ?? ""} ${
                      serviceUser.surname ?? ""
                    }`.trim()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && (
            <div className="mt-6 text-slate-400">Loading eMAR...</div>
          )}

          {!loading && !selectedServiceUserId && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-slate-400">
              Select a service user to view their medication profiles.
            </div>
          )}

          {!loading && selectedServiceUserId && (
            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedServiceUserName || "Medication Profiles"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Active and inactive medication profiles.
                  </p>
                </div>

                <div className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-semibold text-cyan-200">
                  {medications.length} recorded
                </div>
              </div>

              {medications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No medication profiles recorded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left">
                    <thead className="border-b border-white/10 bg-slate-950/60 text-sm text-slate-400">
                      <tr>
                        <th className="p-4">Medication</th>
                        <th className="p-4">Dose</th>
                        <th className="p-4">Route</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Rounds</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {medications.map((medication) => (
                        <tr
                          key={medication.id}
                          className="border-b border-white/10 last:border-b-0"
                        >
                          <td className="p-4">
                            <p className="font-semibold">
                              {medication.medication_name}{" "}
                              {medication.strength || ""}
                            </p>

                            {medication.instructions && (
                              <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                                {medication.instructions}
                              </p>
                            )}
                          </td>

                          <td className="p-4 text-slate-300">
                            {medication.dose}
                          </td>

                          <td className="p-4 text-slate-300">
                            {medication.route}
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                medication.medication_type === "PRN"
                                  ? "bg-amber-500/20 text-amber-200"
                                  : "bg-teal-500/20 text-teal-200"
                              }`}
                            >
                              {medication.medication_type}
                            </span>
                          </td>

                          <td className="p-4">
                            {medication.medication_type === "Regular" ? (
                              <div className="flex flex-wrap gap-1">
                                {(medication.rounds || []).map((round) => (
                                  <span
                                    key={round}
                                    className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300"
                                  >
                                    {round}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                As required
                              </span>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                medication.active
                                  ? "bg-emerald-500/20 text-emerald-200"
                                  : "bg-slate-500/20 text-slate-300"
                              }`}
                            >
                              {medication.active ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="p-4 text-right">
                            <button
                              onClick={() => toggleMedicationActive(medication)}
                              className="inline-flex rounded-xl bg-white/10 p-3 text-slate-300 hover:bg-white/20"
                            >
                              {medication.active ? (
                                <Power size={18} />
                              ) : (
                                <RotateCcw size={18} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {addPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
            <div className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Add Medication</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedServiceUserName}
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setAddPanelOpen(false);
                  }}
                  className="rounded-full bg-white/10 p-3 text-slate-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  value={medicationName}
                  onChange={(e) => setMedicationName(e.target.value)}
                  placeholder="Medication name"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 outline-none placeholder:text-slate-500"
                />

                <input
                  value={strength}
                  onChange={(e) => setStrength(e.target.value)}
                  placeholder="Strength e.g. 500mg"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 outline-none placeholder:text-slate-500"
                />

                <input
                  value={dose}
                  onChange={(e) => setDose(e.target.value)}
                  placeholder="Dose e.g. One tablet"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 outline-none placeholder:text-slate-500"
                />

                <input
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="Route e.g. Oral"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 outline-none placeholder:text-slate-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  {["Regular", "PRN"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMedicationType(type)}
                      className={`rounded-2xl p-3 text-sm font-semibold ${
                        medicationType === type
                          ? "bg-cyan-500 text-white"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {medicationType === "Regular" && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-300">
                      Rounds
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {roundOptions.map((round) => (
                        <button
                          key={round}
                          type="button"
                          onClick={() => toggleRound(round)}
                          className={`rounded-2xl p-3 text-sm font-semibold ${
                            rounds.includes(round)
                              ? "bg-teal-500 text-white"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {round}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {medicationType === "PRN" && (
                  <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                    <label className="flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={prnReasonRequired}
                        onChange={(e) =>
                          setPrnReasonRequired(e.target.checked)
                        }
                      />
                      Require reason when administered
                    </label>

                    <label className="flex items-center gap-3 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={prnIncidentRecommended}
                        onChange={(e) =>
                          setPrnIncidentRecommended(e.target.checked)
                        }
                      />
                      Recommend incident form when administered
                    </label>
                  </div>
                )}

                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instructions / notes"
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 p-4 outline-none placeholder:text-slate-500"
                />

                <button
                  onClick={addMedication}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-lg font-semibold"
                >
                  Save Medication
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </ManagerShell>
  );
}
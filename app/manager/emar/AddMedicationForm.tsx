"use client";

import { useEffect, useState } from "react";
import ManagerShell from "@/components/layouts/ManagerShell";
import { supabase } from "@/lib/supabase";
import { Pill, Plus, Power, RotateCcw } from "lucide-react";

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

export default function AdminEmarPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUserId, setSelectedServiceUserId] = useState("");
  const [medications, setMedications] = useState<MedicationProfile[]>([]);
  const [loading, setLoading] = useState(true);

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

  const selectedServiceUserName =
    selectedServiceUser
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile?.organisation_id) {
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
      .order("created_at", { ascending: false });

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

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Select service user
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

          {!loading && selectedServiceUserId && (
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-500/20 p-3 text-emerald-300">
                    <Plus size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">Add Medication</h2>
                    <p className="text-sm text-slate-400">
                      Create a medication profile for {selectedServiceUserName}.
                    </p>
                  </div>
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
                    <div className="space-y-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
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

              <div className="space-y-4">
                {medications.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-center text-slate-400">
                    No medication profiles recorded for {selectedServiceUserName}.
                  </div>
                )}

                {medications.map((medication) => (
                  <div
                    key={medication.id}
                    className={`rounded-3xl border p-5 shadow-xl backdrop-blur ${
                      medication.active
                        ? "border-white/10 bg-white/10"
                        : "border-slate-700/40 bg-slate-900/40 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          {medication.medication_name}{" "}
                          {medication.strength ? medication.strength : ""}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {medication.dose} • {medication.route} •{" "}
                          {medication.medication_type}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleMedicationActive(medication)}
                        className="rounded-xl bg-white/10 p-3 text-slate-300"
                      >
                        {medication.active ? (
                          <Power size={18} />
                        ) : (
                          <RotateCcw size={18} />
                        )}
                      </button>
                    </div>

                    {medication.medication_type === "Regular" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(medication.rounds || []).map((round) => (
                          <span
                            key={round}
                            className="rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-200"
                          >
                            {round}
                          </span>
                        ))}
                      </div>
                    )}

                    {medication.medication_type === "PRN" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {medication.prn_reason_required && (
                          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200">
                            Reason required
                          </span>
                        )}

                        {medication.prn_incident_recommended && (
                          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                            Incident recommended
                          </span>
                        )}
                      </div>
                    )}

                    {medication.instructions && (
                      <p className="mt-4 whitespace-pre-line rounded-2xl bg-black/20 p-4 text-sm text-slate-300">
                        {medication.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </ManagerShell>
  );
}
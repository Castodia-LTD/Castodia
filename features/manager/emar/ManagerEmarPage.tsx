"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AddMedicationForm from "./components/AddMedicationForm";
import MedicationProfilesTable from "./components/MedicationProfilesTable";
import type { MedicationProfile, ServiceUser } from "./types";

import {
  CastodiaPageShell,
  CastodiaCard,
  CastodiaButton,
  CastodiaSection,
} from "@/components/castodia";

export default function ManagerEmarPage() {
  const [serviceUsers, setServiceUsers] = useState<ServiceUser[]>([]);
  const [selectedServiceUserId, setSelectedServiceUserId] = useState("");
  const [medications, setMedications] = useState<MedicationProfile[]>([]);

  const [panelOpen, setPanelOpen] = useState(false);

  const [medicationName, setMedicationName] = useState("");
  const [strength, setStrength] = useState("");
  const [dose, setDose] = useState("");
  const [route, setRoute] = useState("");
  const [medicationType, setMedicationType] = useState("Regular");
  const [rounds, setRounds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [prnReasonRequired, setPrnReasonRequired] = useState(true);
  const [prnIncidentRecommended, setPrnIncidentRecommended] = useState(false);

  const selectedServiceUser = serviceUsers.find(
    (serviceUser) => serviceUser.id === selectedServiceUserId
  );

  const selectedServiceUserName = selectedServiceUser
    ? `${selectedServiceUser.first_name ?? ""} ${
        selectedServiceUser.surname ?? ""
      }`.trim()
    : "";

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
      .select("id, first_name, surname")
      .eq("organisation_id", profile.organisation_id)
      .eq("is_active", true)
      .order("first_name");

    if (error) {
      alert(error.message);
      return;
    }

    setServiceUsers(data || []);

    if (data?.length && !selectedServiceUserId) {
      setSelectedServiceUserId(data[0].id);
    }
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
      .order("active", { ascending: false })
      .order("medication_name");

    if (error) {
      alert(error.message);
      return;
    }

    setMedications(data || []);
  }

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
        ? current.filter((item) => item !== round)
        : [...current, round]
    );
  }

  async function saveMedication() {
    if (!selectedServiceUserId) {
      alert("Please select a service user.");
      return;
    }

    if (
      !medicationName.trim() ||
      !strength.trim() ||
      !dose.trim() ||
      !route.trim()
    ) {
      alert("Please complete medication name, strength, dose and route.");
      return;
    }

    if (medicationType === "Regular" && rounds.length === 0) {
      alert("Please select at least one medication round.");
      return;
    }

    const isPrn = medicationType === "PRN";

    const { error } = await supabase.from("medication_profiles").insert({
      service_user_id: selectedServiceUserId,
      medication_name: medicationName.trim(),
      dose: `${strength.trim()} - ${dose.trim()}`,
      route: route.trim(),
      round: isPrn ? "PRN" : rounds.join(", "),
      instructions: instructions.trim() || null,
      is_prn: isPrn,
      titration_plan_available: false,
      titration_trigger_missed_rounds: null,
      titration_instructions: null,
      manager_unlock_required: false,
      locked: false,
      active: true,
    });

    if (error) {
      alert(error.message);
      return;
    }

    resetForm();
    setPanelOpen(false);
    await loadMedications(selectedServiceUserId);
  }

  async function toggleMedicationActive(medication: MedicationProfile) {
    const { error } = await supabase
      .from("medication_profiles")
      .update({ active: !medication.active })
      .eq("id", medication.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadMedications(selectedServiceUserId);
  }

  useEffect(() => {
    loadServiceUsers();
  }, []);

  useEffect(() => {
    loadMedications(selectedServiceUserId);
  }, [selectedServiceUserId]);

  return (
    <CastodiaPageShell
      title="eMAR Management"
      description="Create and manage medication profiles for service users."
      maxWidth="wide"
      actions={
        <CastodiaButton
          onClick={() => setPanelOpen(true)}
          disabled={!selectedServiceUserId}
        >
          + Add Medication
        </CastodiaButton>
      }
    >
      <CastodiaSection title="Service User">
        <CastodiaCard>
          <label className="text-sm font-medium text-slate-700">
            Select service user
          </label>

          <select
            value={selectedServiceUserId}
            onChange={(event) => setSelectedServiceUserId(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Select service user</option>

            {serviceUsers.map((serviceUser) => {
              const name =
                `${serviceUser.first_name ?? ""} ${
                  serviceUser.surname ?? ""
                }`.trim() || "Unnamed service user";

              return (
                <option key={serviceUser.id} value={serviceUser.id}>
                  {name}
                </option>
              );
            })}
          </select>
        </CastodiaCard>
      </CastodiaSection>

      <CastodiaSection title="Medication Profiles">
        <MedicationProfilesTable
          medications={medications}
          selectedServiceUserName={selectedServiceUserName}
          onToggleActive={toggleMedicationActive}
        />
      </CastodiaSection>

      {panelOpen && (
        <AddMedicationForm
          selectedServiceUserName={selectedServiceUserName}
          medicationName={medicationName}
          strength={strength}
          dose={dose}
          route={route}
          medicationType={medicationType}
          rounds={rounds}
          instructions={instructions}
          prnReasonRequired={prnReasonRequired}
          prnIncidentRecommended={prnIncidentRecommended}
          setMedicationName={setMedicationName}
          setStrength={setStrength}
          setDose={setDose}
          setRoute={setRoute}
          setMedicationType={setMedicationType}
          setInstructions={setInstructions}
          setPrnReasonRequired={setPrnReasonRequired}
          setPrnIncidentRecommended={setPrnIncidentRecommended}
          toggleRound={toggleRound}
          onSave={saveMedication}
          onClose={() => {
            resetForm();
            setPanelOpen(false);
          }}
        />
      )}
    </CastodiaPageShell>
  );
}
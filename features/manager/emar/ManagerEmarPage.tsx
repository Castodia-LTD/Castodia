"use client";

import { useEffect, useState } from "react";
import {
  PageContainer,
  PageHeader,
  SectionCard,
} from "@/components/layouts";
import { supabase } from "@/lib/supabase";
import AddMedicationForm from "./components/AddMedicationForm";
import MedicationProfilesTable from "./components/MedicationProfilesTable";
import type { MedicationProfile, ServiceUser } from "./types";

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

    if (!medicationName.trim() || !dose.trim() || !route.trim()) {
      alert("Please complete medication name, dose and route.");
      return;
    }

    if (medicationType === "Regular" && rounds.length === 0) {
      alert("Please select at least one medication round.");
      return;
    }

    const { error } = await supabase.from("medication_profiles").insert({
      service_user_id: selectedServiceUserId,
      medication_name: medicationName.trim(),
      strength: strength.trim() || null,
      dose: dose.trim(),
      route: route.trim(),
      medication_type: medicationType,
      rounds: medicationType === "Regular" ? rounds : null,
      instructions: instructions.trim() || null,
      prn_reason_required:
        medicationType === "PRN" ? prnReasonRequired : false,
      prn_incident_recommended:
        medicationType === "PRN" ? prnIncidentRecommended : false,
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
    <PageContainer>
      <PageHeader
        title="eMAR Management"
        subtitle="Create and manage medication profiles for service users."
      >
        <button
          onClick={() => setPanelOpen(true)}
          disabled={!selectedServiceUserId}
          className="rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-900/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Medication
        </button>
      </PageHeader>

      <SectionCard>
        <label className="text-sm font-semibold text-slate-300">
          Select service user
        </label>

        <select
          value={selectedServiceUserId}
          onChange={(event) => setSelectedServiceUserId(event.target.value)}
          className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-white outline-none"
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
      </SectionCard>

      <MedicationProfilesTable
        medications={medications}
        selectedServiceUserName={selectedServiceUserName}
        onToggleActive={toggleMedicationActive}
      />

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
    </PageContainer>
  );
}
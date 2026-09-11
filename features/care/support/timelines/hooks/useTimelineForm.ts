"use client";

import { useState } from "react";

import { getTimeNow } from "@/lib/shared/date";

export function useTimelineForm() {
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);
  const [entryPanelOpen, setEntryPanelOpen] = useState(false);
  const [entryTime, setEntryTime] = useState(getTimeNow());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [activityTitle, setActivityTitle] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityPeople, setActivityPeople] = useState("");
  const [activityParticipation, setActivityParticipation] = useState("");
  const [activityOutcome, setActivityOutcome] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  const [communityDestination, setCommunityDestination] = useState("");
  const [communityTransport, setCommunityTransport] = useState("");
  const [communitySupportProvided, setCommunitySupportProvided] =
    useState("");
  const [communityAccessData, setCommunityAccessData] =
    useState<any>(null);
  const [socialInteractionData, setSocialInteractionData] = useState<any>(null);
  const [contactVisitData, setContactVisitData] = useState<any>(null);
  const [shoppingData, setShoppingData] = useState<any>(null);
  const [householdTasksData, setHouseholdTasksData] = useState<any>(null);

  const [nutritionHydrationData, setNutritionHydrationData] = useState<any>(null);
  const [environmentCheckData, setEnvironmentCheckData] = useState<any>(null);
  const [continenceCareData, setContinenceCareData] = useState<any>(null);

  const [toiletingOutcome, setToiletingOutcome] = useState("");
  const [assistanceRequired, setAssistanceRequired] = useState("");
  const [padChanged, setPadChanged] = useState("");
  const [bristolType, setBristolType] = useState("");
  const [toiletingNotes, setToiletingNotes] = useState("");
  const [continenceSettings, setContinenceSettings] = useState<any>(null);

  const [personalCareData, setPersonalCareData] = useState({
    careType: "",
    assistanceLevel: "",
    notes: "",
  });

  const [healthObservationData, setHealthObservationData] = useState<any>(null);
  const [symptomsData, setSymptomsData] = useState<any>(null);
  const [healthProfessionalData, setHealthProfessionalData] = useState<any>(null);

  const [medicationProfiles, setMedicationProfiles] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState("Morning");
  const [medicationStatuses, setMedicationStatuses] =
    useState<Record<string, string>>({});
  const [medicationReasons, setMedicationReasons] =
    useState<Record<string, string>>({});
  const [medicationErrorData, setMedicationErrorData] = useState<any>(null);

  const [sleepStatus, setSleepStatus] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");
  const [behaviourObserved, setBehaviourObserved] = useState<string[]>([]);
  const [behaviourFrequency, setBehaviourFrequency] = useState("");
  const [behaviourSupportProvided, setBehaviourSupportProvided] =
    useState<string[]>([]);
  const [behaviourOutcome, setBehaviourOutcome] = useState("");
  const [behaviourNotes, setBehaviourNotes] = useState("");

  const [behaviourIncidentTrigger, setBehaviourIncidentTrigger] = useState("");
  const [behaviourIncidentTypes, setBehaviourIncidentTypes] =
    useState<string[]>([]);
  const [behaviourIncidentDescription, setBehaviourIncidentDescription] =
    useState("");
  const [behaviourIncidentSupport, setBehaviourIncidentSupport] =
    useState<string[]>([]);
  const [linkedPrnAdministrationId, setLinkedPrnAdministrationId] = useState("");
  const [behaviourIncidentOutcomes, setBehaviourIncidentOutcomes] =
    useState<string[]>([]);
  const [behaviourIncidentNotes, setBehaviourIncidentNotes] = useState("");

  const [prnOptions] = useState<{ id: string; label: string }[]>([]);
  const [bodyMapMarkers, setBodyMapMarkers] = useState<any[]>([]);
  const [bodyMapNotes, setBodyMapNotes] = useState("");
  const [accidentFallInjuryData, setAccidentFallInjuryData] = useState<any>(null);
  const [nearMissData, setNearMissData] = useState<any>(null);

  function resetCoreState() {
    setContent("");
    setEntryType("");
    setSelectedCategoryId(null);
    setEntryTime(getTimeNow());
    setSaveError(null);
  }

  function resetActivityState() {
    setActivityTitle("");
    setActivityLocation("");
    setActivityPeople("");
    setActivityParticipation("");
    setActivityOutcome("");
    setActivityNotes("");
    setCommunityDestination("");
    setCommunityTransport("");
    setCommunitySupportProvided("");
    setCommunityAccessData(null);
    setSocialInteractionData(null);
    setContactVisitData(null);
    setShoppingData(null);
    setHouseholdTasksData(null);
  }

  function resetCareState() {
    setNutritionHydrationData(null);
    setEnvironmentCheckData(null);
    setContinenceCareData(null);
    setToiletingOutcome("");
    setAssistanceRequired("");
    setPadChanged("");
    setBristolType("");
    setToiletingNotes("");
    setPersonalCareData({ careType: "", assistanceLevel: "", notes: "" });
  }

  function resetHealthState() {
    setHealthObservationData(null);
    setSymptomsData(null);
    setHealthProfessionalData(null);
    setSelectedRound("Morning");
    setMedicationStatuses({});
    setMedicationReasons({});
    setMedicationErrorData(null);
  }

  function resetWellbeingState() {
    setSleepStatus("");
    setSleepNotes("");
    setBehaviourObserved([]);
    setBehaviourFrequency("");
    setBehaviourSupportProvided([]);
    setBehaviourOutcome("");
    setBehaviourNotes("");
  }

  function resetIncidentState() {
    setBehaviourIncidentTrigger("");
    setBehaviourIncidentTypes([]);
    setBehaviourIncidentDescription("");
    setBehaviourIncidentSupport([]);
    setLinkedPrnAdministrationId("");
    setBehaviourIncidentOutcomes([]);
    setBehaviourIncidentNotes("");
    setBodyMapMarkers([]);
    setBodyMapNotes("");
    setAccidentFallInjuryData(null);
    setNearMissData(null);
  }

  function resetEntryPanel() {
    resetCoreState();
    resetActivityState();
    resetCareState();
    resetHealthState();
    resetWellbeingState();
    resetIncidentState();
  }

  function openPanel() {
    resetEntryPanel();
    setSaving(false);
    setEntryPanelOpen(true);
  }

  function closePanel() {
    if (saving) return;
    setEntryPanelOpen(false);
  }

  function closeAndReset() {
    if (saving) return;
    setEntryPanelOpen(false);
    resetEntryPanel();
  }

  return {
    content, setContent,
    entryType, setEntryType,
    selectedCategoryId, setSelectedCategoryId,
    entryPanelOpen, setEntryPanelOpen,
    entryTime, setEntryTime,
    saving, setSaving,
    saveError, setSaveError,

    activityTitle, setActivityTitle,
    activityLocation, setActivityLocation,
    activityPeople, setActivityPeople,
    activityParticipation, setActivityParticipation,
    activityOutcome, setActivityOutcome,
    activityNotes, setActivityNotes,
    communityDestination, setCommunityDestination,
    communityTransport, setCommunityTransport,
    communitySupportProvided, setCommunitySupportProvided,
    communityAccessData, setCommunityAccessData,
    socialInteractionData, setSocialInteractionData,
    contactVisitData, setContactVisitData,
    shoppingData, setShoppingData,
    householdTasksData, setHouseholdTasksData,

    nutritionHydrationData, setNutritionHydrationData,
    environmentCheckData, setEnvironmentCheckData,
    continenceCareData, setContinenceCareData,
    toiletingOutcome, setToiletingOutcome,
    assistanceRequired, setAssistanceRequired,
    padChanged, setPadChanged,
    bristolType, setBristolType,
    toiletingNotes, setToiletingNotes,
    continenceSettings, setContinenceSettings,
    personalCareData, setPersonalCareData,

    healthObservationData, setHealthObservationData,
    symptomsData, setSymptomsData,
    healthProfessionalData, setHealthProfessionalData,
    medicationProfiles, setMedicationProfiles,
    selectedRound, setSelectedRound,
    medicationStatuses, setMedicationStatuses,
    medicationReasons, setMedicationReasons,
    medicationErrorData, setMedicationErrorData,

    sleepStatus, setSleepStatus,
    sleepNotes, setSleepNotes,
    behaviourObserved, setBehaviourObserved,
    behaviourFrequency, setBehaviourFrequency,
    behaviourSupportProvided, setBehaviourSupportProvided,
    behaviourOutcome, setBehaviourOutcome,
    behaviourNotes, setBehaviourNotes,

    behaviourIncidentTrigger, setBehaviourIncidentTrigger,
    behaviourIncidentTypes, setBehaviourIncidentTypes,
    behaviourIncidentDescription, setBehaviourIncidentDescription,
    behaviourIncidentSupport, setBehaviourIncidentSupport,
    linkedPrnAdministrationId, setLinkedPrnAdministrationId,
    behaviourIncidentOutcomes, setBehaviourIncidentOutcomes,
    behaviourIncidentNotes, setBehaviourIncidentNotes,
    prnOptions,
    bodyMapMarkers, setBodyMapMarkers,
    bodyMapNotes, setBodyMapNotes,
    accidentFallInjuryData, setAccidentFallInjuryData,
    nearMissData, setNearMissData,

    resetCoreState,
    resetActivityState,
    resetCareState,
    resetHealthState,
    resetWellbeingState,
    resetIncidentState,
    resetEntryPanel,
    openPanel,
    closePanel,
    closeAndReset,
  };
}

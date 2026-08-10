"use client";

import { useState } from "react";

import { getTimeNow } from "@/lib/shared/date";

export function useTimelineForm() {
  /*
   * =========================================================
   * CORE TIMELINE STATE
   * =========================================================
   */

  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);
  const [entryPanelOpen, setEntryPanelOpen] = useState(false);
  const [entryTime, setEntryTime] = useState(getTimeNow());

  /*
   * =========================================================
   * ACTIVITIES
   * =========================================================
   */

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

  const [socialInteractionData, setSocialInteractionData] =
    useState<any>(null);

  const [contactVisitData, setContactVisitData] =
    useState<any>(null);

  const [shoppingData, setShoppingData] =
    useState<any>(null);

  const [householdTasksData, setHouseholdTasksData] =
    useState<any>(null);

  /*
   * =========================================================
   * CARE
   * =========================================================
   */

  const [nutritionHydrationData, setNutritionHydrationData] =
    useState<any>(null);

  const [environmentCheckData, setEnvironmentCheckData] =
    useState<any>(null);

  const [continenceCareData, setContinenceCareData] =
    useState<any>(null);

  const [toiletingOutcome, setToiletingOutcome] = useState("");
  const [assistanceRequired, setAssistanceRequired] = useState("");
  const [padChanged, setPadChanged] = useState("");
  const [bristolType, setBristolType] = useState("");
  const [toiletingNotes, setToiletingNotes] = useState("");

  const [continenceSettings, setContinenceSettings] =
    useState<any>(null);

  const [personalCareData, setPersonalCareData] = useState({
    careType: "",
    assistanceLevel: "",
    notes: "",
  });

  /*
   * =========================================================
   * HEALTH
   * =========================================================
   */

  const [healthObservationData, setHealthObservationData] =
    useState<any>(null);

  const [symptomsData, setSymptomsData] =
    useState<any>(null);

  const [healthProfessionalData, setHealthProfessionalData] =
    useState<any>(null);

  const [medicationProfiles, setMedicationProfiles] =
    useState<any[]>([]);

  const [selectedRound, setSelectedRound] = useState("Morning");

  const [medicationStatuses, setMedicationStatuses] =
    useState<Record<string, string>>({});

  const [medicationReasons, setMedicationReasons] =
    useState<Record<string, string>>({});

  const [medicationErrorData, setMedicationErrorData] =
    useState<any>(null);

  /*
   * =========================================================
   * WELLBEING
   * =========================================================
   */

  const [sleepStatus, setSleepStatus] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");

  const [behaviourObserved, setBehaviourObserved] =
    useState<string[]>([]);

  const [behaviourFrequency, setBehaviourFrequency] =
    useState("");

  const [
    behaviourSupportProvided,
    setBehaviourSupportProvided,
  ] = useState<string[]>([]);

  const [behaviourOutcome, setBehaviourOutcome] =
    useState("");

  const [behaviourNotes, setBehaviourNotes] =
    useState("");

  /*
   * WellbeingObservationForm currently owns its own persistence,
   * so no additional local timeline state is required here.
   */

  /*
   * =========================================================
   * INCIDENTS
   * =========================================================
   */

  const [
    behaviourIncidentTrigger,
    setBehaviourIncidentTrigger,
  ] = useState("");

  const [
    behaviourIncidentTypes,
    setBehaviourIncidentTypes,
  ] = useState<string[]>([]);

  const [
    behaviourIncidentDescription,
    setBehaviourIncidentDescription,
  ] = useState("");

  const [
    behaviourIncidentSupport,
    setBehaviourIncidentSupport,
  ] = useState<string[]>([]);

  const [
    linkedPrnAdministrationId,
    setLinkedPrnAdministrationId,
  ] = useState("");

  const [
    behaviourIncidentOutcomes,
    setBehaviourIncidentOutcomes,
  ] = useState<string[]>([]);

  const [
    behaviourIncidentNotes,
    setBehaviourIncidentNotes,
  ] = useState("");

  const [prnOptions] = useState<
    {
      id: string;
      label: string;
    }[]
  >([]);

  const [bodyMapMarkers, setBodyMapMarkers] =
    useState<any[]>([]);

  const [bodyMapNotes, setBodyMapNotes] =
    useState("");

  const [
    accidentFallInjuryData,
    setAccidentFallInjuryData,
  ] = useState<any>(null);

  const [nearMissData, setNearMissData] =
    useState<any>(null);

  /*
   * =========================================================
   * CATEGORY RESET FUNCTIONS
   * =========================================================
   */

  function resetCoreState() {
    setContent("");
    setEntryType("");
    setSelectedCategoryId(null);
    setEntryTime(getTimeNow());
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

    /*
     * continenceSettings is service-user configuration.
     * It is intentionally not cleared when the panel resets.
     */

    setPersonalCareData({
      careType: "",
      assistanceLevel: "",
      notes: "",
    });
  }

  function resetHealthState() {
    setHealthObservationData(null);
    setSymptomsData(null);
    setHealthProfessionalData(null);

    setSelectedRound("Morning");
    setMedicationStatuses({});
    setMedicationReasons({});

    /*
     * medicationProfiles contains loaded records.
     * It is intentionally not cleared when the panel resets.
     */

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

  /*
   * =========================================================
   * MASTER RESET
   * =========================================================
   */

  function resetEntryPanel() {
    resetCoreState();
    resetActivityState();
    resetCareState();
    resetHealthState();
    resetWellbeingState();
    resetIncidentState();
  }

  /*
   * =========================================================
   * PANEL CONTROLS
   * =========================================================
   */

  function openPanel() {
    resetEntryPanel();
    setEntryPanelOpen(true);
  }

  function closePanel() {
    setEntryPanelOpen(false);
  }

  function closeAndReset() {
    setEntryPanelOpen(false);
    resetEntryPanel();
  }

  /*
   * =========================================================
   * RETURNED FORM API
   * =========================================================
   */

  return {
    /*
     * Core
     */

    content,
    setContent,

    entryType,
    setEntryType,

    selectedCategoryId,
    setSelectedCategoryId,

    entryPanelOpen,
    setEntryPanelOpen,

    entryTime,
    setEntryTime,

    /*
     * =======================================================
     * Activities
     * =======================================================
     */

    activityTitle,
    setActivityTitle,

    activityLocation,
    setActivityLocation,

    activityPeople,
    setActivityPeople,

    activityParticipation,
    setActivityParticipation,

    activityOutcome,
    setActivityOutcome,

    activityNotes,
    setActivityNotes,

    communityDestination,
    setCommunityDestination,

    communityTransport,
    setCommunityTransport,

    communitySupportProvided,
    setCommunitySupportProvided,

    communityAccessData,
    setCommunityAccessData,

    socialInteractionData,
    setSocialInteractionData,

    contactVisitData,
    setContactVisitData,

    shoppingData,
    setShoppingData,

    householdTasksData,
    setHouseholdTasksData,

    /*
     * =======================================================
     * Care
     * =======================================================
     */

    nutritionHydrationData,
    setNutritionHydrationData,

    environmentCheckData,
    setEnvironmentCheckData,

    continenceCareData,
    setContinenceCareData,

    toiletingOutcome,
    setToiletingOutcome,

    assistanceRequired,
    setAssistanceRequired,

    padChanged,
    setPadChanged,

    bristolType,
    setBristolType,

    toiletingNotes,
    setToiletingNotes,

    continenceSettings,
    setContinenceSettings,

    personalCareData,
    setPersonalCareData,

    /*
     * =======================================================
     * Health
     * =======================================================
     */

    healthObservationData,
    setHealthObservationData,

    symptomsData,
    setSymptomsData,

    healthProfessionalData,
    setHealthProfessionalData,

    medicationProfiles,
    setMedicationProfiles,

    selectedRound,
    setSelectedRound,

    medicationStatuses,
    setMedicationStatuses,

    medicationReasons,
    setMedicationReasons,

    medicationErrorData,
    setMedicationErrorData,

    /*
     * =======================================================
     * Wellbeing
     * =======================================================
     */

    sleepStatus,
    setSleepStatus,

    sleepNotes,
    setSleepNotes,

    behaviourObserved,
    setBehaviourObserved,

    behaviourFrequency,
    setBehaviourFrequency,

    behaviourSupportProvided,
    setBehaviourSupportProvided,

    behaviourOutcome,
    setBehaviourOutcome,

    behaviourNotes,
    setBehaviourNotes,

    /*
     * =======================================================
     * Incidents
     * =======================================================
     */

    behaviourIncidentTrigger,
    setBehaviourIncidentTrigger,

    behaviourIncidentTypes,
    setBehaviourIncidentTypes,

    behaviourIncidentDescription,
    setBehaviourIncidentDescription,

    behaviourIncidentSupport,
    setBehaviourIncidentSupport,

    linkedPrnAdministrationId,
    setLinkedPrnAdministrationId,

    behaviourIncidentOutcomes,
    setBehaviourIncidentOutcomes,

    behaviourIncidentNotes,
    setBehaviourIncidentNotes,

    prnOptions,

    bodyMapMarkers,
    setBodyMapMarkers,

    bodyMapNotes,
    setBodyMapNotes,

    accidentFallInjuryData,
    setAccidentFallInjuryData,

    nearMissData,
    setNearMissData,

    /*
     * Category resets
     */

    resetCoreState,
    resetActivityState,
    resetCareState,
    resetHealthState,
    resetWellbeingState,
    resetIncidentState,

    /*
     * Panel controls
     */

    resetEntryPanel,
    openPanel,
    closePanel,
    closeAndReset,
  };
}
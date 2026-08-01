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

  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | null
  >(null);

  const [entryPanelOpen, setEntryPanelOpen] = useState(false);

  const [entryTime, setEntryTime] = useState(getTimeNow());

  /*
   * =========================================================
   * ACTIVITY
   * =========================================================
   */

  /*
   * Activity
   */

  const [activityTitle, setActivityTitle] = useState("");

  const [activityLocation, setActivityLocation] = useState("");

  const [activityPeople, setActivityPeople] = useState("");

  const [activityParticipation, setActivityParticipation] =
    useState("");

  const [activityOutcome, setActivityOutcome] = useState("");

  const [activityNotes, setActivityNotes] = useState("");

  /*
   * Community Access
   */

  const [communityDestination, setCommunityDestination] =
    useState("");

  const [communityTransport, setCommunityTransport] = useState("");

  const [
    communitySupportProvided,
    setCommunitySupportProvided,
  ] = useState("");

  const [communityAccessData, setCommunityAccessData] =
    useState<any>(null);

  /*
   * Nutrition and Hydration
   */

  const [nutritionHydrationData, setNutritionHydrationData] =
    useState<any>(null);

  /*
   * Environment Check
   */

  const [environmentCheckData, setEnvironmentCheckData] =
    useState<any>(null);

  /*
   * =========================================================
   * CARE
   * =========================================================
   */

  /*
   * Toileting
   */

  const [toiletingOutcome, setToiletingOutcome] = useState("");

  const [assistanceRequired, setAssistanceRequired] = useState("");

  const [padChanged, setPadChanged] = useState("");

  const [bristolType, setBristolType] = useState("");

  const [toiletingNotes, setToiletingNotes] = useState("");

  const [continenceSettings, setContinenceSettings] =
    useState<any>(null);

  /*
   * Personal Care
   */

  const [careType, setCareType] = useState("");

  const [assistanceLevel, setAssistanceLevel] = useState("");

  const [personalCareNotes, setPersonalCareNotes] = useState("");

  /*
   * Sleep
   */

  const [sleepStatus, setSleepStatus] = useState("");

  const [sleepNotes, setSleepNotes] = useState("");

  /*
   * =========================================================
   * HEALTH
   * =========================================================
   */

  /*
   * Health Observation
   */

  const [healthObservationData, setHealthObservationData] =
    useState<any>(null);

  /*
   * Symptoms
   */

  const [symptomsData, setSymptomsData] = useState<any>(null);

  /*
   * Health Professional Contact
   */

  const [healthProfessionalData, setHealthProfessionalData] =
    useState<any>(null);

  /*
   * Medication Administration
   */

  const [medicationProfiles, setMedicationProfiles] = useState<
    any[]
  >([]);

  const [selectedRound, setSelectedRound] = useState("Morning");

  const [medicationStatuses, setMedicationStatuses] = useState<
    Record<string, string>
  >({});

  const [medicationReasons, setMedicationReasons] = useState<
    Record<string, string>
  >({});

  /*
   * Medication Error
   */

  const [medicationErrorData, setMedicationErrorData] =
    useState<any>(null);

  /*
   * Body Map
   */

  const [bodyMapMarkers, setBodyMapMarkers] = useState<any[]>([]);

  const [bodyMapNotes, setBodyMapNotes] = useState("");

  /*
   * =========================================================
   * MOOD AND WELLBEING
   * =========================================================
   */

  /*
   * ABC Record
   */

  const [antecedent, setAntecedent] = useState("");

  const [behaviour, setBehaviour] = useState("");

  const [consequence, setConsequence] = useState("");

  /*
   * Behaviour Observation
   */

  const [behaviourObserved, setBehaviourObserved] = useState<
    string[]
  >([]);

  const [behaviourFrequency, setBehaviourFrequency] = useState("");

  const [
    behaviourSupportProvided,
    setBehaviourSupportProvided,
  ] = useState<string[]>([]);

  const [behaviourOutcome, setBehaviourOutcome] = useState("");

  const [behaviourNotes, setBehaviourNotes] = useState("");

  /*
   * =========================================================
   * INCIDENT
   * =========================================================
   */

  /*
   * Behaviour Incident
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

  /*
   * Accident / Fall / Injury
   */

  const [accidentFallInjuryData, setAccidentFallInjuryData] =
    useState<any>(null);

  /*
   * Near Miss
   */

  const [nearMissData, setNearMissData] = useState<any>(null);

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
    /*
     * Activity
     */

    setActivityTitle("");
    setActivityLocation("");
    setActivityPeople("");
    setActivityParticipation("");
    setActivityOutcome("");
    setActivityNotes("");

    /*
     * Community Access
     */

    setCommunityDestination("");
    setCommunityTransport("");
    setCommunitySupportProvided("");
    setCommunityAccessData(null);

    /*
     * Nutrition and Hydration
     */

    setNutritionHydrationData(null);

    /*
     * Environment Check
     */

    setEnvironmentCheckData(null);
  }

  function resetCareState() {
    /*
     * Toileting
     */

    setToiletingOutcome("");
    setAssistanceRequired("");
    setPadChanged("");
    setBristolType("");
    setToiletingNotes("");

    /*
     * Continence settings are service-user configuration.
     * They are intentionally not cleared when the panel resets.
     */

    /*
     * Personal Care
     */

    setCareType("");
    setAssistanceLevel("");
    setPersonalCareNotes("");

    /*
     * Sleep
     */

    setSleepStatus("");
    setSleepNotes("");
  }

  function resetHealthState() {
    /*
     * Health Observation
     */

    setHealthObservationData(null);

    /*
     * Symptoms
     */

    setSymptomsData(null);

    /*
     * Health Professional Contact
     */

    setHealthProfessionalData(null);

    /*
     * Medication Administration
     */

    setSelectedRound("Morning");
    setMedicationStatuses({});
    setMedicationReasons({});

    /*
     * Medication profiles are loaded records.
     * They are intentionally not cleared when the panel resets.
     */

    /*
     * Medication Error
     */

    setMedicationErrorData(null);

    /*
     * Body Map
     */

    setBodyMapMarkers([]);
    setBodyMapNotes("");
  }

  function resetMoodWellbeingState() {
    /*
     * ABC Record
     */

    setAntecedent("");
    setBehaviour("");
    setConsequence("");

    /*
     * Behaviour Observation
     */

    setBehaviourObserved([]);
    setBehaviourFrequency("");
    setBehaviourSupportProvided([]);
    setBehaviourOutcome("");
    setBehaviourNotes("");
  }

  function resetIncidentState() {
    /*
     * Behaviour Incident
     */

    setBehaviourIncidentTrigger("");
    setBehaviourIncidentTypes([]);
    setBehaviourIncidentDescription("");
    setBehaviourIncidentSupport([]);
    setLinkedPrnAdministrationId("");
    setBehaviourIncidentOutcomes([]);
    setBehaviourIncidentNotes("");

    /*
     * Accident / Fall / Injury
     */

    setAccidentFallInjuryData(null);

    /*
     * Near Miss
     */

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
    resetMoodWellbeingState();
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
   *
   * The API remains flat so your existing components can keep
   * using properties such as:
   *
   * form.environmentCheckData
   * form.setEnvironmentCheckData
   * form.toiletingOutcome
   * form.setToiletingOutcome
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
     * Activity
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

    nutritionHydrationData,
    setNutritionHydrationData,

    environmentCheckData,
    setEnvironmentCheckData,

    /*
     * =======================================================
     * Care
     * =======================================================
     */

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

    careType,
    setCareType,

    assistanceLevel,
    setAssistanceLevel,

    personalCareNotes,
    setPersonalCareNotes,

    sleepStatus,
    setSleepStatus,

    sleepNotes,
    setSleepNotes,

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

    bodyMapMarkers,
    setBodyMapMarkers,

    bodyMapNotes,
    setBodyMapNotes,

    /*
     * =======================================================
     * Mood and Wellbeing
     * =======================================================
     */

    antecedent,
    setAntecedent,

    behaviour,
    setBehaviour,

    consequence,
    setConsequence,

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
     * Incident
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
    resetMoodWellbeingState,
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
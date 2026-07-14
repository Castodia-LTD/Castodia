"use client";

import { useState } from "react";
import { getTimeNow } from "@/lib/shared/date";

export function useTimelineForm() {
  const [content, setContent] = useState("");

  const [entryType, setEntryType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [entryPanelOpen, setEntryPanelOpen] = useState(false);
  const [entryTime, setEntryTime] = useState(getTimeNow());

  const [antecedent, setAntecedent] = useState("");
  const [behaviour, setBehaviour] = useState("");
  const [consequence, setConsequence] = useState("");

  const [behaviourObserved, setBehaviourObserved] = useState<string[]>([]);
  const [behaviourFrequency, setBehaviourFrequency] = useState("");
  const [behaviourSupportProvided, setBehaviourSupportProvided] = useState<
    string[]
  >([]);
  const [behaviourOutcome, setBehaviourOutcome] = useState("");
  const [behaviourNotes, setBehaviourNotes] = useState("");

  const [medicationProfiles, setMedicationProfiles] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState("Morning");
  const [medicationStatuses, setMedicationStatuses] = useState<
    Record<string, string>
  >({});
  const [medicationReasons, setMedicationReasons] = useState<
    Record<string, string>
  >({});

  const [toiletingOutcome, setToiletingOutcome] = useState("");
  const [assistanceRequired, setAssistanceRequired] = useState("");
  const [padChanged, setPadChanged] = useState("");
  const [bristolType, setBristolType] = useState("");
  const [toiletingNotes, setToiletingNotes] = useState("");
  const [continenceSettings, setContinenceSettings] = useState<any>(null);

  const [careType, setCareType] = useState("");
  const [assistanceLevel, setAssistanceLevel] = useState("");
  const [personalCareNotes, setPersonalCareNotes] = useState("");

  const [sleepStatus, setSleepStatus] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");

  const [activityTitle, setActivityTitle] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityPeople, setActivityPeople] = useState("");
  const [activityParticipation, setActivityParticipation] = useState("");
  const [activityOutcome, setActivityOutcome] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  const [communityDestination, setCommunityDestination] = useState("");
  const [communityTransport, setCommunityTransport] = useState("");
  const [communitySupportProvided, setCommunitySupportProvided] = useState("");

  const [bodyMapMarkers, setBodyMapMarkers] = useState<any[]>([]);
  const [bodyMapNotes, setBodyMapNotes] = useState("");

  const [behaviourIncidentTrigger, setBehaviourIncidentTrigger] = useState("");
  const [behaviourIncidentTypes, setBehaviourIncidentTypes] = useState<
    string[]
  >([]);
  const [behaviourIncidentDescription, setBehaviourIncidentDescription] =
    useState("");
  const [behaviourIncidentSupport, setBehaviourIncidentSupport] = useState<
    string[]
  >([]);
  const [linkedPrnAdministrationId, setLinkedPrnAdministrationId] =
    useState("");
  const [behaviourIncidentOutcomes, setBehaviourIncidentOutcomes] = useState<
    string[]
  >([]);
  const [behaviourIncidentNotes, setBehaviourIncidentNotes] = useState("");
  const [prnOptions] = useState<{ id: string; label: string }[]>([]);
  const [nutritionHydrationData, setNutritionHydrationData] =
  useState<any>(null);

const [healthObservationData, setHealthObservationData] =
  useState<any>(null);

const [symptomsData, setSymptomsData] =
  useState<any>(null);

const [healthProfessionalData, setHealthProfessionalData] =
  useState<any>(null);

const [communityAccessData, setCommunityAccessData] =
  useState<any>(null);

  const [medicationErrorData, setMedicationErrorData] =
  useState<any>(null);

  const [nearMissData, setNearMissData] =
  useState<any>(null);

  function resetEntryPanel() {
    setContent("");
    setEntryType("");
    setSelectedCategoryId(null);
    setEntryTime(getTimeNow());

    setAntecedent("");
    setBehaviour("");
    setConsequence("");

    setBehaviourObserved([]);
    setBehaviourFrequency("");
    setBehaviourSupportProvided([]);
    setBehaviourOutcome("");
    setBehaviourNotes("");

    setMedicationStatuses({});
    setMedicationReasons({});

    setToiletingOutcome("");
    setAssistanceRequired("");
    setPadChanged("");
    setBristolType("");
    setToiletingNotes("");

    setCareType("");
    setAssistanceLevel("");
    setPersonalCareNotes("");

    setActivityTitle("");
    setActivityLocation("");
    setActivityPeople("");
    setActivityParticipation("");
    setActivityOutcome("");
    setActivityNotes("");

    setCommunityDestination("");
    setCommunityTransport("");
    setCommunitySupportProvided("");

    setSleepStatus("");
    setSleepNotes("");

    setBodyMapMarkers([]);
    setBodyMapNotes("");

    setNutritionHydrationData(null);
    setHealthObservationData(null);
    setSymptomsData(null);
    setHealthProfessionalData(null);
    setCommunityAccessData(null);

    setBehaviourIncidentTrigger("");
    setBehaviourIncidentTypes([]);
    setBehaviourIncidentDescription("");
    setBehaviourIncidentSupport([]);
    setLinkedPrnAdministrationId("");
    setBehaviourIncidentOutcomes([]);
    setBehaviourIncidentNotes("");

    setMedicationErrorData(null);

    setNearMissData(null);
  }

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

  return {
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

    medicationProfiles,
    setMedicationProfiles,
    selectedRound,
    setSelectedRound,
    medicationStatuses,
    setMedicationStatuses,
    medicationReasons,
    setMedicationReasons,

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

    bodyMapMarkers,
    setBodyMapMarkers,
    bodyMapNotes,
    setBodyMapNotes,

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

    nutritionHydrationData,
setNutritionHydrationData,

healthObservationData,
setHealthObservationData,

symptomsData,
setSymptomsData,

healthProfessionalData,
setHealthProfessionalData,

communityAccessData,
setCommunityAccessData,

medicationErrorData,
setMedicationErrorData,

nearMissData,
setNearMissData,

resetEntryPanel,
openPanel,
closePanel,
closeAndReset,
  };
}
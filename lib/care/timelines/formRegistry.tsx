"use client";

import type React from "react";

/* -------------------------------------------------------------------------- */
/* Activities                                                                 */
/* -------------------------------------------------------------------------- */

import ActivityForm from "@/components/care/timelines/forms/activities/ActivityForm";
import CommunityAccessForm from "@/components/care/timelines/forms/activities/CommunityAccessForm";
import ContactVisitForm from "@/components/care/timelines/forms/activities/ContactVisitForm";
import HouseholdTasksForm from "@/components/care/timelines/forms/activities/HouseholdTasksForm";
import ShoppingForm from "@/components/care/timelines/forms/activities/ShoppingForm";
import SocialInteractionForm from "@/components/care/timelines/forms/activities/SocialInteractionForm";

/* -------------------------------------------------------------------------- */
/* Care                                                                       */
/* -------------------------------------------------------------------------- */

import ContinenceCareForm from "@/components/care/timelines/forms/care/ContinenceCareForm";
import EnvironmentCheckForm from "@/components/care/timelines/forms/care/EnvironmentCheckForm";
import NutritionHydrationForm from "@/components/care/timelines/forms/care/NutritionHydrationForm";
import PersonalCareForm from "@/components/care/timelines/forms/care/PersonalCareForm";
import ToiletingForm from "@/components/care/timelines/forms/care/ToiletingForm";

/* -------------------------------------------------------------------------- */
/* Health                                                                     */
/* -------------------------------------------------------------------------- */

import HealthObservationForm from "@/components/care/timelines/forms/health/HealthObservationForm";
import HealthProfessionalForm from "@/components/care/timelines/forms/health/HealthProfessionalForm";
import MedicationForm from "@/components/care/timelines/forms/health/MedicationForm";
import SymptomsForm from "@/components/care/timelines/forms/health/SymptomsForm";

/* -------------------------------------------------------------------------- */
/* Wellbeing                                                                  */
/* -------------------------------------------------------------------------- */

import BehaviourObservationForm from "@/components/care/timelines/forms/wellbeing/BehaviourObservationForm";
import SleepForm from "@/components/care/timelines/forms/wellbeing/SleepForm";
import WellbeingObservationForm from "@/components/care/timelines/forms/wellbeing/WellbeingObservationForm";

/* -------------------------------------------------------------------------- */
/* Incidents                                                                  */
/* -------------------------------------------------------------------------- */

import AccidentFallInjuryForm from "@/components/care/timelines/forms/incidents/AccidentFallInjuryForm";
import BehaviourIncidentForm from "@/components/care/timelines/forms/incidents/BehaviourIncidentForm";
import BodyMapForm from "@/components/care/timelines/forms/incidents/BodyMapForm";
import MedicationErrorForm from "@/components/care/timelines/forms/incidents/MedicationErrorForm";
import NearMissForm from "@/components/care/timelines/forms/incidents/NearMissform";

type RegistryComponent = (props: any) => React.ReactNode;

export type TimelineFormCategory =
  | "activities"
  | "care"
  | "health"
  | "wellbeing"
  | "incidents";

/* -------------------------------------------------------------------------- */
/* Activities                                                                 */
/* -------------------------------------------------------------------------- */

export const activityFormRegistry: Record<
  string,
  RegistryComponent
> = {
  Activity: (props: any) => (
    <ActivityForm
      title={props.activityTitle}
      setTitle={props.setActivityTitle}
      location={props.activityLocation}
      setLocation={props.setActivityLocation}
      peopleInvolved={props.activityPeople}
      setPeopleInvolved={props.setActivityPeople}
      participationLevel={props.activityParticipation}
      setParticipationLevel={props.setActivityParticipation}
      outcome={props.activityOutcome}
      setOutcome={props.setActivityOutcome}
      notes={props.activityNotes}
      setNotes={props.setActivityNotes}
    />
  ),

  "Community Access": (props: any) => (
    <CommunityAccessForm {...props} />
  ),

  "Social Interaction": (props: any) => (
    <SocialInteractionForm {...props} />
  ),

  "Contact / Visit": (props: any) => (
    <ContactVisitForm
      personContacted={props.activityPeople}
      setPersonContacted={props.setActivityPeople}
      relationship={props.activityTitle}
      setRelationship={props.setActivityTitle}
      contactMethod={props.activityLocation}
      setContactMethod={props.setActivityLocation}
      participationLevel={props.activityParticipation}
      setParticipationLevel={props.setActivityParticipation}
      outcome={props.activityOutcome}
      setOutcome={props.setActivityOutcome}
      notes={props.activityNotes}
      setNotes={props.setActivityNotes}
    />
  ),

  Shopping: (props: any) => (
    <ShoppingForm
      shopLocation={props.activityLocation}
      setShopLocation={props.setActivityLocation}
      itemsPurchased={props.activityTitle}
      setItemsPurchased={props.setActivityTitle}
      moneyManagement={props.activityPeople}
      setMoneyManagement={props.setActivityPeople}
      participationLevel={props.activityParticipation}
      setParticipationLevel={props.setActivityParticipation}
      outcome={props.activityOutcome}
      setOutcome={props.setActivityOutcome}
      notes={props.activityNotes}
      setNotes={props.setActivityNotes}
    />
  ),

  "Household Tasks": (props: any) => (
    <HouseholdTasksForm
      taskCompleted={props.activityTitle}
      setTaskCompleted={props.setActivityTitle}
      areaOfHome={props.activityLocation}
      setAreaOfHome={props.setActivityLocation}
      supportProvided={props.activityPeople}
      setSupportProvided={props.setActivityPeople}
      participationLevel={props.activityParticipation}
      setParticipationLevel={props.setActivityParticipation}
      outcome={props.activityOutcome}
      setOutcome={props.setActivityOutcome}
      notes={props.activityNotes}
      setNotes={props.setActivityNotes}
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Care                                                                       */
/* -------------------------------------------------------------------------- */

export const careFormRegistry: Record<
  string,
  RegistryComponent
> = {
  "Nutrition & Hydration": (props: any) => (
    <NutritionHydrationForm
      onChange={props.setNutritionHydrationData}
    />
  ),

  "Environment Check": (props: any) => (
    <EnvironmentCheckForm
      environmentCheckData={props.environmentCheckData}
      setEnvironmentCheckData={props.setEnvironmentCheckData}
      onChange={props.setEnvironmentCheckData}
    />
  ),

  "Continence Care": (props: any) => (
    <ContinenceCareForm
      continenceCareData={props.continenceCareData}
      setContinenceCareData={props.setContinenceCareData}
      onChange={props.setContinenceCareData}
    />
  ),

  "Personal Care": (props: any) => (
    <PersonalCareForm
      personalCareData={props.personalCareData}
      setPersonalCareData={props.setPersonalCareData}
    />
  ),

  Toileting: (props: any) => (
    <ToiletingForm {...props} />
  ),
};

/* -------------------------------------------------------------------------- */
/* Health                                                                     */
/* -------------------------------------------------------------------------- */

export const healthFormRegistry: Record<
  string,
  RegistryComponent
> = {
  Medication: (props: any) => (
    <MedicationForm {...props} />
  ),

  "Health Observation": (props: any) => (
    <HealthObservationForm
      onChange={props.setHealthObservationData}
    />
  ),

  Symptoms: (props: any) => (
    <SymptomsForm
      onChange={props.setSymptomsData}
    />
  ),

  "Health Professional": (props: any) => (
    <HealthProfessionalForm
      onChange={props.setHealthProfessionalData}
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Wellbeing                                                                  */
/* -------------------------------------------------------------------------- */

export const wellbeingFormRegistry: Record<
  string,
  RegistryComponent
> = {
  Sleep: (props: any) => (
    <SleepForm
      serviceUserName={props.serviceUserName}
      sleepStatus={props.sleepStatus}
      setSleepStatus={props.setSleepStatus}
      sleepNotes={props.sleepNotes}
      setSleepNotes={props.setSleepNotes}
    />
  ),

  Wellbeing: (props: any) => (
    <WellbeingObservationForm {...props} />
  ),

  "Behaviour Observation": (props: any) => (
    <BehaviourObservationForm {...props} />
  ),
};

/* -------------------------------------------------------------------------- */
/* Incidents                                                                  */
/* -------------------------------------------------------------------------- */

export const incidentFormRegistry: Record<
  string,
  RegistryComponent
> = {
  "Body Map": (props: any) => (
    <BodyMapForm {...props} />
  ),

  "Behaviour Incident": (props: any) => (
    <BehaviourIncidentForm {...props} />
  ),

  "Accident / Fall / Injury": (props: any) => (
    <AccidentFallInjuryForm
      onChange={props.setAccidentFallInjuryData}
    />
  ),

  "Medication Error": (props: any) => (
    <MedicationErrorForm
      onChange={props.setMedicationErrorData}
    />
  ),

  "Near Miss": (props: any) => (
    <NearMissForm
      onChange={props.setNearMissData}
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Combined registry                                                          */
/* -------------------------------------------------------------------------- */

export const formRegistry: Record<
  string,
  RegistryComponent
> = {
  ...activityFormRegistry,
  ...careFormRegistry,
  ...healthFormRegistry,
  ...wellbeingFormRegistry,
  ...incidentFormRegistry,
};

/* -------------------------------------------------------------------------- */
/* Category helpers                                                           */
/* -------------------------------------------------------------------------- */

export const formRegistryByCategory: Record<
  TimelineFormCategory,
  Record<string, RegistryComponent>
> = {
  activities: activityFormRegistry,
  care: careFormRegistry,
  health: healthFormRegistry,
  wellbeing: wellbeingFormRegistry,
  incidents: incidentFormRegistry,
};

export function getFormCategory(
  entryType: string,
): TimelineFormCategory | null {
  if (entryType in activityFormRegistry) {
    return "activities";
  }

  if (entryType in careFormRegistry) {
    return "care";
  }

  if (entryType in healthFormRegistry) {
    return "health";
  }

  if (entryType in wellbeingFormRegistry) {
    return "wellbeing";
  }

  if (entryType in incidentFormRegistry) {
    return "incidents";
  }

  return null;
}
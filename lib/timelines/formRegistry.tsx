import ActivityForm from "@/components/timelines/forms/activities/ActivityForm";
import CommunityAccessForm from "@/components/timelines/forms/activities/CommunityAccessForm";
import SocialInteractionForm from "@/components/timelines/forms/activities/SocialInteractionForm";
import MedicationForm from "@/components/timelines/forms/health/MedicationForm";
import ToiletingForm from "@/components/timelines/forms/care/ToiletingForm";
import PersonalCareForm from "@/components/timelines/forms/care/PersonalCareForm";
import SleepForm from "@/components/timelines/forms/wellbeing/SleepForm";
import WellbeingObservationForm from "@/components/timelines/forms/wellbeing/WellbeingObservationForm";
import ContactVisitForm from "@/components/timelines/forms/activities/ContactVisitForm";
import ShoppingForm from "@/components/timelines/forms/activities/ShoppingForm";
import HouseholdTasksForm from "@/components/timelines/forms/activities/HouseholdTasksForm";
import BehaviourObservationForm from "@/components/timelines/forms/wellbeing/BehaviourObservationForm";
import BodyMapForm from "@/components/timelines/forms/incidents/BodyMapForm";
import BehaviourIncidentForm from "@/components/timelines/forms/incidents/BehaviourIncidentForm";

export const formRegistry: Record<string, any> = {
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
    <CommunityAccessForm
      destination={props.communityDestination}
      setDestination={props.setCommunityDestination}
      transport={props.communityTransport}
      setTransport={props.setCommunityTransport}
      supportProvided={props.communitySupportProvided}
      setSupportProvided={props.setCommunitySupportProvided}
      participationLevel={props.activityParticipation}
      setParticipationLevel={props.setActivityParticipation}
      outcome={props.activityOutcome}
      setOutcome={props.setActivityOutcome}
      notes={props.activityNotes}
      setNotes={props.setActivityNotes}
    />
  ),

"Social Interaction": (props: any) => (
  <SocialInteractionForm
    whoInvolved={props.activityPeople}
    setWhoInvolved={props.setActivityPeople}
    interactionType={props.activityTitle}
    setInteractionType={props.setActivityTitle}
    location={props.activityLocation}
    setLocation={props.setActivityLocation}
    participationLevel={props.activityParticipation}
    setParticipationLevel={props.setActivityParticipation}
    outcome={props.activityOutcome}
    setOutcome={props.setActivityOutcome}
    notes={props.activityNotes}
    setNotes={props.setActivityNotes}
  />
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
"Shopping": (props: any) => (
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

Medication: (props: any) => (
  <MedicationForm
    serviceUserId={props.serviceUserId}
    onSaved={props.onSaved}
    onCreateTimelineEntry={props.onCreateTimelineEntry}
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

  Toileting: (props: any) => (
    <ToiletingForm
      toiletingOutcome={props.toiletingOutcome}
      setToiletingOutcome={props.setToiletingOutcome}
      assistanceRequired={props.assistanceRequired}
      setAssistanceRequired={props.setAssistanceRequired}
      padChanged={props.padChanged}
      setPadChanged={props.setPadChanged}
      bristolType={props.bristolType}
      setBristolType={props.setBristolType}
      toiletingNotes={props.toiletingNotes}
      setToiletingNotes={props.setToiletingNotes}
      continenceSettings={props.continenceSettings}
    />
  ),

  "Personal Care": (props: any) => (
    <PersonalCareForm
      careType={props.careType}
      setCareType={props.setCareType}
      assistanceLevel={props.assistanceLevel}
      setAssistanceLevel={props.setAssistanceLevel}
      personalCareNotes={props.personalCareNotes}
      setPersonalCareNotes={props.setPersonalCareNotes}
    />
  ),

  Sleep: (props: any) => (
    <SleepForm
      sleepStatus={props.sleepStatus}
      setSleepStatus={props.setSleepStatus}
      sleepNotes={props.sleepNotes}
      setSleepNotes={props.setSleepNotes}
    />
  ),

  Wellbeing: (props: any) => (
    <WellbeingObservationForm
      serviceUserId={props.serviceUserId}
      serviceUserName={props.serviceUserName}
      onSaved={props.onSaved}
    />
  ),

  "Behaviour Observation": (props: any) => (
    <BehaviourObservationForm
      behaviourObserved={props.behaviourObserved}
      setBehaviourObserved={props.setBehaviourObserved}
      behaviourFrequency={props.behaviourFrequency}
      setBehaviourFrequency={props.setBehaviourFrequency}
      behaviourSupportProvided={props.behaviourSupportProvided}
      setBehaviourSupportProvided={props.setBehaviourSupportProvided}
      behaviourOutcome={props.behaviourOutcome}
      setBehaviourOutcome={props.setBehaviourOutcome}
      behaviourNotes={props.behaviourNotes}
      setBehaviourNotes={props.setBehaviourNotes}
    />
  ),
    "Body Map": (props: any) => (
    <BodyMapForm
      bodyMapMarkers={props.bodyMapMarkers}
      setBodyMapMarkers={props.setBodyMapMarkers}
      bodyMapNotes={props.bodyMapNotes}
      setBodyMapNotes={props.setBodyMapNotes}
      serviceUserGender={props.serviceUserGender}
    />
  ),
"Behaviour Incident": (props: any) => (
  <BehaviourIncidentForm
    trigger={props.behaviourIncidentTrigger}
    setTrigger={props.setBehaviourIncidentTrigger}
    behaviourTypes={props.behaviourIncidentTypes}
    setBehaviourTypes={props.setBehaviourIncidentTypes}
    description={props.behaviourIncidentDescription}
    setDescription={props.setBehaviourIncidentDescription}
    supportProvided={props.behaviourIncidentSupport}
    setSupportProvided={props.setBehaviourIncidentSupport}
    linkedPrnAdministrationId={props.linkedPrnAdministrationId}
    setLinkedPrnAdministrationId={props.setLinkedPrnAdministrationId}
    prnOptions={props.prnOptions}
    immediateOutcomes={props.behaviourIncidentOutcomes}
    setImmediateOutcomes={props.setBehaviourIncidentOutcomes}
    notes={props.behaviourIncidentNotes}
    setNotes={props.setBehaviourIncidentNotes}
  />
),
};
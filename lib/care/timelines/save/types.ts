export type PersonalCareData = {
  careType: string;
  assistanceLevel: string;
  notes: string;
};

export type ToiletingData = {
  toiletingOutcome: string;
  assistanceRequired: string;
  padChanged: string;
  bristolType: string;
  toiletingNotes: string;
};

export type SaveContext = {
  supabase: any;

  serviceUserId: string;
  serviceUserName: string;
  organisationId: string;
  userId: string;
  eventTime: string;

  resetEntryPanel: () => void;
  setEntryPanelOpen: (value: boolean) => void;
  loadEntries: () => Promise<void>;

  // Activities
  activityTitle: string;
  activityLocation: string;
  activityPeople: string;
  activityParticipation: string;
  activityOutcome: string;
  activityNotes: string;

  communityAccessData?: any;
  socialInteractionData?: any;
  contactVisitData?: any;
  shoppingData?: any;
  householdTasksData?: any;

  // Care
  environmentCheckData?: any;
  nutritionHydrationData?: any;
  personalCareData?: PersonalCareData;
  toiletingData?: ToiletingData;
  continenceCareData?: any;

  // Wellbeing
  behaviourObserved: string[];
  behaviourFrequency: string;
  behaviourSupportProvided: string[];
  behaviourOutcome: string;
  behaviourNotes: string;

  sleepStatus: string;
  sleepNotes: string;

  // Body map
  bodyMapMarkers: any[];
  bodyMapNotes: string;

  // Health
  healthObservationData?: any;
  symptomsData?: any;
  healthProfessionalData?: any;

  // Incidents
  accidentFallInjuryData?: any;
  medicationErrorData?: any;
  nearMissData?: any;

  behaviourIncidentTrigger: string;
  behaviourIncidentTypes: string[];
  behaviourIncidentDescription: string;
  behaviourIncidentSupport: string[];
  linkedPrnAdministrationId: string;
  behaviourIncidentOutcomes: string[];
  behaviourIncidentNotes: string;
};

export type SaveHandler = (
  ctx: SaveContext,
) => Promise<boolean>;
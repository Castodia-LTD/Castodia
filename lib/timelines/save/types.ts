export type SaveContext = {
  supabase: any;
  serviceUserId: string;
  organisationId: string;
  userId: string;
  eventTime: string;

  resetEntryPanel: () => void;
  setEntryPanelOpen: (value: boolean) => void;
  loadEntries: () => Promise<void>;

  activityTitle: string;
  activityLocation: string;
  activityPeople: string;
  activityParticipation: string;
  activityOutcome: string;
  activityNotes: string;

  communityAccessData?: any;
  environmentCheckData?: any;

  behaviourObserved: string[];
  behaviourFrequency: string;
  behaviourSupportProvided: string[];
  behaviourOutcome: string;
  behaviourNotes: string;

  bodyMapMarkers: any[];
  bodyMapNotes: string;

  nutritionHydrationData?: any;
  healthObservationData?: any;
  symptomsData?: any;
  healthProfessionalData?: any;
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

export type SaveHandler = (ctx: SaveContext) => Promise<boolean>;
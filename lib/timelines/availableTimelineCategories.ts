export type TimelineOptionKey =
  | "activity"
  | "community_access"
  | "social_interaction"
  | "contact_visit"
  | "shopping"
  | "household_tasks"
  | "health_observation"
  | "symptoms"
  | "health_professional"
  | "clinical_care"
  | "emar"
  | "wellbeing_observation"
  | "behaviour_observation"
  | "sleep_check"
  | "personal_care"
  | "toileting"
  | "continence_care"
  | "nutrition_hydration"
  | "environment_check"
  | "accident_injury"
  | "body_map"
  | "behaviour_incident"
  | "safeguarding_concern"
  | "medication_error"
  | "near_miss";

export type TimelineCategoryKey =
  | "activities"
  | "health"
  | "mood"
  | "care"
  | "incident";

export type AvailableTimelineOption = {
  key: TimelineOptionKey;
  label: string;
  entryType: string;
  description: string;
};

export type AvailableTimelineCategory = {
  key: TimelineCategoryKey;
  title: string;
  colour: string;
  options: AvailableTimelineOption[];
};

export const availableTimelineCategories: AvailableTimelineCategory[] = [
  {
    key: "activities",
    title: "Activities",
    colour: "bg-purple-200 text-purple-950",
    options: [
      {
        key: "activity",
        label: "Activity",
        entryType: "Activity",
        description: "Record an activity or meaningful engagement.",
      },
      {
        key: "community_access",
        label: "Community Access",
        entryType: "Community Access",
        description: "Record time spent accessing the community.",
      },
      {
        key: "social_interaction",
        label: "Social Interaction",
        entryType: "Social Interaction",
        description: "Record social engagement or interaction.",
      },
      {
        key: "contact_visit",
        label: "Contact / Visit",
        entryType: "Contact / Visit",
        description: "Record family contact, visitors or calls.",
      },
      {
        key: "shopping",
        label: "Shopping",
        entryType: "Shopping",
        description: "Record shopping or purchasing support.",
      },
      {
        key: "household_tasks",
        label: "Household Tasks",
        entryType: "Household Tasks",
        description: "Record domestic tasks or household support.",
      },
    ],
  },
  {
    key: "health",
    title: "Health",
    colour: "bg-orange-200 text-orange-950",
    options: [
      {
        key: "health_observation",
        label: "Health Observation",
        entryType: "Health Observation",
        description: "Record general health observations.",
      },
      {
        key: "symptoms",
        label: "Symptoms",
        entryType: "Symptoms",
        description: "Record symptoms or changes in health presentation.",
      },
      {
        key: "health_professional",
        label: "Health Professional",
        entryType: "Health Professional",
        description: "Record contact with a health professional.",
      },
      {
        key: "clinical_care",
        label: "Clinical Care",
        entryType: "Clinical Care",
        description: "Record clinical care or health-related support.",
      },
      {
        key: "emar",
        label: "eMAR",
        entryType: "Medication",
        description: "Record medication administration.",
      },
    ],
  },
  {
    key: "mood",
    title: "Mood & Wellbeing",
    colour: "bg-green-200 text-green-950",
    options: [
      {
        key: "wellbeing_observation",
        label: "Wellbeing Observation",
        entryType: "Wellbeing",
        description: "Record mood, presentation and wellbeing indicators.",
      },
      {
        key: "behaviour_observation",
        label: "Behaviour Observation",
        entryType: "Behaviour Observation",
        description:
          "Record behaviour, presentation, support provided and outcome.",
      },
      {
        key: "sleep_check",
        label: "Sleep Check",
        entryType: "Sleep",
        description: "Record sleep observations or checks.",
      },
    ],
  },
  {
    key: "care",
    title: "Care",
    colour: "bg-sky-200 text-sky-950",
    options: [
      {
        key: "personal_care",
        label: "Personal Care",
        entryType: "Personal Care",
        description: "Record personal care support.",
      },
      {
        key: "toileting",
        label: "Toileting",
        entryType: "Toileting",
        description: "Record toileting support.",
      },
      {
        key: "continence_care",
        label: "Continence Care",
        entryType: "Toileting",
        description: "Record continence care or pad changes.",
      },
      {
        key: "nutrition_hydration",
        label: "Nutrition & Hydration",
        entryType: "Nutrition & Hydration",
        description: "Record food, fluids or mealtime support.",
      },
      {
        key: "environment_check",
        label: "Environment Check",
        entryType: "Environment Check",
        description: "Record room, safety or environment checks.",
      },
    ],
  },
  {
    key: "incident",
    title: "Incident",
    colour: "bg-rose-200 text-rose-950",
    options: [
      {
        key: "accident_injury",
        label: "Accident / Injury",
        entryType: "Incident",
        description: "Record an accident or injury using incident format.",
      },
      {
        key: "body_map",
        label: "Body Map",
        entryType: "Body Map",
        description:
          "Record injuries, marks, bruising or other observations using a body map.",
      },
      {
        key: "behaviour_incident",
        label: "Behaviour Incident",
        entryType: "Behaviour Incident",
        description: "Record a behaviour incident requiring incident review.",
      },
      {
        key: "safeguarding_concern",
        label: "Safeguarding Concern",
        entryType: "Incident",
        description: "Record a safeguarding concern.",
      },
      {
        key: "medication_error",
        label: "Medication Error",
        entryType: "Incident",
        description: "Record a medication error.",
      },
      {
        key: "near_miss",
        label: "Near Miss",
        entryType: "Incident",
        description: "Record a near miss or avoided incident.",
      },
    ],
  },
];
export type EntryCategoryOption = {
  label: string;
  entryType: string;
  description: string;
};

export type EntryCategory = {
  id: string;
  title: string;
  colour: string;
  options: EntryCategoryOption[];
};

export const entryCategories: EntryCategory[] = [
  {
    id: "activities",
    title: "Activities",
    colour: "bg-purple-200 text-purple-950",
    options: [
      {
        label: "Activity",
        entryType: "Activity",
        description: "Record an activity or meaningful engagement.",
      },
      {
        label: "Community Access",
        entryType: "Community Access",
        description: "Record time spent accessing the community.",
      },
      {
        label: "Social Interaction",
        entryType: "Social Interaction",
        description: "Record social engagement or interaction.",
      },
      {
        label: "Contact / Visit",
        entryType: "Contact / Visit",
        description: "Record family contact, visitors or calls.",
      },
      {
        label: "Shopping",
        entryType: "Shopping",
        description: "Record shopping or purchasing support.",
      },
      {
        label: "Household Tasks",
        entryType: "Household Tasks",
        description: "Record domestic tasks or household support.",
      },
    ],
  },
  {
    id: "health",
    title: "Health",
    colour: "bg-orange-200 text-orange-950",
    options: [
      {
        label: "Health Observation",
        entryType: "Health Observation",
        description: "Record general health observations.",
      },
      {
        label: "Symptoms",
        entryType: "Symptoms",
        description: "Record symptoms or changes in health presentation.",
      },
      {
        label: "Health Professional",
        entryType: "Health Professional",
        description: "Record contact with a health professional.",
      },
      {
        label: "Clinical Care",
        entryType: "Clinical Care",
        description: "Record clinical care or health-related support.",
      },
      {
        label: "eMAR",
        entryType: "Medication",
        description: "Record medication administration.",
      },
    ],
  },
  {
    id: "mood",
    title: "Mood & Wellbeing",
    colour: "bg-green-200 text-green-950",
    options: [
      {
        label: "Wellbeing Observation",
        entryType: "Wellbeing",
        description: "Record mood, presentation and wellbeing indicators.",
      },
      {
        label: "Behaviour Observation",
        entryType: "Behaviour Observation",
        description: "Record behaviour, presentation, support provided and outcome.",
      },
      {
        label: "Sleep Check",
        entryType: "Sleep",
        description: "Record sleep observations or checks.",
      },
    ],
  },
  {
    id: "care",
    title: "Care",
    colour: "bg-sky-200 text-sky-950",
    options: [
      {
        label: "Personal Care",
        entryType: "Personal Care",
        description: "Record personal care support.",
      },
      {
        label: "Toileting",
        entryType: "Toileting",
        description: "Record toileting support.",
      },
      {
        label: "Continence Care",
        entryType: "Toileting",
        description: "Record continence care or pad changes.",
      },
      {
        label: "Nutrition & Hydration",
        entryType: "Nutrition & Hydration",
        description: "Record food, fluids or mealtime support.",
      },
      {
        label: "Environment Check",
        entryType: "Environment Check",
        description: "Record room, safety or environment checks.",
      },
    ],
  },
  {
    id: "incident",
    title: "Incident",
    colour: "bg-rose-200 text-rose-950",
    options: [
      {
        label: "Accident / Injury",
        entryType: "Incident",
        description: "Record an accident or injury using incident format.",
      },
      {
        label: "Body Map",
        entryType: "Body Map",
         description: "Record injuries, marks, bruising or other observations using a body map."
      },
      {
        label: "Behaviour Incident",
        entryType: "Behaviour Incident",
        description: "Record a behaviour incident requiring incident review.",
      },
      {
        label: "Safeguarding Concern",
        entryType: "Incident",
        description: "Record a safeguarding concern.",
      },
      {
        label: "Medication Error",
        entryType: "Incident",
        description: "Record a medication error.",
      },
      {
        label: "Near Miss",
        entryType: "Incident",
        description: "Record a near miss or avoided incident.",
      },
    ],
  },
];
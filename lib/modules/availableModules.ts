export type ModuleKey =
  | "medication"
  | "personal_care"
  | "food_drink"
  | "incidents"
  | "wellbeing"
  | "behaviour"
  | "body_maps"
  | "abc_charts";

export const availableModules: {
  key: ModuleKey;
  label: string;
  description: string;
}[] = [
{
    key: "medication",
    label: "Medication",
    description: "Medication profiles, administration and eMAR records.",
  },
  {
    key: "personal_care",
    label: "Personal Care",
    description: "Personal care recording and support notes.",
  },
  {
    key: "food_drink",
    label: "Food & Drink",
    description: "Food, fluid and nutrition-related recording.",
  },
  {
    key: "incidents",
    label: "Incidents",
    description: "Incident recording, review and reporting.",
  },
  {
    key: "wellbeing",
    label: "Wellbeing",
    description: "Mood, wellbeing and observation-based care records.",
  },
  {
    key: "behaviour",
    label: "Behaviour",
    description: "Behaviour monitoring and pattern tracking.",
  },
  {
    key: "body_maps",
    label: "Body Maps",
    description: "Digital body maps for marks, injuries and observations.",
  },
  {
    key: "abc_charts",
    label: "ABC Charts",
    description: "Antecedent, behaviour and consequence recording.",
  },
];
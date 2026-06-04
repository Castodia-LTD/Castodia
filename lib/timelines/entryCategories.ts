export type EntryCategory = {
  id: string;
  title: string;
  description: string;
  colour: string;
  options: string[];
};

export const entryCategories: EntryCategory[] = [
  {
    id: "activities",
    title: "Activities",
    description: "Activities, engagement and community access.",
    colour: "bg-purple-200 text-purple-950",
    options: ["Activity"],
  },
  {
    id: "health",
    title: "Health",
    description: "Medication, appointments and health observations.",
    colour: "bg-orange-200 text-orange-950",
    options: ["Medication"],
  },
  {
    id: "mood",
    title: "Mood & Wellbeing",
    description: "Wellbeing, presentation and support opportunities.",
    colour: "bg-green-200 text-green-950",
    options: ["Wellbeing"],
  },
  {
    id: "care",
    title: "Care",
    description: "Personal care, toileting and sleep.",
    colour: "bg-sky-200 text-sky-950",
    options: ["Personal Care", "Toileting", "Sleep"],
  },
  {
    id: "incident",
    title: "Incident",
    description: "Incidents, concerns and significant events.",
    colour: "bg-rose-200 text-rose-950",
    options: ["Incident"],
  },
];
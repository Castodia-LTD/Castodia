import type {
  DemoScenario,
  DemoScenarioContext,
} from "./types";

function name(
  context: DemoScenarioContext,
) {
  return context.firstName || context.fullName;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: "morning-personal-care",
    category: "personal-care",
    tone: "neutral",
    entryType: "Personal Care",
    weight: 8,
    timeWindow: "morning",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} was supported with their morning personal care routine. Support was provided in line with their care plan and preferences.`,
  },

  {
    id: "independent-personal-care",
    category: "personal-care",
    tone: "positive",
    entryType: "Personal Care",
    weight: 4,
    timeWindow: "morning",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} completed most of their personal care independently today, with staff available for support where needed.`,
  },

  {
    id: "breakfast-good-intake",
    category: "nutrition",
    tone: "positive",
    entryType: "Nutrition & Hydration",
    weight: 7,
    timeWindow: "morning",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} ate breakfast well and appeared to enjoy the meal. No concerns were noted with appetite.`,
  },

  {
    id: "lunch-good-intake",
    category: "nutrition",
    tone: "positive",
    entryType: "Nutrition & Hydration",
    weight: 6,
    timeWindow: "afternoon",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} ate lunch well and had a good appetite. Fluids were offered throughout the meal.`,
  },

  {
    id: "reduced-appetite",
    category: "nutrition",
    tone: "concern",
    entryType: "Nutrition & Hydration",
    weight: 2,
    probability: 0.35,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} had a reduced appetite today and ate less than usual. Staff offered alternatives and continued to monitor food and fluid intake.`,
  },

  {
    id: "good-fluid-intake",
    category: "hydration",
    tone: "positive",
    entryType: "Nutrition & Hydration",
    weight: 6,
    timeWindow: "any",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} maintained good fluid intake today and accepted drinks regularly when offered.`,
  },

  {
    id: "gardening-activity",
    category: "activity",
    tone: "positive",
    entryType: "Activity",
    weight: 4,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} spent time gardening this afternoon and appeared relaxed and engaged throughout the activity.`,
  },

  {
    id: "music-activity",
    category: "activity",
    tone: "positive",
    entryType: "Activity",
    weight: 4,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} enjoyed listening to music with staff and was observed smiling and singing along to familiar songs.`,
  },

  {
    id: "arts-and-crafts",
    category: "activity",
    tone: "positive",
    entryType: "Activity",
    weight: 3,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} took part in an arts and crafts activity and remained engaged throughout. They appeared pleased with what they created.`,
  },

  {
    id: "community-walk",
    category: "community",
    tone: "positive",
    entryType: "Activity",
    weight: 4,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} went for a walk in the local community with staff support. They appeared to enjoy being outside and returned in a positive mood.`,
  },

  {
    id: "cafe-visit",
    category: "community",
    tone: "positive",
    entryType: "Activity",
    weight: 3,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} visited a local café with staff and enjoyed choosing a drink and snack. The outing was positive and relaxed.`,
  },

  {
    id: "family-visit",
    category: "family",
    tone: "positive",
    entryType: "General",
    weight: 3,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} had a family visit today. They appeared pleased to see their relative and spent time talking together.`,
  },

  {
    id: "family-phone-call",
    category: "family",
    tone: "positive",
    entryType: "General",
    weight: 3,
    timeWindow: "evening",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} had a telephone call with family this evening and appeared happy following the conversation.`,
  },

  {
    id: "settled-wellbeing",
    category: "wellbeing",
    tone: "positive",
    entryType: "Wellbeing Observation",
    weight: 6,
    timeWindow: "any",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} appeared settled and comfortable during this observation. They engaged positively with staff and showed no signs of distress.`,
  },

  {
    id: "quiet-day",
    category: "wellbeing",
    tone: "neutral",
    entryType: "Wellbeing Observation",
    weight: 3,
    timeWindow: "any",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} chose to spend some quiet time independently today. Staff remained available and respected their preference for space.`,
  },

  {
    id: "mildly-unsettled",
    category: "wellbeing",
    tone: "concern",
    entryType: "Wellbeing Observation",
    weight: 2,
    probability: 0.3,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} appeared slightly unsettled for a period today. Staff offered reassurance and support, after which they appeared more settled.`,
  },

  {
    id: "settled-night",
    category: "sleep",
    tone: "positive",
    entryType: "General",
    weight: 7,
    timeWindow: "overnight",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} had a settled night with no significant concerns noted. Routine checks were completed as required.`,
  },

  {
    id: "woke-during-night",
    category: "sleep",
    tone: "neutral",
    entryType: "General",
    weight: 2,
    probability: 0.35,
    timeWindow: "overnight",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} woke during the night and spent a short period awake before settling again with staff reassurance.`,
  },

  {
    id: "medication-taken",
    category: "medication",
    tone: "neutral",
    entryType: "Medication",
    weight: 5,
    timeWindow: "any",
    includeInHandover: false,

    generateContent: (context) =>
      `${name(
        context,
      )} accepted their prescribed medication as planned. No immediate concerns were noted.`,
  },

  {
    id: "medication-refused",
    category: "medication",
    tone: "concern",
    entryType: "Medication Refusal",
    weight: 1,
    probability: 0.18,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} declined prescribed medication when offered. Staff provided appropriate information, respected the decision and recorded the refusal in line with the medication plan.`,
  },

  {
    id: "positive-behaviour",
    category: "behaviour",
    tone: "positive",
    entryType: "Behaviour Observation",
    weight: 4,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} engaged positively with staff and others today. Communication was calm and interactions were appropriate throughout.`,
  },

  {
    id: "brief-distress",
    category: "behaviour",
    tone: "concern",
    entryType: "Behaviour Incident",
    weight: 1,
    probability: 0.15,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} became briefly distressed today. Staff reduced demands, offered reassurance and allowed time and space. They later appeared calmer and re-engaged.`,
  },

  {
    id: "minor-fall",
    category: "fall",
    tone: "concern",
    entryType: "Fall",
    weight: 1,
    probability: 0.08,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} experienced a fall today. Staff responded immediately, completed an initial assessment and continued monitoring in line with the person's care plan and local procedures.`,
  },

  {
    id: "minor-bruise",
    category: "injury",
    tone: "concern",
    entryType: "Accident / Injury",
    weight: 1,
    probability: 0.1,
    timeWindow: "any",
    includeInHandover: true,

    generateContent: (context) =>
      `A small area of bruising was observed on ${name(
        context,
      )}. The area was recorded and monitoring was commenced. No immediate change in presentation was noted.`,
  },

  {
    id: "health-appointment",
    category: "appointment",
    tone: "neutral",
    entryType: "Health Appointment",
    weight: 2,
    probability: 0.25,
    timeWindow: "afternoon",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} attended a planned health appointment today with staff support. Relevant information was shared and any advice received was recorded for follow-up.`,
  },

  {
    id: "general-positive-day",
    category: "general",
    tone: "positive",
    entryType: "General",
    weight: 4,
    timeWindow: "evening",
    includeInHandover: true,

    generateContent: (context) =>
      `${name(
        context,
      )} had a positive day overall. They engaged well with their usual routine and appeared comfortable and settled.`,
  },
];

export function getEligibleScenarios(
  timeWindow: DemoScenario["timeWindow"],
) {
  return demoScenarios.filter((scenario) => {
    if (
      scenario.timeWindow === "any" ||
      scenario.timeWindow === undefined
    ) {
      return true;
    }

    return scenario.timeWindow === timeWindow;
  });
}
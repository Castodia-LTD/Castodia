export const CARE_PLAN_SECTION_KEYS = [
  "about_me",
  "personal_outcomes",
  "communication",
  "capacity_decision_making",
  "medical_conditions",
  "medication",
  "allergies_clinical_alerts",
  "mobility",
  "personal_care",
  "continence",
  "nutrition_hydration",
  "swallowing_dysphagia",
  "skin_integrity",
  "sleep_rest",
  "behaviour_emotional_wellbeing",
  "mental_health",
  "sensory_needs",
  "daily_living_skills",
  "social_activities_community",
  "communication_with_family",
  "sexuality_relationships",
  "spiritual_cultural_needs",
  "safety_risk_management",
  "safeguarding",
  "positive_risk_taking",
  "end_of_life_advance_care",
] as const;

export type CarePlanSectionKey =
  (typeof CARE_PLAN_SECTION_KEYS)[number];

export type CarePlanSectionDefinition = {
  key: CarePlanSectionKey;
  title: string;
  placeholder: string;
  displayOrder: number;
};

export const CARE_PLAN_SECTIONS: readonly CarePlanSectionDefinition[] = [
  {
    key: "about_me",
    title: "About Me / Personal Profile",
    placeholder:
      "Describe the person's preferred name, communication style, likes and dislikes, life history, culture, religion and important relationships.",
    displayOrder: 1,
  },
  {
    key: "personal_outcomes",
    title: "Personal Outcomes & Goals",
    placeholder:
      "Describe what the person wants to achieve and what good support looks like to them.",
    displayOrder: 2,
  },
  {
    key: "communication",
    title: "Communication",
    placeholder:
      "Describe how the person communicates, their preferred methods, any sensory impairments, communication aids and interpreter requirements.",
    displayOrder: 3,
  },
  {
    key: "capacity_decision_making",
    title: "Capacity & Decision Making",
    placeholder:
      "Describe relevant Mental Capacity Act assessments, consent arrangements, supported decision-making, best-interests decisions, Lasting Power of Attorney or deputy arrangements.",
    displayOrder: 4,
  },
  {
    key: "medical_conditions",
    title: "Medical Conditions",
    placeholder:
      "Describe the person's diagnoses, chronic conditions, relevant medical history, how each condition affects them and any important health guidance.",
    displayOrder: 5,
  },
  {
    key: "medication",
    title: "Medication",
    placeholder:
      "Describe the person's medication support needs, current medicines, known side effects, PRN protocols, administration preferences and any guidance staff must follow.",
    displayOrder: 6,
  },
  {
    key: "allergies_clinical_alerts",
    title: "Allergies & Clinical Alerts",
    placeholder:
      "Record known allergies and important clinical alerts such as DNACPR, epilepsy, diabetes, aspiration risk or other information staff need to know immediately.",
    displayOrder: 7,
  },
  {
    key: "mobility",
    title: "Mobility",
    placeholder:
      "Describe the person's walking ability, transfers, equipment, level of assistance, falls risks and any physiotherapy or moving-and-handling guidance.",
    displayOrder: 8,
  },
  {
    key: "personal_care",
    title: "Personal Care",
    placeholder:
      "Describe the person's support needs and preferences for washing, bathing, dressing, grooming, oral care, shaving and maintaining their preferred appearance.",
    displayOrder: 9,
  },
  {
    key: "continence",
    title: "Continence",
    placeholder:
      "Describe the person's bladder and bowel support needs, toileting routine, continence products, catheter or stoma care, preferences and monitoring requirements.",
    displayOrder: 10,
  },
  {
    key: "nutrition_hydration",
    title: "Nutrition & Hydration",
    placeholder:
      "Describe the person's diet, preferences, allergies, texture requirements, MUST score, fluid targets, level of assistance and any monitoring or escalation guidance.",
    displayOrder: 11,
  },
  {
    key: "swallowing_dysphagia",
    title: "Swallowing (Dysphagia)",
    placeholder:
      "Describe any swallowing difficulties, SALT guidance, required food textures, fluid consistency, positioning, supervision and aspiration precautions.",
    displayOrder: 12,
  },
  {
    key: "skin_integrity",
    title: "Skin Integrity",
    placeholder:
      "Describe the person's skin condition, pressure-care needs, Waterlow score, repositioning schedule, equipment, wound care and escalation requirements.",
    displayOrder: 13,
  },
  {
    key: "sleep_rest",
    title: "Sleep & Rest",
    placeholder:
      "Describe the person's usual sleep routine, preferences, overnight support, observations, repositioning needs, risks and what helps them settle.",
    displayOrder: 14,
  },
  {
    key: "behaviour_emotional_wellbeing",
    title: "Behaviour & Emotional Wellbeing (PBS)",
    placeholder:
      "Describe behaviours or signs of distress, what the person may be communicating, known triggers, preventative support, de-escalation strategies and any Positive Behaviour Support plan.",
    displayOrder: 15,
  },
  {
    key: "mental_health",
    title: "Mental Health",
    placeholder:
      "Describe relevant diagnoses, the person's usual presentation, relapse indicators, coping strategies, professional involvement, crisis guidance and escalation arrangements.",
    displayOrder: 16,
  },
  {
    key: "sensory_needs",
    title: "Sensory Needs",
    placeholder:
      "Describe the person's vision, hearing, sensory-processing needs, aids, equipment, environmental preferences and how staff should adapt their support.",
    displayOrder: 17,
  },
  {
    key: "daily_living_skills",
    title: "Daily Living Skills",
    placeholder:
      "Describe the person's independence and support needs with cooking, cleaning, shopping, laundry, finances, household tasks and other daily living activities.",
    displayOrder: 18,
  },
  {
    key: "social_activities_community",
    title: "Social Activities & Community",
    placeholder:
      "Describe the person's hobbies, interests, education, employment, volunteering, community access, friendships and support needed to participate.",
    displayOrder: 19,
  },
  {
    key: "communication_with_family",
    title: "Communication with Family",
    placeholder:
      "Describe important family members and other key people, visiting preferences, contact arrangements, agreed information sharing and how relationships should be supported.",
    displayOrder: 20,
  },
  {
    key: "sexuality_relationships",
    title: "Sexuality & Relationships",
    placeholder:
      "Where relevant, describe the person's wishes, preferences and support needs concerning relationships, sexuality, intimacy, privacy, consent and personal identity.",
    displayOrder: 21,
  },
  {
    key: "spiritual_cultural_needs",
    title: "Spiritual & Cultural Needs",
    placeholder:
      "Describe the person's cultural identity, religion or beliefs, observance, dietary requirements, celebrations, customs and how staff should support these respectfully.",
    displayOrder: 22,
  },
  {
    key: "safety_risk_management",
    title: "Safety & Risk Management",
    placeholder:
      "Describe the person's individual risks, agreed control measures, equipment, supervision, emergency guidance and any linked risk assessments staff must follow.",
    displayOrder: 23,
  },
  {
    key: "safeguarding",
    title: "Safeguarding",
    placeholder:
      "Describe known safeguarding risks, protection arrangements, relevant warning signs, reporting requirements and any person-specific guidance staff must follow.",
    displayOrder: 24,
  },
  {
    key: "positive_risk_taking",
    title: "Positive Risk Taking",
    placeholder:
      "Describe the choices and activities that are important to the person, the benefits involved, agreed acceptable risks and the least-restrictive measures supporting independence.",
    displayOrder: 25,
  },
  {
    key: "end_of_life_advance_care",
    title: "End of Life / Advance Care Planning",
    placeholder:
      "Describe the person's wishes, advance decisions, DNACPR arrangements, preferred place of care, people to involve, cultural or spiritual preferences and relevant professional plans.",
    displayOrder: 26,
  },
 
] as const;

export const CARE_PLAN_SECTION_BY_KEY = new Map<
  CarePlanSectionKey,
  CarePlanSectionDefinition
>(CARE_PLAN_SECTIONS.map((section) => [section.key, section]));

export function isCarePlanSectionKey(
  value: string,
): value is CarePlanSectionKey {
  return CARE_PLAN_SECTION_KEYS.includes(value as CarePlanSectionKey);
}

export function getCarePlanSectionDefinition(
  key: CarePlanSectionKey,
): CarePlanSectionDefinition {
  const definition = CARE_PLAN_SECTION_BY_KEY.get(key);

  if (!definition) {
    throw new Error(`Unknown care plan section key: ${key}`);
  }

  return definition;
}
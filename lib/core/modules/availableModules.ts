export type ModuleGroup =
  | "Care platform"
  | "Manager tools"
  | "Support workflows"
  | "Person hub"
  | "Daily recording"
  | "Family";

export type ModuleKey =
  | "people"
  | "staff"
  | "insights"
  | "calendar"
  | "rota"
  | "timelines"
  | "handovers"
  | "medication"
  | "safeguarding"
  | "compliance"
  | "incidents"
  | "reports"
  | "growth"
  | "care_plans"
  | "risk_assessments"
  | "memories"
  | "mental_capacity"
  | "reviews"
  | "wellbeing_indicators"
  | "personal_care"
  | "food_drink"
  | "wellbeing"
  | "behaviour"
  | "body_maps"
  | "abc_charts"
  | "family_portal"
  | "family_growth";

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  description: string;
  group: ModuleGroup;
  defaultEnabled: boolean;
};

export const availableModules: ModuleDefinition[] = [
  { key: "people", label: "People", description: "Person records and the shared Person Hub.", group: "Care platform", defaultEnabled: true },
  { key: "staff", label: "Staff", description: "Staff records, access and workforce management.", group: "Care platform", defaultEnabled: true },
  { key: "insights", label: "Insights", description: "Manager governance, service readiness and operational insights.", group: "Manager tools", defaultEnabled: true },
  { key: "calendar", label: "Calendar", description: "Manager calendar and scheduled activity.", group: "Manager tools", defaultEnabled: true },
  { key: "rota", label: "Rotas", description: "Client rotas, shift assignments and individual staff rotas.", group: "Care platform", defaultEnabled: true },
  { key: "timelines", label: "Timelines", description: "Everyday support recording and authoritative timeline evidence.", group: "Support workflows", defaultEnabled: true },
  { key: "handovers", label: "Handovers", description: "Shift handovers and read tracking.", group: "Support workflows", defaultEnabled: true },
  { key: "medication", label: "Medication & eMAR", description: "Medication profiles, administration and eMAR records.", group: "Care platform", defaultEnabled: true },
  { key: "safeguarding", label: "Safeguarding", description: "Safeguarding reports, cases, actions and oversight.", group: "Care platform", defaultEnabled: true },
  { key: "compliance", label: "Compliance", description: "Manager compliance and service-readiness workflows.", group: "Manager tools", defaultEnabled: true },
  { key: "incidents", label: "Incidents", description: "Incident recording, review and reporting.", group: "Care platform", defaultEnabled: true },
  { key: "reports", label: "Reports", description: "Manager reporting and reporting workflows.", group: "Manager tools", defaultEnabled: true },
  { key: "growth", label: "Growth", description: "Person-centred goals, progress, evidence and monthly check-ins.", group: "Person hub", defaultEnabled: true },
  { key: "care_plans", label: "Care Plans", description: "Care plans within the Person Hub.", group: "Person hub", defaultEnabled: true },
  { key: "risk_assessments", label: "Risk Register", description: "Risk assessments and risk management within the Person Hub.", group: "Person hub", defaultEnabled: true },
  { key: "memories", label: "Memories", description: "Person memories and shared memory content.", group: "Person hub", defaultEnabled: true },
  { key: "mental_capacity", label: "Mental Capacity", description: "Mental Capacity Act assessments and related records.", group: "Person hub", defaultEnabled: true },
  { key: "reviews", label: "Reviews", description: "Person reviews and monthly review workflows.", group: "Person hub", defaultEnabled: true },
  { key: "wellbeing_indicators", label: "Wellbeing Indicators", description: "Manager-configured wellbeing indicators.", group: "Person hub", defaultEnabled: true },
  { key: "personal_care", label: "Personal Care", description: "Personal care recording and support notes.", group: "Daily recording", defaultEnabled: true },
  { key: "food_drink", label: "Food & Drink", description: "Food, fluid and nutrition-related recording.", group: "Daily recording", defaultEnabled: true },
  { key: "wellbeing", label: "Wellbeing", description: "Mood, wellbeing and observation-based care records.", group: "Daily recording", defaultEnabled: true },
  { key: "behaviour", label: "Behaviour", description: "Behaviour monitoring and pattern tracking.", group: "Daily recording", defaultEnabled: true },
  { key: "body_maps", label: "Body Maps", description: "Digital body maps for marks, injuries and observations.", group: "Daily recording", defaultEnabled: true },
  { key: "abc_charts", label: "ABC Charts", description: "Antecedent, behaviour and consequence recording.", group: "Daily recording", defaultEnabled: true },
  { key: "family_portal", label: "CastodiaFamily", description: "Family access to the family-facing experience.", group: "Family", defaultEnabled: true },
  { key: "family_growth", label: "Family Growth", description: "Family-facing view of shared Growth goals and milestones.", group: "Family", defaultEnabled: true },
];

export const moduleDefinitionByKey = new Map(
  availableModules.map((module) => [module.key, module]),
);

export function isModuleKey(value: unknown): value is ModuleKey {
  return typeof value === "string" && moduleDefinitionByKey.has(value as ModuleKey);
}

export function getDefaultModuleState(moduleKey: ModuleKey) {
  return moduleDefinitionByKey.get(moduleKey)?.defaultEnabled ?? true;
}

export const moduleGroups: ModuleGroup[] = [
  "Care platform",
  "Manager tools",
  "Support workflows",
  "Person hub",
  "Daily recording",
  "Family",
];

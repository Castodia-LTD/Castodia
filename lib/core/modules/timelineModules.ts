import type { ModuleKey } from "./availableModules";

const timelineOptionModuleRequirements: Record<string, ModuleKey[]> = {
  emar: ["medication"],
  wellbeing_observation: ["wellbeing"],
  behaviour_observation: ["behaviour"],
  personal_care: ["personal_care"],
  nutrition_hydration: ["food_drink"],
  accident_fall_injury: ["incidents"],
  body_map: ["incidents", "body_maps"],
  behaviour_incident: ["incidents", "behaviour"],
  medication_error: ["incidents", "medication"],
  near_miss: ["incidents"],
};

export function modulesForTimelineOption(optionKey: string): ModuleKey[] {
  return timelineOptionModuleRequirements[optionKey] ?? [];
}

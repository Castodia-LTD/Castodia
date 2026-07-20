import type { SaveHandler } from "./save/types";

// Activities
import { saveActivity } from "./save/activities/saveActivity";
import { saveCommunityAccess } from "./save/activities/saveCommunityAccess";
import { saveSocialInteraction } from "./save/activities/saveSocialInteraction";
import { saveContactVisit } from "./save/activities/saveContactVisit";
import { saveShopping } from "./save/activities/saveShopping";
import { saveHouseholdTasks } from "./save/activities/saveHouseholdTasks";

// Care
import { saveNutritionHydration } from "./save/care/saveNutritionHydration";
import { saveEnvironmentCheck} from "./save/care/saveEnvironmentCheck";
import { savePersonalCare } from "./save/care/savePersonalCare";

// Health
import { saveHealthObservation } from "./save/health/saveHealthObservation";
import { saveSymptoms } from "./save/health/saveSymptoms";
import { saveHealthProfessional } from "./save/health/saveHealthProfessional";

// Wellbeing
import { saveBehaviourObservation } from "./save/wellbeing/saveBehaviourObservation";

// Incidents
import { saveBehaviourIncident } from "./save/incidents/saveBehaviourIncident";
import { saveBodyMap } from "./save/incidents/saveBodyMap";
import { saveAccidentFallInjury} from "./save/incidents/saveAccidentFallInjury";
import { saveMedicationError} from "./save/incidents/saveMedicationError";
import { saveNearMiss } from "./save/incidents/saveNearMiss";
export const saveRegistry: Record<string, SaveHandler> = {
  // Activities
  Activity: saveActivity,
  "Community Access": saveCommunityAccess,
  "Social Interaction": saveSocialInteraction,
  "Contact / Visit": saveContactVisit,
  Shopping: saveShopping,
  "Household Tasks": saveHouseholdTasks,

  // Care
  "Nutrition & Hydration": saveNutritionHydration,
  "Environment Check": saveEnvironmentCheck,
  "Personal Care": savePersonalCare,

  // Health
  "Health Observation": saveHealthObservation,
  Symptoms: saveSymptoms,
  "Health Professional": saveHealthProfessional,

  // Wellbeing
  "Behaviour Observation": saveBehaviourObservation,

  // Incidents
  "Behaviour Incident": saveBehaviourIncident,
  "Body Map": saveBodyMap,
  "Accident / Fall / Injury": saveAccidentFallInjury,
  "Medication Error": saveMedicationError,
  "Near Miss": saveNearMiss,

};
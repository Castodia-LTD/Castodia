import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveHealthObservation(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.healthObservationData;

  if (!data?.sections || data.sections.length === 0) {
    alert("Please select what you are recording.");
    return false;
  }

  const actionsTaken = data.actionsTaken?.length
    ? data.actionsTaken
    : ["No Action Required"];

  const actionTaken = actionsTaken.some(
    (action: string) => action !== "No Action Required"
  );

  if (actionTaken && !data.notes?.trim()) {
    alert("Please add notes when action has been taken.");
    return false;
  }

  const sections: string[] = [];

  if (data.sections.includes("vital_signs")) {
    const vital = data.vitalSigns || {};

    const vitalLines = [
      vital.temperature !== null &&
      vital.temperature !== undefined
        ? `Temperature: ${vital.temperature}°C`
        : null,

      vital.bloodPressure
        ? `Blood Pressure: ${
            vital.bloodPressure.systolic ?? "?"
          } / ${
            vital.bloodPressure.diastolic ?? "?"
          } mmHg`
        : null,

      vital.pulse !== null &&
      vital.pulse !== undefined
        ? `Pulse: ${vital.pulse} bpm`
        : null,

      vital.respiratoryRate !== null &&
      vital.respiratoryRate !== undefined
        ? `Respiratory Rate: ${vital.respiratoryRate} breaths/min`
        : null,

      vital.oxygenSaturation !== null &&
      vital.oxygenSaturation !== undefined
        ? `Oxygen Saturation: ${vital.oxygenSaturation}%`
        : null,

      vital.painScore !== null &&
      vital.painScore !== undefined
        ? `Pain Score: ${vital.painScore}/10`
        : null,
    ].filter(Boolean);

    if (vitalLines.length === 0) {
      alert("Please enter at least one vital sign.");
      return false;
    }

    sections.push(
      `Vital Signs\n${vitalLines.join("\n")}`
    );
  }

  if (data.sections.includes("general_observation")) {
    const general = data.generalObservation || {};

    const generalLines = [
      general.appearance
        ? `Appearance: ${general.appearance}`
        : null,

      general.mood
        ? `Mood: ${general.mood}`
        : null,

      general.skinColour
        ? `Skin Colour: ${general.skinColour}`
        : null,

      general.breathing
        ? `Breathing: ${general.breathing}`
        : null,

      general.alertness
        ? `Alertness: ${general.alertness}`
        : null,
    ].filter(Boolean);

    if (generalLines.length === 0) {
      alert(
        "Please complete at least one general observation."
      );
      return false;
    }

    sections.push(
      `General Observation\n${generalLines.join("\n")}`
    );
  }

  if (data.sections.includes("weight")) {
    if (
      data.weight?.kg === null ||
      data.weight?.kg === undefined
    ) {
      alert("Please enter the weight.");
      return false;
    }

    sections.push(
      `Weight\nWeight: ${data.weight.kg}kg`
    );
  }

  if (data.sections.includes("blood_glucose")) {
    if (
      data.bloodGlucose?.value === null ||
      data.bloodGlucose?.value === undefined
    ) {
      alert("Please enter the blood glucose reading.");
      return false;
    }

    sections.push(`Blood Glucose
Reading: ${data.bloodGlucose.value} mmol/L
Timing: ${data.bloodGlucose.timing || "Not recorded"}`);
  }

  if (data.sections.includes("other")) {
    if (!data.other?.observation?.trim()) {
      alert("Please describe the other observation.");
      return false;
    }

    sections.push(`Other Observation
Observation: ${data.other.observation.trim()}
Value: ${data.other.value?.trim() || "Not recorded"}`);
  }

  const finalContent = `Health Observation

${sections.join("\n\n")}

Action Taken:
${actionsTaken.join(", ")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Health Observation",
    content: finalContent,
  });
}
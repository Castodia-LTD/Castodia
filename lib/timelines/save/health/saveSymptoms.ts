import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveSymptoms(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.symptomsData;

  if (!data?.selectedSymptoms || data.selectedSymptoms.length === 0) {
    alert("Please select at least one symptom.");
    return false;
  }

  if (!data.duration) {
    alert("Please select symptom duration.");
    return false;
  }

  const actionsTaken = data.actionsTaken?.length
    ? data.actionsTaken
    : ["No Action Required"];

  const actionTaken = actionsTaken.some(
    (action: string) => action !== "No Action Required"
  );

  const severeSymptom =
    data.details?.painSeverity === "Severe" ||
    data.details?.breathlessnessSeverity === "Severe";

  const otherSymptom = data.selectedSymptoms.includes("other");

  if (
    (actionTaken || severeSymptom || otherSymptom) &&
    !data.notes?.trim()
  ) {
    alert(
      "Please add notes for actions taken, severe symptoms, or other symptoms."
    );
    return false;
  }

  const lines: string[] = [];

  lines.push("Symptoms");
  lines.push("");
  lines.push("Symptoms Present:");

  data.selectedSymptoms.forEach((symptom: string) => {
    lines.push(`• ${formatSymptom(symptom)}`);
  });

  if (data.details?.temperatureType) {
    lines.push("");
    lines.push(`Temperature: ${data.details.temperatureType}`);
  }

  if (data.details?.coughType) {
    lines.push(`Cough: ${data.details.coughType}`);
  }

  if (data.details?.vomitingOccurrences) {
    lines.push(
      `Vomiting Occurrences: ${data.details.vomitingOccurrences}`
    );
  }

  if (data.details?.diarrhoeaOccurrences) {
    lines.push(
      `Diarrhoea Occurrences: ${data.details.diarrhoeaOccurrences}`
    );
  }

  if (
    data.details?.painLocation ||
    data.details?.painSeverity
  ) {
    lines.push(
      `Pain: ${data.details.painSeverity || "Not recorded"}`
    );

    lines.push(
      `Pain Location: ${data.details.painLocation || "Not recorded"}`
    );
  }

  if (data.details?.breathlessnessSeverity) {
    lines.push(
      `Shortness of Breath: ${data.details.breathlessnessSeverity}`
    );
  }

  if (data.details?.otherSymptom) {
    lines.push(
      `Other Symptom: ${data.details.otherSymptom}`
    );
  }

  lines.push("");
  lines.push("Duration:");
  lines.push(data.duration);

  lines.push("");
  lines.push("Action Taken:");
  lines.push(actionsTaken.join(", "));

  lines.push("");
  lines.push("Notes:");
  lines.push(data.notes?.trim() || "Not recorded");

  const finalContent = lines.join("\n");

  return saveTimelineEntry(ctx, {
    entryType: "Symptoms",
    content: finalContent,
  });
}

function formatSymptom(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveBehaviourObservation(
  ctx: SaveContext
): Promise<boolean> {
  if (!ctx.behaviourObserved || ctx.behaviourObserved.length === 0) {
    alert("Please select at least one behaviour observed.");
    return false;
  }

  if (!ctx.behaviourFrequency) {
    alert("Please select frequency.");
    return false;
  }

  if (!ctx.behaviourOutcome) {
    alert("Please select outcome.");
    return false;
  }

  const finalContent = `Behaviour Observation

Behaviour Observed:
${ctx.behaviourObserved.map((item) => `• ${item}`).join("\n")}

Frequency:
${ctx.behaviourFrequency}

Support Provided:
${
  ctx.behaviourSupportProvided?.length
    ? ctx.behaviourSupportProvided.map((item) => `• ${item}`).join("\n")
    : "Not recorded"
}

Outcome:
${ctx.behaviourOutcome}

Notes:
${ctx.behaviourNotes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Behaviour Observation",
    content: finalContent,
  });
}
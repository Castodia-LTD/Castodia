import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveBehaviourIncident(
  ctx: SaveContext
): Promise<boolean> {
  if (!ctx.behaviourIncidentTrigger.trim()) {
    alert("Please record what happened before.");
    return false;
  }

  if (ctx.behaviourIncidentTypes.length === 0) {
    alert("Please select at least one behaviour type.");
    return false;
  }

  if (!ctx.behaviourIncidentDescription.trim()) {
    alert("Please describe what happened.");
    return false;
  }

  if (ctx.behaviourIncidentSupport.length === 0) {
    alert("Please select support provided.");
    return false;
  }

  if (ctx.behaviourIncidentOutcomes.length === 0) {
    alert("Please select the immediate outcome.");
    return false;
  }

  const finalContent = `Behaviour Incident

What Happened Before:
${ctx.behaviourIncidentTrigger.trim()}

Behaviour Type:
${ctx.behaviourIncidentTypes.map((item) => `• ${item}`).join("\n")}

What Happened:
${ctx.behaviourIncidentDescription.trim()}

Support Provided:
${ctx.behaviourIncidentSupport.map((item) => `• ${item}`).join("\n")}

Immediate Outcome:
${ctx.behaviourIncidentOutcomes.map((item) => `• ${item}`).join("\n")}

Linked PRN Administration:
${ctx.linkedPrnAdministrationId || "Not linked"}

Additional Notes:
${ctx.behaviourIncidentNotes.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Behaviour Incident",
    content: finalContent,
    metadata: {
      trigger: ctx.behaviourIncidentTrigger.trim(),
      behaviourTypes: ctx.behaviourIncidentTypes,
      description: ctx.behaviourIncidentDescription.trim(),
      supportProvided: ctx.behaviourIncidentSupport,
      linkedPrnAdministrationId:
        ctx.linkedPrnAdministrationId || null,
      immediateOutcomes: ctx.behaviourIncidentOutcomes,
      notes: ctx.behaviourIncidentNotes.trim() || null,
    },
  });
}
import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveSocialInteraction(
  ctx: SaveContext
): Promise<boolean> {
  if (!ctx.activityPeople.trim()) {
    alert("Please enter who was involved.");
    return false;
  }

  if (!ctx.activityParticipation) {
    alert("Please select participation level.");
    return false;
  }

  if (!ctx.activityOutcome) {
    alert("Please select outcome.");
    return false;
  }

  const finalContent = `Social Interaction

Who Was Involved:
${ctx.activityPeople.trim()}

Type of Interaction:
${ctx.activityTitle.trim() || "Not recorded"}

Location:
${ctx.activityLocation.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation}

Outcome:
${ctx.activityOutcome}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Social Interaction",
    content: finalContent,
  });
}
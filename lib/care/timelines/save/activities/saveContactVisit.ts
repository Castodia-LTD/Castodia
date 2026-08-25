import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveContactVisit(
  ctx: SaveContext
): Promise<boolean> {
  if (!ctx.activityPeople.trim()) {
    alert("Please enter who was contacted.");
    return false;
  }

  const finalContent = `Contact / Visit

Person Contacted:
${ctx.activityPeople.trim()}

Relationship / Role:
${ctx.activityTitle.trim() || "Not recorded"}

Contact Method:
${ctx.activityLocation.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Contact / Visit",
    content: finalContent,
  });
}
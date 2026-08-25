import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveHouseholdTasks(
  ctx: SaveContext
): Promise<boolean> {
  const finalContent = `Household Tasks

Task Completed:
${ctx.activityTitle.trim() || "Not recorded"}

Area of Home:
${ctx.activityLocation.trim() || "Not recorded"}

Support Provided:
${ctx.activityPeople.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Household Tasks",
    content: finalContent,
  });
}
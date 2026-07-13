import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveActivity(ctx: SaveContext): Promise<boolean> {
  if (!ctx.activityTitle.trim()) {
    alert("Please enter what activity took place.");
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

  const finalContent = `Activity

Activity:
${ctx.activityTitle.trim()}

Location:
${ctx.activityLocation.trim() || "Not recorded"}

People Involved:
${ctx.activityPeople.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation}

Outcome:
${ctx.activityOutcome}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Activity",
    content: finalContent,
  });
}
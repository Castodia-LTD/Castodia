import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveShopping(
  ctx: SaveContext
): Promise<boolean> {
  const finalContent = `Shopping

Shop / Location:
${ctx.activityLocation.trim() || "Not recorded"}

Items Purchased:
${ctx.activityTitle.trim() || "Not recorded"}

Money Management Support:
${ctx.activityPeople.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Shopping",
    content: finalContent,
  });
}
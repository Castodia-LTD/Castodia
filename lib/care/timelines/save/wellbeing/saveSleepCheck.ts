import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveSleepCheck(
  ctx: SaveContext,
): Promise<boolean> {
  const sleepStatus = ctx.sleepStatus.trim();
  const sleepNotes = ctx.sleepNotes.trim();

  if (!sleepStatus) {
    alert("Please select whether the person appeared asleep or awake.");
    return false;
  }

  if (sleepStatus !== "Asleep" && sleepStatus !== "Awake") {
    alert("Please select a valid sleep status.");
    return false;
  }

  const initials = getInitials(ctx.serviceUserName);
  const observation =
    sleepStatus === "Asleep"
      ? `${initials} appeared asleep.`
      : `${initials} appeared awake.`;

  return saveTimelineEntry(ctx, {
    entryType: "Sleep",
    content: sleepNotes ? `${observation}\n\n${sleepNotes}` : observation,
    metadata: {
      status: sleepStatus,
      notes: sleepNotes || null,
    },
  });
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "Client";
}

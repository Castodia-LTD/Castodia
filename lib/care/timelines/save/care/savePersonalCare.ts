import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function savePersonalCare(
  ctx: SaveContext,
): Promise<boolean> {
  const data = ctx.personalCareData;

  if (!data?.careType) {
    alert("Please select the personal care completed.");
    return false;
  }

  const noCareCompleted =
    data.careType === "No personal care completed";

  if (!noCareCompleted && !data.assistanceLevel) {
    alert("Please select the level of assistance provided.");
    return false;
  }

  const notesRequired =
    noCareCompleted ||
    data.assistanceLevel === "Refused";

  if (notesRequired && !data.notes?.trim()) {
    alert(
      noCareCompleted
        ? "Please record why no personal care was completed."
        : "Please add notes when personal care is refused.",
    );

    return false;
  }

  const finalContent = `Personal Care

Care Completed:
${data.careType}

Assistance Level:
${noCareCompleted ? "Not applicable" : data.assistanceLevel}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Personal Care",
    content: finalContent,
    metadata: data,
  });
}
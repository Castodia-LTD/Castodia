import type { SaveHandler } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export const saveToileting: SaveHandler = async (ctx) => {
  const toiletingData = ctx.toiletingData;

  if (!toiletingData) {
    alert("Toileting information is missing.");
    return false;
  }

  const {
    toiletingOutcome,
    assistanceRequired,
    padChanged,
    bristolType,
    toiletingNotes,
  } = toiletingData;

  if (!toiletingOutcome.trim()) {
    alert("Please select a toileting outcome.");
    return false;
  }

  const passedBowel =
    toiletingOutcome === "Bowel movement" ||
    toiletingOutcome === "Both";

  const summaryParts: string[] = [
    `Outcome: ${toiletingOutcome}`,
  ];

  if (assistanceRequired.trim()) {
    summaryParts.push(`Assistance: ${assistanceRequired.trim()}`);
  }

  if (padChanged.trim()) {
    summaryParts.push(`Pad changed: ${padChanged.trim()}`);
  }

  if (passedBowel && bristolType.trim()) {
    summaryParts.push(`Bristol Stool Scale: Type ${bristolType.trim()}`);
  }

  if (toiletingNotes.trim()) {
    summaryParts.push(`Notes: ${toiletingNotes.trim()}`);
  }

  return saveTimelineEntry(ctx, {
    entryType: "Toileting",
    content: summaryParts.join("\n"),
    metadata: {
      outcome: toiletingOutcome,
      assistanceRequired: assistanceRequired.trim() || null,
      padChanged: padChanged.trim() || null,
      bristolType: passedBowel && bristolType.trim() ? bristolType.trim() : null,
      notes: toiletingNotes.trim() || null,
    },
  });
};

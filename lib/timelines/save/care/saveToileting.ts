import type { SaveHandler } from "../types";

export const saveToileting: SaveHandler = async ({
  supabase,
  serviceUserId,
  userId,
  eventTime,
  toiletingData,
  resetEntryPanel,
  setEntryPanelOpen,
  loadEntries,
}) => {
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
    summaryParts.push(
      `Assistance: ${assistanceRequired.trim()}`,
    );
  }

  if (padChanged.trim()) {
    summaryParts.push(
      `Pad changed: ${padChanged.trim()}`,
    );
  }

  if (passedBowel && bristolType.trim()) {
    summaryParts.push(
      `Bristol Stool Scale: Type ${bristolType.trim()}`,
    );
  }

  if (toiletingNotes.trim()) {
    summaryParts.push(
      `Notes: ${toiletingNotes.trim()}`,
    );
  }

  const content = summaryParts.join("\n");

  const { error } = await supabase
    .from("timeline_entries")
    .insert({
      service_user_id: serviceUserId,
      created_by: userId,
      entry_type: "Toileting",
      content,
      event_time: eventTime,
    });

  if (error) {
    console.error("Failed to save toileting entry:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    alert(
      error.message ||
        "The toileting entry could not be saved.",
    );

    return false;
  }

  resetEntryPanel();
  setEntryPanelOpen(false);
  await loadEntries();

  return true;
};
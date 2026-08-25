import type { SaveHandler } from "../types";

export const saveEnvironmentCheck: SaveHandler = async ({
  supabase,
  serviceUserId,
  userId,
  eventTime,
  environmentCheckData,
  resetEntryPanel,
  setEntryPanelOpen,
  loadEntries,
}) => {
  if (!environmentCheckData) {
    alert("Environment check information is missing.");
    return false;
  }

  const {
    temperature,
    cleanliness,
    hazardStatus,
    hazardType,
    otherHazardType,
    riskLevel,
    actionTaken,
    reportedTo,
    otherReportedTo,
    notes,
  } = environmentCheckData;

  if (!temperature?.trim()) {
    alert("Please record the current temperature.");
    return false;
  }

  if (!cleanliness?.trim()) {
    alert("Please select the cleanliness of the environment.");
    return false;
  }

  if (!hazardStatus) {
    alert("Please confirm whether any hazards were identified.");
    return false;
  }

  const hazardIdentified =
    hazardStatus === "hazard_identified";

  if (hazardIdentified) {
    if (!hazardType?.trim()) {
      alert("Please select the type of hazard identified.");
      return false;
    }

    if (
      hazardType === "Other" &&
      !otherHazardType?.trim()
    ) {
      alert("Please describe the hazard identified.");
      return false;
    }

    if (!riskLevel?.trim()) {
      alert("Please select the risk level.");
      return false;
    }

    if (!actionTaken?.trim()) {
      alert("Please record the action taken.");
      return false;
    }

    if (!reportedTo?.trim()) {
      alert("Please record who the hazard was reported to.");
      return false;
    }

    if (
      reportedTo === "Other" &&
      !otherReportedTo?.trim()
    ) {
      alert("Please record who the hazard was reported to.");
      return false;
    }
  }

  const cleanlinessConcern =
    cleanliness === "Requires Cleaning" ||
    cleanliness === "Unsanitary";

  if (cleanlinessConcern && !notes?.trim()) {
    alert(
      "Please record the cleaning action taken or relevant details.",
    );
    return false;
  }

  const summaryParts: string[] = [
    `Temperature: ${temperature.trim()}°C`,
    `Cleanliness: ${cleanliness}`,
    hazardIdentified
      ? "Hazards: Hazard identified"
      : "Hazards: No hazards identified",
  ];

  if (hazardIdentified) {
    const finalHazardType =
      hazardType === "Other"
        ? otherHazardType.trim()
        : hazardType;

    const finalReportedTo =
      reportedTo === "Other"
        ? otherReportedTo.trim()
        : reportedTo;

    summaryParts.push(
      `Hazard type: ${finalHazardType}`,
      `Risk level: ${riskLevel}`,
      `Action taken: ${actionTaken.trim()}`,
      `Reported to: ${finalReportedTo}`,
    );
  }

  if (notes?.trim()) {
    summaryParts.push(`Notes: ${notes.trim()}`);
  }

  const content = summaryParts.join("\n");

  const { error } = await supabase
    .from("timeline_entries")
    .insert({
      service_user_id: serviceUserId,
      created_by: userId,
      entry_type: "Environment Check",
      content,
      event_time: eventTime,
    });

  if (error) {
    console.error(
      "Failed to save environment check:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    alert(
      error.message ||
        "The environment check could not be saved.",
    );

    return false;
  }

  resetEntryPanel();
  setEntryPanelOpen(false);
  await loadEntries();

  return true;
};
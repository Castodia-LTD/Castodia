import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveEnvironmentCheck(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.environmentCheckData;

  if (!data) {
    alert("Please complete the Environment Check form.");
    return false;
  }

  if (!data.temperature?.trim()) {
    alert("Please enter the current temperature.");
    return false;
  }

  const temperature = Number(data.temperature);

  if (Number.isNaN(temperature)) {
    alert("Please enter a valid temperature.");
    return false;
  }

  if (!data.cleanliness) {
    alert("Please select how clean the environment is.");
    return false;
  }

  if (!data.hazardStatus) {
    alert("Please confirm whether any hazards were identified.");
    return false;
  }

  const hazardIdentified =
    data.hazardStatus === "hazard_identified";

  if (hazardIdentified) {
    if (!data.hazardType) {
      alert("Please select the hazard type.");
      return false;
    }

    if (
      data.hazardType === "Other" &&
      !data.otherHazardType?.trim()
    ) {
      alert("Please describe the hazard identified.");
      return false;
    }

    if (!data.riskLevel) {
      alert("Please select the risk level.");
      return false;
    }

    if (!data.actionTaken?.trim()) {
      alert("Please record the action taken.");
      return false;
    }

    if (!data.reportedTo) {
      alert("Please select who the hazard was reported to.");
      return false;
    }

    if (
      data.reportedTo === "Other" &&
      !data.otherReportedTo?.trim()
    ) {
      alert("Please record who the hazard was reported to.");
      return false;
    }
  }

  const cleanlinessConcern =
    data.cleanliness === "Requires Cleaning" ||
    data.cleanliness === "Unsanitary";

  if (cleanlinessConcern && !data.notes?.trim()) {
    alert(
      "Please add notes when the environment requires cleaning or is unsanitary."
    );
    return false;
  }

  const hazardType = hazardIdentified
    ? data.hazardType === "Other"
      ? data.otherHazardType.trim()
      : data.hazardType
    : "No hazards identified";

  const reportedTo = hazardIdentified
    ? data.reportedTo === "Other"
      ? data.otherReportedTo.trim()
      : data.reportedTo
    : "Not required";

  const finalContent = hazardIdentified
    ? `Environment Check

Temperature:
${temperature}°C

Cleanliness:
${data.cleanliness}

Hazards:
Hazard identified

Hazard Type:
${hazardType}

Risk Level:
${data.riskLevel}

Action Taken:
${data.actionTaken.trim()}

Reported To:
${reportedTo}

Notes:
${data.notes?.trim() || "Not recorded"}`
    : `Environment Check

Temperature:
${temperature}°C

Cleanliness:
${data.cleanliness}

Hazards:
No hazards identified

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Environment Check",
    content: finalContent,
    metadata: {
      temperature,
      cleanliness: data.cleanliness,
      hazardStatus: data.hazardStatus,
      hazardIdentified,
      hazardType: hazardIdentified ? hazardType : null,
      riskLevel: hazardIdentified ? data.riskLevel : null,
      actionTaken: hazardIdentified
        ? data.actionTaken.trim()
        : null,
      reportedTo: hazardIdentified ? reportedTo : null,
      notes: data.notes?.trim() || null,
    },
  });
}
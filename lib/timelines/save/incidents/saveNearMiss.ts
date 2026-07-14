import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveNearMiss(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.nearMissData;

  if (!data) {
    alert("Please complete the Near Miss form.");
    return false;
  }

  const nearMissType =
    data.nearMissType === "Other"
      ? data.otherNearMissType?.trim()
      : data.nearMissType;

  if (!nearMissType) {
    alert("Please select the near miss type.");
    return false;
  }

  if (!data.location?.trim()) {
    alert("Please enter the location.");
    return false;
  }

  if (!data.description?.trim()) {
    alert("Please describe what nearly happened.");
    return false;
  }

  if (!data.preventionDetails?.trim()) {
    alert("Please describe what prevented harm.");
    return false;
  }

  if (
    !data.peopleAtRisk ||
    data.peopleAtRisk.length === 0
  ) {
    alert("Please select who was at risk.");
    return false;
  }

  if (
    data.peopleAtRisk.includes("Other") &&
    !data.otherPersonAtRisk?.trim()
  ) {
    alert("Please describe the other person at risk.");
    return false;
  }

  if (!data.hazardStatus) {
    alert("Please select the current hazard status.");
    return false;
  }

  if (data.hazardStatus === "remains") {
    if (!data.riskLevel) {
      alert("Please select the current risk level.");
      return false;
    }

    if (!data.controlMeasures?.trim()) {
      alert("Please record the control measures.");
      return false;
    }
  }

  if (
    !data.immediateActions ||
    data.immediateActions.length === 0
  ) {
    alert("Please select the immediate actions taken.");
    return false;
  }

  if (
    data.immediateActions.includes("Other") &&
    !data.otherImmediateAction?.trim()
  ) {
    alert("Please describe the other immediate action.");
    return false;
  }

  if (
    !data.peopleInformed ||
    data.peopleInformed.length === 0
  ) {
    alert("Please record who was informed.");
    return false;
  }

  if (
    data.peopleInformed.includes("Other") &&
    !data.otherPersonInformed?.trim()
  ) {
    alert("Please describe who else was informed.");
    return false;
  }

  if (
    data.externalReportRequired === null ||
    data.externalReportRequired === undefined
  ) {
    alert("Please indicate whether external reporting is required.");
    return false;
  }

  if (
    data.externalReportRequired &&
    !data.externalReportDetails?.trim()
  ) {
    alert("Please record the external reporting details.");
    return false;
  }

  const peopleAtRisk = data.peopleAtRisk.map(
    (item: string) =>
      item === "Other"
        ? data.otherPersonAtRisk.trim()
        : item
  );

  const immediateActions = data.immediateActions.map(
    (item: string) =>
      item === "Other"
        ? data.otherImmediateAction.trim()
        : item
  );

  const peopleInformed = data.peopleInformed.map(
    (item: string) =>
      item === "Other"
        ? data.otherPersonInformed.trim()
        : item
  );

  const finalContent = `Near Miss

Near Miss Type:
${nearMissType}

Location:
${data.location.trim()}

What Nearly Happened:
${data.description.trim()}

What Prevented Harm:
${data.preventionDetails.trim()}

People At Risk:
${peopleAtRisk.map((item: string) => `• ${item}`).join("\n")}

Hazard Status:
${data.hazardStatus}

Risk Level:
${data.riskLevel || "Not applicable"}

Control Measures:
${data.controlMeasures?.trim() || "Not applicable"}

Immediate Actions:
${immediateActions.map((item: string) => `• ${item}`).join("\n")}

People Informed:
${peopleInformed.map((item: string) => `• ${item}`).join("\n")}

External Reporting Required:
${data.externalReportRequired ? "Yes" : "No"}

Reporting Details:
${
  data.externalReportRequired
    ? data.externalReportDetails.trim()
    : "Not required"
}

Reference Number:
${
  data.externalReference?.trim() || "Not recorded"
}

Follow-up Actions:
${
  data.followUpActions?.length
    ? data.followUpActions
        .map((item: string) => `• ${item}`)
        .join("\n")
    : "None recorded"
}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Near Miss",
    content: finalContent,
    metadata: {
      nearMissType,
      location: data.location.trim(),
      description: data.description.trim(),
      preventionDetails: data.preventionDetails.trim(),
      peopleAtRisk,
      hazardStatus: data.hazardStatus,
      riskLevel:
        data.hazardStatus === "remains"
          ? data.riskLevel
          : null,
      controlMeasures:
        data.hazardStatus === "remains"
          ? data.controlMeasures.trim()
          : null,
      immediateActions,
      peopleInformed,
      externalReportRequired:
        data.externalReportRequired,
      externalReportDetails:
        data.externalReportRequired
          ? data.externalReportDetails.trim()
          : null,
      externalReference:
        data.externalReference?.trim() || null,
      followUpActions:
        data.followUpActions || [],
      notes:
        data.notes?.trim() || null,
    },
  });
}
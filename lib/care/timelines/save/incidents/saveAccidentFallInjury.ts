import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveAccidentFallInjury(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.accidentFallInjuryData;

  if (!data) {
    alert("Please complete the Accident / Fall / Injury form.");
    return false;
  }

  const incidentType =
    data.incidentType === "Other"
      ? data.otherIncidentType?.trim()
      : data.incidentType;

  if (!incidentType) {
    alert("Please select the incident type.");
    return false;
  }

  if (!data.location?.trim()) {
    alert("Please enter the location.");
    return false;
  }

  if (!data.witnessedStatus) {
    alert("Please state whether the incident was witnessed.");
    return false;
  }

  if (
    (data.witnessedStatus === "no" ||
      data.witnessedStatus === "partially") &&
    !data.discoveryDetails?.trim()
  ) {
    alert("Please describe how the incident was discovered.");
    return false;
  }

  if (!data.description?.trim()) {
    alert("Please record what happened.");
    return false;
  }

  if (data.injurySustained === null) {
    alert("Please indicate whether an injury was sustained.");
    return false;
  }

  if (data.injurySustained) {
    if (data.injuryTypes.length === 0) {
      alert("Please select at least one injury type.");
      return false;
    }

    if (
      data.injuryTypes.includes("Other") &&
      !data.otherInjuryType?.trim()
    ) {
      alert("Please describe the injury.");
      return false;
    }

    if (!data.injurySeverity) {
      alert("Please select the injury severity.");
      return false;
    }
  }

  if (data.immediateActions.length === 0) {
    alert("Please record the immediate actions taken.");
    return false;
  }

  if (
    data.immediateActions.includes("Other") &&
    !data.otherImmediateAction?.trim()
  ) {
    alert("Please describe the other immediate action.");
    return false;
  }

  if (!data.outcome) {
    alert("Please select the outcome.");
    return false;
  }

  if (
    data.outcome === "Other" &&
    !data.otherOutcome?.trim()
  ) {
    alert("Please describe the outcome.");
    return false;
  }

  if (
    data.involvedAnotherPerson &&
    !data.otherPersonDetails?.trim()
  ) {
    alert("Please record the other person involved.");
    return false;
  }

  const injuryTypes = data.injuryTypes.map((item: string) =>
    item === "Other"
      ? data.otherInjuryType.trim()
      : item
  );

  const immediateActions = data.immediateActions.map(
    (item: string) =>
      item === "Other"
        ? data.otherImmediateAction.trim()
        : item
  );

  const outcome =
    data.outcome === "Other"
      ? data.otherOutcome.trim()
      : data.outcome;

  const finalContent = `Accident / Fall / Injury

Incident Type:
${incidentType}

Location:
${data.location.trim()}

Witnessed:
${data.witnessedStatus}

${
  data.witnessedStatus !== "yes"
    ? `How Discovered:
${data.discoveryDetails.trim()}

`
    : ""
}What Happened:
${data.description.trim()}

Injury Sustained:
${data.injurySustained ? "Yes" : "No"}

${
  data.injurySustained
    ? `Injury Type:
${injuryTypes.map((item: string) => `• ${item}`).join("\n")}

Severity:
${data.injurySeverity}

Linked Body Map:
${data.createLinkedBodyMap ? "Yes" : "No"}

`
    : ""
}Another Person Involved:
${data.involvedAnotherPerson ? "Yes" : "No"}

${
  data.involvedAnotherPerson
    ? `${data.otherPersonDetails.trim()}

`
    : ""
}Immediate Actions:
${immediateActions.map((item: string) => `• ${item}`).join("\n")}

Outcome:
${outcome}

Follow-up:
${
  data.followUpActions.length
    ? data.followUpActions.map((item: string) => `• ${item}`).join("\n")
    : "None"
}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Accident / Fall / Injury",
    content: finalContent,
    metadata: {
      incidentType,
      location: data.location.trim(),
      witnessedStatus: data.witnessedStatus,
      discoveryDetails:
        data.discoveryDetails?.trim() || null,
      description: data.description.trim(),
      injurySustained: data.injurySustained,
      injuryTypes: data.injurySustained
        ? injuryTypes
        : [],
      injurySeverity: data.injurySeverity || null,
      createLinkedBodyMap:
        data.createLinkedBodyMap,
      involvedAnotherPerson:
        data.involvedAnotherPerson,
      otherPersonDetails:
        data.otherPersonDetails?.trim() || null,
      immediateActions,
      outcome,
      followUpActions: data.followUpActions,
      notes: data.notes?.trim() || null,
    },
  });
}
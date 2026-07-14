import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveMedicationError(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.medicationErrorData;

  if (!data) {
    alert("Please complete the Medication Error form.");
    return false;
  }

  const errorType =
    data.errorType === "Other"
      ? data.otherErrorType?.trim()
      : data.errorType;

  if (!errorType) {
    alert("Please select the medication error type.");
    return false;
  }

  if (!data.medicationName?.trim()) {
    alert("Please enter the medication involved.");
    return false;
  }

  if (!data.description?.trim()) {
    alert("Please record what happened.");
    return false;
  }

  if (
    data.medicationAdministered === null ||
    data.medicationAdministered === undefined
  ) {
    alert("Please confirm whether the medication was administered.");
    return false;
  }

  if (
    data.medicationAdministered === true &&
    !data.administrationDetails?.trim()
  ) {
    alert("Please record the administration details.");
    return false;
  }

  if (!data.healthImpact) {
    alert("Please select the immediate health impact.");
    return false;
  }

  const impactDetailsRequired =
    data.healthImpact !== "No Apparent Harm";

  if (
    impactDetailsRequired &&
    !data.impactDetails?.trim()
  ) {
    alert("Please describe the health impact or concern.");
    return false;
  }

  if (
    !data.immediateActions ||
    data.immediateActions.length === 0
  ) {
    alert("Please select at least one immediate action.");
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
    alert("Please select who was informed.");
    return false;
  }

  if (
    data.peopleInformed.includes("Other") &&
    !data.otherPersonInformed?.trim()
  ) {
    alert("Please record who else was informed.");
    return false;
  }

  if (
    data.clinicalAdviceSought === null ||
    data.clinicalAdviceSought === undefined
  ) {
    alert("Please confirm whether clinical advice was sought.");
    return false;
  }

  if (data.clinicalAdviceSought === true) {
    if (!data.clinicalAdviceSource) {
      alert("Please select who provided clinical advice.");
      return false;
    }

    if (!data.adviceReceived?.trim()) {
      alert("Please record the clinical advice received.");
      return false;
    }
  }

  if (
    data.monitoringRequired === null ||
    data.monitoringRequired === undefined
  ) {
    alert("Please confirm whether monitoring is required.");
    return false;
  }

  if (
    data.monitoringRequired === true &&
    !data.monitoringInstructions?.trim()
  ) {
    alert("Please record the monitoring instructions.");
    return false;
  }

  const outcome =
    data.outcome === "Other"
      ? data.otherOutcome?.trim()
      : data.outcome;

  if (!outcome) {
    alert("Please select the immediate outcome.");
    return false;
  }

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

  const finalContent = `Medication Error

Error Type:
${errorType}

Medication:
${data.medicationName.trim()}

Prescribed Dose:
${data.prescribedDose?.trim() || "Not recorded"}

Dose Affected:
${data.doseAffected?.trim() || "Not recorded"}

Scheduled Time:
${data.scheduledTime || "Not recorded"}

Medication Administered:
${data.medicationAdministered ? "Yes" : "No"}

Administration Details:
${
  data.medicationAdministered
    ? data.administrationDetails.trim()
    : "Not applicable"
}

What Happened:
${data.description.trim()}

Immediate Health Impact:
${data.healthImpact}

Health Impact Details:
${data.impactDetails?.trim() || "Not recorded"}

Immediate Actions:
${immediateActions.map((item: string) => `• ${item}`).join("\n")}

People Informed:
${peopleInformed.map((item: string) => `• ${item}`).join("\n")}

Clinical Advice Sought:
${data.clinicalAdviceSought ? "Yes" : "No"}

Advice Source:
${
  data.clinicalAdviceSought
    ? data.clinicalAdviceSource
    : "Not required"
}

Advice Received:
${
  data.clinicalAdviceSought
    ? data.adviceReceived.trim()
    : "Not required"
}

Monitoring Required:
${data.monitoringRequired ? "Yes" : "No"}

Monitoring Instructions:
${
  data.monitoringRequired
    ? data.monitoringInstructions.trim()
    : "Not required"
}

Immediate Outcome:
${outcome}

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
    entryType: "Medication Error",
    content: finalContent,
    metadata: {
      errorType,
      medicationName: data.medicationName.trim(),
      prescribedDose: data.prescribedDose?.trim() || null,
      doseAffected: data.doseAffected?.trim() || null,
      scheduledTime: data.scheduledTime || null,
      medicationAdministered: data.medicationAdministered,
      administrationDetails:
        data.administrationDetails?.trim() || null,
      description: data.description.trim(),
      healthImpact: data.healthImpact,
      impactDetails: data.impactDetails?.trim() || null,
      immediateActions,
      peopleInformed,
      clinicalAdviceSought: data.clinicalAdviceSought,
      clinicalAdviceSource:
        data.clinicalAdviceSought
          ? data.clinicalAdviceSource
          : null,
      adviceReceived:
        data.clinicalAdviceSought
          ? data.adviceReceived.trim()
          : null,
      monitoringRequired: data.monitoringRequired,
      monitoringInstructions:
        data.monitoringRequired
          ? data.monitoringInstructions.trim()
          : null,
      outcome,
      followUpActions: data.followUpActions || [],
      notes: data.notes?.trim() || null,
    },
  });
}
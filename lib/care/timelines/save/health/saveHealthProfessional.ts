import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

export async function saveHealthProfessional(
  ctx: SaveContext
): Promise<boolean> {
  const data = ctx.healthProfessionalData;

  if (!data) {
    alert("Please complete the Health Professional form.");
    return false;
  }

  if (!data.contactUrgency) {
    alert("Please select the type of contact.");
    return false;
  }

  if (!data.professionalType) {
    alert("Please select the health professional involved.");
    return false;
  }

  if (
    data.professionalType === "Other" &&
    !data.otherProfessionalType?.trim()
  ) {
    alert("Please enter the professional type.");
    return false;
  }

  if (!data.contactMethod) {
    alert("Please select how the contact took place.");
    return false;
  }

  if (
    data.contactMethod === "Other" &&
    !data.otherContactMethod?.trim()
  ) {
    alert("Please describe how the contact took place.");
    return false;
  }

  if (!data.reason?.trim()) {
    alert("Please enter the reason for the contact or appointment.");
    return false;
  }

  if (!data.outcome?.trim()) {
    alert("Please record the advice, assessment or outcome.");
    return false;
  }

  if (
    !data.actionsRequired ||
    data.actionsRequired.length === 0
  ) {
    alert("Please select the actions required.");
    return false;
  }

  if (
    data.actionsRequired.includes("Other") &&
    !data.otherAction?.trim()
  ) {
    alert("Please describe the other action required.");
    return false;
  }

  if (
    data.followUpRequired === null ||
    data.followUpRequired === undefined
  ) {
    alert("Please confirm whether follow-up is required.");
    return false;
  }

  if (
    data.followUpRequired === true &&
    !data.followUpDate
  ) {
    alert("Please enter the follow-up date.");
    return false;
  }

  if (
    !data.documentsReceived ||
    data.documentsReceived.length === 0
  ) {
    alert("Please select whether documents were received.");
    return false;
  }

  if (
    data.documentsReceived.includes("Other") &&
    !data.otherDocument?.trim()
  ) {
    alert("Please describe the document received.");
    return false;
  }

  const professional =
    data.professionalType === "Other"
      ? data.otherProfessionalType.trim()
      : data.professionalType;

  const contactMethod =
    data.contactMethod === "Other"
      ? data.otherContactMethod.trim()
      : data.contactMethod;

  const actions = data.actionsRequired.map(
    (action: string) =>
      action === "Other"
        ? data.otherAction.trim()
        : action
  );

  const documents = data.documentsReceived.map(
    (document: string) =>
      document === "Other"
        ? data.otherDocument.trim()
        : document
  );

  const finalContent = `Health Professional

Contact Type:
${data.contactUrgency}

Professional:
${professional}

Professional Name:
${data.professionalName?.trim() || "Not recorded"}

Contact Method:
${contactMethod}

Reason for Contact or Appointment:
${data.reason.trim()}

Advice, Assessment or Outcome:
${data.outcome.trim()}

Actions Required:
${actions.map((action: string) => `• ${action}`).join("\n")}

Follow-up Required:
${data.followUpRequired ? "Yes" : "No"}

Follow-up Date:
${data.followUpRequired ? data.followUpDate : "Not required"}

Documents Received:
${documents.map((document: string) => `• ${document}`).join("\n")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  return saveTimelineEntry(ctx, {
    entryType: "Health Professional",
    content: finalContent,
  });
}
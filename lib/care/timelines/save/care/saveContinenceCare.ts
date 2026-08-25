import type { SaveContext } from "../types";

export async function saveContinenceCare(
  ctx: SaveContext,
): Promise<boolean> {
  const data = ctx.continenceCareData;

  if (!data) {
    alert("Continence care information is missing.");
    return false;
  }

  if (!data.careTypes?.length) {
    alert("Please select the continence care provided.");
    return false;
  }

  if (!data.assistanceLevel) {
    alert("Please select the level of assistance provided.");
    return false;
  }

  if (
    data.skinCondition &&
    data.skinCondition !== "Intact" &&
    !data.skinNotes?.trim()
  ) {
    alert("Please describe the skin concern.");
    return false;
  }

  const medicationIntervention =
    data.bowelIntervention === "Suppository" ||
    data.bowelIntervention === "Enema" ||
    data.bowelIntervention === "Other prescribed intervention";

  const initials = getInitials(ctx.serviceUserName);

  const summary = buildSummary(initials, data);

  const detailLines: string[] = [];

  detailLines.push(`Care provided: ${data.careTypes.join(", ")}`);
  detailLines.push(`Assistance: ${data.assistanceLevel}`);

  if (data.continenceProductStatus) {
    detailLines.push(
      `Continence product: ${data.continenceProductStatus}${
        data.continenceProductChanged === true
          ? " — changed"
          : data.continenceProductChanged === false
            ? " — not changed"
            : ""
      }`,
    );
  }

  if (data.urinePassed !== null) {
    detailLines.push(
      `Urine passed: ${data.urinePassed ? "Yes" : "No"}`,
    );
  }

  if (data.urinaryObservations?.length) {
    detailLines.push(
      `Urinary observations: ${data.urinaryObservations.join(", ")}`,
    );
  }

  if (data.urinaryNotes?.trim()) {
    detailLines.push(
      `Urinary notes: ${data.urinaryNotes.trim()}`,
    );
  }

  if (data.bowelOpened !== null) {
    detailLines.push(
      `Bowels opened: ${data.bowelOpened ? "Yes" : "No"}`,
    );
  }

  if (data.bristolType) {
    detailLines.push(`Bristol stool type: ${data.bristolType}`);
  }

  if (data.bowelAmount) {
    detailLines.push(`Bowel amount: ${data.bowelAmount}`);
  }

  if (data.bowelObservations?.length) {
    detailLines.push(
      `Bowel observations: ${data.bowelObservations.join(", ")}`,
    );
  }

  if (data.bowelNotes?.trim()) {
    detailLines.push(
      `Bowel notes: ${data.bowelNotes.trim()}`,
    );
  }

  if (data.catheterCareProvided !== null) {
    detailLines.push(
      `Catheter care provided: ${
        data.catheterCareProvided ? "Yes" : "No"
      }`,
    );
  }

  if (
    data.catheterOutputMl !== null &&
    data.catheterOutputMl !== undefined
  ) {
    detailLines.push(
      `Catheter output: ${data.catheterOutputMl} ml`,
    );
  }

  if (data.catheterObservations?.length) {
    detailLines.push(
      `Catheter observations: ${data.catheterObservations.join(", ")}`,
    );
  }

  if (data.stomaCareProvided !== null) {
    detailLines.push(
      `Stoma care provided: ${
        data.stomaCareProvided ? "Yes" : "No"
      }`,
    );
  }

  if (data.stomaObservations?.length) {
    detailLines.push(
      `Stoma observations: ${data.stomaObservations.join(", ")}`,
    );
  }

  if (data.bowelIntervention) {
    detailLines.push(
      `Bowel intervention: ${data.bowelIntervention}`,
    );
  }

  if (data.linkedMedicationAdministrationId?.trim()) {
    detailLines.push(
      `Linked medication administration: ${data.linkedMedicationAdministrationId.trim()}`,
    );
  }

  if (data.interventionOutcome) {
    detailLines.push(
      `Intervention outcome: ${data.interventionOutcome}`,
    );
  }

  if (data.skinCondition) {
    detailLines.push(
      `Skin condition: ${data.skinCondition}`,
    );
  }

  if (data.skinNotes?.trim()) {
    detailLines.push(
      `Skin observations: ${data.skinNotes.trim()}`,
    );
  }

  if (data.concerns?.length) {
    detailLines.push(
      `Concerns: ${data.concerns.join(", ")}`,
    );
  }

  if (data.escalation?.length) {
    detailLines.push(
      `Action / escalation: ${data.escalation.join(", ")}`,
    );
  }

  if (data.notes?.trim()) {
    detailLines.push(`Notes: ${data.notes.trim()}`);
  }

  if (
    medicationIntervention &&
    !data.linkedMedicationAdministrationId?.trim()
  ) {
    detailLines.push(
      "Medication administration record: Related medicinal bowel intervention should also be recorded through the medication workflow.",
    );
  }

  const content = [
    summary,
    "",
    ...detailLines,
  ].join("\n");

  const { error } = await ctx.supabase
    .from("timeline_entries")
    .insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Continence Care",
      content,
      event_time: ctx.eventTime,
    });

  if (error) {
    alert(error.message);
    return false;
  }

  ctx.resetEntryPanel();
  ctx.setEntryPanelOpen(false);
  await ctx.loadEntries();

  return true;
}

function buildSummary(
  initials: string,
  data: SaveContext["continenceCareData"],
) {
  if (!data) {
    return `${initials} received continence care.`;
  }

  const careSummary = data.careTypes.join(", ").toLowerCase();

  if (data.bowelOpened === true && data.urinePassed === true) {
    return `${initials} received continence care. Urine was passed and bowels were opened.`;
  }

  if (data.bowelOpened === true) {
    return `${initials} received continence care. Bowels were opened.`;
  }

  if (data.urinePassed === true) {
    return `${initials} received continence care. Urine was passed.`;
  }

  if (careSummary) {
    return `${initials} received continence care including ${careSummary}.`;
  }

  return `${initials} received continence care.`;
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
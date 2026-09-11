import type { SaveContext } from "../types";
import { saveTimelineEntry } from "../saveTimelineEntry";

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

  const hasProductCare = data.careTypes.includes("Continence product");
  const hasUrinaryCare =
    data.careTypes.includes("Toilet support") ||
    data.careTypes.includes("Commode") ||
    data.careTypes.includes("Bedpan / urinal");
  const hasBowelCare = data.careTypes.includes("Bowel care");
  const hasCatheterCare = data.careTypes.includes("Catheter care");
  const hasStomaCare = data.careTypes.includes("Stoma care");

  if (hasProductCare && !data.continenceProductStatus) {
    alert("Please record the continence product status.");
    return false;
  }

  if (
    hasProductCare &&
    data.continenceProductStatus !== "Dry" &&
    data.continenceProductChanged === null
  ) {
    alert("Please confirm whether the continence product was changed.");
    return false;
  }

  if (hasUrinaryCare && data.urinePassed === null) {
    alert("Please confirm whether urine was passed.");
    return false;
  }

  const urinaryConcern =
    data.urinaryObservations?.some((item) => item !== "No concerns") ?? false;

  if (hasUrinaryCare && data.urinePassed === true && urinaryConcern && !data.urinaryNotes?.trim()) {
    alert("Please add details for the urinary concern.");
    return false;
  }

  if (hasBowelCare && data.bowelOpened === null) {
    alert("Please confirm whether the bowels were opened.");
    return false;
  }

  if (hasBowelCare && data.bowelOpened === true && !data.bristolType) {
    alert("Please select the Bristol stool type.");
    return false;
  }

  if (hasBowelCare && data.bowelOpened === true && !data.bowelAmount) {
    alert("Please select the approximate bowel amount.");
    return false;
  }

  const bowelConcern =
    data.bowelObservations?.some((item) => item !== "No concerns") ?? false;

  if (hasBowelCare && data.bowelOpened === true && bowelConcern && !data.bowelNotes?.trim()) {
    alert("Please add details for the bowel concern.");
    return false;
  }

  if (hasBowelCare && !data.bowelIntervention) {
    alert("Please confirm whether a bowel intervention was provided.");
    return false;
  }

  const medicationIntervention =
    data.bowelIntervention === "Suppository" ||
    data.bowelIntervention === "Enema" ||
    data.bowelIntervention === "Other prescribed intervention";

  if (medicationIntervention && !data.interventionOutcome) {
    alert("Please record the bowel intervention outcome.");
    return false;
  }

  if (hasCatheterCare && data.catheterCareProvided === null) {
    alert("Please confirm whether catheter care was provided.");
    return false;
  }

  if (hasStomaCare && data.stomaCareProvided === null) {
    alert("Please confirm whether stoma care was provided.");
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
    detailLines.push(`Urine passed: ${data.urinePassed ? "Yes" : "No"}`);
  }

  if (data.urinaryObservations?.length) {
    detailLines.push(`Urinary observations: ${data.urinaryObservations.join(", ")}`);
  }

  if (data.urinaryNotes?.trim()) {
    detailLines.push(`Urinary notes: ${data.urinaryNotes.trim()}`);
  }

  if (data.bowelOpened !== null) {
    detailLines.push(`Bowels opened: ${data.bowelOpened ? "Yes" : "No"}`);
  }

  if (data.bristolType) detailLines.push(`Bristol stool type: ${data.bristolType}`);
  if (data.bowelAmount) detailLines.push(`Bowel amount: ${data.bowelAmount}`);

  if (data.bowelObservations?.length) {
    detailLines.push(`Bowel observations: ${data.bowelObservations.join(", ")}`);
  }

  if (data.bowelNotes?.trim()) {
    detailLines.push(`Bowel notes: ${data.bowelNotes.trim()}`);
  }

  if (data.catheterCareProvided !== null) {
    detailLines.push(
      `Catheter care provided: ${data.catheterCareProvided ? "Yes" : "No"}`,
    );
  }

  if (data.catheterOutputMl !== null && data.catheterOutputMl !== undefined) {
    detailLines.push(`Catheter output: ${data.catheterOutputMl} ml`);
  }

  if (data.catheterObservations?.length) {
    detailLines.push(`Catheter observations: ${data.catheterObservations.join(", ")}`);
  }

  if (data.stomaCareProvided !== null) {
    detailLines.push(`Stoma care provided: ${data.stomaCareProvided ? "Yes" : "No"}`);
  }

  if (data.stomaObservations?.length) {
    detailLines.push(`Stoma observations: ${data.stomaObservations.join(", ")}`);
  }

  if (data.bowelIntervention) {
    detailLines.push(`Bowel intervention: ${data.bowelIntervention}`);
  }

  if (data.linkedMedicationAdministrationId?.trim()) {
    detailLines.push(
      `Linked medication administration: ${data.linkedMedicationAdministrationId.trim()}`,
    );
  }

  if (data.interventionOutcome) {
    detailLines.push(`Intervention outcome: ${data.interventionOutcome}`);
  }

  if (data.skinCondition) detailLines.push(`Skin condition: ${data.skinCondition}`);
  if (data.skinNotes?.trim()) detailLines.push(`Skin observations: ${data.skinNotes.trim()}`);
  if (data.concerns?.length) detailLines.push(`Concerns: ${data.concerns.join(", ")}`);
  if (data.escalation?.length) detailLines.push(`Action / escalation: ${data.escalation.join(", ")}`);
  if (data.notes?.trim()) detailLines.push(`Notes: ${data.notes.trim()}`);

  if (medicationIntervention && !data.linkedMedicationAdministrationId?.trim()) {
    detailLines.push(
      "Medication administration record: Related medicinal bowel intervention should also be recorded through the medication workflow.",
    );
  }

  return saveTimelineEntry(ctx, {
    entryType: "Continence Care",
    content: [summary, "", ...detailLines].join("\n"),
    metadata: data,
  });
}

function buildSummary(
  initials: string,
  data: SaveContext["continenceCareData"],
) {
  if (!data) return `${initials} received continence care.`;

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

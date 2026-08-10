export function getTimelineSummary(
  entryType: string,
  content: string,
) {
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const fields = parseFields(lines);

  /* ------------------------------------------------------------------------ */
  /* Activities                                                               */
  /* ------------------------------------------------------------------------ */

  if (entryType === "Activity") {
    return joinSummary([
      getField(fields, "Activity"),
      getField(fields, "Location"),
      getField(fields, "Participation Level"),
      getField(fields, "Outcome"),
    ]);
  }

  if (entryType === "Community Access") {
    return joinSummary([
      getField(fields, "Destination"),
      getField(fields, "Purpose"),
      getField(fields, "Participation Level"),
      getField(fields, "Outcome"),
    ]);
  }

  if (entryType === "Social Interaction") {
    return joinSummary([
      getField(fields, "Person / People"),
      getField(fields, "Interaction Type"),
      getField(fields, "Participation Level"),
      getField(fields, "Outcome"),
    ]);
  }

  if (entryType === "Contact / Visit") {
    return joinSummary([
      getField(fields, "Person Contacted"),
      getField(fields, "Relationship"),
      getField(fields, "Contact Method"),
      getField(fields, "Outcome"),
    ]);
  }

  if (entryType === "Shopping") {
    return joinSummary([
      getField(fields, "Shop / Location"),
      getField(fields, "Items Purchased"),
      getField(fields, "Participation Level"),
      getField(fields, "Outcome"),
    ]);
  }

  if (entryType === "Household Tasks") {
    return joinSummary([
      getField(fields, "Task Completed"),
      getField(fields, "Area of Home"),
      getField(fields, "Participation Level"),
      getField(fields, "Outcome"),
    ]);
  }

  /* ------------------------------------------------------------------------ */
  /* Care                                                                     */
  /* ------------------------------------------------------------------------ */

  if (entryType === "Nutrition & Hydration") {
    const type = getField(fields, "Type");

    if (type === "Food") {
      return joinSummary([
        getField(fields, "Meal") || "Food",
        getField(fields, "Food"),
        getField(fields, "Amount Eaten"),
        formatConcerns(getField(fields, "Concerns")),
      ]);
    }

    if (type === "Drink") {
      return joinSummary([
        getField(fields, "Drink") || "Drink",
        getField(fields, "Amount"),
        formatConcerns(getField(fields, "Concerns")),
      ]);
    }

    return genericSummary(fields, lines);
  }

  if (entryType === "Personal Care") {
    return joinSummary([
      getField(fields, "Care Completed"),
      getField(fields, "Assistance Level"),
    ]);
  }

  if (entryType === "Toileting") {
    return joinSummary([
      getField(fields, "Outcome"),
      getField(fields, "Assistance Required"),
      getField(fields, "Bristol Type"),
    ]);
  }

  if (entryType === "Continence Care") {
    return joinSummary([
      getField(fields, "Care Type"),
      getField(fields, "Outcome"),
      getField(fields, "Assistance"),
    ]);
  }

  if (entryType === "Environment Check") {
    return joinSummary([
      labelled(
        "Cleanliness",
        getField(fields, "Cleanliness"),
      ),
      getField(fields, "Hazards"),
    ]);
  }

  /* ------------------------------------------------------------------------ */
  /* Health                                                                   */
  /* ------------------------------------------------------------------------ */

  if (entryType === "Health Observation") {
    return healthObservationSummary(fields);
  }

  if (entryType === "Symptoms") {
    return joinSummary([
      getField(fields, "Symptom"),
      getField(fields, "Severity"),
      getField(fields, "Action Taken"),
    ]);
  }

  if (entryType === "Health Professional") {
    return joinSummary([
      getField(fields, "Professional"),
      getField(fields, "Reason"),
      getField(fields, "Outcome"),
    ]);
  }

  /* ------------------------------------------------------------------------ */
  /* Wellbeing                                                                */
  /* ------------------------------------------------------------------------ */

  if (entryType === "Behaviour Observation") {
    return joinSummary([
      getField(fields, "Behaviour Observed"),
      getField(fields, "Frequency"),
      getField(fields, "Outcome"),
    ]);
  }

  if (entryType === "Sleep") {
    /*
     * New sleep entries are already saved as a natural sentence:
     * "BS appeared asleep."
     */
    const naturalLine = lines.find(
      (line) =>
        !line.endsWith(":") &&
        line !== "Sleep" &&
        !line.startsWith("Recorded"),
    );

    return naturalLine || "Sleep check recorded";
  }

  /* ------------------------------------------------------------------------ */
  /* Incidents                                                                */
  /* ------------------------------------------------------------------------ */

  if (entryType === "Body Map") {
    const markers = getField(
      fields,
      "Markers Recorded",
    );

    const count = markers || "0";

    return `${count} marker${
      count === "1" ? "" : "s"
    } recorded`;
  }

  if (entryType === "Behaviour Incident") {
    return joinSummary([
      getField(fields, "Behaviour Type"),
      getField(fields, "Immediate Outcome"),
    ]);
  }

  if (entryType === "Accident / Fall / Injury") {
    return joinSummary([
      getField(fields, "Incident Type"),
      getField(fields, "Injury"),
      getField(fields, "Action Taken"),
    ]);
  }

  if (entryType === "Medication Error") {
    return joinSummary([
      getField(fields, "Error Type"),
      getField(fields, "Medication"),
      getField(fields, "Action Taken"),
    ]);
  }

  if (entryType === "Near Miss") {
    return joinSummary([
      getField(fields, "Near Miss Type"),
      getField(fields, "Potential Harm"),
      getField(fields, "Action Taken"),
    ]);
  }

  /* ------------------------------------------------------------------------ */
  /* Safe fallback                                                            */
  /* ------------------------------------------------------------------------ */

  return genericSummary(fields, lines);
}

/* -------------------------------------------------------------------------- */
/* Parser                                                                     */
/* -------------------------------------------------------------------------- */

function parseFields(
  lines: string[],
): Record<string, string> {
  const fields: Record<string, string> = {};

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    /*
     * Supports:
     *
     * Activity:
     * Walk
     *
     * and:
     *
     * Activity: Walk
     */
    const colonIndex = line.indexOf(":");

    if (colonIndex === -1) {
      continue;
    }

    const label = line
      .slice(0, colonIndex)
      .trim();

    const inlineValue = line
      .slice(colonIndex + 1)
      .trim();

    if (!label) {
      continue;
    }

    if (inlineValue) {
      fields[label] = inlineValue;
      continue;
    }

    const nextLine = lines[index + 1];

    if (
      nextLine &&
      !looksLikeLabel(nextLine)
    ) {
      fields[label] = nextLine;
      index += 1;
    }
  }

  return fields;
}

function looksLikeLabel(value: string) {
  return value.endsWith(":");
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getField(
  fields: Record<string, string>,
  label: string,
) {
  return fields[label]?.trim() || "";
}

function joinSummary(
  values: Array<string | null | undefined>,
) {
  return values
    .map((value) => value?.trim())
    .filter(
      (value): value is string =>
        Boolean(value) &&
        value !== "Not recorded" &&
        value !== "Not applicable",
    )
    .join(" • ");
}

function labelled(
  label: string,
  value: string,
) {
  if (!value) {
    return "";
  }

  return `${label}: ${value}`;
}

function healthObservationSummary(
  fields: Record<string, string>,
) {
  const observationType =
    getField(fields, "Observation Type") ||
    getField(fields, "Type");

  const candidates = [
    getField(fields, "Weight"),
    getField(fields, "Temperature"),
    getField(fields, "Blood Pressure"),
    getField(fields, "Pulse"),
    getField(fields, "Oxygen Saturation"),
    getField(fields, "Blood Glucose"),
  ].filter(Boolean);

  return joinSummary([
    observationType,
    ...candidates,
    getField(fields, "Action Taken"),
  ]);
}

function genericSummary(
  fields: Record<string, string>,
  lines: string[],
) {
  const values = Object.values(fields)
    .filter(Boolean)
    .filter(
      (value) =>
        value !== "Not recorded" &&
        value !== "Not applicable",
    )
    .slice(0, 3);

  if (values.length > 0) {
    return values.join(" • ");
  }

  /*
   * Last resort for old entries that don't use
   * Castodia's Label:/Value structure.
   */
  return (
    lines
      .filter(
        (line) =>
          !line.endsWith(":") &&
          line !== lines[0],
      )
      .slice(0, 2)
      .join(" • ") ||
    contentPreview(lines)
  );
}

function contentPreview(lines: string[]) {
  return lines.join(" ").slice(0, 100);
}

function formatConcerns(value: string) {
  if (!value || value === "no_concerns") {
    return "No concerns";
  }

  return value
    .split(",")
    .map((item) =>
      item
        .trim()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
          char.toUpperCase(),
        ),
    )
    .join(", ");
}
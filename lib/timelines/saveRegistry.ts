type SaveContext = {
  supabase: any;
  serviceUserId: string;
  userId: string;
  eventTime: string;
  resetEntryPanel: () => void;
  setEntryPanelOpen: (value: boolean) => void;
  loadEntries: () => Promise<void>;

  activityTitle: string;
  activityLocation: string;
  activityPeople: string;
  activityParticipation: string;
  activityOutcome: string;
  activityNotes: string;

  communityDestination: string;
  communityTransport: string;
  communitySupportProvided: string;

  behaviourObserved: string[];
  behaviourFrequency: string;
  behaviourSupportProvided: string[];
  behaviourOutcome: string;
  behaviourNotes: string;
  bodyMapMarkers: any[];
  bodyMapNotes: string;
  organisationId: string;
  nutritionHydrationData?: any;
  healthObservationData?: any;
  symptomsData?: any;
  behaviourIncidentTrigger: string;
  behaviourIncidentTypes: string[];
  behaviourIncidentDescription: string;
  behaviourIncidentSupport: string[];
  linkedPrnAdministrationId: string;
  behaviourIncidentOutcomes: string[];
  behaviourIncidentNotes: string;
};

export const saveRegistry: Record<
  string,
  (ctx: SaveContext) => Promise<boolean>
> = {
  Activity: async (ctx) => {
    if (!ctx.activityTitle.trim()) {
      alert("Please enter what activity took place.");
      return false;
    }

    if (!ctx.activityParticipation) {
      alert("Please select participation level.");
      return false;
    }

    if (!ctx.activityOutcome) {
      alert("Please select outcome.");
      return false;
    }

    const finalContent = `Activity

Activity:
${ctx.activityTitle.trim()}

Location:
${ctx.activityLocation.trim() || "Not recorded"}

People Involved:
${ctx.activityPeople.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation}

Outcome:
${ctx.activityOutcome}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Activity",
      content: finalContent,
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
  },

  "Community Access": async (ctx) => {
    const finalContent = `Community Access

Destination:
${ctx.communityDestination || "Not recorded"}

Transport:
${ctx.communityTransport || "Not recorded"}

Support Provided:
${ctx.communitySupportProvided || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Community Access",
      content: finalContent,
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
  },

  "Social Interaction": async (ctx) => {
    if (!ctx.activityPeople.trim()) {
      alert("Please enter who was involved.");
      return false;
    }

    if (!ctx.activityParticipation) {
      alert("Please select participation level.");
      return false;
    }

    if (!ctx.activityOutcome) {
      alert("Please select outcome.");
      return false;
    }

    const finalContent = `Social Interaction

Who was involved:
${ctx.activityPeople.trim()}

Type of interaction:
${ctx.activityTitle.trim() || "Not recorded"}

Location:
${ctx.activityLocation.trim() || "Not recorded"}

Participation Level:
${ctx.activityParticipation}

Outcome:
${ctx.activityOutcome}

Notes:
${ctx.activityNotes.trim() || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Social Interaction",
      content: finalContent,
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
  },

  "Contact / Visit": async (ctx) => {
    if (!ctx.activityPeople.trim()) {
      alert("Please enter who was contacted.");
      return false;
    }

    const finalContent = `Contact / Visit

Person Contacted:
${ctx.activityPeople || "Not recorded"}

Relationship / Role:
${ctx.activityTitle || "Not recorded"}

Contact Method:
${ctx.activityLocation || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Contact / Visit",
      content: finalContent,
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
  },

  Shopping: async (ctx) => {
    const finalContent = `Shopping

Shop / Location:
${ctx.activityLocation || "Not recorded"}

Items Purchased:
${ctx.activityTitle || "Not recorded"}

Money Management Support:
${ctx.activityPeople || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Shopping",
      content: finalContent,
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
  },

  "Household Tasks": async (ctx) => {
    const finalContent = `Household Tasks

Task Completed:
${ctx.activityTitle || "Not recorded"}

Area of Home:
${ctx.activityLocation || "Not recorded"}

Support Provided:
${ctx.activityPeople || "Not recorded"}

Participation Level:
${ctx.activityParticipation || "Not recorded"}

Outcome:
${ctx.activityOutcome || "Not recorded"}

Notes:
${ctx.activityNotes || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Household Tasks",
      content: finalContent,
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
    
  },
  

  "Behaviour Observation": async (ctx) => {
    if (!ctx.behaviourObserved || ctx.behaviourObserved.length === 0) {
      alert("Please select at least one behaviour observed.");
      return false;
    }

    if (!ctx.behaviourFrequency) {
      alert("Please select frequency.");
      return false;
    }

    if (!ctx.behaviourOutcome) {
      alert("Please select outcome.");
      return false;
    }

    const finalContent = `Behaviour Observation

Behaviour Observed:
${ctx.behaviourObserved.join(", ")}

Frequency:
${ctx.behaviourFrequency}

Support Provided:
${
  ctx.behaviourSupportProvided?.length
    ? ctx.behaviourSupportProvided.join(", ")
    : "Not recorded"
}

Outcome:
${ctx.behaviourOutcome}

Notes:
${ctx.behaviourNotes?.trim() || "Not recorded"}`;

    const { error } = await ctx.supabase.from("timeline_entries").insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Behaviour Observation",
      content: finalContent,
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
  },

  "Nutrition & Hydration": async (ctx) => {
  const data = ctx.nutritionHydrationData;

  if (!data?.type) {
    alert("Please choose Food or Drink.");
    return false;
  }

  const concerns = data.concerns?.length ? data.concerns : ["no_concerns"];
  const hasConcern = concerns.some((c: string) => c !== "no_concerns");

  if (hasConcern && !data.notes?.trim()) {
    alert("Please add notes when a concern is recorded.");
    return false;
  }

  if (data.type === "food") {
    if (!data.meal) {
      alert("Please select a meal.");
      return false;
    }

    if (!data.foodDescription?.trim()) {
      alert("Please enter what was eaten.");
      return false;
    }

    if (!data.preparedBy) {
      alert("Please select who prepared it.");
      return false;
    }

    if (!data.amountEaten) {
      alert("Please select how much was eaten.");
      return false;
    }
  }

  if (data.type === "drink") {
    if (!data.drinkType) {
      alert("Please select a drink.");
      return false;
    }

    if (!data.amountMl) {
      alert("Please enter the amount in ml.");
      return false;
    }

    if (!data.assistance) {
      alert("Please select assistance level.");
      return false;
    }
  }

  const finalContent =
    data.type === "food"
      ? `Nutrition & Hydration

Type:
Food

Meal:
${data.meal}

Food:
${data.foodDescription}

Prepared By:
${data.preparedBy}

Amount Eaten:
${data.amountEaten}

Dietary Requirements:
${data.dietaryRequirements?.length ? data.dietaryRequirements.join(", ") : "Not recorded"}

Concerns:
${concerns.join(", ")}

Notes:
${data.notes?.trim() || "Not recorded"}`
      : `Nutrition & Hydration

Type:
Drink

Drink:
${data.drinkType}

Amount:
${data.amountMl}ml

Assistance:
${data.assistance}

Concerns:
${concerns.join(", ")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  const { error } = await ctx.supabase.from("timeline_entries").insert({
    service_user_id: ctx.serviceUserId,
    created_by: ctx.userId,
    entry_type: "Nutrition & Hydration",
    content: finalContent,
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
},

"Body Map": async (ctx) => {
  if (!ctx.bodyMapMarkers || ctx.bodyMapMarkers.length === 0) {
    alert("Please place at least one marker on the body map.");
    return false;
  }

  const markerSummary = ctx.bodyMapMarkers
    .map(
      (marker) =>
        `Marker ${marker.markerNumber}
View: ${marker.bodyView}
Body Area: ${marker.bodyArea || "Not recorded"}
Injury Type: ${marker.injuryType || "Not recorded"}
Description: ${marker.description || "Not recorded"}
Action Taken: ${marker.actionTaken || "Not recorded"}`
    )
    .join("\n\n");

  const additionalNotes = ctx.bodyMapNotes?.trim();

  const finalContent = `Body Map

Markers Recorded:
${ctx.bodyMapMarkers.length}

${markerSummary}${
    additionalNotes
      ? `

Additional Notes:
${additionalNotes}`
      : ""
  }`;

  const { data: timelineEntry, error: timelineError } = await ctx.supabase
    .from("timeline_entries")
    .insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Body Map",
      content: finalContent,
      event_time: ctx.eventTime,
    })
    .select("id")
    .single();

  if (timelineError) {
    alert(timelineError.message);
    return false;
  }

  const { data: bodyMap, error: bodyMapError } = await ctx.supabase
    .from("body_maps")
    .insert({
      organisation_id: ctx.organisationId,
      service_user_id: ctx.serviceUserId,
      timeline_entry_id: timelineEntry.id,
      created_by: ctx.userId,
    })
    .select("id")
    .single();

  if (bodyMapError) {
    alert(bodyMapError.message);
    return false;
  }

  const markerRows = ctx.bodyMapMarkers.map((marker) => ({
    body_map_id: bodyMap.id,
    marker_number: marker.markerNumber,
    body_view: marker.bodyView,
    x_position: marker.xPosition,
    y_position: marker.yPosition,
    body_area: marker.bodyArea || null,
    injury_type: marker.injuryType || "Not recorded",
    description: marker.description || null,
    action_taken: marker.actionTaken || null,
  }));

  const { error: markerError } = await ctx.supabase
    .from("body_map_markers")
    .insert(markerRows);

  if (markerError) {
    alert(markerError.message);
    return false;
  }

  ctx.resetEntryPanel();
  ctx.setEntryPanelOpen(false);
  await ctx.loadEntries();

  return true;
},
"Health Observation": async (ctx) => {
  const data = ctx.healthObservationData;

  if (!data?.sections || data.sections.length === 0) {
    alert("Please select what you are recording.");
    return false;
  }

  const actionsTaken = data.actionsTaken?.length
    ? data.actionsTaken
    : ["No Action Required"];

  const actionTaken = actionsTaken.some(
    (action: string) => action !== "No Action Required"
  );

  if (actionTaken && !data.notes?.trim()) {
    alert("Please add notes when action has been taken.");
    return false;
  }

  const sections: string[] = [];

  if (data.sections.includes("vital_signs")) {
    const vital = data.vitalSigns || {};

    const vitalLines = [
      vital.temperature ? `Temperature: ${vital.temperature}°C` : null,
      vital.bloodPressure
        ? `Blood Pressure: ${vital.bloodPressure.systolic || "?"} / ${
            vital.bloodPressure.diastolic || "?"
          } mmHg`
        : null,
      vital.pulse ? `Pulse: ${vital.pulse} bpm` : null,
      vital.respiratoryRate
        ? `Respiratory Rate: ${vital.respiratoryRate} breaths/min`
        : null,
      vital.oxygenSaturation
        ? `Oxygen Saturation: ${vital.oxygenSaturation}%`
        : null,
      vital.painScore !== null && vital.painScore !== undefined
        ? `Pain Score: ${vital.painScore}/10`
        : null,
    ].filter(Boolean);

    if (vitalLines.length === 0) {
      alert("Please enter at least one vital sign.");
      return false;
    }

    sections.push(`Vital Signs\n${vitalLines.join("\n")}`);
  }

  if (data.sections.includes("general_observation")) {
    const general = data.generalObservation || {};

    const generalLines = [
      general.appearance ? `Appearance: ${general.appearance}` : null,
      general.mood ? `Mood: ${general.mood}` : null,
      general.skinColour ? `Skin Colour: ${general.skinColour}` : null,
      general.breathing ? `Breathing: ${general.breathing}` : null,
      general.alertness ? `Alertness: ${general.alertness}` : null,
    ].filter(Boolean);

    if (generalLines.length === 0) {
      alert("Please complete at least one general observation.");
      return false;
    }

    sections.push(`General Observation\n${generalLines.join("\n")}`);
  }

  if (data.sections.includes("weight")) {
    if (!data.weight?.kg) {
      alert("Please enter the weight.");
      return false;
    }

    sections.push(`Weight\nWeight: ${data.weight.kg}kg`);
  }

  if (data.sections.includes("blood_glucose")) {
    if (!data.bloodGlucose?.value) {
      alert("Please enter the blood glucose reading.");
      return false;
    }

    sections.push(`Blood Glucose\nReading: ${data.bloodGlucose.value} mmol/L
Timing: ${data.bloodGlucose.timing || "Not recorded"}`);
  }

  if (data.sections.includes("other")) {
    if (!data.other?.observation?.trim()) {
      alert("Please describe the other observation.");
      return false;
    }

    sections.push(`Other Observation
Observation: ${data.other.observation}
Value: ${data.other.value || "Not recorded"}`);
  }

  const finalContent = `Health Observation

${sections.join("\n\n")}

Action Taken:
${actionsTaken.join(", ")}

Notes:
${data.notes?.trim() || "Not recorded"}`;

  const { error } = await ctx.supabase.from("timeline_entries").insert({
    service_user_id: ctx.serviceUserId,
    created_by: ctx.userId,
    entry_type: "Health Observation",
    content: finalContent,
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
},

Symptoms: async (ctx) => {
  const data = ctx.symptomsData;

  if (!data?.selectedSymptoms || data.selectedSymptoms.length === 0) {
    alert("Please select at least one symptom.");
    return false;
  }

  if (!data.duration) {
    alert("Please select symptom duration.");
    return false;
  }

  const actionsTaken = data.actionsTaken?.length
    ? data.actionsTaken
    : ["No Action Required"];

  const actionTaken = actionsTaken.some(
    (action: string) => action !== "No Action Required"
  );

  const severeSymptom =
    data.details?.painSeverity === "Severe" ||
    data.details?.breathlessnessSeverity === "Severe";

  const otherSymptom = data.selectedSymptoms.includes("other");

  if ((actionTaken || severeSymptom || otherSymptom) && !data.notes?.trim()) {
    alert("Please add notes for actions taken, severe symptoms, or other symptoms.");
    return false;
  }

  const lines: string[] = [];

  lines.push("Symptoms");
  lines.push("");
  lines.push("Symptoms Present:");

  data.selectedSymptoms.forEach((symptom: string) => {
    lines.push(`• ${formatSymptom(symptom)}`);
  });

  if (data.details?.temperatureType) {
    lines.push("");
    lines.push(`Temperature: ${data.details.temperatureType}`);
  }

  if (data.details?.coughType) {
    lines.push(`Cough: ${data.details.coughType}`);
  }

  if (data.details?.vomitingOccurrences) {
    lines.push(`Vomiting Occurrences: ${data.details.vomitingOccurrences}`);
  }

  if (data.details?.diarrhoeaOccurrences) {
    lines.push(`Diarrhoea Occurrences: ${data.details.diarrhoeaOccurrences}`);
  }

  if (data.details?.painLocation || data.details?.painSeverity) {
    lines.push(
      `Pain: ${data.details.painSeverity || "Not recorded"}`
    );
    lines.push(
      `Pain Location: ${data.details.painLocation || "Not recorded"}`
    );
  }

  if (data.details?.breathlessnessSeverity) {
    lines.push(
      `Shortness of Breath: ${data.details.breathlessnessSeverity}`
    );
  }

  if (data.details?.otherSymptom) {
    lines.push(`Other Symptom: ${data.details.otherSymptom}`);
  }

  lines.push("");
  lines.push("Duration:");
  lines.push(data.duration || "Not recorded");

  lines.push("");
  lines.push("Action Taken:");
  lines.push(actionsTaken.join(", "));

  lines.push("");
  lines.push("Notes:");
  lines.push(data.notes?.trim() || "Not recorded");

  const finalContent = lines.join("\n");

  const { error } = await ctx.supabase.from("timeline_entries").insert({
    service_user_id: ctx.serviceUserId,
    created_by: ctx.userId,
    entry_type: "Symptoms",
    content: finalContent,
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
},

"Behaviour Incident": async (ctx) => {
  if (!ctx.behaviourIncidentTrigger.trim()) {
    alert("Please record what happened before.");
    return false;
  }

  if (ctx.behaviourIncidentTypes.length === 0) {
    alert("Please select at least one behaviour type.");
    return false;
  }

  if (!ctx.behaviourIncidentDescription.trim()) {
    alert("Please describe what happened.");
    return false;
  }

  if (ctx.behaviourIncidentSupport.length === 0) {
    alert("Please select support provided.");
    return false;
  }

  if (ctx.behaviourIncidentOutcomes.length === 0) {
    alert("Please select the immediate outcome.");
    return false;
  }

  const finalContent = `Behaviour Incident

What happened before:
${ctx.behaviourIncidentTrigger.trim()}

Behaviour Type:
${ctx.behaviourIncidentTypes.map((item) => `• ${item}`).join("\n")}

What happened:
${ctx.behaviourIncidentDescription.trim()}

Support Provided:
${ctx.behaviourIncidentSupport.map((item) => `• ${item}`).join("\n")}

Immediate Outcome:
${ctx.behaviourIncidentOutcomes.map((item) => `• ${item}`).join("\n")}

Linked PRN Administration:
${ctx.linkedPrnAdministrationId || "Not linked"}

Additional Notes:
${ctx.behaviourIncidentNotes.trim() || "Not recorded"}`;


  const { error } = await ctx.supabase.from("timeline_entries").insert({
    service_user_id: ctx.serviceUserId,
    created_by: ctx.userId,
    entry_type: "Behaviour Incident",
    content: finalContent,
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
},
}
function formatSymptom(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
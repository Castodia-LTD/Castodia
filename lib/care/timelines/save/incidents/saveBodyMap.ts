import type { SaveContext } from "../types";

export async function saveBodyMap(
  ctx: SaveContext
): Promise<boolean> {
  if (!ctx.bodyMapMarkers || ctx.bodyMapMarkers.length === 0) {
    alert("Please place at least one marker on the body map.");
    return false;
  }

  const markerSummary = ctx.bodyMapMarkers
    .map(
      (marker) => `Marker ${marker.markerNumber}
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

  const metadata = {
    markers: ctx.bodyMapMarkers.map((marker) => ({
      markerNumber: marker.markerNumber,
      bodyView: marker.bodyView,
      xPosition: marker.xPosition,
      yPosition: marker.yPosition,
      bodyArea: marker.bodyArea || null,
      injuryType: marker.injuryType || null,
      description: marker.description || null,
      actionTaken: marker.actionTaken || null,
    })),
    notes: additionalNotes || null,
  };

  const { data: timelineEntry, error: timelineError } =
    await ctx.supabase
      .from("timeline_entries")
      .insert({
        service_user_id: ctx.serviceUserId,
        created_by: ctx.userId,
        entry_type: "Body Map",
        content: finalContent,
        metadata,
        event_time: ctx.eventTime,
      })
      .select("id")
      .single();

  if (timelineError) {
    alert(timelineError.message);
    return false;
  }

  const { data: bodyMap, error: bodyMapError } =
    await ctx.supabase
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
}
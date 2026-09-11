import type { SaveContext } from "../types";
import {
  completeTimelineSave,
  insertTimelineEntry,
} from "../saveTimelineEntry";

export async function saveBodyMap(
  ctx: SaveContext
): Promise<boolean> {
  if (!ctx.bodyMapMarkers || ctx.bodyMapMarkers.length === 0) {
    alert("Please place at least one marker on the body map.");
    return false;
  }

  const markerSummary = ctx.bodyMapMarkers
    .map(
      (marker) => `Marker ${marker.markerNumber}\nView: ${marker.bodyView}\nBody Area: ${marker.bodyArea || "Not recorded"}\nInjury Type: ${marker.injuryType || "Not recorded"}\nDescription: ${marker.description || "Not recorded"}\nAction Taken: ${marker.actionTaken || "Not recorded"}`
    )
    .join("\n\n");

  const additionalNotes = ctx.bodyMapNotes?.trim();

  const finalContent = `Body Map\n\nMarkers Recorded:\n${ctx.bodyMapMarkers.length}\n\n${markerSummary}${
    additionalNotes
      ? `\n\nAdditional Notes:\n${additionalNotes}`
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

  const timelineEntryId = await insertTimelineEntry(ctx, {
    entryType: "Body Map",
    content: finalContent,
    metadata,
  });

  if (!timelineEntryId) return false;

  const { data: bodyMap, error: bodyMapError } =
    await ctx.supabase
      .from("body_maps")
      .insert({
        organisation_id: ctx.organisationId,
        service_user_id: ctx.serviceUserId,
        timeline_entry_id: timelineEntryId,
        created_by: ctx.userId,
      })
      .select("id")
      .single();

  if (bodyMapError) {
    console.error("Body map record save failed", bodyMapError);
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
    console.error("Body map marker save failed", markerError);
    return false;
  }

  await completeTimelineSave(ctx);
  return true;
}

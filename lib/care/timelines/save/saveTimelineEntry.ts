import type { SaveContext } from "./types";

type TimelineEntryPayload = {
  entryType: string;
  content: string;
  metadata?: unknown;
};

/**
 * Single persistence and post-save lifecycle for registry-driven timeline entries.
 * Entry-specific handlers validate/build content; this boundary writes the record,
 * resets the composer and refreshes the visible timeline consistently.
 */
export async function saveTimelineEntry(
  ctx: SaveContext,
  entry: TimelineEntryPayload,
): Promise<boolean> {
  const { error } = await ctx.supabase.from("timeline_entries").insert({
    service_user_id: ctx.serviceUserId,
    created_by: ctx.userId,
    entry_type: entry.entryType,
    content: entry.content,
    metadata: entry.metadata ?? null,
    event_time: ctx.eventTime,
  });

  if (error) {
    console.error("Timeline entry save failed", {
      entryType: entry.entryType,
      serviceUserId: ctx.serviceUserId,
      error,
    });
    return false;
  }

  ctx.resetEntryPanel();
  ctx.setEntryPanelOpen(false);
  await ctx.loadEntries();

  return true;
}

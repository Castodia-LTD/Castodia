import type { SaveContext } from "./types";

export type TimelineEntryPayload = {
  entryType: string;
  content: string;
  metadata?: unknown;
};

/**
 * Lowest-level shared timeline insert. Returns the created entry id so linked
 * record workflows (for example Body Map) can use the same persistence boundary.
 */
export async function insertTimelineEntry(
  ctx: SaveContext,
  entry: TimelineEntryPayload,
): Promise<string | null> {
  const { data, error } = await ctx.supabase
    .from("timeline_entries")
    .insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: entry.entryType,
      content: entry.content,
      metadata: entry.metadata ?? null,
      event_time: ctx.eventTime,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Timeline entry save failed", {
      entryType: entry.entryType,
      serviceUserId: ctx.serviceUserId,
      error,
    });
    return null;
  }

  return data?.id ?? null;
}

/**
 * Shared successful-save lifecycle. Linked workflows call this only after their
 * related records have also been persisted successfully.
 */
export async function completeTimelineSave(ctx: SaveContext) {
  ctx.resetEntryPanel();
  ctx.setEntryPanelOpen(false);
  await ctx.loadEntries();
}

/**
 * Standard persistence and post-save lifecycle for registry-driven timeline entries.
 * Entry-specific handlers validate/build content; this boundary writes the record,
 * resets the composer and refreshes the visible timeline consistently.
 */
export async function saveTimelineEntry(
  ctx: SaveContext,
  entry: TimelineEntryPayload,
): Promise<boolean> {
  const entryId = await insertTimelineEntry(ctx, entry);
  if (!entryId) return false;

  await completeTimelineSave(ctx);
  return true;
}

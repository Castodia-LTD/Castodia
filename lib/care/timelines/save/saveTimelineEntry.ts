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
  const metadata = entry.metadata && typeof entry.metadata === "object"
    ? { ...entry.metadata as object, ...(ctx.growthMetadata ? { growth: ctx.growthMetadata } : {}) }
    : ctx.growthMetadata ? { growth: ctx.growthMetadata } : entry.metadata ?? null;

  if (ctx.growthMetadata) {
    const { data, error } = await ctx.supabase.rpc("save_timeline_entry_with_growth", {
      p_service_user_id: ctx.serviceUserId,
      p_entry_type: entry.entryType,
      p_content: entry.content,
      p_metadata: metadata,
      p_event_time: ctx.eventTime,
      p_growth: ctx.growthMetadata,
    });
    if (error) {
      console.error("Timeline Growth save failed", { entryType: entry.entryType, error });
      return null;
    }
    return typeof data === "string" ? data : null;
  }

  const { data, error } = await ctx.supabase
    .from("timeline_entries")
    .insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: entry.entryType,
      content: entry.content,
      metadata,
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

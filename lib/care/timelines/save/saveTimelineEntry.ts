import type { SaveContext } from "./types";

type TimelineEntryPayload = {
  entryType: string;
  content: string;
  metadata?: unknown;
};

/**
 * Single persistence boundary for registry-driven timeline entries.
 *
 * This function deliberately performs no panel reset, navigation or refresh.
 * UI lifecycle is owned by TimelineEntryPanel so every entry type follows the
 * same save -> success/error -> refresh -> close behaviour.
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

  return true;
}

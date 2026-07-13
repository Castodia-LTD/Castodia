import type { SaveContext } from "./types";

type TimelineEntryPayload = {
  entryType: string;
  content: string;
};

export async function saveTimelineEntry(
  ctx: SaveContext,
  entry: TimelineEntryPayload
): Promise<boolean> {
  const { error } = await ctx.supabase.from("timeline_entries").insert({
    service_user_id: ctx.serviceUserId,
    created_by: ctx.userId,
    entry_type: entry.entryType,
    content: entry.content,
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
type SaveSleepCheckContext = {
  supabase: any;

  serviceUserId: string;
  serviceUserName: string;
  userId: string;
  eventTime: string;

  sleepStatus: string;
  sleepNotes: string;

  resetEntryPanel: () => void;
  setEntryPanelOpen: (value: boolean) => void;
  loadEntries: () => Promise<void>;
};

export async function saveSleepCheck(
  ctx: SaveSleepCheckContext,
): Promise<boolean> {
  const sleepStatus = ctx.sleepStatus.trim();
  const sleepNotes = ctx.sleepNotes.trim();

  if (!sleepStatus) {
    alert("Please select whether the person appeared asleep or awake.");
    return false;
  }

  if (
    sleepStatus !== "Asleep" &&
    sleepStatus !== "Awake"
  ) {
    alert("Please select a valid sleep status.");
    return false;
  }

  const initials = getInitials(
    ctx.serviceUserName,
  );

  const observation =
    sleepStatus === "Asleep"
      ? `${initials} appeared asleep.`
      : `${initials} appeared awake.`;

  const finalContent = sleepNotes
    ? `${observation}\n\n${sleepNotes}`
    : observation;

  const { error } = await ctx.supabase
    .from("timeline_entries")
    .insert({
      service_user_id: ctx.serviceUserId,
      created_by: ctx.userId,
      entry_type: "Sleep",
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
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");

  return initials || "Client";
}
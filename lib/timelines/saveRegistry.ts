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
};
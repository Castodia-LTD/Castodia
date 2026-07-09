"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

import EntryCategoryTiles from "@/components/timelines/EntryCategoryTiles";
import { formRegistry } from "@/lib/timelines/formRegistry";
import { saveRegistry } from "@/lib/timelines/saveRegistry";
import { combineDateAndTime } from "@/lib/shared/date";

type Props = {
  serviceUserId: string;
  organisationId: string;
  serviceUserName: string;
  serviceUserGender?: string | null;
  viewingToday: boolean;
  form: any;
  onSaved: () => Promise<void>;
};

export default function TimelineEntryPanel({
  serviceUserId,
  organisationId,
  serviceUserName,
  serviceUserGender,
  viewingToday,
  form,
  onSaved,
}: Props) {
  const entryPanelRef = useRef<HTMLDivElement | null>(null);

  const SelectedForm = formRegistry[form.entryType];

  useEffect(() => {
    if (!entryPanelRef.current) return;

    entryPanelRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [form.selectedCategoryId, form.entryType]);

  async function createMedicationTimelineEntry(summary: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to create an entry.");
      return;
    }

    const eventTime = combineDateAndTime(new Date(), form.entryTime);

    const { error } = await supabase.from("timeline_entries").insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: "Medication",
      content: summary,
      event_time: eventTime,
    });

    if (error) {
      alert(error.message);
      return;
    }

    form.closeAndReset();
    await onSaved();
  }

  async function addEntry() {
    if (!viewingToday) {
      return alert("Entries can only be added to today’s record.");
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return alert("You must be logged in to create an entry.");
    }

    if (!form.entryType) {
      return alert("Please select what you would like to record.");
    }

    const eventTime = combineDateAndTime(new Date(), form.entryTime);
    const saveHandler = saveRegistry[form.entryType];

    if (saveHandler) {
      await saveHandler({
        supabase,
        organisationId,
        serviceUserId,
        userId: user.id,
        eventTime,
        resetEntryPanel: form.resetEntryPanel,
        setEntryPanelOpen: form.setEntryPanelOpen,
        loadEntries: onSaved,

        activityTitle: form.activityTitle,
        activityLocation: form.activityLocation,
        activityPeople: form.activityPeople,
        activityParticipation: form.activityParticipation,
        activityOutcome: form.activityOutcome,
        activityNotes: form.activityNotes,

        communityDestination: form.communityDestination,
        communityTransport: form.communityTransport,
        communitySupportProvided: form.communitySupportProvided,

        behaviourObserved: form.behaviourObserved,
        behaviourFrequency: form.behaviourFrequency,
        behaviourSupportProvided: form.behaviourSupportProvided,
        behaviourOutcome: form.behaviourOutcome,
        behaviourNotes: form.behaviourNotes,

        bodyMapMarkers: form.bodyMapMarkers,
        bodyMapNotes: form.bodyMapNotes,

        behaviourIncidentTrigger: form.behaviourIncidentTrigger,
        behaviourIncidentTypes: form.behaviourIncidentTypes,
        behaviourIncidentDescription: form.behaviourIncidentDescription,
        behaviourIncidentSupport: form.behaviourIncidentSupport,
        linkedPrnAdministrationId: form.linkedPrnAdministrationId,
        behaviourIncidentOutcomes: form.behaviourIncidentOutcomes,
        behaviourIncidentNotes: form.behaviourIncidentNotes,
      });

      return;
    }

    if (form.entryType === "Sleep") {
      if (!form.sleepStatus) return alert("Please select sleep status.");

      const summary = form.sleepNotes.trim()
        ? `${form.sleepStatus} — ${form.sleepNotes.trim()}`
        : form.sleepStatus;

      const { error } = await supabase.from("timeline_entries").insert({
        service_user_id: serviceUserId,
        created_by: user.id,
        entry_type: "Sleep",
        content: summary,
        event_time: eventTime,
      });

      if (error) return alert(error.message);

      form.closeAndReset();
      await onSaved();
      return;
    }

    const isIncident = form.entryType === "Incident";

    const finalContent = isIncident
      ? `Antecedent:
${form.antecedent.trim()}

Behaviour:
${form.behaviour.trim()}

Consequence / Outcome:
${form.consequence.trim()}`
      : form.content.trim();

    if (
      isIncident &&
      (!form.antecedent.trim() ||
        !form.behaviour.trim() ||
        !form.consequence.trim())
    ) {
      return alert(
        "Please complete antecedent, behaviour and consequence/outcome."
      );
    }

    if (!finalContent.trim()) return;

    const { error } = await supabase.from("timeline_entries").insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: form.entryType,
      content: finalContent,
      event_time: eventTime,
    });

    if (error) return alert(error.message);

    form.closeAndReset();
    await onSaved();
  }

  if (!viewingToday || !form.entryPanelOpen) return null;

  return (
    <div
      ref={entryPanelRef}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl space-y-4 overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Entry</h2>

        <button
          onClick={form.closeAndReset}
          className="rounded-full bg-white/10 px-4 py-2 text-sm"
        >
          Close
        </button>
      </div>

      {!form.entryType && (
        <EntryCategoryTiles
  organisationId={organisationId}
  selectedCategoryId={form.selectedCategoryId}
  setSelectedCategoryId={form.setSelectedCategoryId}
  setEntryType={form.setEntryType}
/>
      )}

      {form.entryType && (
        <>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3">
            <div>
              <p className="text-xs text-slate-400">Recording</p>
              <p className="font-semibold text-white">{form.entryType}</p>
            </div>

            <button
              onClick={() => {
                form.setEntryType("");
                form.setSelectedCategoryId(null);
              }}
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-300"
            >
              Change
            </button>
          </div>

          <input
            type="time"
            value={form.entryTime}
            onChange={(event) => form.setEntryTime(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
          />

          {SelectedForm ? (
            <SelectedForm
              serviceUserId={serviceUserId}
              serviceUserName={serviceUserName}
              serviceUserGender={serviceUserGender}
              onSaved={async () => {
                form.closeAndReset();
                await onSaved();
              }}
              onCreateTimelineEntry={createMedicationTimelineEntry}
              {...form}
            />
          ) : (
            <input
              value={form.content}
              onChange={(event) => form.setContent(event.target.value)}
              placeholder="Write entry..."
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
            />
          )}

          {form.entryType !== "Wellbeing" &&
            form.entryType !== "Medication" && (
              <button
                onClick={addEntry}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-xl font-semibold"
              >
                Save Entry
              </button>
            )}
        </>
      )}
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

import EntryCategoryTiles from "@/components/care/timelines/EntryCategoryTiles";
import { formRegistry } from "@/lib/care/timelines/formRegistry";
import { saveRegistry } from "@/lib/care/timelines/saveRegistry";
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

    const eventTime = combineDateAndTime(
      new Date(),
      form.entryTime,
    );

    const { error } = await supabase
      .from("timeline_entries")
      .insert({
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
      alert("Entries can only be added to today’s record.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("You must be logged in to create an entry.");
      return;
    }

    if (!form.entryType) {
      alert("Please select what you would like to record.");
      return;
    }

    const eventTime = combineDateAndTime(
      new Date(),
      form.entryTime,
    );

    const saveHandler = saveRegistry[form.entryType];

    if (saveHandler) {
      const saved = await saveHandler({
        supabase,
        organisationId,
        serviceUserId,
        serviceUserName,
        userId: user.id,
        eventTime,

        resetEntryPanel: form.resetEntryPanel,
        setEntryPanelOpen: form.setEntryPanelOpen,
        loadEntries: onSaved,

        // Activities
        activityTitle: form.activityTitle ?? "",
        activityLocation: form.activityLocation ?? "",
        activityPeople: form.activityPeople ?? "",
        activityParticipation:
          form.activityParticipation ?? "",
        activityOutcome: form.activityOutcome ?? "",
        activityNotes: form.activityNotes ?? "",

        communityAccessData:
          form.communityAccessData ?? undefined,

        socialInteractionData:
          form.socialInteractionData ?? undefined,

        contactVisitData:
          form.contactVisitData ?? undefined,

        shoppingData:
          form.shoppingData ?? undefined,

        householdTasksData:
          form.householdTasksData ?? undefined,

        // Care
        nutritionHydrationData:
          form.nutritionHydrationData ?? undefined,

        environmentCheckData:
          form.environmentCheckData ?? undefined,

        personalCareData:
  form.personalCareData ?? undefined,

        toiletingData: {
          toiletingOutcome:
            form.toiletingOutcome ?? "",
          assistanceRequired:
            form.assistanceRequired ?? "",
          padChanged: form.padChanged ?? "",
          bristolType: form.bristolType ?? "",
          toiletingNotes:
            form.toiletingNotes ?? "",
        },

        sleepStatus: form.sleepStatus ?? "",
        sleepNotes: form.sleepNotes ?? "",

        continenceCareData:
        form.continenceCareData ?? undefined,

        // Wellbeing
        behaviourObserved:
          form.behaviourObserved ?? [],

        behaviourFrequency:
          form.behaviourFrequency ?? "",

        behaviourSupportProvided:
          form.behaviourSupportProvided ?? [],

        behaviourOutcome:
          form.behaviourOutcome ?? "",

        behaviourNotes:
          form.behaviourNotes ?? "",

        // Body map
        bodyMapMarkers:
          form.bodyMapMarkers ?? [],

        bodyMapNotes:
          form.bodyMapNotes ?? "",

        // Health
        healthObservationData:
          form.healthObservationData ?? undefined,

        symptomsData:
          form.symptomsData ?? undefined,

        healthProfessionalData:
          form.healthProfessionalData ?? undefined,

        // Incidents
        accidentFallInjuryData:
          form.accidentFallInjuryData ?? undefined,

        medicationErrorData:
          form.medicationErrorData ?? undefined,

        nearMissData:
          form.nearMissData ?? undefined,

        behaviourIncidentTrigger:
          form.behaviourIncidentTrigger ?? "",

        behaviourIncidentTypes:
          form.behaviourIncidentTypes ?? [],

        behaviourIncidentDescription:
          form.behaviourIncidentDescription ?? "",

        behaviourIncidentSupport:
          form.behaviourIncidentSupport ?? [],

        linkedPrnAdministrationId:
          form.linkedPrnAdministrationId ?? "",

        behaviourIncidentOutcomes:
          form.behaviourIncidentOutcomes ?? [],

        behaviourIncidentNotes:
          form.behaviourIncidentNotes ?? "",
      });

      if (!saved) {
        return;
      }

      return;
    }

    const finalContent =
      form.content?.trim() ?? "";

    if (!finalContent) {
      alert("Please enter some information.");
      return;
    }

    const { error } = await supabase
      .from("timeline_entries")
      .insert({
        service_user_id: serviceUserId,
        created_by: user.id,
        entry_type: form.entryType,
        content: finalContent,
        event_time: eventTime,
      });

    if (error) {
      alert(error.message);
      return;
    }

    form.closeAndReset();
    await onSaved();
  }

  if (
    !viewingToday ||
    !form.entryPanelOpen
  ) {
    return null;
  }

  return (
    <div
      ref={entryPanelRef}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-teal-100 bg-gradient-to-b from-[#f8fcfc] via-[#f4fbfb] to-[#eaf7f7] shadow-[-20px_0_45px_rgba(15,23,42,0.14)]"
    >
      <div className="sticky top-0 z-10 border-b border-teal-100 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
              Timeline
            </p>

            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Add Entry
            </h2>
          </div>

          <button
            type="button"
            onClick={form.closeAndReset}
            className="rounded-xl border border-teal-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
      {!form.entryType && (
        <div className="rounded-[24px] border border-teal-200/70 bg-gradient-to-br from-[#0f766e] via-[#0891b2] to-[#0f766e] p-5 shadow-[0_12px_30px_rgba(13,148,136,0.16)] sm:p-6">
          <EntryCategoryTiles
            organisationId={organisationId}
            selectedCategoryId={
              form.selectedCategoryId
            }
            setSelectedCategoryId={
              form.setSelectedCategoryId
            }
            setEntryType={form.setEntryType}
          />
        </div>
      )}

      {form.entryType && (
        <>
          <div className="flex items-center justify-between rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">
                Recording
              </p>

              <p className="font-semibold text-slate-950">
                {form.entryType}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                form.setEntryType("");
                form.setSelectedCategoryId(null);
              }}
              className="rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 transition hover:border-teal-200 hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              Change
            </button>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
            <label
              htmlFor="timeline-entry-time"
              className="mb-2 block text-sm font-medium text-slate-800"
            >
              Entry time
            </label>

            <input
              id="timeline-entry-time"
              type="time"
              value={form.entryTime}
              onChange={(event) =>
                form.setEntryTime(
                  event.target.value,
                )
              }
              className="min-h-11 w-full rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {SelectedForm ? (
            <SelectedForm
              serviceUserId={serviceUserId}
              serviceUserName={serviceUserName}
              serviceUserGender={
                serviceUserGender
              }
              onSaved={async () => {
                form.closeAndReset();
                await onSaved();
              }}
              onCreateTimelineEntry={
                createMedicationTimelineEntry
              }
              {...form}
            />
          ) : (
            <input
              value={form.content}
              onChange={(event) =>
                form.setContent(
                  event.target.value,
                )
              }
              placeholder="Write entry..."
              className="min-h-12 w-full rounded-xl border border-teal-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          )}

          {form.entryType !== "Wellbeing" &&
            form.entryType !== "Medication" && (
              <button
                type="button"
                onClick={addEntry}
                className="w-full rounded-xl bg-gradient-to-r from-[#079c9c] to-[#6ed6ce] p-4 text-lg font-semibold text-white shadow-[0_8px_20px_rgba(13,148,136,0.18)] transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
              >
                Save Entry
              </button>
            )}
        </>
      )}
      </div>
    </div>
  );
}
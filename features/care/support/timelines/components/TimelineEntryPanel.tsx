"use client";

import { useEffect, useRef } from "react";
import { Loader2, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";

import EntryCategoryTiles from "@/components/care/timelines/EntryCategoryTiles";
import { primaryActionBase, secondaryActionBase } from "@/components/care/timelines/forms/shared";
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
    entryPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    form.setSaveError?.(null);
  }, [form.selectedCategoryId, form.entryType]);

  async function completeSave() {
    form.closeAndReset();
    await onSaved();
  }

  async function createMedicationTimelineEntry(summary: string) {
    if (form.saving) return;

    form.setSaving?.(true);
    form.setSaveError?.(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        form.setSaveError?.("You must be logged in to create an entry.");
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
        form.setSaveError?.(error.message);
        return;
      }

      await completeSave();
    } catch (error) {
      form.setSaveError?.(
        error instanceof Error ? error.message : "The entry could not be saved.",
      );
    } finally {
      form.setSaving?.(false);
    }
  }

  async function addEntry() {
    if (form.saving) return;

    if (!viewingToday) {
      form.setSaveError?.("Entries can only be added to today’s record.");
      return;
    }

    if (!form.entryType) {
      form.setSaveError?.("Please select what you would like to record.");
      return;
    }

    form.setSaving?.(true);
    form.setSaveError?.(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        form.setSaveError?.("You must be logged in to create an entry.");
        return;
      }

      const eventTime = combineDateAndTime(new Date(), form.entryTime);
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

          activityTitle: form.activityTitle ?? "",
          activityLocation: form.activityLocation ?? "",
          activityPeople: form.activityPeople ?? "",
          activityParticipation: form.activityParticipation ?? "",
          activityOutcome: form.activityOutcome ?? "",
          activityNotes: form.activityNotes ?? "",
          communityAccessData: form.communityAccessData ?? undefined,
          socialInteractionData: form.socialInteractionData ?? undefined,
          contactVisitData: form.contactVisitData ?? undefined,
          shoppingData: form.shoppingData ?? undefined,
          householdTasksData: form.householdTasksData ?? undefined,

          nutritionHydrationData: form.nutritionHydrationData ?? undefined,
          environmentCheckData: form.environmentCheckData ?? undefined,
          personalCareData: form.personalCareData ?? undefined,
          toiletingData: {
            toiletingOutcome: form.toiletingOutcome ?? "",
            assistanceRequired: form.assistanceRequired ?? "",
            padChanged: form.padChanged ?? "",
            bristolType: form.bristolType ?? "",
            toiletingNotes: form.toiletingNotes ?? "",
          },
          sleepStatus: form.sleepStatus ?? "",
          sleepNotes: form.sleepNotes ?? "",
          continenceCareData: form.continenceCareData ?? undefined,

          behaviourObserved: form.behaviourObserved ?? [],
          behaviourFrequency: form.behaviourFrequency ?? "",
          behaviourSupportProvided: form.behaviourSupportProvided ?? [],
          behaviourOutcome: form.behaviourOutcome ?? "",
          behaviourNotes: form.behaviourNotes ?? "",

          bodyMapMarkers: form.bodyMapMarkers ?? [],
          bodyMapNotes: form.bodyMapNotes ?? "",

          healthObservationData: form.healthObservationData ?? undefined,
          symptomsData: form.symptomsData ?? undefined,
          healthProfessionalData: form.healthProfessionalData ?? undefined,

          accidentFallInjuryData: form.accidentFallInjuryData ?? undefined,
          medicationErrorData: form.medicationErrorData ?? undefined,
          nearMissData: form.nearMissData ?? undefined,
          behaviourIncidentTrigger: form.behaviourIncidentTrigger ?? "",
          behaviourIncidentTypes: form.behaviourIncidentTypes ?? [],
          behaviourIncidentDescription: form.behaviourIncidentDescription ?? "",
          behaviourIncidentSupport: form.behaviourIncidentSupport ?? [],
          linkedPrnAdministrationId: form.linkedPrnAdministrationId ?? "",
          behaviourIncidentOutcomes: form.behaviourIncidentOutcomes ?? [],
          behaviourIncidentNotes: form.behaviourIncidentNotes ?? "",
        });

        if (!saved) {
          form.setSaveError?.(
            "Please check the highlighted or required information and try again.",
          );
        }
        return;
      }

      const finalContent = form.content?.trim() ?? "";
      if (!finalContent) {
        form.setSaveError?.("Please enter some information.");
        return;
      }

      const { error } = await supabase.from("timeline_entries").insert({
        service_user_id: serviceUserId,
        created_by: user.id,
        entry_type: form.entryType,
        content: finalContent,
        event_time: eventTime,
      });

      if (error) {
        form.setSaveError?.(error.message);
        return;
      }

      await completeSave();
    } catch (error) {
      form.setSaveError?.(
        error instanceof Error ? error.message : "The entry could not be saved.",
      );
    } finally {
      form.setSaving?.(false);
    }
  }

  if (!viewingToday || !form.entryPanelOpen) return null;

  return (
    <div
      ref={entryPanelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="timeline-entry-panel-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl overflow-y-auto border-l border-teal-100 bg-[#f7fafb] shadow-[-20px_0_45px_rgba(15,23,42,0.14)]"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
              Timeline
            </p>
            <h2 id="timeline-entry-panel-title" className="mt-1 text-xl font-semibold text-slate-950">
              Add entry
            </h2>
          </div>

          <button
            type="button"
            onClick={form.closeAndReset}
            disabled={form.saving}
            className={secondaryActionBase}
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 px-3.5 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-teal-700 shadow-sm">
            <UserRound size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">Recording for</p>
            <p className="truncate text-sm font-semibold text-slate-950">{serviceUserName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
        {!form.entryType ? (
          <div className="rounded-[24px] border border-teal-200/70 bg-gradient-to-br from-[#0f766e] via-[#0891b2] to-[#0f766e] p-5 shadow-[0_12px_30px_rgba(13,148,136,0.16)] sm:p-6">
            <EntryCategoryTiles
              organisationId={organisationId}
              selectedCategoryId={form.selectedCategoryId}
              setSelectedCategoryId={form.setSelectedCategoryId}
              setEntryType={form.setEntryType}
            />
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">
                    Recording
                  </p>
                  <p className="truncate font-semibold text-slate-950">{form.entryType}</p>
                </div>
                <button
                  type="button"
                  disabled={form.saving}
                  onClick={() => {
                    form.setSaveError?.(null);
                    form.setEntryType("");
                    form.setSelectedCategoryId(null);
                  }}
                  className={secondaryActionBase}
                >
                  Change
                </button>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <label htmlFor="timeline-entry-time" className="mb-2 block text-sm font-semibold text-slate-800">
                  When did this happen?
                </label>
                <input
                  id="timeline-entry-time"
                  type="time"
                  value={form.entryTime}
                  disabled={form.saving}
                  onChange={(event) => form.setEntryTime(event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:bg-slate-50"
                />
              </div>
            </div>

            {SelectedForm ? (
              <SelectedForm
                serviceUserId={serviceUserId}
                serviceUserName={serviceUserName}
                serviceUserGender={serviceUserGender}
                onSaved={async () => {
                  if (!form.saving) form.closeAndReset();
                  await onSaved();
                }}
                onCreateTimelineEntry={createMedicationTimelineEntry}
                {...form}
              />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <label htmlFor="timeline-free-text" className="mb-2 block text-sm font-semibold text-slate-800">
                  What happened?
                </label>
                <textarea
                  id="timeline-free-text"
                  value={form.content}
                  disabled={form.saving}
                  onChange={(event) => form.setContent(event.target.value)}
                  placeholder="Record the important details…"
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 disabled:bg-slate-50"
                />
              </div>
            )}

            {form.saveError ? (
              <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {form.saveError}
              </div>
            ) : null}

            {form.entryType !== "Wellbeing" && form.entryType !== "Medication" ? (
              <div className="sticky bottom-0 -mx-5 border-t border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6">
                <button
                  type="button"
                  onClick={addEntry}
                  disabled={form.saving}
                  className={`w-full ${primaryActionBase}`}
                >
                  {form.saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                      Saving entry…
                    </span>
                  ) : (
                    "Save entry"
                  )}
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import type { RefObject } from "react";
import { supabase } from "@/lib/supabase";
import EntryCategoryTiles from "@/components/timelines/EntryCategoryTiles";
import { CastodiaButton } from "@/components/castodia";

type Props = {
  viewingToday: boolean;
  entryPanelOpen: boolean;
  setEntryPanelOpen: (value: boolean) => void;
  resetEntryPanel: () => void;
  entryPanelRef: RefObject<HTMLDivElement | null>;

  serviceUserId: string;
  organisationId: string;
  serviceUserName: string;
  serviceUserGender?: string | null;

  entryType: string;
  setEntryType: (value: string) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (value: string | null) => void;

  entryTime: string;
  setEntryTime: (value: string) => void;
  combineDateAndTime: (date: Date, time: string) => string;

  SelectedForm: any;
  addEntry: () => void | Promise<void>;
  loadEntries: () => Promise<void>;

  content: string;
  setContent: (value: string) => void;

  activityTitle: string;
  setActivityTitle: (value: string) => void;
  activityLocation: string;
  setActivityLocation: (value: string) => void;
  activityPeople: string;
  setActivityPeople: (value: string) => void;
  activityParticipation: string;
  setActivityParticipation: (value: string) => void;
  activityOutcome: string;
  setActivityOutcome: (value: string) => void;
  activityNotes: string;
  setActivityNotes: (value: string) => void;

  communityDestination: string;
  setCommunityDestination: (value: string) => void;
  communityTransport: string;
  setCommunityTransport: (value: string) => void;
  communitySupportProvided: string;
  setCommunitySupportProvided: (value: string) => void;

  behaviourObserved: string[];
  setBehaviourObserved: (value: string[]) => void;
  behaviourFrequency: string;
  setBehaviourFrequency: (value: string) => void;
  behaviourSupportProvided: string[];
  setBehaviourSupportProvided: (value: string[]) => void;
  behaviourOutcome: string;
  setBehaviourOutcome: (value: string) => void;
  behaviourNotes: string;
  setBehaviourNotes: (value: string) => void;

  selectedRound: string;
  setSelectedRound: (value: string) => void;
  medicationProfiles: any[];
  medicationStatuses: Record<string, string>;
  setMedicationStatuses: (value: Record<string, string>) => void;
  medicationReasons: Record<string, string>;
  setMedicationReasons: (value: Record<string, string>) => void;

  toiletingOutcome: string;
  setToiletingOutcome: (value: string) => void;
  assistanceRequired: string;
  setAssistanceRequired: (value: string) => void;
  padChanged: string;
  setPadChanged: (value: string) => void;
  bristolType: string;
  setBristolType: (value: string) => void;
  toiletingNotes: string;
  setToiletingNotes: (value: string) => void;
  continenceSettings: any;

  careType: string;
  setCareType: (value: string) => void;
  assistanceLevel: string;
  setAssistanceLevel: (value: string) => void;
  personalCareNotes: string;
  setPersonalCareNotes: (value: string) => void;

  sleepStatus: string;
  setSleepStatus: (value: string) => void;
  sleepNotes: string;
  setSleepNotes: (value: string) => void;

  antecedent: string;
  setAntecedent: (value: string) => void;
  behaviour: string;
  setBehaviour: (value: string) => void;
  consequence: string;
  setConsequence: (value: string) => void;

  bodyMapMarkers: any[];
  setBodyMapMarkers: (value: any[]) => void;
  bodyMapNotes: string;
  setBodyMapNotes: (value: string) => void;

  behaviourIncidentTrigger: string;
  setBehaviourIncidentTrigger: (value: string) => void;
  behaviourIncidentTypes: string[];
  setBehaviourIncidentTypes: (value: string[]) => void;
  behaviourIncidentDescription: string;
  setBehaviourIncidentDescription: (value: string) => void;
  behaviourIncidentSupport: string[];
  setBehaviourIncidentSupport: (value: string[]) => void;
  linkedPrnAdministrationId: string;
  setLinkedPrnAdministrationId: (value: string) => void;
  behaviourIncidentOutcomes: string[];
  setBehaviourIncidentOutcomes: (value: string[]) => void;
  behaviourIncidentNotes: string;
  setBehaviourIncidentNotes: (value: string) => void;
  prnOptions: { id: string; label: string }[];
};

export default function TimelineEntryPanelLive({
  viewingToday,
  entryPanelOpen,
  setEntryPanelOpen,
  resetEntryPanel,
  entryPanelRef,

  serviceUserId,
  organisationId,
  serviceUserName,
  serviceUserGender,

  entryType,
  setEntryType,
  selectedCategoryId,
  setSelectedCategoryId,

  entryTime,
  setEntryTime,
  combineDateAndTime,

  SelectedForm,
  addEntry,
  loadEntries,

  content,
  setContent,

  activityTitle,
  setActivityTitle,
  activityLocation,
  setActivityLocation,
  activityPeople,
  setActivityPeople,
  activityParticipation,
  setActivityParticipation,
  activityOutcome,
  setActivityOutcome,
  activityNotes,
  setActivityNotes,

  communityDestination,
  setCommunityDestination,
  communityTransport,
  setCommunityTransport,
  communitySupportProvided,
  setCommunitySupportProvided,

  behaviourObserved,
  setBehaviourObserved,
  behaviourFrequency,
  setBehaviourFrequency,
  behaviourSupportProvided,
  setBehaviourSupportProvided,
  behaviourOutcome,
  setBehaviourOutcome,
  behaviourNotes,
  setBehaviourNotes,

  selectedRound,
  setSelectedRound,
  medicationProfiles,
  medicationStatuses,
  setMedicationStatuses,
  medicationReasons,
  setMedicationReasons,

  toiletingOutcome,
  setToiletingOutcome,
  assistanceRequired,
  setAssistanceRequired,
  padChanged,
  setPadChanged,
  bristolType,
  setBristolType,
  toiletingNotes,
  setToiletingNotes,
  continenceSettings,

  careType,
  setCareType,
  assistanceLevel,
  setAssistanceLevel,
  personalCareNotes,
  setPersonalCareNotes,

  sleepStatus,
  setSleepStatus,
  sleepNotes,
  setSleepNotes,

  antecedent,
  setAntecedent,
  behaviour,
  setBehaviour,
  consequence,
  setConsequence,

  bodyMapMarkers,
  setBodyMapMarkers,
  bodyMapNotes,
  setBodyMapNotes,

  behaviourIncidentTrigger,
  setBehaviourIncidentTrigger,
  behaviourIncidentTypes,
  setBehaviourIncidentTypes,
  behaviourIncidentDescription,
  setBehaviourIncidentDescription,
  behaviourIncidentSupport,
  setBehaviourIncidentSupport,
  linkedPrnAdministrationId,
  setLinkedPrnAdministrationId,
  behaviourIncidentOutcomes,
  setBehaviourIncidentOutcomes,
  behaviourIncidentNotes,
  setBehaviourIncidentNotes,
  prnOptions,
}: Props) {
  if (!viewingToday) return null;

  return (
    <>
      {!entryPanelOpen && (
        <CastodiaButton
          onClick={() => {
            resetEntryPanel();
            setEntryPanelOpen(true);
          }}
          className="fixed bottom-24 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full p-0 text-3xl font-bold shadow-2xl md:bottom-6"
        >
          +
        </CastodiaButton>
      )}

      {entryPanelOpen && (
        <div
          ref={entryPanelRef}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl space-y-4 overflow-y-auto border-l border-slate-200 bg-slate-50 p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              Add Entry
            </h2>

            <button
              onClick={() => {
                resetEntryPanel();
                setEntryPanelOpen(false);
              }}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          {!entryType && (
            <EntryCategoryTiles
  organisationId={organisationId}
  selectedCategoryId={selectedCategoryId}
  setSelectedCategoryId={setSelectedCategoryId}
  setEntryType={setEntryType}
/>
          )}

          {entryType && (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3">
                <div>
                  <p className="text-xs text-slate-500">Recording</p>
                  <p className="font-semibold text-slate-950">{entryType}</p>
                </div>

                <button
                  onClick={() => {
                    setEntryType("");
                    setSelectedCategoryId(null);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Change
                </button>
              </div>

              <input
                type="time"
                value={entryTime}
                onChange={(event) => setEntryTime(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 outline-none"
              />

              {SelectedForm ? (
                <SelectedForm
                  serviceUserId={serviceUserId}
                  serviceUserName={serviceUserName}
                  onSaved={async () => {
                    resetEntryPanel();
                    setEntryPanelOpen(false);
                    await loadEntries();
                  }}
                  onCreateTimelineEntry={async (summary: string) => {
                    const {
                      data: { user },
                    } = await supabase.auth.getUser();

                    if (!user) {
                      alert("You must be logged in to create an entry.");
                      return;
                    }

                    const eventTime = combineDateAndTime(new Date(), entryTime);

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

                    resetEntryPanel();
                    setEntryPanelOpen(false);
                    await loadEntries();
                  }}
                  activityTitle={activityTitle}
                  setActivityTitle={setActivityTitle}
                  activityLocation={activityLocation}
                  setActivityLocation={setActivityLocation}
                  activityPeople={activityPeople}
                  setActivityPeople={setActivityPeople}
                  activityParticipation={activityParticipation}
                  setActivityParticipation={setActivityParticipation}
                  activityOutcome={activityOutcome}
                  setActivityOutcome={setActivityOutcome}
                  activityNotes={activityNotes}
                  setActivityNotes={setActivityNotes}
                  communityDestination={communityDestination}
                  setCommunityDestination={setCommunityDestination}
                  communityTransport={communityTransport}
                  setCommunityTransport={setCommunityTransport}
                  communitySupportProvided={communitySupportProvided}
                  setCommunitySupportProvided={setCommunitySupportProvided}
                  behaviourObserved={behaviourObserved}
                  setBehaviourObserved={setBehaviourObserved}
                  behaviourFrequency={behaviourFrequency}
                  setBehaviourFrequency={setBehaviourFrequency}
                  behaviourSupportProvided={behaviourSupportProvided}
                  setBehaviourSupportProvided={setBehaviourSupportProvided}
                  behaviourOutcome={behaviourOutcome}
                  setBehaviourOutcome={setBehaviourOutcome}
                  behaviourNotes={behaviourNotes}
                  setBehaviourNotes={setBehaviourNotes}
                  selectedRound={selectedRound}
                  setSelectedRound={setSelectedRound}
                  medicationProfiles={medicationProfiles}
                  medicationStatuses={medicationStatuses}
                  setMedicationStatuses={setMedicationStatuses}
                  medicationReasons={medicationReasons}
                  setMedicationReasons={setMedicationReasons}
                  toiletingOutcome={toiletingOutcome}
                  setToiletingOutcome={setToiletingOutcome}
                  assistanceRequired={assistanceRequired}
                  setAssistanceRequired={setAssistanceRequired}
                  padChanged={padChanged}
                  setPadChanged={setPadChanged}
                  bristolType={bristolType}
                  setBristolType={setBristolType}
                  toiletingNotes={toiletingNotes}
                  setToiletingNotes={setToiletingNotes}
                  continenceSettings={continenceSettings}
                  careType={careType}
                  setCareType={setCareType}
                  assistanceLevel={assistanceLevel}
                  setAssistanceLevel={setAssistanceLevel}
                  personalCareNotes={personalCareNotes}
                  setPersonalCareNotes={setPersonalCareNotes}
                  sleepStatus={sleepStatus}
                  setSleepStatus={setSleepStatus}
                  sleepNotes={sleepNotes}
                  setSleepNotes={setSleepNotes}
                  antecedent={antecedent}
                  setAntecedent={setAntecedent}
                  behaviour={behaviour}
                  setBehaviour={setBehaviour}
                  consequence={consequence}
                  setConsequence={setConsequence}
                  bodyMapMarkers={bodyMapMarkers}
                  setBodyMapMarkers={setBodyMapMarkers}
                  bodyMapNotes={bodyMapNotes}
                  setBodyMapNotes={setBodyMapNotes}
                  serviceUserGender={serviceUserGender}
                  behaviourIncidentTrigger={behaviourIncidentTrigger}
                  setBehaviourIncidentTrigger={setBehaviourIncidentTrigger}
                  behaviourIncidentTypes={behaviourIncidentTypes}
                  setBehaviourIncidentTypes={setBehaviourIncidentTypes}
                  behaviourIncidentDescription={behaviourIncidentDescription}
                  setBehaviourIncidentDescription={setBehaviourIncidentDescription}
                  behaviourIncidentSupport={behaviourIncidentSupport}
                  setBehaviourIncidentSupport={setBehaviourIncidentSupport}
                  linkedPrnAdministrationId={linkedPrnAdministrationId}
                  setLinkedPrnAdministrationId={setLinkedPrnAdministrationId}
                  behaviourIncidentOutcomes={behaviourIncidentOutcomes}
                  setBehaviourIncidentOutcomes={setBehaviourIncidentOutcomes}
                  behaviourIncidentNotes={behaviourIncidentNotes}
                  setBehaviourIncidentNotes={setBehaviourIncidentNotes}
                  prnOptions={prnOptions}
                />
              ) : (
                <input
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write entry..."
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 outline-none"
                />
              )}

              {entryType !== "Wellbeing" && entryType !== "Medication" && (
                <CastodiaButton onClick={addEntry} className="w-full">
                  Save Entry
                </CastodiaButton>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
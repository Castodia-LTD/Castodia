"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

import TimelineHeader from "@/components/timelines/TimelineHeader";
import TimelineEntryCard from "@/components/timelines/TimelineEntryCard";
import EntryCategoryTiles from "@/components/timelines/EntryCategoryTiles";

import { filters } from "@/lib/timelines/constants";
import { formRegistry } from "@/lib/timelines/formRegistry";
import { saveRegistry } from "@/lib/timelines/saveRegistry";
import type { ServiceUser, TimelineEntry } from "@/lib/timelines/types";

import {
  combineDateAndTime,
  getTimeNow,
  isSameDay,
} from "@/lib/shared/date";

export default function TimelineDetailPage() {
  const params = useParams();
  const serviceUserId = params.id as string;

  const entryPanelRef = useRef<HTMLDivElement | null>(null);

  const [organisationId, setOrganisationId] = useState("");
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [content, setContent] = useState("");

  const [entryType, setEntryType] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [entryPanelOpen, setEntryPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entryTime, setEntryTime] = useState(getTimeNow());

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const [antecedent, setAntecedent] = useState("");
  const [behaviour, setBehaviour] = useState("");
  const [consequence, setConsequence] = useState("");

  const [behaviourObserved, setBehaviourObserved] = useState<string[]>([]);
  const [behaviourFrequency, setBehaviourFrequency] = useState("");
  const [behaviourSupportProvided, setBehaviourSupportProvided] = useState<
    string[]
  >([]);
  const [behaviourOutcome, setBehaviourOutcome] = useState("");
  const [behaviourNotes, setBehaviourNotes] = useState("");

  const [medicationProfiles, setMedicationProfiles] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState("Morning");
  const [medicationStatuses, setMedicationStatuses] = useState<
    Record<string, string>
  >({});
  const [medicationReasons, setMedicationReasons] = useState<
    Record<string, string>
  >({});

  const [toiletingOutcome, setToiletingOutcome] = useState("");
  const [assistanceRequired, setAssistanceRequired] = useState("");
  const [padChanged, setPadChanged] = useState("");
  const [bristolType, setBristolType] = useState("");
  const [toiletingNotes, setToiletingNotes] = useState("");
  const [continenceSettings, setContinenceSettings] = useState<any>(null);

  const [careType, setCareType] = useState("");
  const [assistanceLevel, setAssistanceLevel] = useState("");
  const [personalCareNotes, setPersonalCareNotes] = useState("");

  const [sleepStatus, setSleepStatus] = useState("");
  const [sleepNotes, setSleepNotes] = useState("");

  const [activityTitle, setActivityTitle] = useState("");
  const [activityLocation, setActivityLocation] = useState("");
  const [activityPeople, setActivityPeople] = useState("");
  const [activityParticipation, setActivityParticipation] = useState("");
  const [activityOutcome, setActivityOutcome] = useState("");
  const [activityNotes, setActivityNotes] = useState("");

  const [communityDestination, setCommunityDestination] = useState("");
  const [communityTransport, setCommunityTransport] = useState("");
  const [communitySupportProvided, setCommunitySupportProvided] = useState("");

  const [bodyMapMarkers, setBodyMapMarkers] = useState<any[]>([]);
  const [bodyMapNotes, setBodyMapNotes] = useState("");

  const [behaviourIncidentTrigger, setBehaviourIncidentTrigger] = useState("");
  const [behaviourIncidentTypes, setBehaviourIncidentTypes] = useState<
    string[]
  >([]);
  const [behaviourIncidentDescription, setBehaviourIncidentDescription] =
    useState("");
  const [behaviourIncidentSupport, setBehaviourIncidentSupport] = useState<
    string[]
  >([]);
  const [linkedPrnAdministrationId, setLinkedPrnAdministrationId] =
    useState("");
  const [behaviourIncidentOutcomes, setBehaviourIncidentOutcomes] = useState<
    string[]
  >([]);
  const [behaviourIncidentNotes, setBehaviourIncidentNotes] = useState("");
  const [prnOptions] = useState<{ id: string; label: string }[]>([]);

  const viewingToday = isSameDay(selectedDate, new Date());

  const serviceUserName =
    `${serviceUser?.first_name ?? ""} ${serviceUser?.surname ?? ""}`.trim() ||
    "Service user";

  const filteredEntries =
    activeFilter === "All"
      ? entries
      : entries.filter((entry) => entry.entry_type === activeFilter);

  const SelectedForm = formRegistry[entryType];

  function resetEntryPanel() {
    setContent("");
    setEntryType("");
    setSelectedCategoryId(null);
    setEntryTime(getTimeNow());

    setAntecedent("");
    setBehaviour("");
    setConsequence("");

    setBehaviourObserved([]);
    setBehaviourFrequency("");
    setBehaviourSupportProvided([]);
    setBehaviourOutcome("");
    setBehaviourNotes("");

    setActivityTitle("");
    setActivityLocation("");
    setActivityPeople("");
    setActivityParticipation("");
    setActivityOutcome("");
    setActivityNotes("");

    setCommunityDestination("");
    setCommunityTransport("");
    setCommunitySupportProvided("");

    setSleepStatus("");
    setSleepNotes("");

    setBodyMapMarkers([]);
    setBodyMapNotes("");

    setBehaviourIncidentTrigger("");
    setBehaviourIncidentTypes([]);
    setBehaviourIncidentDescription("");
    setBehaviourIncidentSupport([]);
    setLinkedPrnAdministrationId("");
    setBehaviourIncidentOutcomes([]);
    setBehaviourIncidentNotes("");
  }

  async function loadServiceUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organisation_id) {
      alert("Organisation not found.");
      return;
    }

    setOrganisationId(profile.organisation_id);

    const { data, error } = await supabase
      .from("service_users")
      .select(
        `
        id,
        first_name,
        surname,
        gender,
        continence_care_enabled,
        track_pad_changes,
        track_bristol_stool_chart
      `
      )
      .eq("id", serviceUserId)
      .eq("organisation_id", profile.organisation_id)
      .single();

    if (error || !data) {
      alert("Service user not found.");
      return;
    }

    setServiceUser(data);
    setContinenceSettings(data);
  }

  async function loadEntries() {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: entriesData, error } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("service_user_id", serviceUserId)
      .gte("event_time", startOfDay.toISOString())
      .lte("event_time", endOfDay.toISOString())
      .order("event_time", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name");

    const entriesWithNames =
      entriesData?.map((entry) => {
        const profile = profilesData?.find(
          (profile) => profile.id === entry.created_by
        );

        return {
          ...entry,
          staff_name: profile?.full_name || "Unknown staff member",
        };
      }) || [];

    setEntries(entriesWithNames);
  }

  async function loadMedicationProfiles() {
    const { data, error } = await supabase
      .from("medication_profiles")
      .select("*")
      .eq("service_user_id", serviceUserId)
      .eq("active", true)
      .order("round");

    if (error) {
      alert(error.message);
      return;
    }

    setMedicationProfiles(data || []);
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

    if (!entryType) {
      return alert("Please select what you would like to record.");
    }

    const eventTime = combineDateAndTime(new Date(), entryTime);
    const saveHandler = saveRegistry[entryType];

    if (saveHandler) {
      await saveHandler({
        supabase,
        organisationId,
        serviceUserId,
        userId: user.id,
        eventTime,
        resetEntryPanel,
        setEntryPanelOpen,
        loadEntries,

        activityTitle,
        activityLocation,
        activityPeople,
        activityParticipation,
        activityOutcome,
        activityNotes,

        communityDestination,
        communityTransport,
        communitySupportProvided,

        behaviourObserved,
        behaviourFrequency,
        behaviourSupportProvided,
        behaviourOutcome,
        behaviourNotes,

        bodyMapMarkers,
        bodyMapNotes,

        behaviourIncidentTrigger,
        behaviourIncidentTypes,
        behaviourIncidentDescription,
        behaviourIncidentSupport,
        linkedPrnAdministrationId,
        behaviourIncidentOutcomes,
        behaviourIncidentNotes,
      });

      return;
    }

    if (entryType === "Sleep") {
      if (!sleepStatus) return alert("Please select sleep status.");

      const summary = sleepNotes.trim()
        ? `${sleepStatus} — ${sleepNotes.trim()}`
        : sleepStatus;

      const { error } = await supabase.from("timeline_entries").insert({
        service_user_id: serviceUserId,
        created_by: user.id,
        entry_type: "Sleep",
        content: summary,
        event_time: eventTime,
      });

      if (error) return alert(error.message);

      resetEntryPanel();
      setEntryPanelOpen(false);
      await loadEntries();
      return;
    }

    const isIncident = entryType === "Incident";

    const finalContent = isIncident
      ? `Antecedent:
${antecedent.trim()}

Behaviour:
${behaviour.trim()}

Consequence / Outcome:
${consequence.trim()}`
      : content.trim();

    if (
      isIncident &&
      (!antecedent.trim() || !behaviour.trim() || !consequence.trim())
    ) {
      return alert(
        "Please complete antecedent, behaviour and consequence/outcome."
      );
    }

    if (!finalContent.trim()) return;

    const { error } = await supabase.from("timeline_entries").insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: entryType,
      content: finalContent,
      event_time: eventTime,
    });

    if (error) return alert(error.message);

    resetEntryPanel();
    setEntryPanelOpen(false);
    await loadEntries();
  }

  useEffect(() => {
    loadServiceUser();
  }, [serviceUserId]);

  useEffect(() => {
    loadEntries();
  }, [serviceUserId, selectedDate]);

  useEffect(() => {
    loadMedicationProfiles();
  }, [serviceUserId]);

  useEffect(() => {
    if (!entryPanelRef.current) return;

    entryPanelRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [selectedCategoryId, entryType]);

  return (
    <main className="min-h-screen pb-24 text-white">
      <TimelineHeader
        serviceUserName={serviceUserName}
        selectedDate={selectedDate}
        setSelectedDate={(date) => {
          setSelectedDate(date);
          setEntryPanelOpen(false);
          resetEntryPanel();
        }}
        onFilterClick={() => setFilterOpen(true)}
      />

      {!viewingToday && (
        <div className="m-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-center text-slate-300 backdrop-blur">
          Viewing historic records. Entries can only be added to today.
        </div>
      )}

      <div className="relative px-4 pb-4 pt-4">
        <div className="absolute bottom-0 left-8 top-4 w-px bg-white/10" />

        <div className="space-y-5">
          {filteredEntries.length === 0 && (
            <div className="ml-10 rounded-3xl border border-white/10 bg-white/10 p-6 text-center text-slate-300 backdrop-blur">
              No entries for this filter/day.
            </div>
          )}

          {filteredEntries.map((entry) => (
            <TimelineEntryCard
              key={entry.id}
              entry={entry}
              serviceUserGender={serviceUser?.gender}
            />
          ))}
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-3xl bg-slate-950 p-6 md:ml-72">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filter entries</h2>

              <button
                onClick={() => setFilterOpen(false)}
                className="text-sm text-slate-400"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setFilterOpen(false);
                  }}
                  className={`w-full rounded-xl p-3 text-left ${
                    activeFilter === filter
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewingToday && !entryPanelOpen && (
        <button
          onClick={() => {
            resetEntryPanel();
            setEntryPanelOpen(true);
          }}
          className="fixed bottom-24 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-teal-400 text-3xl font-bold text-white shadow-2xl md:bottom-6"        >
          +
        </button>
      )}

      {viewingToday && entryPanelOpen && (
        <div
          ref={entryPanelRef}
          className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl space-y-4 overflow-y-auto border-l border-white/10 bg-slate-950/95 p-6 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add Entry</h2>

            <button
              onClick={() => {
                resetEntryPanel();
                setEntryPanelOpen(false);
              }}
              className="rounded-full bg-white/10 px-4 py-2 text-sm"
            >
              Close
            </button>
          </div>

          {!entryType && (
            <EntryCategoryTiles
              selectedCategoryId={selectedCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              setEntryType={setEntryType}
            />
          )}

          {entryType && (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 p-3">
                <div>
                  <p className="text-xs text-slate-400">Recording</p>
                  <p className="font-semibold text-white">{entryType}</p>
                </div>

                <button
                  onClick={() => {
                    setEntryType("");
                    setSelectedCategoryId(null);
                  }}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-slate-300"
                >
                  Change
                </button>
              </div>

              <input
                type="time"
                value={entryTime}
                onChange={(event) => setEntryTime(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
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
                  serviceUserGender={serviceUser?.gender}
                  behaviourIncidentTrigger={behaviourIncidentTrigger}
                  setBehaviourIncidentTrigger={setBehaviourIncidentTrigger}
                  behaviourIncidentTypes={behaviourIncidentTypes}
                  setBehaviourIncidentTypes={setBehaviourIncidentTypes}
                  behaviourIncidentDescription={behaviourIncidentDescription}
                  setBehaviourIncidentDescription={
                    setBehaviourIncidentDescription
                  }
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
                  className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
                />
              )}

              {entryType !== "Wellbeing" && entryType !== "Medication" && (
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
      )}
    </main>
  );
}
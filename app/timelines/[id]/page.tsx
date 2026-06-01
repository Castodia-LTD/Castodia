"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

import TimelineHeader from "@/components/timelines/TimelineHeader";
import TimelineEntryCard from "@/components/timelines/TimelineEntryCard";
import MedicationForm from "@/components/timelines/MedicationForm";
import ToiletingForm from "@/components/timelines/ToiletingForm";
import PersonalCareForm from "@/components/timelines/PersonalCareForm";
import SleepForm from "@/components/timelines/SleepForm";
import WellbeingObservationForm from "@/components/wellbeing/WellbeingObservationForm";

import { entryTypes, filters } from "@/lib/timelines/constants";
import type { ServiceUser, TimelineEntry } from "@/lib/timelines/types";
import {
  combineDateAndTime,
  getTimeNow,
  isSameDay,
} from "@/lib/shared/date";

export default function ServiceUserPage() {
  const params = useParams();
  const serviceUserId = params.id as string;

  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState("Activity");
  const [entryPanelOpen, setEntryPanelOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entryTime, setEntryTime] = useState(getTimeNow());

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  const [antecedent, setAntecedent] = useState("");
  const [behaviour, setBehaviour] = useState("");
  const [consequence, setConsequence] = useState("");

  const [medicationProfiles, setMedicationProfiles] = useState<any[]>([]);
  const [selectedRound, setSelectedRound] = useState("Morning");
  const [medicationStatuses, setMedicationStatuses] = useState<Record<string, string>>({});
  const [medicationReasons, setMedicationReasons] = useState<Record<string, string>>({});

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

  const viewingToday = isSameDay(selectedDate, new Date());

  const serviceUserName =
    `${serviceUser?.first_name ?? ""} ${serviceUser?.surname ?? ""}`.trim() ||
    "Service user";

  const filteredEntries =
    activeFilter === "All"
      ? entries
      : entries.filter((entry) => entry.entry_type === activeFilter);

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

    const { data, error } = await supabase
      .from("service_users")
      .select(`
        id,
        first_name,
        surname,
        continence_care_enabled,
        track_pad_changes,
        track_bristol_stool_chart
      `)
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
    if (!viewingToday) return alert("Entries can only be added to today’s record.");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return alert("You must be logged in to create an entry.");

    const eventTime = combineDateAndTime(new Date(), entryTime);

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

      setSleepStatus("");
      setSleepNotes("");
      setEntryTime(getTimeNow());
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

    if (!finalContent.trim()) return;

    if (
      isIncident &&
      (!antecedent.trim() || !behaviour.trim() || !consequence.trim())
    ) {
      return alert("Please complete antecedent, behaviour and consequence/outcome.");
    }

    const { error } = await supabase.from("timeline_entries").insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: entryType,
      content: finalContent,
      event_time: eventTime,
    });

    if (error) return alert(error.message);

    setContent("");
    setAntecedent("");
    setBehaviour("");
    setConsequence("");
    setEntryTime(getTimeNow());
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 pb-24 text-white">
      <TimelineHeader
        serviceUserName={serviceUserName}
        selectedDate={selectedDate}
        setSelectedDate={(date) => {
          setSelectedDate(date);
          setEntryPanelOpen(false);
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
            <TimelineEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50">
          <div className="w-full rounded-t-3xl bg-slate-950 p-6">
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
          onClick={() => setEntryPanelOpen(true)}
          className="fixed bottom-6 left-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-4xl font-light shadow-2xl shadow-blue-900/40"
        >
          +
        </button>
      )}

      {viewingToday && entryPanelOpen && (
        <div className="fixed bottom-0 left-0 right-0 max-h-[75vh] space-y-2 overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Add Entry</h2>

            <button
              onClick={() => setEntryPanelOpen(false)}
              className="rounded-full bg-white/10 px-4 py-2 text-sm"
            >
              Close
            </button>
          </div>

          <input
            type="time"
            value={entryTime}
            onChange={(e) => setEntryTime(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
          />

          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          >
            {entryTypes.map((type) => (
              <option key={type} value={type} className="bg-slate-900 text-white">
                {type}
              </option>
            ))}
          </select>

          {entryType === "Incident" ? (
            <div className="space-y-2">
              <textarea
                value={antecedent}
                onChange={(e) => setAntecedent(e.target.value)}
                placeholder="Antecedent — what happened before?"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
              />

              <textarea
                value={behaviour}
                onChange={(e) => setBehaviour(e.target.value)}
                placeholder="Behaviour — what happened?"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
              />

              <textarea
                value={consequence}
                onChange={(e) => setConsequence(e.target.value)}
                placeholder="Consequence / Outcome — what happened afterwards?"
                className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
              />
            </div>
          ) : entryType === "Medication" ? (
            <MedicationForm
              selectedRound={selectedRound}
              setSelectedRound={setSelectedRound}
              medicationProfiles={medicationProfiles}
              medicationStatuses={{}}
              setMedicationStatuses={() => {}}
              medicationReasons={{}}
              setMedicationReasons={() => {}}
            />
          ) : entryType === "Toileting" ? (
            <ToiletingForm
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
            />
          ) : entryType === "Personal Care" ? (
            <PersonalCareForm
              careType={careType}
              setCareType={setCareType}
              assistanceLevel={assistanceLevel}
              setAssistanceLevel={setAssistanceLevel}
              personalCareNotes={personalCareNotes}
              setPersonalCareNotes={setPersonalCareNotes}
            />
          ) : entryType === "Sleep" ? (
            <SleepForm
              sleepStatus={sleepStatus}
              setSleepStatus={setSleepStatus}
              sleepNotes={sleepNotes}
              setSleepNotes={setSleepNotes}
            />
          ) : entryType === "Wellbeing" ? (
            <WellbeingObservationForm
              serviceUserId={serviceUserId}
              serviceUserName={serviceUserName}
              onSaved={async () => {
                setEntryTime(getTimeNow());
                setEntryPanelOpen(false);
                await loadEntries();
              }}
            />
          ) : (
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write entry..."
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
            />
          )}

          {entryType !== "Wellbeing" && (
            <button
              onClick={addEntry}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-xl font-semibold"
            >
              Save Entry
            </button>
          )}
        </div>
      )}
    </main>
  );
}
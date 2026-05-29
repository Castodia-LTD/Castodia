"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import WellbeingObservationForm from "@/components/wellbeing/WellbeingObservationForm";
import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Filter,
  Moon,
  Pill,
  Soup,
  Toilet,
  UserRound,
  Utensils,
  HeartPulse,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type TimelineEntry = {
  id: string;
  service_user_id: string;
  created_by: string;
  entry_type: string;
  content: string;
  created_at: string;
  event_time: string;
  reviewed: boolean;
  staff_name?: string;
};

type ServiceUser = {
  id: string;
  first_name: string | null;
  surname: string | null;
};

function isSameDay(dateA: Date, dateB: Date) {
  return dateA.toDateString() === dateB.toDateString();
}

function getTimeNow() {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
}

function combineDateAndTime(date: Date, time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

function formatAuditDate(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatEventTime(value: string) {
  return new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntryStyle(type: string) {
  switch (type) {
    case "Medication":
      return {
        icon: Pill,
        accent: "from-blue-500 to-cyan-400",
        border: "border-blue-400/30",
        text: "text-blue-200",
      };
      case "Personal Care":
  return {
    icon: Soup,
    accent: "from-pink-500 to-rose-400",
    border: "border-pink-400/30",
    text: "text-pink-200",
  };
    case "Food / Fluid":
      return {
        icon: Utensils,
        accent: "from-emerald-500 to-teal-400",
        border: "border-emerald-400/30",
        text: "text-emerald-200",
      };
    case "Toileting":
      return {
        icon: Toilet,
        accent: "from-sky-500 to-blue-400",
        border: "border-sky-400/30",
        text: "text-sky-200",
      };
    case "Behaviour":
      return {
        icon: UserRound,
        accent: "from-purple-500 to-fuchsia-400",
        border: "border-purple-400/30",
        text: "text-purple-200",
      };
    case "Incident":
      return {
        icon: AlertTriangle,
        accent: "from-red-500 to-orange-400",
        border: "border-red-400/30",
        text: "text-red-200",
      };
    case "Sleep":
      return {
        icon: Moon,
        accent: "from-indigo-500 to-violet-400",
        border: "border-indigo-400/30",
        text: "text-indigo-200",
      };
    case "Body Map":
      return {
        icon: ClipboardList,
        accent: "from-amber-500 to-yellow-400",
        border: "border-amber-400/30",
        text: "text-amber-200",
      };
      case "Wellbeing":
  return {
    icon: HeartPulse,
    accent: "from-emerald-500 to-green-400",
    border: "border-emerald-400/30",
    text: "text-emerald-200",
  };
    default:
      return {
        icon: Activity,
        accent: "from-teal-500 to-blue-400",
        border: "border-teal-400/30",
        text: "text-teal-200",
      };
  }
}

const filters = [
  "All",
  "Medication",
  "Food / Fluid",
  "Toileting",
  "Personal Care",
  "Behaviour",
  "Incident",
  "Sleep",
  "Body Map",
  "Wellbeing",
  "Activity",
];

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

const viewingToday = isSameDay(selectedDate, new Date());

 async function loadServiceUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organisation_id) {
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

    const { data: entriesData, error: entriesError } = await supabase
      .from("timeline_entries")
      .select("*")
      .eq("service_user_id", serviceUserId)
      .gte("event_time", startOfDay.toISOString())
      .lte("event_time", endOfDay.toISOString())
      .order("event_time", { ascending: false });

    if (entriesError) {
      alert(entriesError.message);
      return;
    }

    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name");

    if (profilesError) {
      alert(profilesError.message);
      return;
    }

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
      alert("Entries can only be added to today’s record.");
      return;
    }
if (entryType === "Medication") {
  const medsForRound = medicationProfiles.filter(
    (med) => med.round === selectedRound
  );

  if (medsForRound.length === 0) {
    alert("No medications found for this round.");
    return;
  }

  for (const med of medsForRound) {
    const status = medicationStatuses[med.id];
    const reason = medicationReasons[med.id];

    if (!status) {
      alert(`Please select a status for ${med.medication_name}.`);
      return;
    }

    if (status !== "Administered" && !reason) {
      alert(`Please select a reason for ${med.medication_name}.`);
      return;
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    alert("You must be logged in to create an entry.");
    return;
  }

  const eventTime = combineDateAndTime(new Date(), entryTime);

  const administrationRows = medsForRound.map((med) => ({
    service_user_id: serviceUserId,
    medication_profile_id: med.id,
    administered_by: user.id,
    round: selectedRound,
    status: medicationStatuses[med.id],
    reason:
      medicationStatuses[med.id] === "Administered"
        ? null
        : medicationReasons[med.id],
    administered_at: eventTime,
administration_date: new Date(eventTime)
  .toISOString()
  .slice(0, 10),
  }));

  const { error: medError } = await supabase
    .from("medication_administrations")
    .insert(administrationRows);

  if (medError) {
    alert(medError.message);
    return;
  }

  const summary = medsForRound
    .map((med) => {
      const status = medicationStatuses[med.id];
      const reason = medicationReasons[med.id];

      return `${med.medication_name} ${med.dose} — ${status}${
        status !== "Administered" ? ` (${reason})` : ""
      }`;
    })
    .join("\n");

  const { error: timelineError } = await supabase
    .from("timeline_entries")
    .insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: "Medication",
      content: `${selectedRound} medication round:\n${summary}`,
      event_time: eventTime,
    });

  if (timelineError) {
    alert(timelineError.message);
    return;
  }

  setMedicationStatuses({});
  setMedicationReasons({});
  setEntryTime(getTimeNow());
  setEntryPanelOpen(false);

  await loadEntries();
  return;
}
if (entryType === "Toileting") {
  if (!toiletingOutcome) {
    alert("Please select a toileting outcome.");
    return;
  }

  if (!assistanceRequired) {
    alert("Please select whether assistance was required.");
    return;
  }

  if (continenceSettings?.track_pad_changes && !padChanged) {
    alert("Please select whether pad was changed.");
    return;
  }

  if (
    continenceSettings?.track_bristol_stool_chart &&
    (toiletingOutcome === "Bowel movement" || toiletingOutcome === "Both") &&
    !bristolType
  ) {
    alert("Please select a Bristol stool type.");
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

  const eventTime = combineDateAndTime(new Date(), entryTime);

  const { error: toiletingError } = await supabase
    .from("toileting_records")
    .insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      toileting_outcome: toiletingOutcome,
      assistance_required: assistanceRequired,
      pad_changed: continenceSettings?.track_pad_changes
        ? padChanged
        : null,
      bristol_stool_type:
        continenceSettings?.track_bristol_stool_chart &&
        (toiletingOutcome === "Bowel movement" || toiletingOutcome === "Both")
          ? Number(bristolType)
          : null,
      notes: toiletingNotes.trim() || null,
      occurred_at: eventTime,
    });

  if (toiletingError) {
    alert(toiletingError.message);
    return;
  }

  const summaryParts = [
    `Outcome: ${toiletingOutcome}`,
    `Assistance: ${assistanceRequired}`,
  ];

  if (continenceSettings?.track_pad_changes) {
    summaryParts.push(`Pad changed: ${padChanged}`);
  }

  if (
    continenceSettings?.track_bristol_stool_chart &&
    (toiletingOutcome === "Bowel movement" || toiletingOutcome === "Both")
  ) {
    summaryParts.push(`Bristol stool type: ${bristolType}`);
  }

  if (toiletingNotes.trim()) {
    summaryParts.push(`Notes: ${toiletingNotes.trim()}`);
  }

  const { error: timelineError } = await supabase
    .from("timeline_entries")
    .insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: "Toileting",
      content: summaryParts.join("\n"),
      event_time: eventTime,
    });

  if (timelineError) {
    alert(timelineError.message);
    return;
  }

  setToiletingOutcome("");
  setAssistanceRequired("");
  setPadChanged("");
  setBristolType("");
  setToiletingNotes("");
  setEntryTime(getTimeNow());
  setEntryPanelOpen(false);

  await loadEntries();
  return;
}
if (entryType === "Personal Care") {
  if (!careType) {
    alert("Please select care completed.");
    return;
  }

  if (!assistanceLevel) {
    alert("Please select assistance level.");
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

  const eventTime = combineDateAndTime(new Date(), entryTime);

  const { error: personalCareError } = await supabase
    .from("personal_care_records")
    .insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      care_type: careType,
      assistance_level: assistanceLevel,
      notes: personalCareNotes.trim() || null,
      occurred_at: eventTime,
    });

  if (personalCareError) {
    alert(personalCareError.message);
    return;
  }

  const summaryParts = [
    `Care completed: ${careType}`,
    `Assistance: ${assistanceLevel}`,
  ];

  if (personalCareNotes.trim()) {
    summaryParts.push(`Notes: ${personalCareNotes.trim()}`);
  }

  const { error: timelineError } = await supabase
    .from("timeline_entries")
    .insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: "Personal Care",
      content: summaryParts.join("\n"),
      event_time: eventTime,
    });

  if (timelineError) {
    alert(timelineError.message);
    return;
  }

  setCareType("");
  setAssistanceLevel("");
  setPersonalCareNotes("");

  setEntryTime(getTimeNow());
  setEntryPanelOpen(false);

  await loadEntries();
  return;
}
if (entryType === "Sleep") {
  if (!sleepStatus) {
    alert("Please select sleep status.");
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

  const eventTime = combineDateAndTime(new Date(), entryTime);

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

  if (error) {
    alert(error.message);
    return;
  }

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
      alert("Please complete antecedent, behaviour and consequence/outcome.");
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

    const { error } = await supabase.from("timeline_entries").insert({
      service_user_id: serviceUserId,
      created_by: user.id,
      entry_type: entryType,
      content: finalContent,
      event_time: combineDateAndTime(new Date(), entryTime),
    });

    if (error) {
      alert(error.message);
      return;
    }

    setContent("");
    setAntecedent("");
    setBehaviour("");
    setConsequence("");
    setEntryTime(getTimeNow());
    setEntryPanelOpen(false);

    await loadEntries();
  }

  function previousDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
    setEntryPanelOpen(false);
  }

  function nextDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
    setEntryPanelOpen(false);
  }

  function goToToday() {
    setSelectedDate(new Date());
    setEntryPanelOpen(false);
  }

  const filteredEntries =
    activeFilter === "All"
      ? entries
      : entries.filter((entry) => entry.entry_type === activeFilter);

  useEffect(() => {
    loadServiceUser();
  }, [serviceUserId]);

  useEffect(() => {
    loadEntries();
  }, [serviceUserId, selectedDate]);

  useEffect(() => {
  loadMedicationProfiles();
  }, [serviceUserId]);

const serviceUserName =
  `${serviceUser?.first_name ?? ""} ${serviceUser?.surname ?? ""}`.trim() ||
  "Service user";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pb-24">

      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-400">
            ← Dashboard
          </Link>

          <h1 className="text-lg font-semibold text-center">
            {serviceUserName}
          </h1>

          <button
            onClick={() => setFilterOpen(true)}
            className="rounded-xl bg-white/10 p-2 text-slate-200"
          >
            <Filter size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={previousDay}
            className="rounded-full bg-white/10 px-4 py-2"
          >
            ←
          </button>

          <button onClick={goToToday} className="font-semibold">
            {selectedDate.toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </button>

          <button
            onClick={nextDay}
            className="rounded-full bg-white/10 px-4 py-2"
          >
            →
          </button>
        </div>
      </div>

      {!viewingToday && (
        <div className="m-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-center text-slate-300 backdrop-blur">
          Viewing historic records. Entries can only be added to today.
        </div>
      )}

      <div className="relative p-4">
        <div className="absolute bottom-0 left-8 top-4 w-px bg-white/10" />

        <div className="space-y-5">
          {filteredEntries.length === 0 && (
            <div className="ml-10 rounded-3xl border border-white/10 bg-white/10 p-6 text-center text-slate-300 backdrop-blur">
              No entries for this filter/day.
            </div>
          )}

          {filteredEntries.map((entry) => {
            const style = getEntryStyle(entry.entry_type);
            const Icon = style.icon;

            const cardContent = (
              <>
                <div
                  className={`absolute -left-[50px] top-5 flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${style.accent} shadow-lg`}
                >
                  <Icon size={19} className="text-white" />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-slate-950/60 px-3 py-1 text-sm font-semibold text-slate-200">
                      {formatEventTime(entry.event_time)}
                    </span>

                    <h2 className={`mt-3 text-xl font-bold ${style.text}`}>
                      {entry.entry_type}
                    </h2>
                  </div>

                  {entry.entry_type === "Incident" && entry.reviewed && (
                    <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold">
                      Reviewed
                    </span>
                  )}
                </div>

                {entry.entry_type === "Incident" ? (
                  <p className="mt-3 text-slate-300">
                    Tap to view incident details
                  </p>
                ) : (
                  <p className="mt-3 whitespace-pre-line text-lg text-slate-100">
                    {entry.content}
                  </p>
                )}

                <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
                  Entered by {entry.staff_name}, {formatAuditDate(entry.created_at)}
                </p>
              </>
            );

            return entry.entry_type === "Incident" ? (
              <Link
                key={entry.id}
                href={`/incidents/${entry.id}`}
                className={`relative ml-10 block rounded-3xl border ${style.border} bg-white/10 p-5 shadow-xl backdrop-blur transition hover:bg-white/15`}
              >
                {cardContent}
              </Link>
            ) : (
              <div
                key={entry.id}
                className={`relative ml-10 rounded-3xl border ${style.border} bg-white/10 p-5 shadow-xl backdrop-blur`}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Filter Entries</h2>

              <button
                onClick={() => setFilterOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => {
                    setActiveFilter(filter);
                    setFilterOpen(false);
                  }}
                  className={`w-full rounded-2xl p-4 text-left transition ${
                    activeFilter === filter
                      ? "bg-blue-500 text-white"
                      : "bg-white/10 text-slate-200"
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
        <div className="fixed bottom-0 left-0 right-0 max-h-[75vh] space-y-2 overflow-y-auto rounded-t-3xl border-t border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">auto rounded-t-3xl border-t border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur"
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
  <option value="Medication" className="bg-slate-900 text-white">
    Medication
  </option>

  <option value="Food / Fluid" className="bg-slate-900 text-white">
    Food / Fluid
  </option>

  <option value="Toileting" className="bg-slate-900 text-white">
    Toileting
  </option>

  <option value="Personal Care" className="bg-slate-900 text-white">
    Personal Care
  </option>

  <option value="Behaviour" className="bg-slate-900 text-white">
    Behaviour
  </option>

  <option value="Incident" className="bg-slate-900 text-white">
    Incident
  </option>

  <option value="Sleep" className="bg-slate-900 text-white">
    Sleep
  </option>

  <option value="Body Map" className="bg-slate-900 text-white">
    Body Map
  </option>
<option value="Wellbeing">Wellbeing</option>
  <option value="Activity" className="bg-slate-900 text-white">
    Activity
  </option>
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
  <div className="space-y-4">

    <select
      value={selectedRound}
      onChange={(e) => setSelectedRound(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
    >
      <option value="Morning">Morning</option>
      <option value="Lunch">Lunch</option>
      <option value="Tea">Tea</option>
      <option value="Night">Night</option>
      <option value="PRN">PRN</option>
    </select>

    {medicationProfiles
      .filter((med) => med.round === selectedRound)
      .map((med) => (
        <div
          key={med.id}
          className="space-y-3 rounded-2xl border border-white/10 bg-white/10 p-4"
        >
          <div>
            <p className="font-semibold text-white">
              {med.medication_name}
            </p>

            <p className="text-sm text-slate-300">
              {med.dose}
            </p>
          </div>

          <select
            value={medicationStatuses[med.id] || ""}
            onChange={(e) =>
              setMedicationStatuses({
                ...medicationStatuses,
                [med.id]: e.target.value,
              })
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-white outline-none"
          >
            <option value="">Select status</option>
            <option value="Administered">Administered</option>
            <option value="Refused">Refused</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Omitted">Omitted</option>
          </select>

          {medicationStatuses[med.id] &&
            medicationStatuses[med.id] !== "Administered" && (
              <select
                value={medicationReasons[med.id] || ""}
                onChange={(e) =>
                  setMedicationReasons({
                    ...medicationReasons,
                    [med.id]: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-red-500/20 bg-red-950/40 p-3 text-white outline-none"
              >
                <option value="">Select reason</option>
                <option value="Refused by service user">
                  Refused by service user
                </option>
                <option value="Medication unavailable">
                  Medication unavailable
                </option>
                <option value="Asleep">
                  Asleep
                </option>
                <option value="Away from service">
                  Away from service
                </option>
                <option value="Clinical decision">
                  Clinical decision
                </option>
              </select>
            )}
        </div>
      ))}
  </div>
) : entryType === "Toileting" ? (
  <div className="space-y-4">

    <select
      value={toiletingOutcome}
      onChange={(e) => setToiletingOutcome(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
    >
      <option value="">Select outcome</option>
      <option value="Passed urine">Passed urine</option>
      <option value="Bowel movement">Bowel movement</option>
      <option value="Both">Both</option>
      <option value="No result">No result</option>
    </select>

    <select
      value={assistanceRequired}
      onChange={(e) => setAssistanceRequired(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
    >
      <option value="">Assistance required?</option>
      <option value="Yes">Yes</option>
      <option value="No">No</option>
      <option value="N/A">N/A</option>
    </select>

    {continenceSettings?.track_pad_changes && (
      <select
        value={padChanged}
        onChange={(e) => setPadChanged(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="">Pad changed?</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
      </select>
    )}

    {continenceSettings?.track_bristol_stool_chart &&
      (toiletingOutcome === "Bowel movement" ||
        toiletingOutcome === "Both") && (
        <select
          value={bristolType}
          onChange={(e) => setBristolType(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          <option value="">Bristol stool type</option>

          <option value="1">Type 1</option>
          <option value="2">Type 2</option>
          <option value="3">Type 3</option>
          <option value="4">Type 4</option>
          <option value="5">Type 5</option>
          <option value="6">Type 6</option>
          <option value="7">Type 7</option>
        </select>
      )}

    <textarea
      value={toiletingNotes}
      onChange={(e) => setToiletingNotes(e.target.value)}
      placeholder="Additional notes..."
      className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
    />

  </div>
) : entryType === "Personal Care" ? (
  <div className="space-y-4">

    <select
      value={careType}
      onChange={(e) => setCareType(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
    >
      <option value="">Select care completed</option>

      <option value="Shower">Shower</option>
      <option value="Bath">Bath</option>
      <option value="Strip wash">Strip wash</option>
      <option value="Face / hands">Face / hands</option>
      <option value="Oral care">Oral care</option>
      <option value="Hair wash">Hair wash</option>
      <option value="Shave">Shave</option>
      <option value="Clothing changed">Clothing changed</option>
      <option value="No personal care completed">
        No personal care completed
      </option>
    </select>

    <select
      value={assistanceLevel}
      onChange={(e) => setAssistanceLevel(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
    >
      <option value="">Select assistance level</option>

      <option value="Independent">Independent</option>
      <option value="Prompted">Prompted</option>
      <option value="Assisted">Assisted</option>
      <option value="Fully supported">Fully supported</option>
      <option value="Refused">Refused</option>
    </select>

    <textarea
      value={personalCareNotes}
      onChange={(e) => setPersonalCareNotes(e.target.value)}
      placeholder="Additional notes..."
      className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
    />

  </div>
  ) : entryType === "Sleep" ? (
  <div className="space-y-4">

    <select
      value={sleepStatus}
      onChange={(e) => setSleepStatus(e.target.value)}
      className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
    >
      <option value="">Select sleep status</option>

      <option value="Asleep">Asleep</option>
      <option value="Awake">Awake</option>
    </select>

    <textarea
      value={sleepNotes}
      onChange={(e) => setSleepNotes(e.target.value)}
      placeholder="Optional notes..."
      className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
    />

  </div>
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
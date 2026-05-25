"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  full_name: string;
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
  "Behaviour",
  "Incident",
  "Sleep",
  "Body Map",
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

  const viewingToday = isSameDay(selectedDate, new Date());

  async function loadServiceUser() {
    const { data, error } = await supabase
      .from("service_users")
      .select("id, full_name")
      .eq("id", serviceUserId)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setServiceUser(data);
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

  async function addEntry() {
    if (!viewingToday) {
      alert("Entries can only be added to today’s record.");
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white pb-24">
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-slate-400">
            ← Dashboard
          </Link>

          <h1 className="text-lg font-semibold text-center">
            {serviceUser?.full_name || "Loading..."}
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
        <div className="fixed bottom-0 left-0 right-0 space-y-2 rounded-t-3xl border-t border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
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
          ) : (
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write entry..."
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
            />
          )}

          <button
            onClick={addEntry}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-xl font-semibold"
          >
            Save Entry
          </button>
        </div>
      )}
    </main>
  );
}
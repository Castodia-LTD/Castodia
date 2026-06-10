"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

import {
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";

import { useTimelineForm } from "../hooks/useTimelineForm";

type Props = {
  serviceUserId: string;
  onSaved: () => void;
};

const entryTypes = [
  "Activity",
  "Community Access",
  "Social Interaction",
  "Contact/Visit",
  "Shopping",
  "Household Tasks",
  "Health Observation",
  "Symptoms",
  "Health Professional",
  "Clinical Care",
  "eMAR",
  "Wellbeing Observation",
  "Behaviour Observation",
  "Sleep Check",
  "Personal Care",
  "Toileting",
  "Continence Care",
  "Nutrition & Hydration",
  "Environment Check",
  "Accident/Injury",
  "Fall",
  "Behaviour Incident",
  "Safeguarding Concern",
  "Medication Error",
  "Near Miss",
];

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const textareaClass =
  "mt-2 min-h-32 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function TimelineEntryPanel({
  serviceUserId,
  onSaved,
}: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useTimelineForm();

  async function saveEntry() {
    if (!form.content.trim()) {
      alert("Please enter timeline details.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    setSaving(true);

    const now = new Date().toISOString();

    const { error } = await supabase.from("timeline_entries").insert({
      service_user_id: serviceUserId,
      entry_type: form.entryType || "Activity",
      content: form.content.trim(),
      event_time: now,
      created_by: user.id,
    });

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    form.resetEntryPanel();
    form.setEntryType("Activity");
    setPanelOpen(false);
    setSaving(false);
    onSaved();
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <CastodiaButton
          type="button"
          onClick={() => {
            form.setEntryType(form.entryType || "Activity");
            setPanelOpen(true);
          }}
          className="h-14 w-14 rounded-full p-0 shadow-xl"
        >
          <Plus size={24} />
        </CastodiaButton>
      </div>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-slate-50 p-6 shadow-2xl">
            <CastodiaCard>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Add Timeline Entry
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Record a new timeline note for this service user.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    form.resetEntryPanel();
                    setPanelOpen(false);
                  }}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Entry type
                  </label>

                  <select
                    value={form.entryType || "Activity"}
                    onChange={(event) => form.setEntryType(event.target.value)}
                    className={inputClass}
                  >
                    {entryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Details
                  </label>

                  <textarea
                    value={form.content}
                    onChange={(event) => form.setContent(event.target.value)}
                    placeholder="Write timeline details..."
                    className={textareaClass}
                  />
                </div>

                <CastodiaButton
                  type="button"
                  onClick={saveEntry}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Entry"}
                </CastodiaButton>
              </div>
            </CastodiaCard>
          </div>
        </div>
      )}
    </>
  );
}
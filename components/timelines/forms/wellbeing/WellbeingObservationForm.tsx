"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  defaultObservedIndicators,
  overallPresentationOptions,
} from "@/lib/wellbeing/constants";
import {
  createWellbeingObservation,
  getServiceUserWellbeingIndicators,
} from "@/lib/wellbeing/queries";

type Props = {
  serviceUserId: string;
  serviceUserName: string;
  onSaved?: () => void;
};

export default function WellbeingObservationForm({
  serviceUserId,
  serviceUserName,
  onSaved,
}: Props) {
  const [customIndicators, setCustomIndicators] = useState<string[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCustomIndicators() {
      const data = await getServiceUserWellbeingIndicators(serviceUserId);
      setCustomIndicators(data.map((item) => item.label));
    }

    loadCustomIndicators();
  }, [serviceUserId]);

  function toggleIndicator(indicator: string) {
    setSelectedIndicators((current) =>
      current.includes(indicator)
        ? current.filter((item) => item !== indicator)
        : [...current, indicator]
    );
  }

  async function handleSave() {
    if (!selectedScore) {
      alert("Please select an overall presentation.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in.");
        return;
      }

      const selectedOption = overallPresentationOptions.find(
        (option) => option.score === selectedScore
      );

      if (!selectedOption) return;

      await createWellbeingObservation({
        serviceUserId,
        serviceUserName,
        overallPresentationScore: selectedOption.score,
        overallPresentationLabel: selectedOption.label,
        observedIndicators: selectedIndicators,
        notes,
        recordedBy: user.id,
      });

      setSelectedScore(null);
      setSelectedIndicators([]);
      setNotes("");

      onSaved?.();
    } catch (error) {
      console.error(error);
      alert("Unable to save wellbeing observation.");
    } finally {
      setSaving(false);
    }
  }

  const allIndicators = [...defaultObservedIndicators, ...customIndicators];

  return (
    <div className="space-y-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
      <div>
        <h2 className="text-xl font-bold text-emerald-300">
          Wellbeing Observation
        </h2>
        <p className="text-sm text-emerald-200/70">
          Record overall presentation and observed indicators.
        </p>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Overall Presentation</h3>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {overallPresentationOptions.map((option) => (
            <button
              key={option.score}
              type="button"
              onClick={() => setSelectedScore(option.score)}
              className={`rounded-2xl border px-3 py-3 text-sm ${
                selectedScore === option.score
                  ? "border-emerald-300 bg-emerald-400/20 text-emerald-100"
                  : "border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Observed Indicators</h3>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {allIndicators.map((indicator) => (
            <label
              key={indicator}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={selectedIndicators.includes(indicator)}
                onChange={() => toggleIndicator(indicator)}
              />
              <span>{indicator}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-semibold">Additional Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-white"
          placeholder="Add any additional observations..."
        />
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-2xl bg-emerald-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Wellbeing Observation"}
      </button>
    </div>
  );
}
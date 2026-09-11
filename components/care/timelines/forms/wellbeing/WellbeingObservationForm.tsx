"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { combineDateAndTime } from "@/lib/shared/date";
import {
  defaultObservedIndicators,
  overallPresentationOptions,
} from "@/lib/care/wellbeing/constants";
import {
  createWellbeingObservation,
  getServiceUserWellbeingIndicators,
} from "@/lib/care/wellbeing/queries";
import {
  FormChoiceGroup,
  FormField,
  FormSection,
  FormTextarea,
  primaryActionBase,
} from "@/components/care/timelines/forms/shared";

type Props = {
  serviceUserId: string;
  serviceUserName: string;
  entryTime?: string;
  onSaved?: () => void | Promise<void>;
  saving?: boolean;
  setSaving?: (saving: boolean) => void;
  setSaveError?: (message: string | null) => void;
};

export default function WellbeingObservationForm({
  serviceUserId,
  serviceUserName,
  entryTime,
  onSaved,
  saving: sharedSaving,
  setSaving: setSharedSaving,
  setSaveError,
}: Props) {
  const [customIndicators, setCustomIndicators] = useState<string[]>([]);
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [localSaving, setLocalSaving] = useState(false);

  const saving = sharedSaving ?? localSaving;
  const setSaving = (value: boolean) => {
    setLocalSaving(value);
    setSharedSaving?.(value);
  };

  useEffect(() => {
    async function loadCustomIndicators() {
      try {
        const data = await getServiceUserWellbeingIndicators(serviceUserId);
        setCustomIndicators(data.map((item) => item.label));
      } catch (error) {
        console.error("Unable to load wellbeing indicators", error);
      }
    }

    void loadCustomIndicators();
  }, [serviceUserId]);

  function toggleIndicator(indicator: string) {
    setSelectedIndicators((current) =>
      current.includes(indicator)
        ? current.filter((item) => item !== indicator)
        : [...current, indicator],
    );
  }

  async function handleSave() {
    if (saving) return;

    if (!selectedScore) {
      setSaveError?.("Please select an overall presentation.");
      return;
    }

    setSaving(true);
    setSaveError?.(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setSaveError?.("You must be logged in to create an entry.");
        return;
      }

      const selectedOption = overallPresentationOptions.find(
        (option) => option.score === selectedScore,
      );

      if (!selectedOption) {
        setSaveError?.("Please select an overall presentation.");
        return;
      }

      const eventTime = entryTime
        ? combineDateAndTime(new Date(), entryTime)
        : new Date().toISOString();

      await createWellbeingObservation({
        serviceUserId,
        serviceUserName,
        overallPresentationScore: selectedOption.score,
        overallPresentationLabel: selectedOption.label,
        observedIndicators: selectedIndicators,
        notes,
        recordedBy: user.id,
        eventTime,
      });

      setSelectedScore(null);
      setSelectedIndicators([]);
      setNotes("");
      setSaving(false);
      await onSaved?.();
    } catch (error) {
      console.error(error);
      setSaveError?.(
        error instanceof Error
          ? error.message
          : "Unable to save wellbeing observation.",
      );
    } finally {
      setSaving(false);
    }
  }

  const allIndicators = [...defaultObservedIndicators, ...customIndicators];
  const presentationOptions = overallPresentationOptions.map((option) => ({
    value: String(option.score),
    label: option.label,
  }));

  return (
    <div className="space-y-4">
      <FormSection
        title="Overall presentation"
        description={`How does ${serviceUserName} appear overall right now?`}
      >
        <FormChoiceGroup
          label="Presentation"
          value={selectedScore ? String(selectedScore) : ""}
          options={presentationOptions}
          onChange={(value) => setSelectedScore(Number(value))}
          required
          disabled={saving}
          columns={2}
        />
      </FormSection>

      {selectedScore ? (
        <FormSection
          title="Observed indicators"
          description="Select only what you actually observed."
          collapsible
          defaultOpen
          summary={
            selectedIndicators.length
              ? selectedIndicators.join(", ")
              : "No indicators selected"
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {allIndicators.map((indicator) => {
              const checked = selectedIndicators.includes(indicator);
              return (
                <label
                  key={indicator}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                    checked
                      ? "border-teal-400 bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={saving}
                    onChange={() => toggleIndicator(indicator)}
                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{indicator}</span>
                </label>
              );
            })}
          </div>
        </FormSection>
      ) : null}

      {selectedScore ? (
        <FormSection
          title="Additional notes"
          description="Optional context that is not already captured above."
          collapsible
          defaultOpen={false}
          summary={notes.trim() || "No additional notes"}
        >
          <FormField label="Notes">
            <FormTextarea
              value={notes}
              disabled={saving}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Add a concise observation only if it adds useful context…"
            />
          </FormField>
        </FormSection>
      ) : null}

      {selectedScore ? (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={`w-full ${primaryActionBase}`}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Saving entry…
            </span>
          ) : (
            "Save entry"
          )}
        </button>
      ) : null}
    </div>
  );
}

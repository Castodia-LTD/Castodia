"use client";

import {
  FormChoiceGroup,
  FormField,
  FormInput,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

type ExtraField = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: "text" | "textarea";
};

type Props = {
  primaryLabel: string;
  primaryPlaceholder: string;
  primaryValue: string;
  setPrimaryValue: (value: string) => void;

  extraFields?: ExtraField[];

  participationLevel: string;
  setParticipationLevel: (value: string) => void;

  outcome: string;
  setOutcome: (value: string) => void;

  notes: string;
  setNotes: (value: string) => void;
};

const participationOptions = [
  {
    value: "Independent",
    label: "Independent",
    description: "Completed without staff support.",
  },
  {
    value: "Prompted",
    label: "Prompted",
    description: "Verbal encouragement or reminders were provided.",
  },
  {
    value: "Supported",
    label: "Supported",
    description: "Practical staff support was provided.",
  },
  {
    value: "Full Assistance",
    label: "Full assistance",
    description: "Staff provided most or all of the support required.",
  },
  {
    value: "Refused",
    label: "Refused",
    description: "The activity was offered but declined.",
  },
];

const outcomeOptions = [
  {
    value: "Very Positive",
    label: "Very positive",
    description: "Strong engagement or clear benefit observed.",
  },
  {
    value: "Positive",
    label: "Positive",
    description: "The activity was completed with a positive outcome.",
  },
  {
    value: "Neutral",
    label: "Neutral",
    description: "No significant positive or negative outcome observed.",
  },
  {
    value: "Negative",
    label: "Negative",
    description: "Distress, dissatisfaction or another negative outcome was observed.",
  },
  {
    value: "Unable to Complete",
    label: "Unable to complete",
    description: "The activity could not be completed.",
  },
];

export default function ActivityBaseForm({
  primaryLabel,
  primaryPlaceholder,
  primaryValue,
  setPrimaryValue,
  extraFields = [],
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  const needsNotes =
    participationLevel === "Refused" ||
    outcome === "Negative" ||
    outcome === "Unable to Complete";

  return (
    <div className="space-y-6">
      <FormSection
        title="Activity details"
        description="Record the main details of the activity."
      >
        <FormField
          label={primaryLabel}
          required
        >
          <FormInput
            value={primaryValue}
            onChange={(event) =>
              setPrimaryValue(event.target.value)
            }
            placeholder={primaryPlaceholder}
          />
        </FormField>

        {extraFields.map((field) => (
          <FormField
            key={field.label}
            label={field.label}
          >
            {field.type === "textarea" ? (
              <FormTextarea
                value={field.value}
                onChange={(event) =>
                  field.setValue(event.target.value)
                }
                placeholder={field.placeholder}
                rows={4}
              />
            ) : (
              <FormInput
                value={field.value}
                onChange={(event) =>
                  field.setValue(event.target.value)
                }
                placeholder={field.placeholder}
              />
            )}
          </FormField>
        ))}
      </FormSection>

      {primaryValue.trim() && (
        <FormSection
          title="Participation"
          description="Record how independently the person took part."
        >
          <FormChoiceGroup
            label="Participation level"
            value={participationLevel}
            options={participationOptions}
            onChange={setParticipationLevel}
            columns={2}
            required
          />
        </FormSection>
      )}

      {participationLevel && (
        <FormSection
          title="Outcome"
          description="Record the overall outcome of the activity."
        >
          <FormChoiceGroup
            label="Activity outcome"
            value={outcome}
            options={outcomeOptions}
            onChange={setOutcome}
            columns={2}
            required
          />
        </FormSection>
      )}

      {outcome && (
        <FormSection
          title="Observations"
          description={
            needsNotes
              ? "Add the relevant detail before saving."
              : "Record any useful observations or additional information."
          }
        >
          <FormField
            label="Notes / observations"
            required={needsNotes}
            description={
              needsNotes
                ? "Include any reason given, difficulty encountered, support offered or follow-up required."
                : "Optional details about engagement, preferences, support or outcome."
            }
          >
            <FormTextarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder={
                needsNotes
                  ? "Add the required details..."
                  : "Optional notes or observations..."
              }
              rows={5}
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}
"use client";

import {
  FormChoiceGroup,
  FormField,
  FormMultiSelect,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

const behaviourOptions = [
  "Pacing",
  "Repetitive Questioning",
  "Door Checking",
  "Food Seeking",
  "Increased Stimming",
  "Refusal of Support",
  "Attempting to Leave",
  "Social Withdrawal",
  "Verbal Frustration",
  "Restlessness",
].map((value) => ({ value, label: value }));

const frequencyOptions = [
  "Single Occurrence",
  "Occasional",
  "Repeated",
  "Persistent",
].map((value) => ({ value, label: value }));

const supportOptions = [
  "Verbal Reassurance",
  "Redirection",
  "Quiet Space",
  "Preferred Activity",
  "Sensory Support",
  "Increased Observation",
  "Time Alone",
].map((value) => ({ value, label: value }));

const outcomeOptions = [
  "Settled Independently",
  "Settled With Support",
  "Continued",
  "Escalated",
].map((value) => ({ value, label: value }));

type Props = {
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
};

export default function BehaviourObservationForm({
  behaviourObserved = [],
  setBehaviourObserved,
  behaviourFrequency = "",
  setBehaviourFrequency,
  behaviourSupportProvided = [],
  setBehaviourSupportProvided,
  behaviourOutcome = "",
  setBehaviourOutcome,
  behaviourNotes = "",
  setBehaviourNotes,
}: Props) {
  const notesUseful =
    behaviourOutcome === "Continued" ||
    behaviourOutcome === "Escalated" ||
    behaviourObserved.includes("Attempting to Leave") ||
    behaviourObserved.includes("Refusal of Support");

  return (
    <div className="space-y-5">
      <FormSection
        title="Behaviour observed"
        description="Select only what was actually observed."
      >
        <FormMultiSelect
          label="Observed behaviour"
          value={behaviourObserved}
          options={behaviourOptions}
          onChange={setBehaviourObserved}
          columns={2}
          required
        />
      </FormSection>

      {behaviourObserved.length > 0 && (
        <FormSection
          title="Frequency"
          description="Record how often the behaviour was observed during this episode."
        >
          <FormChoiceGroup
            label="Frequency"
            value={behaviourFrequency}
            options={frequencyOptions}
            onChange={setBehaviourFrequency}
            required
          />
        </FormSection>
      )}

      {behaviourFrequency && (
        <FormSection
          title="Support and outcome"
          description="Record what support was provided and what happened next."
        >
          <FormMultiSelect
            label="Support provided"
            value={behaviourSupportProvided}
            options={supportOptions}
            onChange={setBehaviourSupportProvided}
            columns={2}
          />

          <FormChoiceGroup
            label="Outcome"
            value={behaviourOutcome}
            options={outcomeOptions}
            onChange={setBehaviourOutcome}
            required
          />
        </FormSection>
      )}

      {behaviourOutcome && (
        <FormSection
          title="Additional context"
          description={
            notesUseful
              ? "Add relevant context about escalation, refusal, risk or support offered."
              : "Optional context if it adds useful information."
          }
          collapsible={!notesUseful}
          defaultOpen={notesUseful}
          summary={!notesUseful && behaviourNotes ? "Notes added" : undefined}
        >
          <FormField label="Notes">
            <FormTextarea
              value={behaviourNotes}
              onChange={(event) => setBehaviourNotes(event.target.value)}
              rows={4}
              placeholder="Add useful context, support offered or observations..."
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

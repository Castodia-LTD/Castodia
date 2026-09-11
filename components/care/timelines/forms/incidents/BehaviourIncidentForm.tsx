"use client";

import {
  FormAlert,
  FormField,
  FormMultiSelect,
  FormSection,
  FormSelect,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

type Props = {
  trigger: string;
  setTrigger: (value: string) => void;
  behaviourTypes: string[];
  setBehaviourTypes: (value: string[]) => void;
  description: string;
  setDescription: (value: string) => void;
  supportProvided: string[];
  setSupportProvided: (value: string[]) => void;
  linkedPrnAdministrationId: string;
  setLinkedPrnAdministrationId: (value: string) => void;
  prnOptions?: { id: string; label: string }[];
  immediateOutcomes: string[];
  setImmediateOutcomes: (value: string[]) => void;
  notes: string;
  setNotes: (value: string) => void;
};

const behaviourOptions = [
  "Verbal Aggression",
  "Physical Aggression",
  "Property Damage",
  "Self Injury",
  "Absconding",
  "Distress",
  "Refusal",
  "Other",
].map((value) => ({ value, label: value }));

const supportOptions = [
  "Verbal Reassurance",
  "Redirection",
  "Distraction",
  "Environmental Changes",
  "PRN Medication",
  "Physical Intervention",
  "Other",
].map((value) => ({ value, label: value }));

const outcomeOptions = [
  "Settled independently",
  "Settled with staff support",
  "Removed from situation",
  "Service user remained distressed",
  "Other",
].map((value) => ({ value, label: value }));

export default function BehaviourIncidentForm({
  trigger,
  setTrigger,
  behaviourTypes,
  setBehaviourTypes,
  description,
  setDescription,
  supportProvided,
  setSupportProvided,
  linkedPrnAdministrationId,
  setLinkedPrnAdministrationId,
  prnOptions = [],
  immediateOutcomes,
  setImmediateOutcomes,
  notes,
  setNotes,
}: Props) {
  const prnMedicationSelected = supportProvided.includes("PRN Medication");
  const notesUseful =
    supportProvided.includes("Physical Intervention") ||
    immediateOutcomes.includes("Service user remained distressed") ||
    behaviourTypes.includes("Self Injury") ||
    behaviourTypes.includes("Absconding");

  return (
    <div className="space-y-5">
      <FormSection
        title="Before the incident"
        description="Record the observable events or circumstances immediately before the incident."
      >
        <FormField label="What happened before?" required>
          <FormTextarea
            value={trigger}
            onChange={(event) => setTrigger(event.target.value)}
            rows={4}
            placeholder="Describe what happened before the incident..."
          />
        </FormField>
      </FormSection>

      {trigger.trim() && (
        <FormSection
          title="What happened"
          description="Record the behaviour and a factual description without assumptions or blame."
        >
          <FormMultiSelect
            label="Behaviour type"
            value={behaviourTypes}
            options={behaviourOptions}
            onChange={setBehaviourTypes}
            columns={2}
            required
          />

          {behaviourTypes.length > 0 && (
            <FormField label="Factual description" required>
              <FormTextarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                placeholder="Describe what was observed..."
              />
            </FormField>
          )}
        </FormSection>
      )}

      {description.trim() && (
        <FormSection
          title="Support provided"
          description="Record the support used during the incident."
        >
          <FormMultiSelect
            label="Support"
            value={supportProvided}
            options={supportOptions}
            onChange={setSupportProvided}
            columns={2}
            required
          />

          {prnMedicationSelected && (
            <div className="space-y-3">
              <FormAlert variant="info" title="PRN medication selected">
                Link the related PRN administration where one is available.
              </FormAlert>

              <FormField
                label="Linked PRN administration"
                description={
                  prnOptions.length === 0
                    ? "No recent PRN administrations were found for this person."
                    : "Choose the administration linked to this incident."
                }
              >
                <FormSelect
                  value={linkedPrnAdministrationId}
                  onChange={(event) => setLinkedPrnAdministrationId(event.target.value)}
                >
                  <option value="">Not linked</option>
                  {prnOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
            </div>
          )}
        </FormSection>
      )}

      {supportProvided.length > 0 && (
        <FormSection
          title="Immediate outcome"
          description="Record what happened immediately after support was provided."
        >
          <FormMultiSelect
            label="Outcome"
            value={immediateOutcomes}
            options={outcomeOptions}
            onChange={setImmediateOutcomes}
            columns={2}
            required
          />
        </FormSection>
      )}

      {immediateOutcomes.length > 0 && (
        <FormSection
          title="Additional information"
          description={
            notesUseful
              ? "Add any relevant detail about continuing distress, risk or restrictive intervention."
              : "Optional context if it adds useful information."
          }
          collapsible={!notesUseful}
          defaultOpen={notesUseful}
          summary={!notesUseful && notes ? "Notes added" : undefined}
        >
          <FormField label="Notes">
            <FormTextarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Add any additional relevant information..."
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

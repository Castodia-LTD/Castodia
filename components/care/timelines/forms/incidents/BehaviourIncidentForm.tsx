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
  behaviourIncidentTrigger: string;
  setBehaviourIncidentTrigger: (value: string) => void;
  behaviourIncidentTypes: string[];
  setBehaviourIncidentTypes: (value: string[]) => void;
  behaviourIncidentDescription: string;
  setBehaviourIncidentDescription: (value: string) => void;
  behaviourIncidentSupport: string[];
  setBehaviourIncidentSupport: (value: string[]) => void;
  linkedPrnAdministrationId: string;
  setLinkedPrnAdministrationId: (value: string) => void;
  prnOptions?: { id: string; label: string }[];
  behaviourIncidentOutcomes: string[];
  setBehaviourIncidentOutcomes: (value: string[]) => void;
  behaviourIncidentNotes: string;
  setBehaviourIncidentNotes: (value: string) => void;
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
  behaviourIncidentTrigger,
  setBehaviourIncidentTrigger,
  behaviourIncidentTypes,
  setBehaviourIncidentTypes,
  behaviourIncidentDescription,
  setBehaviourIncidentDescription,
  behaviourIncidentSupport,
  setBehaviourIncidentSupport,
  linkedPrnAdministrationId,
  setLinkedPrnAdministrationId,
  prnOptions = [],
  behaviourIncidentOutcomes,
  setBehaviourIncidentOutcomes,
  behaviourIncidentNotes,
  setBehaviourIncidentNotes,
}: Props) {
  const prnMedicationSelected = behaviourIncidentSupport.includes("PRN Medication");
  const notesUseful =
    behaviourIncidentSupport.includes("Physical Intervention") ||
    behaviourIncidentOutcomes.includes("Service user remained distressed") ||
    behaviourIncidentTypes.includes("Self Injury") ||
    behaviourIncidentTypes.includes("Absconding");

  return (
    <div className="space-y-5">
      <FormSection
        title="Before the incident"
        description="Record the observable events or circumstances immediately before the incident."
      >
        <FormField label="What happened before?" required>
          <FormTextarea
            value={behaviourIncidentTrigger}
            onChange={(event) => setBehaviourIncidentTrigger(event.target.value)}
            rows={4}
            placeholder="Describe what happened before the incident..."
          />
        </FormField>
      </FormSection>

      {behaviourIncidentTrigger.trim() && (
        <FormSection
          title="What happened"
          description="Record the behaviour and a factual description without assumptions or blame."
        >
          <FormMultiSelect
            label="Behaviour type"
            value={behaviourIncidentTypes}
            options={behaviourOptions}
            onChange={setBehaviourIncidentTypes}
            columns={2}
            required
          />

          {behaviourIncidentTypes.length > 0 && (
            <FormField label="Factual description" required>
              <FormTextarea
                value={behaviourIncidentDescription}
                onChange={(event) => setBehaviourIncidentDescription(event.target.value)}
                rows={5}
                placeholder="Describe what was observed..."
              />
            </FormField>
          )}
        </FormSection>
      )}

      {behaviourIncidentDescription.trim() && (
        <FormSection
          title="Support provided"
          description="Record the support used during the incident."
        >
          <FormMultiSelect
            label="Support"
            value={behaviourIncidentSupport}
            options={supportOptions}
            onChange={setBehaviourIncidentSupport}
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

      {behaviourIncidentSupport.length > 0 && (
        <FormSection
          title="Immediate outcome"
          description="Record what happened immediately after support was provided."
        >
          <FormMultiSelect
            label="Outcome"
            value={behaviourIncidentOutcomes}
            options={outcomeOptions}
            onChange={setBehaviourIncidentOutcomes}
            columns={2}
            required
          />
        </FormSection>
      )}

      {behaviourIncidentOutcomes.length > 0 && (
        <FormSection
          title="Additional information"
          description={
            notesUseful
              ? "Add any relevant detail about continuing distress, risk or restrictive intervention."
              : "Optional context if it adds useful information."
          }
          collapsible={!notesUseful}
          defaultOpen={notesUseful}
          summary={!notesUseful && behaviourIncidentNotes ? "Notes added" : undefined}
        >
          <FormField label="Notes">
            <FormTextarea
              value={behaviourIncidentNotes}
              onChange={(event) => setBehaviourIncidentNotes(event.target.value)}
              rows={4}
              placeholder="Add any additional relevant information..."
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

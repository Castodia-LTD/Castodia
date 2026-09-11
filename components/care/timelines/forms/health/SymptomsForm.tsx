"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

type Props = {
  onChange: (data: any) => void;
};

const symptomOptions = [
  { value: "temperature", label: "Temperature" },
  { value: "cough", label: "Cough" },
  { value: "cold_symptoms", label: "Cold symptoms" },
  { value: "nausea", label: "Nausea" },
  { value: "vomiting", label: "Vomiting" },
  { value: "diarrhoea", label: "Diarrhoea" },
  { value: "pain", label: "Pain" },
  { value: "dizziness", label: "Dizziness" },
  { value: "fatigue", label: "Fatigue" },
  { value: "poor_appetite", label: "Poor appetite" },
  { value: "reduced_fluid_intake", label: "Reduced fluid intake" },
  { value: "shortness_of_breath", label: "Shortness of breath" },
  { value: "confusion", label: "Confusion" },
  { value: "low_mood", label: "Low mood" },
  { value: "other", label: "Other" },
];

const actionOptions = [
  "No Action Required",
  "Monitoring",
  "GP Contacted",
  "NHS 111",
  "Family Informed",
  "Medication Given",
  "Emergency Services",
  "Other",
].map((value) => ({ value, label: value }));

const durationOptions = [
  "Started Today",
  "Yesterday",
  "2–3 Days",
  "More Than 3 Days",
  "Unknown",
].map((value) => ({ value, label: value }));

function choices(values: string[]) {
  return values.map((value) => ({ value, label: value }));
}

export default function SymptomsForm({ onChange }: Props) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [temperatureType, setTemperatureType] = useState("");
  const [coughType, setCoughType] = useState("");
  const [vomitingOccurrences, setVomitingOccurrences] = useState("");
  const [diarrhoeaOccurrences, setDiarrhoeaOccurrences] = useState("");
  const [painLocation, setPainLocation] = useState("");
  const [painSeverity, setPainSeverity] = useState("");
  const [breathlessnessSeverity, setBreathlessnessSeverity] = useState("");
  const [otherSymptom, setOtherSymptom] = useState("");
  const [duration, setDuration] = useState("");
  const [actionsTaken, setActionsTaken] = useState<string[]>([
    "No Action Required",
  ]);
  const [notes, setNotes] = useState("");

  const notesRequired = useMemo(() => {
    const hasAction = actionsTaken.some(
      (action) => action !== "No Action Required",
    );

    return (
      hasAction ||
      painSeverity === "Severe" ||
      breathlessnessSeverity === "Severe" ||
      selectedSymptoms.includes("other")
    );
  }, [actionsTaken, painSeverity, breathlessnessSeverity, selectedSymptoms]);

  function emit(overrides: any = {}) {
    onChange({
      selectedSymptoms,
      details: {
        temperatureType,
        coughType,
        vomitingOccurrences,
        diarrhoeaOccurrences,
        painLocation,
        painSeverity,
        breathlessnessSeverity,
        otherSymptom,
      },
      duration,
      actionsTaken,
      notes,
      ...overrides,
    });
  }

  function setSymptoms(next: string[]) {
    setSelectedSymptoms(next);
    emit({ selectedSymptoms: next });
  }

  function setActions(next: string[]) {
    let normalized = next;

    if (normalized.includes("No Action Required") && normalized.length > 1) {
      normalized = normalized.filter((item) => item !== "No Action Required");
    }

    if (normalized.length === 0) normalized = ["No Action Required"];

    setActionsTaken(normalized);
    emit({ actionsTaken: normalized });
  }

  return (
    <div className="space-y-5">
      <FormSection
        title="Symptoms"
        description="Select the symptoms observed or reported. Only relevant follow-up questions will appear."
      >
        <FormMultiSelect
          label="Symptoms present"
          value={selectedSymptoms}
          options={symptomOptions}
          onChange={setSymptoms}
          columns={2}
          required
        />
      </FormSection>

      {selectedSymptoms.length > 0 && (
        <FormSection
          title="Symptom details"
          description="Add detail only for the symptoms that need it."
        >
          {selectedSymptoms.includes("temperature") && (
            <FormChoiceGroup
              label="Temperature"
              value={temperatureType}
              options={choices([
                "Low Grade",
                "High Temperature",
                "Temperature Recorded Elsewhere",
              ])}
              onChange={(value) => {
                setTemperatureType(value);
                emit({ details: { temperatureType: value } });
              }}
            />
          )}

          {selectedSymptoms.includes("cough") && (
            <FormChoiceGroup
              label="Cough type"
              value={coughType}
              options={choices(["Dry", "Productive", "Unknown"])}
              onChange={(value) => {
                setCoughType(value);
                emit();
              }}
            />
          )}

          {selectedSymptoms.includes("vomiting") && (
            <FormChoiceGroup
              label="Vomiting occurrences"
              value={vomitingOccurrences}
              options={choices(["1", "2", "3", "4+"])}
              onChange={(value) => {
                setVomitingOccurrences(value);
                emit();
              }}
            />
          )}

          {selectedSymptoms.includes("diarrhoea") && (
            <FormChoiceGroup
              label="Diarrhoea occurrences"
              value={diarrhoeaOccurrences}
              options={choices(["1", "2", "3", "4+"])}
              onChange={(value) => {
                setDiarrhoeaOccurrences(value);
                emit();
              }}
            />
          )}

          {selectedSymptoms.includes("pain") && (
            <div className="space-y-5">
              <FormChoiceGroup
                label="Pain location"
                value={painLocation}
                options={choices([
                  "Head",
                  "Chest",
                  "Abdomen",
                  "Back",
                  "Arm",
                  "Leg",
                  "Other",
                ])}
                onChange={(value) => {
                  setPainLocation(value);
                  emit();
                }}
              />

              <FormChoiceGroup
                label="Pain severity"
                value={painSeverity}
                options={choices(["Mild", "Moderate", "Severe"])}
                onChange={(value) => {
                  setPainSeverity(value);
                  emit();
                }}
              />
            </div>
          )}

          {selectedSymptoms.includes("shortness_of_breath") && (
            <FormChoiceGroup
              label="Breathlessness severity"
              value={breathlessnessSeverity}
              options={choices(["Mild", "Moderate", "Severe"])}
              onChange={(value) => {
                setBreathlessnessSeverity(value);
                emit();
              }}
            />
          )}

          {selectedSymptoms.includes("other") && (
            <FormField label="Other symptom" required>
              <FormInput
                value={otherSymptom}
                onChange={(event) => {
                  const value = event.target.value;
                  setOtherSymptom(value);
                  emit();
                }}
                placeholder="Describe the symptom"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {selectedSymptoms.length > 0 && (
        <FormSection
          title="Duration and action"
          description="Record how long the symptoms have been present and what was done."
        >
          <FormChoiceGroup
            label="Duration"
            value={duration}
            options={durationOptions}
            onChange={(value) => {
              setDuration(value);
              emit({ duration: value });
            }}
            required
          />

          {duration && (
            <FormMultiSelect
              label="Action taken"
              value={actionsTaken}
              options={actionOptions}
              onChange={setActions}
              columns={2}
            />
          )}
        </FormSection>
      )}

      {duration && (
        <FormSection
          title="Notes"
          description={
            notesRequired
              ? "Add enough detail to explain the concern or action taken."
              : "Optional additional context."
          }
          collapsible={!notesRequired}
          defaultOpen={notesRequired}
          summary={!notesRequired && notes ? "Notes added" : undefined}
        >
          {notesRequired && (
            <FormAlert variant="warning" title="Additional detail required">
              Notes are required for severe symptoms, other symptoms or when action was taken.
            </FormAlert>
          )}

          <FormField label={notesRequired ? "Tell us more" : "Notes"} required={notesRequired}>
            <FormTextarea
              value={notes}
              onChange={(event) => {
                const value = event.target.value;
                setNotes(value);
                emit({ notes: value });
              }}
              rows={4}
              placeholder={
                notesRequired
                  ? "Describe the symptoms, concern and action taken..."
                  : "Optional additional information..."
              }
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

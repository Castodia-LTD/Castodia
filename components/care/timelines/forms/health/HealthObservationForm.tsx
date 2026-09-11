"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormField,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

type Props = {
  onChange: (data: any) => void;
};

type Section =
  | "vital_signs"
  | "general_observation"
  | "weight"
  | "blood_glucose"
  | "other";

const sectionOptions: Array<{ value: Section; label: string }> = [
  { value: "vital_signs", label: "Vital signs" },
  { value: "general_observation", label: "General observation" },
  { value: "weight", label: "Weight" },
  { value: "blood_glucose", label: "Blood glucose" },
  { value: "other", label: "Other observation" },
];

const actionOptions = [
  "No Action Required",
  "GP Contacted",
  "NHS 111",
  "Family Informed",
  "Medication Given",
  "Monitoring Increased",
  "Emergency Services",
  "Other",
].map((value) => ({ value, label: value }));

const presentationFields = [
  ["Appearance", "appearance"],
  ["Mood", "mood"],
  ["Skin colour", "skinColour"],
  ["Breathing", "breathing"],
  ["Alertness", "alertness"],
] as const;

export default function HealthObservationForm({ onChange }: Props) {
  const [sections, setSections] = useState<Section[]>([]);
  const [temperature, setTemperature] = useState("");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [painScore, setPainScore] = useState("");
  const [appearance, setAppearance] = useState("");
  const [mood, setMood] = useState("");
  const [skinColour, setSkinColour] = useState("");
  const [breathing, setBreathing] = useState("");
  const [alertness, setAlertness] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bloodGlucose, setBloodGlucose] = useState("");
  const [bloodGlucoseTiming, setBloodGlucoseTiming] = useState("");
  const [otherObservation, setOtherObservation] = useState("");
  const [otherValue, setOtherValue] = useState("");
  const [actionsTaken, setActionsTaken] = useState<string[]>(["No Action Required"]);
  const [notes, setNotes] = useState("");

  const notesRequired = useMemo(
    () => actionsTaken.some((action) => action !== "No Action Required"),
    [actionsTaken],
  );

  const warningMessages = useMemo(() => {
    const warnings: string[] = [];
    const temp = Number(temperature);
    const sats = Number(oxygenSaturation);
    const pulseValue = Number(pulse);

    if (temperature && (temp >= 38 || temp <= 35)) {
      warnings.push("Temperature is outside the usual range.");
    }
    if (oxygenSaturation && sats < 94) {
      warnings.push("Oxygen saturation is below the usual range.");
    }
    if (pulse && (pulseValue > 120 || pulseValue < 50)) {
      warnings.push("Pulse is outside the usual range.");
    }

    return warnings;
  }, [temperature, oxygenSaturation, pulse]);

  function currentVitalSigns(overrides: Record<string, any> = {}) {
    return {
      temperature: temperature ? Number(temperature) : null,
      bloodPressure:
        systolic || diastolic
          ? {
              systolic: systolic ? Number(systolic) : null,
              diastolic: diastolic ? Number(diastolic) : null,
            }
          : null,
      pulse: pulse ? Number(pulse) : null,
      respiratoryRate: respiratoryRate ? Number(respiratoryRate) : null,
      oxygenSaturation: oxygenSaturation ? Number(oxygenSaturation) : null,
      painScore: painScore ? Number(painScore) : null,
      ...overrides,
    };
  }

  function snapshot(overrides: any = {}) {
    return {
      sections,
      vitalSigns: currentVitalSigns(),
      generalObservation: { appearance, mood, skinColour, breathing, alertness },
      weight: { kg: weightKg ? Number(weightKg) : null },
      bloodGlucose: {
        value: bloodGlucose ? Number(bloodGlucose) : null,
        timing: bloodGlucoseTiming,
      },
      other: { observation: otherObservation, value: otherValue },
      actionsTaken,
      notes,
      ...overrides,
    };
  }

  function update(overrides: any = {}) {
    onChange(snapshot(overrides));
  }

  function setSelectedSections(next: Section[]) {
    setSections(next);
    update({ sections: next });
  }

  function setActions(next: string[]) {
    let normalized = next;

    if (next.includes("No Action Required") && next.length > 1) {
      const selectedNoneNow =
        !actionsTaken.includes("No Action Required") && next.includes("No Action Required");
      normalized = selectedNoneNow
        ? ["No Action Required"]
        : next.filter((item) => item !== "No Action Required");
    }

    if (!normalized.length) normalized = ["No Action Required"];
    setActionsTaken(normalized);
    update({ actionsTaken: normalized });
  }

  const generalValues: Record<string, string> = {
    appearance,
    mood,
    skinColour,
    breathing,
    alertness,
  };

  function setGeneralField(key: string, value: string) {
    if (key === "appearance") setAppearance(value);
    if (key === "mood") setMood(value);
    if (key === "skinColour") setSkinColour(value);
    if (key === "breathing") setBreathing(value);
    if (key === "alertness") setAlertness(value);

    update({
      generalObservation: {
        appearance,
        mood,
        skinColour,
        breathing,
        alertness,
        [key]: value,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Health Observation</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Choose only the observations you are recording. Unselected sections stay out of the way.
        </p>
      </div>

      <FormSection title="What are you recording?">
        <FormMultiSelect<Section>
          label="Observation sections"
          value={sections}
          options={sectionOptions}
          onChange={setSelectedSections}
          columns={2}
          required
        />
      </FormSection>

      {sections.includes("vital_signs") && (
        <FormSection title="Vital signs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Metric label="Temperature" suffix="°C" value={temperature} setValue={(value) => { setTemperature(value); update({ vitalSigns: currentVitalSigns({ temperature: value ? Number(value) : null }) }); }} />
            <Metric label="Pulse" suffix="bpm" value={pulse} setValue={(value) => { setPulse(value); update({ vitalSigns: currentVitalSigns({ pulse: value ? Number(value) : null }) }); }} />
            <Metric label="Respiratory rate" suffix="/min" value={respiratoryRate} setValue={(value) => { setRespiratoryRate(value); update({ vitalSigns: currentVitalSigns({ respiratoryRate: value ? Number(value) : null }) }); }} />
            <Metric label="Oxygen saturation" suffix="%" value={oxygenSaturation} setValue={(value) => { setOxygenSaturation(value); update({ vitalSigns: currentVitalSigns({ oxygenSaturation: value ? Number(value) : null }) }); }} />
            <Metric label="Pain score" suffix="/10" value={painScore} setValue={(value) => { setPainScore(value); update({ vitalSigns: currentVitalSigns({ painScore: value ? Number(value) : null }) }); }} />
          </div>

          <FormField label="Blood pressure">
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                type="number"
                inputMode="numeric"
                value={systolic}
                placeholder="Systolic"
                onChange={(event) => {
                  const value = event.target.value;
                  setSystolic(value);
                  update({
                    vitalSigns: currentVitalSigns({
                      bloodPressure: {
                        systolic: value ? Number(value) : null,
                        diastolic: diastolic ? Number(diastolic) : null,
                      },
                    }),
                  });
                }}
              />
              <FormInput
                type="number"
                inputMode="numeric"
                value={diastolic}
                placeholder="Diastolic"
                onChange={(event) => {
                  const value = event.target.value;
                  setDiastolic(value);
                  update({
                    vitalSigns: currentVitalSigns({
                      bloodPressure: {
                        systolic: systolic ? Number(systolic) : null,
                        diastolic: value ? Number(value) : null,
                      },
                    }),
                  });
                }}
              />
            </div>
          </FormField>

          {warningMessages.length > 0 && (
            <FormAlert variant="warning" title="Check these observations">
              <ul className="list-disc space-y-1 pl-5">
                {warningMessages.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            </FormAlert>
          )}
        </FormSection>
      )}

      {sections.includes("general_observation") && (
        <FormSection title="General observation">
          {presentationFields.map(([label, key]) => (
            <FormField key={key} label={label}>
              <FormInput
                value={generalValues[key]}
                onChange={(event) => setGeneralField(key, event.target.value)}
                placeholder={`Record ${label.toLowerCase()}...`}
              />
            </FormField>
          ))}
        </FormSection>
      )}

      {sections.includes("weight") && (
        <FormSection title="Weight">
          <Metric label="Weight" suffix="kg" value={weightKg} setValue={(value) => { setWeightKg(value); update({ weight: { kg: value ? Number(value) : null } }); }} />
        </FormSection>
      )}

      {sections.includes("blood_glucose") && (
        <FormSection title="Blood glucose">
          <Metric label="Blood glucose" suffix="mmol/L" value={bloodGlucose} setValue={(value) => { setBloodGlucose(value); update({ bloodGlucose: { value: value ? Number(value) : null, timing: bloodGlucoseTiming } }); }} />
          <FormField label="Timing / context">
            <FormInput
              value={bloodGlucoseTiming}
              onChange={(event) => {
                const value = event.target.value;
                setBloodGlucoseTiming(value);
                update({ bloodGlucose: { value: bloodGlucose ? Number(bloodGlucose) : null, timing: value } });
              }}
              placeholder="For example: before breakfast or 2 hours after meal"
            />
          </FormField>
        </FormSection>
      )}

      {sections.includes("other") && (
        <FormSection title="Other observation">
          <FormField label="Observation">
            <FormInput
              value={otherObservation}
              onChange={(event) => {
                const value = event.target.value;
                setOtherObservation(value);
                update({ other: { observation: value, value: otherValue } });
              }}
              placeholder="What was observed?"
            />
          </FormField>
          <FormField label="Value / result">
            <FormInput
              value={otherValue}
              onChange={(event) => {
                const value = event.target.value;
                setOtherValue(value);
                update({ other: { observation: otherObservation, value } });
              }}
              placeholder="Record the result or value"
            />
          </FormField>
        </FormSection>
      )}

      {sections.length > 0 && (
        <FormSection title="Action taken">
          <FormMultiSelect
            label="Actions"
            value={actionsTaken}
            options={actionOptions}
            onChange={setActions}
            columns={2}
          />

          {notesRequired && (
            <FormAlert variant="warning" title="Add supporting detail">
              An action has been recorded, so add enough detail for continuity of care.
            </FormAlert>
          )}

          <FormField label={notesRequired ? "Action notes" : "Notes"} required={notesRequired}>
            <FormTextarea
              value={notes}
              onChange={(event) => {
                const value = event.target.value;
                setNotes(value);
                update({ notes: value });
              }}
              placeholder={notesRequired ? "Record what action was taken and any instructions..." : "Optional notes..."}
              rows={4}
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

function Metric({
  label,
  suffix,
  value,
  setValue,
}: {
  label: string;
  suffix: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <FormField label={label}>
      <div className="flex items-center gap-3">
        <FormInput
          type="number"
          step="any"
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <span className="shrink-0 text-sm font-medium text-teal-700">{suffix}</span>
      </div>
    </FormField>
  );
}

"use client";

import { useMemo, useState } from "react";

type Props = {
  onChange: (data: any) => void;
};

type Section =
  | "vital_signs"
  | "general_observation"
  | "weight"
  | "blood_glucose"
  | "other";

const sectionOptions = [
  { value: "vital_signs", label: "Vital Signs", icon: "❤️" },
  { value: "general_observation", label: "General Observation", icon: "👁" },
  { value: "weight", label: "Weight", icon: "⚖" },
  { value: "blood_glucose", label: "Blood Glucose", icon: "🩸" },
  { value: "other", label: "Other Observation", icon: "➕" },
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
];

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

  const [actionsTaken, setActionsTaken] = useState<string[]>([
    "No Action Required",
  ]);
  const [notes, setNotes] = useState("");

  const notesRequired = useMemo(() => {
    return actionsTaken.some((action) => action !== "No Action Required");
  }, [actionsTaken]);

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

  function update(payload?: any) {
    onChange({
      sections,
      vitalSigns: {
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
        oxygenSaturation: oxygenSaturation
          ? Number(oxygenSaturation)
          : null,
        painScore: painScore ? Number(painScore) : null,
      },
      generalObservation: {
        appearance,
        mood,
        skinColour,
        breathing,
        alertness,
      },
      weight: {
        kg: weightKg ? Number(weightKg) : null,
      },
      bloodGlucose: {
        value: bloodGlucose ? Number(bloodGlucose) : null,
        timing: bloodGlucoseTiming,
      },
      other: {
        observation: otherObservation,
        value: otherValue,
      },
      actionsTaken,
      notes,
      ...payload,
    });
  }

  function toggleSection(value: Section) {
    const next = sections.includes(value)
      ? sections.filter((section) => section !== value)
      : [...sections, value];

    setSections(next);
    update({ sections: next });
  }

  function toggleAction(value: string) {
    let next: string[];

    if (value === "No Action Required") {
      next = ["No Action Required"];
    } else {
      next = actionsTaken
        .filter((action) => action !== "No Action Required")
        .includes(value)
        ? actionsTaken.filter((action) => action !== value)
        : [
            ...actionsTaken.filter(
              (action) => action !== "No Action Required"
            ),
            value,
          ];
    }

    if (next.length === 0) next = ["No Action Required"];

    setActionsTaken(next);
    update({ actionsTaken: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Health Observation
        </h3>
        <p className="text-sm text-slate-500">
          Record observations, vital signs and actions taken.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          What are you recording?
        </label>

        <div className="grid grid-cols-2 gap-3">
          {sectionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleSection(option.value as Section)}
              className={`rounded-2xl border p-4 text-left transition ${
                sections.includes(option.value as Section)
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-2xl">{option.icon}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {option.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {sections.includes("vital_signs") && (
        <SectionCard title="❤️ Vital Signs">
          <NumberInput
            label="Temperature"
            suffix="°C"
            value={temperature}
            onChange={(value) => {
              setTemperature(value);
              update({ vitalSigns: { temperature: Number(value) } });
            }}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Blood Pressure
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Systolic"
                value={systolic}
                onChange={(e) => {
                  setSystolic(e.target.value);
                  update();
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
              <input
                type="number"
                placeholder="Diastolic"
                value={diastolic}
                onChange={(e) => {
                  setDiastolic(e.target.value);
                  update();
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          <NumberInput
            label="Pulse"
            suffix="bpm"
            value={pulse}
            onChange={(value) => {
              setPulse(value);
              update();
            }}
          />

          <NumberInput
            label="Respiratory Rate"
            suffix="breaths/min"
            value={respiratoryRate}
            onChange={(value) => {
              setRespiratoryRate(value);
              update();
            }}
          />

          <NumberInput
            label="Oxygen Saturation"
            suffix="%"
            value={oxygenSaturation}
            onChange={(value) => {
              setOxygenSaturation(value);
              update();
            }}
          />

          <SelectBlock
            label="Pain Score"
            value={painScore}
            onChange={(value) => {
              setPainScore(value);
              update();
            }}
            options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
          />
        </SectionCard>
      )}

      {sections.includes("general_observation") && (
        <SectionCard title="👁 General Observation">
          <SelectBlock
            label="Appearance"
            value={appearance}
            onChange={(value) => {
              setAppearance(value);
              update();
            }}
            options={["Well", "Slightly Unwell", "Unwell"]}
          />

          <SelectBlock
            label="Mood"
            value={mood}
            onChange={(value) => {
              setMood(value);
              update();
            }}
            options={["Positive", "Neutral", "Low"]}
          />

          <SelectBlock
            label="Skin Colour"
            value={skinColour}
            onChange={(value) => {
              setSkinColour(value);
              update();
            }}
            options={["Normal", "Pale", "Flushed", "Blue"]}
          />

          <SelectBlock
            label="Breathing"
            value={breathing}
            onChange={(value) => {
              setBreathing(value);
              update();
            }}
            options={["Normal", "Laboured", "Rapid"]}
          />

          <SelectBlock
            label="Alertness"
            value={alertness}
            onChange={(value) => {
              setAlertness(value);
              update();
            }}
            options={["Alert", "Drowsy", "Confused", "Unresponsive"]}
          />
        </SectionCard>
      )}

      {sections.includes("weight") && (
        <SectionCard title="⚖ Weight">
          <NumberInput
            label="Weight"
            suffix="kg"
            value={weightKg}
            onChange={(value) => {
              setWeightKg(value);
              update();
            }}
          />
        </SectionCard>
      )}

      {sections.includes("blood_glucose") && (
        <SectionCard title="🩸 Blood Glucose">
          <NumberInput
            label="Blood Glucose"
            suffix="mmol/L"
            value={bloodGlucose}
            onChange={(value) => {
              setBloodGlucose(value);
              update();
            }}
          />

          <SelectBlock
            label="Reading Taken"
            value={bloodGlucoseTiming}
            onChange={(value) => {
              setBloodGlucoseTiming(value);
              update();
            }}
            options={[
              "Before Breakfast",
              "Before Lunch",
              "Before Evening Meal",
              "Bedtime",
              "Other",
            ]}
          />
        </SectionCard>
      )}

      {sections.includes("other") && (
        <SectionCard title="➕ Other Observation">
          <TextInput
            label="Observation"
            value={otherObservation}
            onChange={(value) => {
              setOtherObservation(value);
              update();
            }}
          />

          <TextInput
            label="Value"
            value={otherValue}
            onChange={(value) => {
              setOtherValue(value);
              update();
            }}
          />
        </SectionCard>
      )}

      {warningMessages.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Observation warning</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {warningMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p className="mt-2">
            Please ensure appropriate action has been taken in line with the
            person's care plan.
          </p>
        </div>
      )}

      {sections.length > 0 && (
        <>
          <CheckboxGroup
            label="Action Taken"
            values={actionsTaken}
            options={actionOptions}
            onToggle={toggleAction}
          />

          {notesRequired && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Please add notes when action has been taken.
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {notesRequired ? "Tell us more" : "Notes"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                update({ notes: e.target.value });
              }}
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              placeholder={
                notesRequired
                  ? "Describe the observation and action taken..."
                  : "Optional notes..."
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function NumberInput({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />
        <span className="text-sm text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
      />
    </div>
  );
}

function SelectBlock({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3 py-3 text-left text-sm ${
              value === option
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  options: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${
              values.includes(option)
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <span>{option}</span>
            <span>{values.includes(option) ? "✓" : ""}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
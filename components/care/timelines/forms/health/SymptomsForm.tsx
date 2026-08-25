"use client";

import { useMemo, useState } from "react";

type Props = {
  onChange: (data: any) => void;
};

const symptomOptions = [
  { value: "temperature", label: "Temperature", icon: "🤒" },
  { value: "cough", label: "Cough", icon: "😮‍💨" },
  { value: "cold_symptoms", label: "Cold Symptoms", icon: "🤧" },
  { value: "nausea", label: "Nausea", icon: "🤢" },
  { value: "vomiting", label: "Vomiting", icon: "🤮" },
  { value: "diarrhoea", label: "Diarrhoea", icon: "💩" },
  { value: "pain", label: "Pain", icon: "😣" },
  { value: "dizziness", label: "Dizziness", icon: "🥴" },
  { value: "fatigue", label: "Fatigue", icon: "😴" },
  { value: "poor_appetite", label: "Poor Appetite", icon: "🍽" },
  { value: "reduced_fluid_intake", label: "Reduced Fluid Intake", icon: "💧" },
  { value: "shortness_of_breath", label: "Shortness of Breath", icon: "🫁" },
  { value: "confusion", label: "Confusion", icon: "🧠" },
  { value: "low_mood", label: "Low Mood", icon: "😢" },
  { value: "other", label: "Other", icon: "➕" },
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
];

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
      (action) => action !== "No Action Required"
    );

    const hasSevereSymptom =
      painSeverity === "Severe" || breathlessnessSeverity === "Severe";

    const hasOther = selectedSymptoms.includes("other");

    return hasAction || hasSevereSymptom || hasOther;
  }, [actionsTaken, painSeverity, breathlessnessSeverity, selectedSymptoms]);

  function update(payload?: any) {
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
      ...payload,
    });
  }

  function toggleSymptom(value: string) {
    const next = selectedSymptoms.includes(value)
      ? selectedSymptoms.filter((item) => item !== value)
      : [...selectedSymptoms, value];

    setSelectedSymptoms(next);
    update({ selectedSymptoms: next });
  }

  function toggleAction(value: string) {
    let next: string[];

    if (value === "No Action Required") {
      next = ["No Action Required"];
    } else {
      next = actionsTaken
        .filter((item) => item !== "No Action Required")
        .includes(value)
        ? actionsTaken.filter((item) => item !== value)
        : [
            ...actionsTaken.filter(
              (item) => item !== "No Action Required"
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
        <h3 className="text-lg font-semibold text-slate-900">Symptoms</h3>
        <p className="text-sm text-slate-500">
          Record symptoms observed or reported.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          What symptoms are present?
        </label>

        <div className="grid grid-cols-2 gap-3">
          {symptomOptions.map((symptom) => (
            <button
              key={symptom.value}
              type="button"
              onClick={() => toggleSymptom(symptom.value)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedSymptoms.includes(symptom.value)
                  ? "border-cyan-500 bg-cyan-50"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="text-2xl">{symptom.icon}</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {symptom.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedSymptoms.includes("temperature") && (
        <SectionCard title="🤒 Temperature">
          <SelectBlock
            label="Temperature type"
            value={temperatureType}
            onChange={(value) => {
              setTemperatureType(value);
              update({ details: { temperatureType: value } });
            }}
            options={[
              "Low Grade",
              "High Temperature",
              "Temperature Recorded Elsewhere",
            ]}
          />
        </SectionCard>
      )}

      {selectedSymptoms.includes("cough") && (
        <SectionCard title="😮‍💨 Cough">
          <SelectBlock
            label="Cough type"
            value={coughType}
            onChange={(value) => {
              setCoughType(value);
              update();
            }}
            options={["Dry", "Productive", "Unknown"]}
          />
        </SectionCard>
      )}

      {selectedSymptoms.includes("vomiting") && (
        <SectionCard title="🤮 Vomiting">
          <SelectBlock
            label="Occurrences"
            value={vomitingOccurrences}
            onChange={(value) => {
              setVomitingOccurrences(value);
              update();
            }}
            options={["1", "2", "3", "4+"]}
          />
        </SectionCard>
      )}

      {selectedSymptoms.includes("diarrhoea") && (
        <SectionCard title="💩 Diarrhoea">
          <SelectBlock
            label="Occurrences"
            value={diarrhoeaOccurrences}
            onChange={(value) => {
              setDiarrhoeaOccurrences(value);
              update();
            }}
            options={["1", "2", "3", "4+"]}
          />
        </SectionCard>
      )}

      {selectedSymptoms.includes("pain") && (
        <SectionCard title="😣 Pain">
          <SelectBlock
            label="Location"
            value={painLocation}
            onChange={(value) => {
              setPainLocation(value);
              update();
            }}
            options={[
              "Head",
              "Chest",
              "Abdomen",
              "Back",
              "Arm",
              "Leg",
              "Other",
            ]}
          />

          <SelectBlock
            label="Severity"
            value={painSeverity}
            onChange={(value) => {
              setPainSeverity(value);
              update();
            }}
            options={["Mild", "Moderate", "Severe"]}
          />
        </SectionCard>
      )}

      {selectedSymptoms.includes("shortness_of_breath") && (
        <SectionCard title="🫁 Shortness of Breath">
          <SelectBlock
            label="Severity"
            value={breathlessnessSeverity}
            onChange={(value) => {
              setBreathlessnessSeverity(value);
              update();
            }}
            options={["Mild", "Moderate", "Severe"]}
          />
        </SectionCard>
      )}

      {selectedSymptoms.includes("other") && (
        <SectionCard title="➕ Other Symptom">
          <TextInput
            label="Other symptom"
            value={otherSymptom}
            onChange={(value) => {
              setOtherSymptom(value);
              update();
            }}
          />
        </SectionCard>
      )}

      {selectedSymptoms.length > 0 && (
        <>
          <SelectBlock
            label="Duration"
            value={duration}
            onChange={(value) => {
              setDuration(value);
              update({ duration: value });
            }}
            options={[
              "Started Today",
              "Yesterday",
              "2–3 Days",
              "More Than 3 Days",
              "Unknown",
            ]}
          />

          <CheckboxGroup
            label="Action Taken"
            values={actionsTaken}
            options={actionOptions}
            onToggle={toggleAction}
          />

          {notesRequired && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Please add notes for actions taken, severe symptoms, or other
              symptoms.
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
                  ? "Describe symptoms and action taken..."
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
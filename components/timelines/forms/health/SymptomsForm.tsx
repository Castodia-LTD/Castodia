"use client";

type Props = {
  selectedSymptoms: string[];
  setSelectedSymptoms: (symptoms: string[]) => void;

  actionTaken: string;
  setActionTaken: (value: string) => void;

  outcome: string;
  setOutcome: (value: string) => void;

  notes: string;
  setNotes: (value: string) => void;
};

const symptoms = [
  "Headache",
  "Dizziness",
  "Fatigue",
  "Lethargy",

  "Cough",
  "Sneezing",
  "Shortness of Breath",
  "Wheezing",
  "Sore Throat",

  "Nausea",
  "Vomiting",
  "Diarrhoea",
  "Constipation",

  "Pain Reported",

  "Rash",
  "Redness",
  "Swelling",
];

const outcomeOptions = [
  "Improved",
  "No Change",
  "Worsened",
  "Resolved",
];

export default function SymptomsForm({
  selectedSymptoms,
  setSelectedSymptoms,
  actionTaken,
  setActionTaken,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  function toggleSymptom(symptom: string) {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(
        selectedSymptoms.filter((s) => s !== symptom)
      );
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          Symptoms observed
        </p>

        <div className="grid grid-cols-2 gap-2">
          {symptoms.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => toggleSymptom(symptom)}
              className={`rounded-2xl p-3 text-sm font-semibold ${
                selectedSymptoms.includes(symptom)
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={actionTaken}
        onChange={(e) => setActionTaken(e.target.value)}
        placeholder="Action taken"
        className="min-h-24 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          Outcome
        </p>

        <div className="grid grid-cols-2 gap-2">
          {outcomeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setOutcome(option)}
              className={`rounded-2xl p-3 text-sm font-semibold ${
                outcome === option
                  ? "bg-teal-500 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Additional notes"
        className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
      />
    </div>
  );
}
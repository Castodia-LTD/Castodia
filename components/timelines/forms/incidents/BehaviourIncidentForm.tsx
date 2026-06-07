"use client";

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

  prnOptions?: {
    id: string;
    label: string;
  }[];

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
];

const supportOptions = [
  "Verbal Reassurance",
  "Redirection",
  "Distraction",
  "Environmental Changes",
  "PRN Medication",
  "Physical Intervention",
  "Other",
];

const outcomeOptions = [
  "Settled independently",
  "Settled with staff support",
  "Removed from situation",
  "Service user remained distressed",
  "Other",
];

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

  function toggleValue(
    value: string,
    currentValues: string[],
    setValues: (value: string[]) => void
  ) {
    if (currentValues.includes(value)) {
      setValues(currentValues.filter((item) => item !== value));
      return;
    }

    setValues([...currentValues, value]);
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          What happened before?
        </p>

        <textarea
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          placeholder="Describe what happened before the incident..."
          className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          Behaviour type
        </p>

        <div className="grid grid-cols-2 gap-2">
          {behaviourOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                toggleValue(option, behaviourTypes, setBehaviourTypes)
              }
              className={`rounded-2xl p-3 text-sm font-semibold ${
                behaviourTypes.includes(option)
                  ? "bg-blue-500 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          What happened?
        </p>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide a factual description of what happened..."
          className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          Support provided
        </p>

        <div className="grid grid-cols-2 gap-2">
          {supportOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                toggleValue(option, supportProvided, setSupportProvided)
              }
              className={`rounded-2xl p-3 text-sm font-semibold ${
                supportProvided.includes(option)
                  ? "bg-teal-500 text-white"
                  : "bg-white/10 text-slate-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {prnMedicationSelected && (
        <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
          <p className="mb-2 text-sm font-semibold text-blue-200">
            Link PRN administration
          </p>

          <select
            value={linkedPrnAdministrationId}
            onChange={(e) => setLinkedPrnAdministrationId(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-white outline-none"
          >
            <option value="">Select PRN administration...</option>

            {prnOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {prnOptions.length === 0 && (
            <p className="mt-2 text-xs text-slate-400">
              No recent PRN administrations found for this service user.
            </p>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          Immediate outcome
        </p>

        <div className="grid grid-cols-2 gap-2">
          {outcomeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                toggleValue(option, immediateOutcomes, setImmediateOutcomes)
              }
              className={`rounded-2xl p-3 text-sm font-semibold ${
                immediateOutcomes.includes(option)
                  ? "bg-purple-500 text-white"
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
        className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
      />
    </div>
  );
}
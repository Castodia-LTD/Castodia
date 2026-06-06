"use client";

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
];

const frequencyOptions = [
  "Single Occurrence",
  "Occasional",
  "Repeated",
  "Persistent",
];

const supportOptions = [
  "Verbal Reassurance",
  "Redirection",
  "Quiet Space",
  "Preferred Activity",
  "Sensory Support",
  "Increased Observation",
  "Time Alone",
];

const outcomeOptions = [
  "Settled Independently",
  "Settled With Support",
  "Continued",
  "Escalated",
];

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
  const toggleArrayValue = (
    current: string[],
    setValue: (value: string[]) => void,
    value: string
  ) => {
    setValue(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Behaviour Observation
        </h3>
        <p className="text-sm text-slate-600">
          Record behaviours that may indicate escalation or a developing concern.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Behaviour observed
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {behaviourOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="checkbox"
                checked={behaviourObserved.includes(option)}
                onChange={() =>
                  toggleArrayValue(
                    behaviourObserved,
                    setBehaviourObserved,
                    option
                  )
                }
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Frequency
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {frequencyOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="radio"
                name="behaviourFrequency"
                checked={behaviourFrequency === option}
                onChange={() => setBehaviourFrequency(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Support provided
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {supportOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="checkbox"
                checked={behaviourSupportProvided.includes(option)}
                onChange={() =>
                  toggleArrayValue(
                    behaviourSupportProvided,
                    setBehaviourSupportProvided,
                    option
                  )
                }
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Outcome
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {outcomeOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <input
                type="radio"
                name="behaviourOutcome"
                checked={behaviourOutcome === option}
                onChange={() => setBehaviourOutcome(option)}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-800 mb-2">
          Additional notes
        </label>

        <textarea
          className="w-full rounded-lg border p-3 text-sm"
          rows={4}
          value={behaviourNotes}
          onChange={(e) => setBehaviourNotes(e.target.value)}
          placeholder="Add any further context, support offered, or observations..."
        />
      </div>
    </div>
  );
}
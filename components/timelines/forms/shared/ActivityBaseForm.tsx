type ExtraField = {
  label: string;
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: "text" | "textarea";
};

type Props = {
  primaryLabel: string;
  primaryPlaceholder: string;
  primaryValue: string;
  setPrimaryValue: (value: string) => void;

  extraFields?: ExtraField[];

  participationLevel: string;
  setParticipationLevel: (value: string) => void;

  outcome: string;
  setOutcome: (value: string) => void;

  notes: string;
  setNotes: (value: string) => void;
};

const participationOptions = [
  "Independent",
  "Prompted",
  "Supported",
  "Full Assistance",
  "Refused",
];

const outcomeOptions = [
  "Very Positive",
  "Positive",
  "Neutral",
  "Negative",
  "Unable to Complete",
];

export default function ActivityBaseForm({
  primaryLabel,
  primaryPlaceholder,
  primaryValue,
  setPrimaryValue,
  extraFields = [],
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          {primaryLabel}
        </p>

        <input
          value={primaryValue}
          onChange={(e) => setPrimaryValue(e.target.value)}
          placeholder={primaryPlaceholder}
          className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
        />
      </div>

      {extraFields.map((field) => (
        <div key={field.label}>
          <p className="mb-2 text-sm font-semibold text-slate-300">
            {field.label}
          </p>

          {field.type === "textarea" ? (
            <textarea
              value={field.value}
              onChange={(e) => field.setValue(e.target.value)}
              placeholder={field.placeholder}
              className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
            />
          ) : (
            <input
              value={field.value}
              onChange={(e) => field.setValue(e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
            />
          )}
        </div>
      ))}

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-300">
          Participation level
        </p>

        <div className="grid grid-cols-2 gap-2">
          {participationOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setParticipationLevel(option)}
              className={`rounded-2xl p-3 text-sm font-semibold ${
                participationLevel === option
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
        <p className="mb-2 text-sm font-semibold text-slate-300">Outcome</p>

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
        placeholder="Notes / observations"
        className="min-h-32 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
      />
    </div>
  );
}
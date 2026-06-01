type Props = {
  toiletingOutcome: string;
  setToiletingOutcome: (value: string) => void;

  assistanceRequired: string;
  setAssistanceRequired: (value: string) => void;

  padChanged: string;
  setPadChanged: (value: string) => void;

  bristolType: string;
  setBristolType: (value: string) => void;

  toiletingNotes: string;
  setToiletingNotes: (value: string) => void;

  continenceSettings: any;
};

export default function ToiletingForm({
  toiletingOutcome,
  setToiletingOutcome,
  assistanceRequired,
  setAssistanceRequired,
  padChanged,
  setPadChanged,
  bristolType,
  setBristolType,
  toiletingNotes,
  setToiletingNotes,
  continenceSettings,
}: Props) {
  return (
    <div className="space-y-4">
      <select
        value={toiletingOutcome}
        onChange={(e) => setToiletingOutcome(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="">Select outcome</option>
        <option value="Passed urine">Passed urine</option>
        <option value="Bowel movement">Bowel movement</option>
        <option value="Both">Both</option>
        <option value="No result">No result</option>
      </select>

      <select
        value={assistanceRequired}
        onChange={(e) => setAssistanceRequired(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="">Assistance required?</option>
        <option value="Yes">Yes</option>
        <option value="No">No</option>
        <option value="N/A">N/A</option>
      </select>

      {continenceSettings?.track_pad_changes && (
        <select
          value={padChanged}
          onChange={(e) => setPadChanged(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        >
          <option value="">Pad changed?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      )}

      {continenceSettings?.track_bristol_stool_chart &&
        (toiletingOutcome === "Bowel movement" ||
          toiletingOutcome === "Both") && (
          <select
            value={bristolType}
            onChange={(e) => setBristolType(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          >
            <option value="">Bristol stool type</option>

            <option value="1">Type 1</option>
            <option value="2">Type 2</option>
            <option value="3">Type 3</option>
            <option value="4">Type 4</option>
            <option value="5">Type 5</option>
            <option value="6">Type 6</option>
            <option value="7">Type 7</option>
          </select>
        )}

      <textarea
        value={toiletingNotes}
        onChange={(e) => setToiletingNotes(e.target.value)}
        placeholder="Additional notes..."
        className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
      />
    </div>
  );
}
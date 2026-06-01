type Props = {
  sleepStatus: string;
  setSleepStatus: (value: string) => void;

  sleepNotes: string;
  setSleepNotes: (value: string) => void;
};

export default function SleepForm({
  sleepStatus,
  setSleepStatus,
  sleepNotes,
  setSleepNotes,
}: Props) {
  return (
    <div className="space-y-4">
      <select
        value={sleepStatus}
        onChange={(e) => setSleepStatus(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="">Select sleep status</option>

        <option value="Asleep">Asleep</option>
        <option value="Awake">Awake</option>
      </select>

      <textarea
        value={sleepNotes}
        onChange={(e) => setSleepNotes(e.target.value)}
        placeholder="Optional notes..."
        className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
      />
    </div>
  );
}
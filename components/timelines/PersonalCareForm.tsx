type Props = {
  careType: string;
  setCareType: (value: string) => void;

  assistanceLevel: string;
  setAssistanceLevel: (value: string) => void;

  personalCareNotes: string;
  setPersonalCareNotes: (value: string) => void;
};

export default function PersonalCareForm({
  careType,
  setCareType,
  assistanceLevel,
  setAssistanceLevel,
  personalCareNotes,
  setPersonalCareNotes,
}: Props) {
  return (
    <div className="space-y-4">
      <select
        value={careType}
        onChange={(e) => setCareType(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="">Select care completed</option>

        <option value="Shower">Shower</option>
        <option value="Bath">Bath</option>
        <option value="Strip wash">Strip wash</option>
        <option value="Face / hands">Face / hands</option>
        <option value="Oral care">Oral care</option>
        <option value="Hair wash">Hair wash</option>
        <option value="Shave">Shave</option>
        <option value="Clothing changed">Clothing changed</option>
        <option value="No personal care completed">
          No personal care completed
        </option>
      </select>

      <select
        value={assistanceLevel}
        onChange={(e) => setAssistanceLevel(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="">Select assistance level</option>

        <option value="Independent">Independent</option>
        <option value="Prompted">Prompted</option>
        <option value="Assisted">Assisted</option>
        <option value="Fully supported">Fully supported</option>
        <option value="Refused">Refused</option>
      </select>

      <textarea
        value={personalCareNotes}
        onChange={(e) => setPersonalCareNotes(e.target.value)}
        placeholder="Additional notes..."
        className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none"
      />
    </div>
  );
}
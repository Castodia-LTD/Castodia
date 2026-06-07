import { SectionCard } from "@/components/layouts";
import type { ServiceUser } from "../types";

type HandoverFormProps = {
  title: string;
  content: string;
  handoverPeriod: string;
  serviceUsers: ServiceUser[];
  selectedServiceUsers: string[];
  generating: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onHandoverPeriodChange: (value: string) => void;
  onToggleServiceUser: (id: string) => void;
  onGenerateSummary: () => void;
  onCreateHandover: () => void;
  onClose: () => void;
};

export default function HandoverForm({
  title,
  content,
  handoverPeriod,
  serviceUsers,
  selectedServiceUsers,
  generating,
  onTitleChange,
  onContentChange,
  onHandoverPeriodChange,
  onToggleServiceUser,
  onGenerateSummary,
  onCreateHandover,
  onClose,
}: HandoverFormProps) {
  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-white">Create Handover</h2>

        <button
          onClick={onClose}
          className="rounded-full bg-white/10 px-3 py-1 text-sm text-slate-200"
        >
          Close
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Handover title"
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder="Write handover details..."
          className="min-h-32 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <div>
          <h3 className="mb-3 font-semibold text-white">Handover Period</h3>

          <select
            value={handoverPeriod}
            onChange={(event) => onHandoverPeriodChange(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
          >
            <option value="24">Last 24 Hours</option>
            <option value="48">Last 48 Hours</option>
            <option value="72">Last 72 Hours</option>
          </select>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">
            Select service users
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {serviceUsers.map((serviceUser) => {
              const selected = selectedServiceUsers.includes(serviceUser.id);

              return (
                <button
                  key={serviceUser.id}
                  type="button"
                  onClick={() => onToggleServiceUser(serviceUser.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-cyan-300 bg-cyan-500/20"
                      : "border-white/10 bg-white/10"
                  }`}
                >
                  <p className="font-semibold text-white">
                    {serviceUser.full_name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {serviceUser.house_name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerateSummary}
          disabled={generating}
          className="w-full rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 font-semibold text-cyan-200 disabled:opacity-60"
        >
          {generating ? "Generating summary..." : "Generate Automatic Summary"}
        </button>

        <button
          onClick={onCreateHandover}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold text-white"
        >
          Create Handover
        </button>
      </div>
    </SectionCard>
  );
}
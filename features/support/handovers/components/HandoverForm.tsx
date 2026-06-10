import {
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
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

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const textareaClass =
  "min-h-32 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

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
    <CastodiaCard>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-slate-950">
          Create Handover
        </h2>

        <CastodiaButton variant="secondary" size="sm" onClick={onClose}>
          Close
        </CastodiaButton>
      </div>

      <div className="mt-5 space-y-4">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Handover title"
          className={inputClass}
        />

        <textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder="Write handover details..."
          className={textareaClass}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Handover period
          </label>

          <select
            value={handoverPeriod}
            onChange={(event) => onHandoverPeriodChange(event.target.value)}
            className={inputClass}
          >
            <option value="24">Last 24 Hours</option>
            <option value="48">Last 48 Hours</option>
            <option value="72">Last 72 Hours</option>
          </select>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">
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
                      ? "border-teal-400 bg-teal-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-950">
                    {serviceUser.full_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {serviceUser.house_name || "No house assigned"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <CastodiaButton
          type="button"
          variant="secondary"
          onClick={onGenerateSummary}
          disabled={generating}
          className="w-full"
        >
          {generating ? "Generating summary..." : "Generate Automatic Summary"}
        </CastodiaButton>

        <CastodiaButton onClick={onCreateHandover} className="w-full">
          Create Handover
        </CastodiaButton>
      </div>
    </CastodiaCard>
  );
}
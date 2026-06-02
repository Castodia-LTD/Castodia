import type { CompetencyAction } from "@/lib/admin/competencies/types";

type Props = {
  action: CompetencyAction;
  onChange: (action: CompetencyAction) => void;
  onRemove: () => void;
};

export default function CompetencyActionRow({
  action,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
      <input
        value={action.action}
        onChange={(e) =>
          onChange({
            ...action,
            action: e.target.value,
          })
        }
        placeholder="Action"
        className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />

      <input
        value={action.responsible_person}
        onChange={(e) =>
          onChange({
            ...action,
            responsible_person: e.target.value,
          })
        }
        placeholder="Responsible person"
        className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />

      <input
        type="date"
        value={action.due_date}
        onChange={(e) =>
          onChange({
            ...action,
            due_date: e.target.value,
          })
        }
        className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />

      <button
        onClick={onRemove}
        className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-200"
      >
        Remove
      </button>
    </div>
  );
}
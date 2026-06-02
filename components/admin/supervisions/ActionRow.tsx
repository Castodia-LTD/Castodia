import { SupervisionAction } from "@/lib/admin/supervisions/types";

type Props = {
  action: SupervisionAction;
  onChange: (action: SupervisionAction) => void;
  onRemove: () => void;
};

export default function ActionRow({
  action,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 space-y-3">
      <input
        value={action.action}
        onChange={(e) =>
          onChange({
            ...action,
            action: e.target.value,
          })
        }
        placeholder="Action"
        className="w-full rounded-xl bg-slate-800 p-3 text-white"
      />

      <input
        value={action.responsible_person}
        onChange={(e) =>
          onChange({
            ...action,
            responsible_person: e.target.value,
          })
        }
        placeholder="Responsible Person"
        className="w-full rounded-xl bg-slate-800 p-3 text-white"
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
        className="w-full rounded-xl bg-slate-800 p-3 text-white"
      />

      <button
        onClick={onRemove}
        className="rounded-xl bg-red-500/20 px-4 py-2 text-red-200"
      >
        Remove
      </button>
    </div>
  );
}
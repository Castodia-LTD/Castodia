import type { CompetencyAction } from "@/lib/admin/competencies/types";
import { CastodiaButton } from "@/components/castodia";

type Props = {
  action: CompetencyAction;
  onChange: (action: CompetencyAction) => void;
  onRemove: () => void;
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function CompetencyActionRow({
  action,
  onChange,
  onRemove,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto] md:items-center">
        <input
          value={action.action}
          onChange={(e) =>
            onChange({
              ...action,
              action: e.target.value,
            })
          }
          placeholder="Action"
          className={inputClass}
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
          className={inputClass}
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
          className={inputClass}
        />

        <CastodiaButton variant="danger" size="sm" onClick={onRemove}>
          Remove
        </CastodiaButton>
      </div>
    </div>
  );
}
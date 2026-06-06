import type { Dispatch, SetStateAction } from "react";
import type { ServiceUser } from "@/lib/admin/service-users/types";

type Props = {
  editing: ServiceUser | null;
  setEditing: Dispatch<SetStateAction<ServiceUser | null>>;
  onSave: () => void;
};

export default function EditServiceUserModal({
  editing,
  setEditing,
  onSave,
}: Props) {
  if (!editing) return null;

  function updateField<K extends keyof ServiceUser>(
    key: K,
    value: ServiceUser[K]
  ) {
    setEditing((current) => {
      if (!current) return current;

      return {
        ...current,
        [key]: value,
      };
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Service User</h2>

          <button
            onClick={() => setEditing(null)}
            className="rounded-full bg-white/10 px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <input
          value={editing.first_name || ""}
          onChange={(e) => updateField("first_name", e.target.value)}
          placeholder="First name"
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <input
          value={editing.surname || ""}
          onChange={(e) => updateField("surname", e.target.value)}
          placeholder="Surname"
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />
        <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Gender</label>

        <select
          value={editing.gender || ""}
          onChange={(e) => updateField("gender", e.target.value || null)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
         >
          <option value="">Not recorded</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          </select>
        </div>
        <input
          value={editing.house_name || ""}
          onChange={(e) => updateField("house_name", e.target.value)}
          placeholder="House / location"
          className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <textarea
          value={editing.key_notes || ""}
          onChange={(e) => updateField("key_notes", e.target.value)}
          placeholder="Key notes"
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <textarea
          value={editing.allergies || ""}
          onChange={(e) => updateField("allergies", e.target.value)}
          placeholder="Allergies"
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <textarea
          value={editing.communication_needs || ""}
          onChange={(e) => updateField("communication_needs", e.target.value)}
          placeholder="Communication needs"
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <textarea
          value={editing.risk_notes || ""}
          onChange={(e) => updateField("risk_notes", e.target.value)}
          placeholder="Risk notes"
          className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
        />

        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 p-4">
          <input
            type="checkbox"
            checked={editing.continence_care_enabled}
            onChange={(e) =>
              updateField("continence_care_enabled", e.target.checked)
            }
          />
          <span>Enable continence care</span>
        </label>

        {editing.continence_care_enabled && (
          <div className="space-y-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editing.track_pad_changes}
                onChange={(e) =>
                  updateField("track_pad_changes", e.target.checked)
                }
              />
              <span>Track pad changes</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={editing.track_bristol_stool_chart}
                onChange={(e) =>
                  updateField("track_bristol_stool_chart", e.target.checked)
                }
              />
              <span>Track Bristol stool chart</span>
            </label>
          </div>
        )}

        <button
          onClick={onSave}
          className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
import type { MedicationProfile } from "@/lib/admin/medications/types";

type Props = {
  medication: MedicationProfile;
  onToggleLock: (medication: MedicationProfile) => void;
  onDeactivate: (id: string) => void;
};

export default function MedicationProfileCard({
  medication,
  onToggleLock,
  onDeactivate,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-300">{medication.round}</p>

          <h2 className="mt-1 text-xl font-bold">
            {medication.medication_name}
          </h2>

          <p className="mt-1 text-slate-300">{medication.dose}</p>

          {medication.route && (
            <p className="mt-1 text-sm text-slate-400">
              Route: {medication.route}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 text-right">
          {medication.is_prn && (
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs text-purple-200">
              PRN
            </span>
          )}

          {medication.locked && (
            <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200">
              Locked
            </span>
          )}
        </div>
      </div>

      {medication.instructions && (
        <p className="mt-4 whitespace-pre-line text-sm text-slate-300">
          {medication.instructions}
        </p>
      )}

      {medication.titration_plan_available && (
        <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Titration Plan</p>

          {medication.titration_trigger_missed_rounds && (
            <p className="mt-1">
              Trigger after {medication.titration_trigger_missed_rounds} missed
              rounds.
            </p>
          )}

          {medication.titration_instructions && (
            <p className="mt-2 whitespace-pre-line">
              {medication.titration_instructions}
            </p>
          )}

          {medication.manager_unlock_required && (
            <p className="mt-2 font-semibold">
              Manager unlock required after trigger.
            </p>
          )}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onToggleLock(medication)}
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm"
        >
          {medication.locked ? "Unlock" : "Lock"}
        </button>

        <button
          onClick={() => onDeactivate(medication.id)}
          className="rounded-2xl bg-red-500/20 px-4 py-2 text-sm text-red-200"
        >
          Deactivate
        </button>
      </div>
    </div>
  );
}
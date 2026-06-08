import { Power, RotateCcw } from "lucide-react";
import type { MedicationProfile } from "../types";

type Props = {
  medications: MedicationProfile[];
  selectedServiceUserName: string;
  onToggleActive: (medication: MedicationProfile) => void;
};

export default function MedicationProfilesTable({
  medications,
  selectedServiceUserName,
  onToggleActive,
}: Props) {
  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="text-xl font-bold text-white">
            {selectedServiceUserName || "Medication Profiles"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Active and inactive medication profiles.
          </p>
        </div>

        <div className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-semibold text-cyan-200">
          {medications.length} recorded
        </div>
      </div>

      {medications.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          No medication profiles recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="border-b border-white/10 bg-slate-950/60 text-sm text-slate-400">
              <tr>
                <th className="p-4">Medication</th>
                <th className="p-4">Dose</th>
                <th className="p-4">Route</th>
                <th className="p-4">Type</th>
                <th className="p-4">Rounds</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {medications.map((medication) => (
                <tr
                  key={medication.id}
                  className="border-b border-white/10 last:border-b-0"
                >
                  <td className="p-4">
                    <p className="font-semibold text-white">
                      {medication.medication_name} {medication.strength || ""}
                    </p>

                    {medication.instructions && (
                      <p className="mt-1 max-w-xs truncate text-sm text-slate-400">
                        {medication.instructions}
                      </p>
                    )}
                  </td>

                  <td className="p-4 text-slate-300">{medication.dose}</td>
                  <td className="p-4 text-slate-300">{medication.route}</td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        medication.medication_type === "PRN"
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-teal-500/20 text-teal-200"
                      }`}
                    >
                      {medication.medication_type}
                    </span>
                  </td>

                  <td className="p-4">
                    {medication.medication_type === "Regular" ? (
                      <div className="flex flex-wrap gap-1">
                        {(medication.rounds || []).map((round) => (
                          <span
                            key={round}
                            className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300"
                          >
                            {round}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">
                        As required
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        medication.active
                          ? "bg-emerald-500/20 text-emerald-200"
                          : "bg-slate-500/20 text-slate-300"
                      }`}
                    >
                      {medication.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => onToggleActive(medication)}
                      className="inline-flex rounded-xl bg-white/10 p-3 text-slate-300 hover:bg-white/20"
                    >
                      {medication.active ? (
                        <Power size={18} />
                      ) : (
                        <RotateCcw size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
import { Power, RotateCcw } from "lucide-react";
import type { MedicationProfile } from "../types";
import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";

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
    <CastodiaCard padding="none">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            {selectedServiceUserName || "Medication Profiles"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Active and inactive medication profiles.
          </p>
        </div>

        <CastodiaBadge variant="info">
          {medications.length} recorded
        </CastodiaBadge>
      </div>

      {medications.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No medication profiles recorded.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Medication
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dose
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Route
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Rounds
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {medications.map((medication) => {
                const rounds = medication.round
                  .split(",")
                  .map((round) => round.trim())
                  .filter(Boolean);

                return (
                  <tr
                    key={medication.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-950">
                        {medication.medication_name}
                      </p>

                      {medication.instructions && (
                        <p className="mt-1 max-w-xs truncate text-sm text-slate-500">
                          {medication.instructions}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {medication.dose}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-700">
                      {medication.route || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <CastodiaBadge
                        variant={medication.is_prn ? "warning" : "success"}
                      >
                        {medication.is_prn ? "PRN" : "Regular"}
                      </CastodiaBadge>
                    </td>

                    <td className="px-4 py-4">
                      {!medication.is_prn ? (
                        <div className="flex flex-wrap gap-1">
                          {rounds.map((round) => (
                            <CastodiaBadge key={round} variant="neutral">
                              {round}
                            </CastodiaBadge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">
                          As required
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <CastodiaBadge
                        variant={medication.active ? "success" : "neutral"}
                      >
                        {medication.active ? "Active" : "Inactive"}
                      </CastodiaBadge>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <CastodiaButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onToggleActive(medication)}
                      >
                        {medication.active ? (
                          <Power size={16} />
                        ) : (
                          <RotateCcw size={16} />
                        )}
                      </CastodiaButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CastodiaCard>
  );
}
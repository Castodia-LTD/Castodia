import { X } from "lucide-react";
import { roundOptions } from "../types";

type Props = {
  selectedServiceUserName: string;

  medicationName: string;
  strength: string;
  dose: string;
  route: string;
  medicationType: string;
  rounds: string[];
  instructions: string;

  prnReasonRequired: boolean;
  prnIncidentRecommended: boolean;

  setMedicationName: (value: string) => void;
  setStrength: (value: string) => void;
  setDose: (value: string) => void;
  setRoute: (value: string) => void;
  setMedicationType: (value: string) => void;
  setInstructions: (value: string) => void;

  setPrnReasonRequired: (value: boolean) => void;
  setPrnIncidentRecommended: (value: boolean) => void;

  toggleRound: (round: string) => void;

  onSave: () => void;
  onClose: () => void;
};

export default function AddMedicationForm({
  selectedServiceUserName,

  medicationName,
  strength,
  dose,
  route,
  medicationType,
  rounds,
  instructions,

  prnReasonRequired,
  prnIncidentRecommended,

  setMedicationName,
  setStrength,
  setDose,
  setRoute,
  setMedicationType,
  setInstructions,

  setPrnReasonRequired,
  setPrnIncidentRecommended,

  toggleRound,

  onSave,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Add Medication Profile
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {selectedServiceUserName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-3 text-slate-300 hover:bg-white/20"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            placeholder="Medication name"
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
          />

          <input
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
            placeholder="Strength (e.g. 500mg)"
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
          />

          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="Dose (e.g. 2 tablets)"
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
          />

          <input
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="Route (e.g. Oral)"
            className="w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
          />

          <div className="grid grid-cols-2 gap-2">
            {["Regular", "PRN"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMedicationType(type)}
                className={`rounded-2xl p-3 text-sm font-semibold ${
                  medicationType === type
                    ? "bg-cyan-500 text-white"
                    : "bg-white/10 text-slate-300"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {medicationType === "Regular" && (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-300">
                Medication Rounds
              </p>

              <div className="grid grid-cols-2 gap-2">
                {roundOptions.map((round) => (
                  <button
                    key={round}
                    type="button"
                    onClick={() => toggleRound(round)}
                    className={`rounded-2xl p-3 text-sm font-semibold ${
                      rounds.includes(round)
                        ? "bg-teal-500 text-white"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    {round}
                  </button>
                ))}
              </div>
            </div>
          )}

          {medicationType === "PRN" && (
            <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={prnReasonRequired}
                  onChange={(e) =>
                    setPrnReasonRequired(e.target.checked)
                  }
                />

                Require reason when administered
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={prnIncidentRecommended}
                  onChange={(e) =>
                    setPrnIncidentRecommended(e.target.checked)
                  }
                />

                Recommend incident form when administered
              </label>
            </div>
          )}

          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions / notes"
            className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none placeholder:text-slate-500"
          />

          <button
            onClick={onSave}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 text-lg font-semibold text-white"
          >
            Save Medication Profile
          </button>
        </div>
      </div>
    </div>
  );
}
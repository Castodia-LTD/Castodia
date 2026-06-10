import { X } from "lucide-react";
import { roundOptions } from "../types";
import { CastodiaButton } from "@/components/castodia";

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

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

const textareaClass =
  "mt-2 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Add Medication Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {selectedServiceUserName || "No service user selected"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Medication name
            </label>
            <input
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Medication name"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Strength
              </label>
              <input
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="e.g. 500mg"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Dose
              </label>
              <input
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="e.g. 2 tablets"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Route
            </label>
            <input
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="e.g. Oral"
              className={inputClass}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">
              Medication type
            </p>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {["Regular", "PRN"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMedicationType(type)}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                    medicationType === type
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {medicationType === "Regular" && (
            <div>
              <p className="text-sm font-medium text-slate-700">
                Medication rounds
              </p>

              <div className="mt-2 grid grid-cols-2 gap-2">
                {roundOptions.map((round) => (
                  <button
                    key={round}
                    type="button"
                    onClick={() => toggleRound(round)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                      rounds.includes(round)
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {round}
                  </button>
                ))}
              </div>
            </div>
          )}

          {medicationType === "PRN" && (
            <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={prnReasonRequired}
                  onChange={(e) => setPrnReasonRequired(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Require reason when administered
              </label>

              <label className="flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={prnIncidentRecommended}
                  onChange={(e) =>
                    setPrnIncidentRecommended(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Recommend incident form when administered
              </label>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700">
              Instructions / notes
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Instructions / notes"
              className={textareaClass}
            />
          </div>

          <CastodiaButton onClick={onSave} className="w-full">
            Save Medication Profile
          </CastodiaButton>
        </div>
      </div>
    </div>
  );
}
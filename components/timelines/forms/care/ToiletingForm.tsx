type Props = {
  toiletingOutcome: string;
  setToiletingOutcome: (value: string) => void;

  assistanceRequired: string;
  setAssistanceRequired: (value: string) => void;

  padChanged: string;
  setPadChanged: (value: string) => void;

  bristolType: string;
  setBristolType: (value: string) => void;

  toiletingNotes: string;
  setToiletingNotes: (value: string) => void;

  continenceSettings?: {
    track_pad_changes?: boolean;
    track_bristol_stool_chart?: boolean;
  } | null;
};

const selectClassName =
  "w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none transition focus:border-cyan-400/60";

const textareaClassName =
  "w-full rounded-2xl border border-white/10 bg-white/10 p-4 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/60";

export default function ToiletingForm({
  toiletingOutcome,
  setToiletingOutcome,
  assistanceRequired,
  setAssistanceRequired,
  padChanged,
  setPadChanged,
  bristolType,
  setBristolType,
  toiletingNotes,
  setToiletingNotes,
  continenceSettings,
}: Props) {
  const outcomeSelected = Boolean(toiletingOutcome);

  const passedUrine =
    toiletingOutcome === "Passed urine" ||
    toiletingOutcome === "Both";

  const passedBowel =
    toiletingOutcome === "Bowel movement" ||
    toiletingOutcome === "Both";

  const handleOutcomeChange = (value: string) => {
    setToiletingOutcome(value);

    if (value !== "Bowel movement" && value !== "Both") {
      setBristolType("");
    }

    if (!value) {
      setAssistanceRequired("");
      setPadChanged("");
      setBristolType("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-white">
            Toileting outcome
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Select what occurred during this toileting episode.
          </p>
        </div>

        <select
          value={toiletingOutcome}
          onChange={(event) =>
            handleOutcomeChange(event.target.value)
          }
          className={selectClassName}
        >
          <option value="">Select outcome</option>
          <option value="Passed urine">Passed urine</option>
          <option value="Bowel movement">Bowel movement</option>
          <option value="Both">
            Passed urine and bowel movement
          </option>
          <option value="No result">No result</option>
        </select>
      </section>

      {outcomeSelected && (
        <section className="space-y-3">
          <div>
            <h3 className="font-semibold text-white">
              Support provided
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Record the level of support provided.
            </p>
          </div>

          <select
            value={assistanceRequired}
            onChange={(event) =>
              setAssistanceRequired(event.target.value)
            }
            className={selectClassName}
          >
            <option value="">Select level of assistance</option>
            <option value="Independent">Independent</option>
            <option value="Prompted">Prompted</option>
            <option value="Supervised">Supervised</option>
            <option value="Partial assistance">
              Partial assistance
            </option>
            <option value="Full assistance">
              Full assistance
            </option>
            <option value="N/A">Not applicable</option>
          </select>
        </section>
      )}

      {passedUrine && (
        <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <h3 className="font-semibold text-white">
            Urination recorded
          </h3>

          <p className="text-sm text-slate-400">
            Add any relevant concerns such as unusual colour,
            odour, discomfort, reduced output or blood in the notes
            section below.
          </p>
        </section>
      )}

      {passedBowel && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <h3 className="font-semibold text-white">
              Bowel movement
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Record stool consistency where monitoring is enabled.
            </p>
          </div>

          {continenceSettings?.track_bristol_stool_chart ? (
            <select
              value={bristolType}
              onChange={(event) =>
                setBristolType(event.target.value)
              }
              className={selectClassName}
            >
              <option value="">
                Select Bristol Stool Scale type
              </option>

              <option value="1">
                Type 1 — Separate hard lumps
              </option>

              <option value="2">
                Type 2 — Sausage-shaped but lumpy
              </option>

              <option value="3">
                Type 3 — Sausage-shaped with surface cracks
              </option>

              <option value="4">
                Type 4 — Smooth, soft and formed
              </option>

              <option value="5">
                Type 5 — Soft blobs with clear edges
              </option>

              <option value="6">
                Type 6 — Fluffy or mushy pieces
              </option>

              <option value="7">
                Type 7 — Watery with no solid pieces
              </option>
            </select>
          ) : (
            <p className="text-sm text-slate-400">
              Bristol Stool Scale monitoring is not enabled for this
              service user.
            </p>
          )}
        </section>
      )}

      {continenceSettings?.track_pad_changes && outcomeSelected && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <h3 className="font-semibold text-white">
              Continence pad
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Record whether a continence pad was changed.
            </p>
          </div>

          <select
            value={padChanged}
            onChange={(event) =>
              setPadChanged(event.target.value)
            }
            className={selectClassName}
          >
            <option value="">Was the pad changed?</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not required">Not required</option>
          </select>
        </section>
      )}

      {toiletingOutcome === "No result" && (
        <section className="space-y-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
          <h3 className="font-semibold text-amber-100">
            No result recorded
          </h3>

          <p className="text-sm text-amber-100/70">
            Use the notes section to record relevant context, such as
            whether toileting was offered, declined or unsuccessful.
          </p>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h3 className="font-semibold text-white">
            Additional notes
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Record observations, concerns, support provided or actions
            taken.
          </p>
        </div>

        <textarea
          value={toiletingNotes}
          onChange={(event) =>
            setToiletingNotes(event.target.value)
          }
          placeholder={
            toiletingOutcome === "No result"
              ? "For example: Toileting was offered but declined..."
              : "Add any relevant observations or concerns..."
          }
          rows={4}
          className={textareaClassName}
        />
      </section>
    </div>
  );
}
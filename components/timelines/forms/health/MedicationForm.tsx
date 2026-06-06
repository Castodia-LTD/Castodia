type Props = {
  selectedRound: string;
  setSelectedRound: (round: string) => void;
  medicationProfiles: any[];
  medicationStatuses: Record<string, string>;
  setMedicationStatuses: (statuses: Record<string, string>) => void;
  medicationReasons: Record<string, string>;
  setMedicationReasons: (reasons: Record<string, string>) => void;
};

export default function MedicationForm({
  selectedRound,
  setSelectedRound,
  medicationProfiles,
  medicationStatuses,
  setMedicationStatuses,
  medicationReasons,
  setMedicationReasons,
}: Props) {
  return (
    <div className="space-y-4">
      <select
        value={selectedRound}
        onChange={(e) => setSelectedRound(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 p-4 text-white outline-none"
      >
        <option value="Morning">Morning</option>
        <option value="Lunch">Lunch</option>
        <option value="Tea">Tea</option>
        <option value="Night">Night</option>
        <option value="PRN">PRN</option>
      </select>

      {medicationProfiles
        .filter((med) => med.round === selectedRound)
        .map((med) => (
          <div
            key={med.id}
            className="space-y-3 rounded-2xl border border-white/10 bg-white/10 p-4"
          >
            <div>
              <p className="font-semibold text-white">
                {med.medication_name}
              </p>

              <p className="text-sm text-slate-300">{med.dose}</p>
            </div>

            <select
              value={medicationStatuses[med.id] || ""}
              onChange={(e) =>
                setMedicationStatuses({
                  ...medicationStatuses,
                  [med.id]: e.target.value,
                })
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900 p-3 text-white outline-none"
            >
              <option value="">Select status</option>
              <option value="Administered">Administered</option>
              <option value="Refused">Refused</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Omitted">Omitted</option>
            </select>

            {medicationStatuses[med.id] &&
              medicationStatuses[med.id] !== "Administered" && (
                <select
                  value={medicationReasons[med.id] || ""}
                  onChange={(e) =>
                    setMedicationReasons({
                      ...medicationReasons,
                      [med.id]: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-red-500/20 bg-red-950/40 p-3 text-white outline-none"
                >
                  <option value="">Select reason</option>
                  <option value="Refused by service user">
                    Refused by service user
                  </option>
                  <option value="Medication unavailable">
                    Medication unavailable
                  </option>
                  <option value="Asleep">Asleep</option>
                  <option value="Away from service">Away from service</option>
                  <option value="Clinical decision">Clinical decision</option>
                </select>
              )}
          </div>
        ))}
    </div>
  );
}
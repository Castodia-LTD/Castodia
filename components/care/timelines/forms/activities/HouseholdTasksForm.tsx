import ActivityBaseForm from "@/components/care/timelines/forms/shared/ActivityBaseForm";

type Props = {
  taskCompleted: string;
  setTaskCompleted: (value: string) => void;
  areaOfHome: string;
  setAreaOfHome: (value: string) => void;
  supportProvided: string;
  setSupportProvided: (value: string) => void;
  participationLevel: string;
  setParticipationLevel: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function HouseholdTasksForm({
  taskCompleted,
  setTaskCompleted,
  areaOfHome,
  setAreaOfHome,
  supportProvided,
  setSupportProvided,
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  return (
    <ActivityBaseForm
      primaryLabel="Task completed"
      primaryPlaceholder="e.g. Laundry, washing up, vacuuming"
      primaryValue={taskCompleted}
      setPrimaryValue={setTaskCompleted}
      extraFields={[
        {
          label: "Area of home",
          value: areaOfHome,
          setValue: setAreaOfHome,
          placeholder: "e.g. Kitchen, bedroom, bathroom",
        },
        {
          label: "Support provided",
          value: supportProvided,
          setValue: setSupportProvided,
          placeholder:
            "e.g. verbal prompts, modelling, physical assistance",
          type: "textarea",
        },
      ]}
      participationLevel={participationLevel}
      setParticipationLevel={setParticipationLevel}
      outcome={outcome}
      setOutcome={setOutcome}
      notes={notes}
      setNotes={setNotes}
    />
  );
}
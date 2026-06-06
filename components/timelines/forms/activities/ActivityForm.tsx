import ActivityBaseForm from "@/components/timelines/forms/shared/ActivityBaseForm";

type Props = {
  title: string;
  setTitle: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  peopleInvolved: string;
  setPeopleInvolved: (value: string) => void;
  participationLevel: string;
  setParticipationLevel: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function ActivityForm({
  title,
  setTitle,
  location,
  setLocation,
  peopleInvolved,
  setPeopleInvolved,
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  return (
    <ActivityBaseForm
      primaryLabel="Activity"
      primaryPlaceholder="What activity took place?"
      primaryValue={title}
      setPrimaryValue={setTitle}
      extraFields={[
        {
          label: "Location",
          value: location,
          setValue: setLocation,
          placeholder: "Where did this take place?",
        },
        {
          label: "People involved",
          value: peopleInvolved,
          setValue: setPeopleInvolved,
          placeholder: "Who was involved?",
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
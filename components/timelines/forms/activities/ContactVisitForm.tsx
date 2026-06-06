import ActivityBaseForm from "@/components/timelines/forms/shared/ActivityBaseForm";

type Props = {
  personContacted: string;
  setPersonContacted: (value: string) => void;
  relationship: string;
  setRelationship: (value: string) => void;
  contactMethod: string;
  setContactMethod: (value: string) => void;
  participationLevel: string;
  setParticipationLevel: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function ContactVisitForm({
  personContacted,
  setPersonContacted,
  relationship,
  setRelationship,
  contactMethod,
  setContactMethod,
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  return (
    <ActivityBaseForm
      primaryLabel="Person contacted / visited"
      primaryPlaceholder="e.g. mother, sister, social worker, friend"
      primaryValue={personContacted}
      setPrimaryValue={setPersonContacted}
      extraFields={[
        {
          label: "Relationship / role",
          value: relationship,
          setValue: setRelationship,
          placeholder: "e.g. family member, friend, advocate, social worker",
        },
        {
          label: "Contact method",
          value: contactMethod,
          setValue: setContactMethod,
          placeholder: "e.g. visit, phone call, video call, email",
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
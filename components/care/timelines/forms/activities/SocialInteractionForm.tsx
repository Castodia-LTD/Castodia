import ActivityBaseForm from "@/components/care/timelines/forms/shared/ActivityBaseForm";

type Props = {
  whoInvolved: string;
  setWhoInvolved: (value: string) => void;
  interactionType: string;
  setInteractionType: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  participationLevel: string;
  setParticipationLevel: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function SocialInteractionForm({
  whoInvolved,
  setWhoInvolved,
  interactionType,
  setInteractionType,
  location,
  setLocation,
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  return (
    <ActivityBaseForm
      primaryLabel="Who was involved?"
      primaryPlaceholder="e.g. peers, staff, family member, friend"
      primaryValue={whoInvolved}
      setPrimaryValue={setWhoInvolved}
      extraFields={[
        {
          label: "Type of interaction",
          value: interactionType,
          setValue: setInteractionType,
          placeholder: "e.g. conversation, group activity, shared meal",
        },
        {
          label: "Where did this take place?",
          value: location,
          setValue: setLocation,
          placeholder: "e.g. lounge, garden, community centre",
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
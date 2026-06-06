import ActivityBaseForm from "@/components/timelines/forms/shared/ActivityBaseForm";

type Props = {
  destination: string;
  setDestination: (value: string) => void;
  transport: string;
  setTransport: (value: string) => void;
  supportProvided: string;
  setSupportProvided: (value: string) => void;
  participationLevel: string;
  setParticipationLevel: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function CommunityAccessForm({
  destination,
  setDestination,
  transport,
  setTransport,
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
      primaryLabel="Destination"
      primaryPlaceholder="Where did they go?"
      primaryValue={destination}
      setPrimaryValue={setDestination}
      extraFields={[
        {
          label: "Transport / travel method",
          value: transport,
          setValue: setTransport,
          placeholder: "Walking, taxi, bus, staff vehicle...",
        },
        {
          label: "Support provided",
          value: supportProvided,
          setValue: setSupportProvided,
          placeholder: "What support did staff provide?",
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
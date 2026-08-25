import ActivityBaseForm from "@/components/care/timelines/forms/shared/ActivityBaseForm";

type Props = {
  shopLocation: string;
  setShopLocation: (value: string) => void;
  itemsPurchased: string;
  setItemsPurchased: (value: string) => void;
  moneyManagement: string;
  setMoneyManagement: (value: string) => void;
  participationLevel: string;
  setParticipationLevel: (value: string) => void;
  outcome: string;
  setOutcome: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
};

export default function ShoppingForm({
  shopLocation,
  setShopLocation,
  itemsPurchased,
  setItemsPurchased,
  moneyManagement,
  setMoneyManagement,
  participationLevel,
  setParticipationLevel,
  outcome,
  setOutcome,
  notes,
  setNotes,
}: Props) {
  return (
    <ActivityBaseForm
      primaryLabel="Shop / Location"
      primaryPlaceholder="e.g. Tesco, Asda, local shop"
      primaryValue={shopLocation}
      setPrimaryValue={setShopLocation}
      extraFields={[
        {
          label: "Items purchased",
          value: itemsPurchased,
          setValue: setItemsPurchased,
          placeholder: "e.g. groceries, toiletries, clothing",
          type: "textarea",
        },
        {
          label: "Money management support",
          value: moneyManagement,
          setValue: setMoneyManagement,
          placeholder:
            "e.g. independent, prompted, supported with budgeting",
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
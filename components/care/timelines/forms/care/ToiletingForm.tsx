"use client";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

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

const outcomeOptions = [
  { value: "Passed urine", label: "Passed urine" },
  { value: "Bowel movement", label: "Bowel movement" },
  { value: "Both", label: "Urine and bowel movement" },
  { value: "No result", label: "No result" },
];

const assistanceOptions = [
  "Independent",
  "Prompted",
  "Supervised",
  "Partial assistance",
  "Full assistance",
  "N/A",
].map((value) => ({ value, label: value === "N/A" ? "Not applicable" : value }));

const padOptions = ["Yes", "No", "Not required"].map((value) => ({
  value,
  label: value,
}));

const bristolOptions = [
  { value: "1", label: "Type 1", description: "Separate hard lumps" },
  { value: "2", label: "Type 2", description: "Sausage-shaped but lumpy" },
  { value: "3", label: "Type 3", description: "Sausage-shaped with surface cracks" },
  { value: "4", label: "Type 4", description: "Smooth, soft and formed" },
  { value: "5", label: "Type 5", description: "Soft blobs with clear edges" },
  { value: "6", label: "Type 6", description: "Fluffy or mushy pieces" },
  { value: "7", label: "Type 7", description: "Watery with no solid pieces" },
];

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
  const passedBowel =
    toiletingOutcome === "Bowel movement" || toiletingOutcome === "Both";

  function selectOutcome(value: string) {
    setToiletingOutcome(value);

    if (value !== "Bowel movement" && value !== "Both") {
      setBristolType("");
    }

    if (!value) {
      setAssistanceRequired("");
      setPadChanged("");
      setBristolType("");
    }
  }

  const notesUseful = toiletingOutcome === "No result";

  return (
    <div className="space-y-5">
      <FormSection
        title="Toileting outcome"
        description="Record what occurred during this toileting episode."
      >
        <FormChoiceGroup
          label="Outcome"
          value={toiletingOutcome}
          options={outcomeOptions}
          onChange={selectOutcome}
          required
        />
      </FormSection>

      {toiletingOutcome && (
        <FormSection
          title="Support provided"
          description="Record the level of support provided where relevant."
        >
          <FormChoiceGroup
            label="Assistance"
            value={assistanceRequired}
            options={assistanceOptions}
            onChange={setAssistanceRequired}
          />
        </FormSection>
      )}

      {passedBowel && continenceSettings?.track_bristol_stool_chart && (
        <FormSection
          title="Bowel movement"
          description="Record stool consistency using the Bristol Stool Scale."
        >
          <FormChoiceGroup
            label="Bristol Stool Scale"
            value={bristolType}
            options={bristolOptions}
            onChange={setBristolType}
          />
        </FormSection>
      )}

      {continenceSettings?.track_pad_changes && toiletingOutcome && (
        <FormSection
          title="Continence product"
          description="Record whether a continence pad was changed."
        >
          <FormChoiceGroup
            label="Pad changed"
            value={padChanged}
            options={padOptions}
            onChange={setPadChanged}
          />
        </FormSection>
      )}

      {toiletingOutcome && (
        <FormSection
          title="Additional information"
          description={
            notesUseful
              ? "Add context about why there was no result."
              : "Optional observations or concerns."
          }
          collapsible={!notesUseful}
          defaultOpen={notesUseful}
          summary={!notesUseful && toiletingNotes ? "Notes added" : undefined}
        >
          {notesUseful && (
            <FormAlert variant="info" title="No result recorded">
              Record useful context such as whether toileting was offered, declined or unsuccessful.
            </FormAlert>
          )}

          <FormField label="Notes">
            <FormTextarea
              value={toiletingNotes}
              onChange={(event) => setToiletingNotes(event.target.value)}
              rows={4}
              placeholder={
                notesUseful
                  ? "For example: Toileting was offered but declined..."
                  : "Add any relevant observations or concerns..."
              }
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

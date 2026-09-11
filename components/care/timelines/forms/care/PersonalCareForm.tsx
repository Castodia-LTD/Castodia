"use client";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

export type PersonalCareData = {
  careType: string;
  assistanceLevel: string;
  notes: string;
};

type Props = {
  personalCareData: PersonalCareData;
  setPersonalCareData: (data: PersonalCareData) => void;
};

const careTypeOptions = [
  { value: "Shower", label: "Shower", description: "Full shower completed" },
  { value: "Bath", label: "Bath", description: "Full bath completed" },
  { value: "Strip wash", label: "Strip wash", description: "Personal wash without a bath or shower" },
  { value: "Face / hands", label: "Face / hands", description: "Face and hand hygiene completed" },
  { value: "Oral care", label: "Oral care", description: "Teeth, dentures or mouth care completed" },
  { value: "Hair wash", label: "Hair wash", description: "Hair washing and drying completed" },
  { value: "Shave", label: "Shave", description: "Facial or body shaving completed" },
  { value: "Clothing changed", label: "Clothing changed", description: "Clean clothing or nightwear provided" },
  { value: "No personal care completed", label: "No personal care completed", description: "No personal care activity was completed" },
];

const assistanceLevelOptions = [
  { value: "Independent", label: "Independent", description: "Completed without staff assistance" },
  { value: "Prompted", label: "Prompted", description: "Verbal reminders or encouragement provided" },
  { value: "Assisted", label: "Assisted", description: "Some practical support was provided" },
  { value: "Fully supported", label: "Fully supported", description: "Staff completed most or all of the task" },
  { value: "Refused", label: "Refused", description: "Personal care was offered but declined" },
];

export const initialPersonalCareData: PersonalCareData = {
  careType: "",
  assistanceLevel: "",
  notes: "",
};

export default function PersonalCareForm({
  personalCareData,
  setPersonalCareData,
}: Props) {
  const data = personalCareData;
  const noCareCompleted = data.careType === "No personal care completed";
  const notesRequired = noCareCompleted || data.assistanceLevel === "Refused";

  function update(changes: Partial<PersonalCareData>) {
    setPersonalCareData({ ...data, ...changes });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Personal Care</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record what happened and how much support was needed.
        </p>
      </div>

      <FormSection title="Care completed">
        <FormChoiceGroup
          label="Care type"
          value={data.careType}
          options={careTypeOptions}
          onChange={(value) =>
            update({
              careType: value,
              assistanceLevel: value === "No personal care completed" ? "" : data.assistanceLevel,
            })
          }
          columns={2}
          required
        />
      </FormSection>

      {data.careType && !noCareCompleted && (
        <FormSection title="Support provided">
          <FormChoiceGroup
            label="Assistance level"
            value={data.assistanceLevel}
            options={assistanceLevelOptions}
            onChange={(value) => update({ assistanceLevel: value })}
            columns={2}
            required
          />

          {data.assistanceLevel === "Refused" && (
            <FormAlert variant="warning" title="Refusal recorded">
              Add a brief note explaining that care was offered, any reason given and any action taken.
            </FormAlert>
          )}
        </FormSection>
      )}

      {data.careType && (
        <FormSection
          title={notesRequired ? "Required detail" : "Additional notes"}
          description={
            notesRequired
              ? "Add the information needed to explain this outcome."
              : "Only add detail when it helps the next person understand the care provided."
          }
          collapsible={!notesRequired}
          defaultOpen={notesRequired}
          summary={data.notes.trim() ? "Notes added" : "Optional"}
        >
          <FormField
            label="Notes"
            htmlFor="personal-care-notes"
            required={notesRequired}
            description={
              data.assistanceLevel === "Refused"
                ? "Include care offered, reason for refusal if known, and any follow-up."
                : noCareCompleted
                  ? "Record why no personal care was completed."
                  : "Preferences, observations or anything relevant to continuity of care."
            }
          >
            <FormTextarea
              id="personal-care-notes"
              value={data.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder={notesRequired ? "Add the required details..." : "Optional notes..."}
              rows={4}
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

"use client";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormSection,
  FormTextarea,
} from "@/components/timelines/forms/shared";

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
  {
    value: "Shower",
    label: "Shower",
    description: "Full shower completed",
  },
  {
    value: "Bath",
    label: "Bath",
    description: "Full bath completed",
  },
  {
    value: "Strip wash",
    label: "Strip wash",
    description: "Personal wash without a bath or shower",
  },
  {
    value: "Face / hands",
    label: "Face / hands",
    description: "Face and hand hygiene completed",
  },
  {
    value: "Oral care",
    label: "Oral care",
    description: "Teeth, dentures or mouth care completed",
  },
  {
    value: "Hair wash",
    label: "Hair wash",
    description: "Hair washing and drying completed",
  },
  {
    value: "Shave",
    label: "Shave",
    description: "Facial or body shaving completed",
  },
  {
    value: "Clothing changed",
    label: "Clothing changed",
    description: "Clean clothing or nightwear provided",
  },
  {
    value: "No personal care completed",
    label: "No personal care completed",
    description: "No personal care activity was completed",
  },
];

const assistanceLevelOptions = [
  {
    value: "Independent",
    label: "Independent",
    description: "Completed without staff assistance",
  },
  {
    value: "Prompted",
    label: "Prompted",
    description: "Verbal reminders or encouragement provided",
  },
  {
    value: "Assisted",
    label: "Assisted",
    description: "Some practical support was provided",
  },
  {
    value: "Fully supported",
    label: "Fully supported",
    description: "Staff completed most or all of the task",
  },
  {
    value: "Refused",
    label: "Refused",
    description: "Personal care was offered but declined",
  },
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

  const notesRequired =
    data.assistanceLevel === "Refused" ||
    data.careType === "No personal care completed";

  function update(
    changes: Partial<PersonalCareData>,
  ) {
    setPersonalCareData({
      ...data,
      ...changes,
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-teal-100 bg-gradient-to-br from-white via-cyan-50/60 to-teal-50/80 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
          Care
        </p>

        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Personal Care
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Record the care completed, the level of support provided
          and any relevant observations.
        </p>
      </div>

      <FormSection
        title="Care completed"
        description="Choose the personal care activity that was completed."
      >
        <FormChoiceGroup
          label="Care type"
          value={data.careType}
          options={careTypeOptions}
          onChange={(value) =>
            update({
              careType: value,
              assistanceLevel:
                value === "No personal care completed"
                  ? ""
                  : data.assistanceLevel,
            })
          }
          columns={2}
          required
        />
      </FormSection>

      {data.careType &&
        data.careType !== "No personal care completed" && (
          <FormSection
            title="Support provided"
            description="Choose the level of assistance provided by staff."
          >
            <FormChoiceGroup
              label="Assistance level"
              value={data.assistanceLevel}
              options={assistanceLevelOptions}
              onChange={(value) =>
                update({
                  assistanceLevel: value,
                })
              }
              columns={2}
              required
            />

            {data.assistanceLevel === "Refused" && (
              <FormAlert
                variant="warning"
                title="Refusal recorded"
              >
                Add a brief note explaining that care was offered,
                any reason given, and any action taken.
              </FormAlert>
            )}
          </FormSection>
        )}

      {data.careType && (
        <FormSection
          title="Additional information"
          description={
            notesRequired
              ? "Add the relevant details before saving."
              : "Record any useful observations or preferences."
          }
        >
          <FormField
            label="Additional notes"
            htmlFor="personal-care-notes"
            required={notesRequired}
            description={
              data.assistanceLevel === "Refused"
                ? "Include care offered, reason for refusal if known, and any follow-up."
                : data.careType === "No personal care completed"
                  ? "Record why no personal care was completed."
                  : "For example: preferences followed, skin observations, distress, reassurance or other relevant details."
            }
          >
            <FormTextarea
              id="personal-care-notes"
              value={data.notes}
              onChange={(event) =>
                update({
                  notes: event.target.value,
                })
              }
              placeholder={
                notesRequired
                  ? "Add the required details..."
                  : "Optional additional information..."
              }
              rows={5}
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}
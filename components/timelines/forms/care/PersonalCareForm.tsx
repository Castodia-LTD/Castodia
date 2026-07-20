"use client";

import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Bath, CheckCircle2, HandHeart, NotebookPen } from "lucide-react";

import {
  FormLabel,
  FormOptionCard,
  FormSection,
  FormTextarea,
} from "@/components/timelines/forms/shared";

export type PersonalCareData = {
  careType: string;
  assistanceLevel: string;
  notes: string;
};

type Props = {
  /*
   * Preferred newer Castodia pattern
   */
  personalCareData?: PersonalCareData;
  setPersonalCareData?: Dispatch<SetStateAction<PersonalCareData>>;

  /*
   * Alternative object-based patterns
   */
  data?: PersonalCareData;
  setData?: Dispatch<SetStateAction<PersonalCareData>>;

  value?: PersonalCareData;
  onChange?: (value: PersonalCareData) => void;

  /*
   * Legacy pattern
   */
  careType?: string;
  setCareType?: (value: string) => void;

  assistanceLevel?: string;
  setAssistanceLevel?: (value: string) => void;

  personalCareNotes?: string;
  setPersonalCareNotes?: (value: string) => void;
};

const emptyData: PersonalCareData = {
  careType: "",
  assistanceLevel: "",
  notes: "",
};

const careTypeOptions = [
  {
    value: "Shower",
    description: "Full shower completed",
  },
  {
    value: "Bath",
    description: "Full bath completed",
  },
  {
    value: "Strip wash",
    description: "Personal wash without a bath or shower",
  },
  {
    value: "Face / hands",
    description: "Face and hand hygiene completed",
  },
  {
    value: "Oral care",
    description: "Teeth, dentures or mouth care completed",
  },
  {
    value: "Hair wash",
    description: "Hair washing and drying completed",
  },
  {
    value: "Shave",
    description: "Facial or body shaving completed",
  },
  {
    value: "Clothing changed",
    description: "Clean clothing or nightwear provided",
  },
  {
    value: "No personal care completed",
    description: "No personal care activity was completed",
  },
];

const assistanceLevelOptions = [
  {
    value: "Independent",
    description: "Completed without staff assistance",
  },
  {
    value: "Prompted",
    description: "Verbal reminders or encouragement provided",
  },
  {
    value: "Assisted",
    description: "Some practical support was provided",
  },
  {
    value: "Fully supported",
    description: "Staff completed most or all of the task",
  },
  {
    value: "Refused",
    description: "Personal care was offered but declined",
  },
];

export default function PersonalCareForm(props: Props) {
  const externallyControlledData =
    props.personalCareData ?? props.data ?? props.value;

  const legacyData = useMemo<PersonalCareData>(
    () => ({
      careType: props.careType ?? "",
      assistanceLevel: props.assistanceLevel ?? "",
      notes: props.personalCareNotes ?? "",
    }),
    [
      props.careType,
      props.assistanceLevel,
      props.personalCareNotes,
    ]
  );

  const [localData, setLocalData] =
    useState<PersonalCareData>(emptyData);

  const currentData =
    externallyControlledData ??
    (props.careType !== undefined ||
    props.assistanceLevel !== undefined ||
    props.personalCareNotes !== undefined
      ? legacyData
      : localData);

  const updateData = <K extends keyof PersonalCareData>(
    field: K,
    newValue: PersonalCareData[K]
  ) => {
    const nextData: PersonalCareData = {
      ...currentData,
      [field]: newValue,
    };

    /*
     * Preferred object-state setter
     */
    props.setPersonalCareData?.((previous) => ({
      ...previous,
      [field]: newValue,
    }));

    /*
     * Other supported object-state patterns
     */
    props.setData?.((previous) => ({
      ...previous,
      [field]: newValue,
    }));

    props.onChange?.(nextData);

    /*
     * Legacy individual setters
     */
    if (field === "careType") {
      props.setCareType?.(newValue);
    }

    if (field === "assistanceLevel") {
      props.setAssistanceLevel?.(newValue);
    }

    if (field === "notes") {
      props.setPersonalCareNotes?.(newValue);
    }

    /*
     * Prevents an uncontrolled rendering crash while developing.
     * Saving still requires one of the parent callbacks above.
     */
    if (
      !props.setPersonalCareData &&
      !props.setData &&
      !props.onChange &&
      !props.setCareType &&
      !props.setAssistanceLevel &&
      !props.setPersonalCareNotes
    ) {
      setLocalData(nextData);
    }
  };

  const completedSections = [
    Boolean(currentData.careType),
    Boolean(currentData.assistanceLevel),
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 px-5 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
              <Bath className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900">
                Personal Care
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Record the care completed, the level of support
                provided and any relevant observations.
              </p>
            </div>

            <div className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
              {completedSections} of 2 required sections completed
            </div>
          </div>
        </div>
      </div>

      <FormSection
        title="Care completed"
        description="Choose the personal care activity that was completed."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <HandHeart className="h-4 w-4 text-cyan-700" />

            <FormLabel required>Care type</FormLabel>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {careTypeOptions.map((option) => (
              <FormOptionCard
                key={option.value}
                type="button"
                title={option.value}
                description={option.description}
                selected={currentData.careType === option.value}
                onClick={() =>
                  updateData("careType", option.value)
                }
              />
            ))}
          </div>

          {currentData.careType && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Selected: {currentData.careType}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection
        title="Support provided"
        description="Choose the level of assistance provided by staff."
      >
        <div className="space-y-3">
          <FormLabel required>Assistance level</FormLabel>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {assistanceLevelOptions.map((option) => (
              <FormOptionCard
                key={option.value}
                type="button"
                title={option.value}
                description={option.description}
                selected={
                  currentData.assistanceLevel === option.value
                }
                onClick={() =>
                  updateData("assistanceLevel", option.value)
                }
              />
            ))}
          </div>

          {currentData.assistanceLevel && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Selected: {currentData.assistanceLevel}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection
        title="Additional information"
        description="Record preferences, observations, refusals or other relevant details."
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-cyan-700" />

            <FormLabel htmlFor="personal-care-notes">
              Additional notes
            </FormLabel>
          </div>

          <FormTextarea
            id="personal-care-notes"
            value={currentData.notes}
            onChange={(event) =>
              updateData("notes", event.target.value)
            }
            placeholder="For example: support offered, preferences followed, skin observations, distress, refusal or actions taken..."
            rows={5}
          />

          {currentData.assistanceLevel === "Refused" && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Notes are required when personal care has been
              refused.
            </p>
          )}
        </div>
      </FormSection>
    </div>
  );
}
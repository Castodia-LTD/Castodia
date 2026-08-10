"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormMultiSelect,
  FormOptionCard,
  FormSection,
  FormTextarea,
  FormYesNo,
} from "@/components/timelines/forms/shared";

export type ContinenceCareData = {
  careTypes: string[];
  assistanceLevel: string;

  continenceProductStatus: string;
  continenceProductChanged: boolean | null;

  urinePassed: boolean | null;
  urinaryObservations: string[];
  urinaryNotes: string;

  bowelOpened: boolean | null;
  bristolType: string;
  bowelAmount: string;
  bowelObservations: string[];
  bowelNotes: string;

  catheterCareProvided: boolean | null;
  catheterOutputMl: number | null;
  catheterObservations: string[];

  stomaCareProvided: boolean | null;
  stomaObservations: string[];

  bowelIntervention: string;
  linkedMedicationAdministrationId: string;
  interventionOutcome: string;

  skinCondition: string;
  skinNotes: string;

  concerns: string[];
  escalation: string[];
  notes: string;
};

type Props = {
  continenceCareData?: ContinenceCareData;
  setContinenceCareData?: (data: ContinenceCareData) => void;
  onChange?: (data: ContinenceCareData) => void;
};

export const initialContinenceCareData: ContinenceCareData = {
  careTypes: [],
  assistanceLevel: "",

  continenceProductStatus: "",
  continenceProductChanged: null,

  urinePassed: null,
  urinaryObservations: [],
  urinaryNotes: "",

  bowelOpened: null,
  bristolType: "",
  bowelAmount: "",
  bowelObservations: [],
  bowelNotes: "",

  catheterCareProvided: null,
  catheterOutputMl: null,
  catheterObservations: [],

  stomaCareProvided: null,
  stomaObservations: [],

  bowelIntervention: "",
  linkedMedicationAdministrationId: "",
  interventionOutcome: "",

  skinCondition: "",
  skinNotes: "",

  concerns: [],
  escalation: [],
  notes: "",
};

const careTypeOptions = [
  {
    value: "Toilet support",
    label: "Toilet support",
    description: "Support using the toilet.",
  },
  {
    value: "Commode",
    label: "Commode",
    description: "Support using a commode.",
  },
  {
    value: "Bedpan / urinal",
    label: "Bedpan / urinal",
    description: "Bedside elimination support.",
  },
  {
    value: "Continence product",
    label: "Continence product",
    description: "Check or change pad/product.",
  },
  {
    value: "Catheter care",
    label: "Catheter care",
    description: "Catheter observation or care.",
  },
  {
    value: "Stoma care",
    label: "Stoma care",
    description: "Stoma observation or care.",
  },
  {
    value: "Bowel care",
    label: "Bowel care",
    description: "Bowel support or intervention.",
  },
];

const assistanceOptions = [
  { value: "Independent", label: "Independent" },
  { value: "Prompted", label: "Prompted" },
  { value: "Supervised", label: "Supervised" },
  { value: "Partial assistance", label: "Partial assistance" },
  { value: "Full assistance", label: "Full assistance" },
];

const productStatusOptions = [
  { value: "Dry", label: "Dry" },
  { value: "Wet", label: "Wet" },
  { value: "Soiled", label: "Soiled" },
  { value: "Wet and soiled", label: "Wet & soiled" },
];

const urinaryObservationOptions = [
  { value: "No concerns", label: "No concerns" },
  { value: "Strong odour", label: "Strong odour" },
  { value: "Dark urine", label: "Dark urine" },
  { value: "Cloudy urine", label: "Cloudy urine" },
  { value: "Blood observed", label: "Blood observed" },
  { value: "Pain / discomfort", label: "Pain / discomfort" },
  { value: "Reduced output", label: "Reduced output" },
  { value: "Other", label: "Other" },
];

const bristolOptions = [
  { value: "1", label: "Type 1", description: "Separate hard lumps" },
  { value: "2", label: "Type 2", description: "Lumpy sausage-shaped" },
  { value: "3", label: "Type 3", description: "Sausage with cracks" },
  { value: "4", label: "Type 4", description: "Smooth and soft" },
  { value: "5", label: "Type 5", description: "Soft blobs" },
  { value: "6", label: "Type 6", description: "Mushy / fluffy pieces" },
  { value: "7", label: "Type 7", description: "Watery" },
];

const bowelAmountOptions = [
  { value: "Small", label: "Small" },
  { value: "Moderate", label: "Moderate" },
  { value: "Large", label: "Large" },
];

const bowelObservationOptions = [
  { value: "No concerns", label: "No concerns" },
  { value: "Constipation concern", label: "Constipation concern" },
  { value: "Diarrhoea", label: "Diarrhoea" },
  { value: "Blood observed", label: "Blood observed" },
  { value: "Mucus observed", label: "Mucus observed" },
  { value: "Pain / discomfort", label: "Pain / discomfort" },
  { value: "Straining", label: "Straining" },
  { value: "Other", label: "Other" },
];

const catheterObservationOptions = [
  { value: "Draining normally", label: "Draining normally" },
  { value: "Bag emptied", label: "Bag emptied" },
  { value: "Tubing checked", label: "Tubing checked" },
  { value: "Leakage", label: "Leakage" },
  { value: "Bypassing", label: "Bypassing" },
  { value: "Blood observed", label: "Blood observed" },
  { value: "Reduced / no drainage", label: "Reduced / no drainage" },
  { value: "Pain / discomfort", label: "Pain / discomfort" },
];

const stomaObservationOptions = [
  { value: "No concerns", label: "No concerns" },
  { value: "Appliance changed", label: "Appliance changed" },
  { value: "Output observed", label: "Output observed" },
  { value: "Leakage", label: "Leakage" },
  { value: "Skin irritation", label: "Skin irritation" },
  { value: "Bleeding", label: "Bleeding" },
  { value: "Other", label: "Other" },
];

const bowelInterventionOptions = [
  { value: "None", label: "No intervention" },
  { value: "Suppository", label: "Suppository" },
  { value: "Enema", label: "Enema" },
  { value: "Other prescribed intervention", label: "Other prescribed intervention" },
];

const interventionOutcomeOptions = [
  { value: "Pending", label: "Outcome pending" },
  { value: "Effective", label: "Effective" },
  { value: "Partially effective", label: "Partially effective" },
  { value: "Not effective", label: "Not effective" },
  { value: "Declined", label: "Declined" },
];

const skinOptions = [
  { value: "Intact", label: "Intact" },
  { value: "Redness", label: "Redness" },
  { value: "Sore", label: "Sore" },
  { value: "Broken skin", label: "Broken skin" },
  { value: "Other concern", label: "Other concern" },
];

const concernOptions = [
  { value: "Pain / discomfort", label: "Pain / discomfort" },
  { value: "Constipation", label: "Constipation" },
  { value: "Diarrhoea", label: "Diarrhoea" },
  { value: "Possible UTI", label: "Possible UTI" },
  { value: "Blood observed", label: "Blood observed" },
  { value: "Skin integrity", label: "Skin integrity" },
  { value: "Change from usual pattern", label: "Change from usual pattern" },
  { value: "Other", label: "Other" },
];

const escalationOptions = [
  { value: "Manager informed", label: "Manager informed" },
  { value: "Senior / nurse informed", label: "Senior / nurse informed" },
  { value: "GP / clinician contacted", label: "GP / clinician contacted" },
  { value: "Family / representative informed", label: "Family / representative informed" },
  { value: "Monitoring increased", label: "Monitoring increased" },
];

export default function ContinenceCareForm({
  continenceCareData,
  setContinenceCareData,
  onChange,
}: Props) {
  const [localData, setLocalData] = useState<ContinenceCareData>(
    continenceCareData ?? initialContinenceCareData,
  );

  const data = continenceCareData ?? localData;

  const hasProductCare = data.careTypes.includes("Continence product");
  const hasUrinaryCare =
    data.careTypes.includes("Toilet support") ||
    data.careTypes.includes("Commode") ||
    data.careTypes.includes("Bedpan / urinal");
  const hasBowelCare = data.careTypes.includes("Bowel care");
  const hasCatheterCare = data.careTypes.includes("Catheter care");
  const hasStomaCare = data.careTypes.includes("Stoma care");

  const medicationIntervention =
    data.bowelIntervention === "Suppository" ||
    data.bowelIntervention === "Enema" ||
    data.bowelIntervention === "Other prescribed intervention";

  const skinConcern = data.skinCondition !== "" && data.skinCondition !== "Intact";

  const clinicalConcern = useMemo(
    () =>
      data.concerns.length > 0 ||
      data.urinaryObservations.some((item) => item !== "No concerns") ||
      data.bowelObservations.some((item) => item !== "No concerns") ||
      skinConcern,
    [
      data.concerns,
      data.urinaryObservations,
      data.bowelObservations,
      skinConcern,
    ],
  );

  function update(changes: Partial<ContinenceCareData>) {
    const next = { ...data, ...changes };

    setLocalData(next);
    setContinenceCareData?.(next);
    onChange?.(next);
  }

  function updateCareTypes(next: string[]) {
    update({
      careTypes: next,

      continenceProductStatus: next.includes("Continence product")
        ? data.continenceProductStatus
        : "",
      continenceProductChanged: next.includes("Continence product")
        ? data.continenceProductChanged
        : null,

      catheterCareProvided: next.includes("Catheter care")
        ? data.catheterCareProvided
        : null,
      catheterOutputMl: next.includes("Catheter care")
        ? data.catheterOutputMl
        : null,
      catheterObservations: next.includes("Catheter care")
        ? data.catheterObservations
        : [],

      stomaCareProvided: next.includes("Stoma care")
        ? data.stomaCareProvided
        : null,
      stomaObservations: next.includes("Stoma care")
        ? data.stomaObservations
        : [],

      bowelOpened: next.includes("Bowel care")
        ? data.bowelOpened
        : null,
      bristolType: next.includes("Bowel care") ? data.bristolType : "",
      bowelAmount: next.includes("Bowel care") ? data.bowelAmount : "",
      bowelObservations: next.includes("Bowel care")
        ? data.bowelObservations
        : [],
      bowelNotes: next.includes("Bowel care") ? data.bowelNotes : "",
      bowelIntervention: next.includes("Bowel care")
        ? data.bowelIntervention
        : "",
      linkedMedicationAdministrationId: next.includes("Bowel care")
        ? data.linkedMedicationAdministrationId
        : "",
      interventionOutcome: next.includes("Bowel care")
        ? data.interventionOutcome
        : "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-teal-100 bg-gradient-to-br from-white via-cyan-50/60 to-teal-50/80 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
          Personal care
        </p>

        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Continence Care
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Record continence support, elimination, products, skin observations
          and any relevant bowel or urinary care.
        </p>
      </div>

      <FormSection
        title="Care provided"
        description="Select everything provided during this episode of care."
      >
        <FormMultiSelect
          label="What support was provided?"
          value={data.careTypes}
          options={careTypeOptions}
          onChange={updateCareTypes}
          columns={2}
          required
        />

        {data.careTypes.length > 0 && (
          <FormChoiceGroup
            label="Level of assistance"
            value={data.assistanceLevel}
            options={assistanceOptions}
            onChange={(value) => update({ assistanceLevel: value })}
            columns={3}
          />
        )}
      </FormSection>

      {hasProductCare && (
        <FormSection
          title="Continence product"
          description="Record the condition of the product when checked."
        >
          <FormChoiceGroup
            label="Product status"
            value={data.continenceProductStatus}
            options={productStatusOptions}
            onChange={(value) =>
              update({
                continenceProductStatus: value,
                continenceProductChanged:
                  value === "Dry" ? false : data.continenceProductChanged,
              })
            }
            columns={4}
          />

          {data.continenceProductStatus &&
            data.continenceProductStatus !== "Dry" && (
              <FormYesNo
                label="Was the continence product changed?"
                value={data.continenceProductChanged}
                onChange={(value) =>
                  update({ continenceProductChanged: value })
                }
              />
            )}
        </FormSection>
      )}

      {hasUrinaryCare && (
        <FormSection
          title="Urinary care"
          description="Record urinary output and observations where relevant."
        >
          <FormYesNo
            label="Was urine passed?"
            value={data.urinePassed}
            onChange={(value) =>
              update({
                urinePassed: value,
                urinaryObservations: value ? data.urinaryObservations : [],
                urinaryNotes: value ? data.urinaryNotes : "",
              })
            }
          />

          {data.urinePassed === true && (
            <>
              <FormMultiSelect
                label="Urinary observations"
                value={data.urinaryObservations}
                options={urinaryObservationOptions}
                onChange={(value) => update({ urinaryObservations: value })}
                columns={2}
              />

              {data.urinaryObservations.some(
                (item) => item !== "No concerns",
              ) && (
                <FormField label="Urinary observation details">
                  <FormTextarea
                    rows={3}
                    value={data.urinaryNotes}
                    onChange={(event) =>
                      update({ urinaryNotes: event.target.value })
                    }
                    placeholder="Add relevant urinary observations..."
                  />
                </FormField>
              )}
            </>
          )}
        </FormSection>
      )}

      {hasBowelCare && (
        <FormSection
          title="Bowel care"
          description="Record bowel activity and any intervention provided."
        >
          <FormYesNo
            label="Were the bowels opened?"
            value={data.bowelOpened}
            onChange={(value) =>
              update({
                bowelOpened: value,
                bristolType: value ? data.bristolType : "",
                bowelAmount: value ? data.bowelAmount : "",
                bowelObservations: value ? data.bowelObservations : [],
                bowelNotes: value ? data.bowelNotes : "",
              })
            }
          />

          {data.bowelOpened === true && (
            <>
              <FormChoiceGroup
                label="Bristol stool type"
                description="Select the closest observed stool type."
                value={data.bristolType}
                options={bristolOptions}
                onChange={(value) => update({ bristolType: value })}
                columns={4}
              />

              <FormChoiceGroup
                label="Approximate amount"
                value={data.bowelAmount}
                options={bowelAmountOptions}
                onChange={(value) => update({ bowelAmount: value })}
                columns={3}
              />

              <FormMultiSelect
                label="Bowel observations"
                value={data.bowelObservations}
                options={bowelObservationOptions}
                onChange={(value) => update({ bowelObservations: value })}
                columns={2}
              />

              {data.bowelObservations.some(
                (item) => item !== "No concerns",
              ) && (
                <FormField label="Bowel observation details">
                  <FormTextarea
                    rows={3}
                    value={data.bowelNotes}
                    onChange={(event) =>
                      update({ bowelNotes: event.target.value })
                    }
                    placeholder="Add relevant bowel observations..."
                  />
                </FormField>
              )}
            </>
          )}

          <FormChoiceGroup
            label="Bowel intervention"
            description="Only record prescribed interventions that form part of the person's current care plan."
            value={data.bowelIntervention}
            options={bowelInterventionOptions}
            onChange={(value) =>
              update({
                bowelIntervention: value,
                linkedMedicationAdministrationId:
                  value === "None"
                    ? ""
                    : data.linkedMedicationAdministrationId,
                interventionOutcome:
                  value === "None" ? "" : data.interventionOutcome,
              })
            }
            columns={2}
          />

          {medicationIntervention && (
            <>
              <FormAlert
                variant="warning"
                title="Medication administration record required"
              >
                A prescribed suppository, enema or other medicinal bowel
                intervention must also be recorded through the medication
                administration workflow. This continence record documents the
                care and outcome; it does not replace the MAR.
              </FormAlert>

              <FormField
                label="Linked medication administration"
                description="Optional reference to the related medication administration record."
                htmlFor="linked-medication-administration"
              >
                <FormInput
                  id="linked-medication-administration"
                  value={data.linkedMedicationAdministrationId}
                  onChange={(event) =>
                    update({
                      linkedMedicationAdministrationId: event.target.value,
                    })
                  }
                  placeholder="Medication administration reference"
                />
              </FormField>

              <FormChoiceGroup
                label="Intervention outcome"
                value={data.interventionOutcome}
                options={interventionOutcomeOptions}
                onChange={(value) => update({ interventionOutcome: value })}
                columns={3}
              />
            </>
          )}
        </FormSection>
      )}

      {hasCatheterCare && (
        <FormSection
          title="Catheter care"
          description="Record catheter care and observations."
        >
          <FormYesNo
            label="Was catheter care provided?"
            value={data.catheterCareProvided}
            onChange={(value) =>
              update({
                catheterCareProvided: value,
                catheterOutputMl: value ? data.catheterOutputMl : null,
                catheterObservations: value
                  ? data.catheterObservations
                  : [],
              })
            }
          />

          {data.catheterCareProvided === true && (
            <>
              <FormField
                label="Output"
                description="Enter the measured amount if recorded."
                htmlFor="catheter-output"
              >
                <div className="flex items-center gap-3">
                  <FormInput
                    id="catheter-output"
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={data.catheterOutputMl ?? ""}
                    onChange={(event) =>
                      update({
                        catheterOutputMl: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                    placeholder="For example, 350"
                  />
                  <span className="shrink-0 text-sm font-semibold text-teal-700">
                    ml
                  </span>
                </div>
              </FormField>

              <FormMultiSelect
                label="Catheter observations"
                value={data.catheterObservations}
                options={catheterObservationOptions}
                onChange={(value) =>
                  update({ catheterObservations: value })
                }
                columns={2}
              />
            </>
          )}
        </FormSection>
      )}

      {hasStomaCare && (
        <FormSection
          title="Stoma care"
          description="Record stoma care and relevant observations."
        >
          <FormYesNo
            label="Was stoma care provided?"
            value={data.stomaCareProvided}
            onChange={(value) =>
              update({
                stomaCareProvided: value,
                stomaObservations: value ? data.stomaObservations : [],
              })
            }
          />

          {data.stomaCareProvided === true && (
            <FormMultiSelect
              label="Stoma observations"
              value={data.stomaObservations}
              options={stomaObservationOptions}
              onChange={(value) => update({ stomaObservations: value })}
              columns={2}
            />
          )}
        </FormSection>
      )}

      {data.careTypes.length > 0 && (
        <FormSection
          title="Skin integrity"
          description="Record the condition of skin exposed during continence care."
        >
          <FormChoiceGroup
            label="Skin condition"
            value={data.skinCondition}
            options={skinOptions}
            onChange={(value) =>
              update({
                skinCondition: value,
                skinNotes: value === "Intact" ? "" : data.skinNotes,
              })
            }
            columns={3}
          />

          {skinConcern && (
            <FormField
              label="Skin observation"
              required
              htmlFor="continence-skin-notes"
            >
              <FormTextarea
                id="continence-skin-notes"
                rows={3}
                value={data.skinNotes}
                onChange={(event) =>
                  update({ skinNotes: event.target.value })
                }
                placeholder="Describe the location and appearance..."
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.careTypes.length > 0 && (
        <FormSection
          title="Concerns & outcome"
          description="Record anything requiring monitoring or escalation."
        >
          <FormMultiSelect
            label="Concerns identified"
            value={data.concerns}
            options={concernOptions}
            onChange={(value) => update({ concerns: value })}
            columns={2}
          />

          {clinicalConcern && (
            <>
              <FormAlert
                variant="warning"
                title="Concern identified"
              >
                Record any action or escalation completed in line with the
                person's care plan and local procedure.
              </FormAlert>

              <FormMultiSelect
                label="Action / escalation"
                value={data.escalation}
                options={escalationOptions}
                onChange={(value) => update({ escalation: value })}
                columns={2}
              />
            </>
          )}

          <FormField
            label="Additional notes"
            htmlFor="continence-care-notes"
          >
            <FormTextarea
              id="continence-care-notes"
              rows={4}
              value={data.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder="Add any other relevant information..."
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}
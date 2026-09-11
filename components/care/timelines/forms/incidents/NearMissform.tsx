"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormTextarea,
  FormYesNo,
} from "@/components/care/timelines/forms/shared";

type Props = {
  onChange: (data: NearMissData) => void;
};

export type NearMissData = {
  nearMissType: string;
  otherNearMissType: string;
  location: string;
  description: string;
  potentialHarm: string;
  immediateActions: string[];
  otherImmediateAction: string;
  involvedAnotherPerson: boolean;
  otherPersonDetails: string;
  reportedTo: string[];
  otherReportedTo: string;
  followUpActions: string[];
  notes: string;
};

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

const nearMissTypeOptions = toOptions([
  "Medication",
  "Fall",
  "Moving and Handling",
  "Environmental Hazard",
  "Equipment",
  "Food / Choking",
  "Community Safety",
  "Behaviour",
  "Security",
  "Other",
]);

const potentialHarmOptions = toOptions([
  "Low",
  "Moderate",
  "High",
  "Potentially Serious",
]);

const immediateActionOptions = toOptions([
  "Hazard Removed",
  "Equipment Removed from Use",
  "Medication Secured",
  "Person Reassured",
  "Manager Informed",
  "Maintenance Informed",
  "Risk Reduced",
  "No Further Action Required",
  "Other",
]);

const reportedToOptions = toOptions([
  "Manager",
  "On-call Manager",
  "Maintenance",
  "Health Professional",
  "Family / Representative",
  "Other",
]);

const followUpOptions = toOptions([
  "Risk Assessment Review",
  "Care Plan Review",
  "Equipment Review",
  "Medication Review",
  "Staff Discussion",
  "Manager Review",
  "Incident Review",
  "Safeguarding Considered",
]);

const initialData: NearMissData = {
  nearMissType: "",
  otherNearMissType: "",
  location: "",
  description: "",
  potentialHarm: "",
  immediateActions: [],
  otherImmediateAction: "",
  involvedAnotherPerson: false,
  otherPersonDetails: "",
  reportedTo: [],
  otherReportedTo: "",
  followUpActions: [],
  notes: "",
};

export default function NearMissForm({ onChange }: Props) {
  const [data, setData] = useState<NearMissData>(initialData);

  const notesRecommended = useMemo(
    () =>
      data.potentialHarm === "High" ||
      data.potentialHarm === "Potentially Serious" ||
      data.followUpActions.includes("Safeguarding Considered"),
    [data.potentialHarm, data.followUpActions],
  );

  function update(changes: Partial<NearMissData>) {
    const next = { ...data, ...changes };
    setData(next);
    onChange(next);
  }

  function updateImmediateActions(next: string[]) {
    let normalized = next;
    if (next.includes("No Further Action Required") && next.length > 1) {
      const selectedNoneNow =
        !data.immediateActions.includes("No Further Action Required") &&
        next.includes("No Further Action Required");
      normalized = selectedNoneNow
        ? ["No Further Action Required"]
        : next.filter((item) => item !== "No Further Action Required");
    }

    update({
      immediateActions: normalized,
      otherImmediateAction: normalized.includes("Other") ? data.otherImmediateAction : "",
    });
  }

  const typeComplete =
    data.nearMissType &&
    (data.nearMissType !== "Other" || data.otherNearMissType.trim());

  const actionComplete =
    data.immediateActions.length > 0 &&
    (!data.immediateActions.includes("Other") || data.otherImmediateAction.trim());

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Near Miss</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record what almost happened, the potential harm and what was done to prevent recurrence.
        </p>
      </div>

      <FormSection title="What almost happened?">
        <FormChoiceGroup
          label="Near miss type"
          value={data.nearMissType}
          options={nearMissTypeOptions}
          onChange={(value) =>
            update({
              nearMissType: value,
              otherNearMissType: value === "Other" ? data.otherNearMissType : "",
            })
          }
          required
          columns={2}
        />

        {data.nearMissType === "Other" && (
          <FormField label="Describe the near miss type" required>
            <FormInput
              value={data.otherNearMissType}
              onChange={(event) => update({ otherNearMissType: event.target.value })}
              placeholder="Describe the type of near miss"
            />
          </FormField>
        )}

        {typeComplete && (
          <FormField label="Location" required>
            <FormInput
              value={data.location}
              onChange={(event) => update({ location: event.target.value })}
              placeholder="Where did this happen?"
            />
          </FormField>
        )}

        {data.location.trim() && (
          <FormField
            label="What happened?"
            description="Record the factual sequence and how harm was avoided."
            required
          >
            <FormTextarea
              value={data.description}
              onChange={(event) => update({ description: event.target.value })}
              placeholder="Describe what almost happened..."
              rows={5}
            />
          </FormField>
        )}
      </FormSection>

      {data.description.trim() && (
        <FormSection title="Potential harm">
          <FormChoiceGroup
            label="Potential severity if harm had occurred"
            value={data.potentialHarm}
            options={potentialHarmOptions}
            onChange={(value) => update({ potentialHarm: value })}
            required
            columns={2}
          />
        </FormSection>
      )}

      {data.potentialHarm && (
        <FormSection title="Immediate response">
          <FormMultiSelect
            label="Immediate actions"
            value={data.immediateActions}
            options={immediateActionOptions}
            onChange={updateImmediateActions}
            required
            columns={2}
          />

          {data.immediateActions.includes("Other") && (
            <FormField label="Describe the other immediate action" required>
              <FormTextarea
                value={data.otherImmediateAction}
                onChange={(event) => update({ otherImmediateAction: event.target.value })}
                rows={3}
              />
            </FormField>
          )}
        </FormSection>
      )}

      {actionComplete && (
        <FormSection title="Reporting">
          <FormMultiSelect
            label="Who was informed?"
            value={data.reportedTo}
            options={reportedToOptions}
            onChange={(next) =>
              update({
                reportedTo: next,
                otherReportedTo: next.includes("Other") ? data.otherReportedTo : "",
              })
            }
            required
            columns={2}
          />

          {data.reportedTo.includes("Other") && (
            <FormField label="Other person or service informed" required>
              <FormInput
                value={data.otherReportedTo}
                onChange={(event) => update({ otherReportedTo: event.target.value })}
                placeholder="Who else was informed?"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.reportedTo.length > 0 &&
        (!data.reportedTo.includes("Other") || data.otherReportedTo.trim()) && (
          <FormSection
            title="People and follow-up"
            description="Add these only when they are relevant to the event."
            collapsible
            defaultOpen={false}
            summary={
              data.involvedAnotherPerson || data.followUpActions.length
                ? "Additional follow-up recorded"
                : "Optional"
            }
          >
            <FormYesNo
              label="Was another person involved?"
              value={data.involvedAnotherPerson}
              onChange={(value) =>
                update({
                  involvedAnotherPerson: value,
                  otherPersonDetails: value ? data.otherPersonDetails : "",
                })
              }
            />

            {data.involvedAnotherPerson && (
              <FormField label="Other person involved" required>
                <FormInput
                  value={data.otherPersonDetails}
                  onChange={(event) => update({ otherPersonDetails: event.target.value })}
                  placeholder="Name and relationship or role"
                />
              </FormField>
            )}

            <FormMultiSelect
              label="Follow-up actions"
              value={data.followUpActions}
              options={followUpOptions}
              onChange={(next) => update({ followUpActions: next })}
              columns={2}
            />
          </FormSection>
        )}

      {data.reportedTo.length > 0 &&
        (!data.reportedTo.includes("Other") || data.otherReportedTo.trim()) &&
        (notesRecommended ? (
          <FormSection title="Additional detail">
            <FormAlert variant="warning" title="Additional detail recommended">
              Add relevant information for a high-potential-harm event or safeguarding consideration.
            </FormAlert>
            <FormField label="Notes">
              <FormTextarea
                value={data.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Add relevant detail..."
                rows={4}
              />
            </FormField>
          </FormSection>
        ) : (
          <FormSection
            title="Additional notes"
            description="Only add information that is not already captured above."
            collapsible
            defaultOpen={false}
            summary={data.notes.trim() ? "Notes added" : "Optional"}
          >
            <FormField label="Notes">
              <FormTextarea
                value={data.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Optional additional information..."
                rows={4}
              />
            </FormField>
          </FormSection>
        ))}
    </div>
  );
}

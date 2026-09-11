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
  onChange: (data: MedicationErrorData) => void;
};

export type MedicationErrorData = {
  errorType: string;
  otherErrorType: string;
  medicationName: string;
  prescribedDose: string;
  doseAffected: string;
  scheduledTime: string;
  medicationAdministered: boolean | null;
  administrationDetails: string;
  description: string;
  healthImpact: string;
  impactDetails: string;
  immediateActions: string[];
  otherImmediateAction: string;
  peopleInformed: string[];
  otherPersonInformed: string;
  clinicalAdviceSought: boolean | null;
  clinicalAdviceSource: string;
  adviceReceived: string;
  monitoringRequired: boolean | null;
  monitoringInstructions: string;
  outcome: string;
  otherOutcome: string;
  followUpActions: string[];
  notes: string;
};

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

const errorTypeOptions = toOptions([
  "Missed Dose",
  "Late Administration",
  "Wrong Medication",
  "Wrong Dose",
  "Wrong Person",
  "Wrong Time",
  "Duplicate Dose",
  "Medication Unavailable",
  "Administration Record Error",
  "Storage Issue",
  "Refusal Recorded Incorrectly",
  "Other",
]);

const healthImpactOptions = toOptions([
  "No Apparent Harm",
  "Minor Concern",
  "Moderate Concern",
  "Serious Concern",
  "Unknown",
]);

const immediateActionOptions = toOptions([
  "Medication Withheld",
  "Medication Administered",
  "MAR Corrected",
  "Medication Secured",
  "Observations Commenced",
  "GP Contacted",
  "Pharmacist Contacted",
  "NHS 111 Contacted",
  "999 Contacted",
  "Hospital Assessment",
  "Manager Informed",
  "No Immediate Action Required",
  "Other",
]);

const peopleInformedOptions = toOptions([
  "Manager",
  "On-call Manager",
  "GP",
  "Pharmacist",
  "NHS 111",
  "Emergency Services",
  "Family / Representative",
  "Prescriber",
  "Other",
]);

const clinicalAdviceSourceOptions = toOptions([
  "GP",
  "Pharmacist",
  "NHS 111",
  "Prescriber",
  "Hospital",
  "Other",
]);

const outcomeOptions = toOptions([
  "No Harm Identified",
  "Monitoring Continues",
  "Medication Administered Correctly",
  "Medication Withheld Following Advice",
  "Medication Replaced",
  "Medical Assessment Completed",
  "Transferred to Hospital",
  "Other",
]);

const followUpOptions = toOptions([
  "Manager Review Required",
  "Medication Audit Required",
  "MAR Review Required",
  "Care Plan Review",
  "Risk Assessment Review",
  "Staff Competency Review",
  "Pharmacy Follow-up",
  "Prescriber Follow-up",
  "Incident Investigation Required",
  "Safeguarding Considered",
]);

const initialData: MedicationErrorData = {
  errorType: "",
  otherErrorType: "",
  medicationName: "",
  prescribedDose: "",
  doseAffected: "",
  scheduledTime: "",
  medicationAdministered: null,
  administrationDetails: "",
  description: "",
  healthImpact: "",
  impactDetails: "",
  immediateActions: [],
  otherImmediateAction: "",
  peopleInformed: [],
  otherPersonInformed: "",
  clinicalAdviceSought: null,
  clinicalAdviceSource: "",
  adviceReceived: "",
  monitoringRequired: null,
  monitoringInstructions: "",
  outcome: "",
  otherOutcome: "",
  followUpActions: [],
  notes: "",
};

export default function MedicationErrorForm({ onChange }: Props) {
  const [data, setData] = useState<MedicationErrorData>(initialData);

  const impactDetailsRequired = useMemo(
    () => Boolean(data.healthImpact && data.healthImpact !== "No Apparent Harm"),
    [data.healthImpact],
  );

  const notesRecommended = useMemo(
    () =>
      data.healthImpact === "Serious Concern" ||
      data.immediateActions.includes("999 Contacted") ||
      data.outcome === "Transferred to Hospital" ||
      data.followUpActions.includes("Safeguarding Considered"),
    [data.healthImpact, data.immediateActions, data.outcome, data.followUpActions],
  );

  function update(changes: Partial<MedicationErrorData>) {
    const next = { ...data, ...changes };
    setData(next);
    onChange(next);
  }

  function updateImmediateActions(next: string[]) {
    let normalized = next;

    if (next.includes("No Immediate Action Required") && next.length > 1) {
      const selectedNoneNow =
        !data.immediateActions.includes("No Immediate Action Required") &&
        next.includes("No Immediate Action Required");

      normalized = selectedNoneNow
        ? ["No Immediate Action Required"]
        : next.filter((item) => item !== "No Immediate Action Required");
    }

    update({
      immediateActions: normalized,
      otherImmediateAction: normalized.includes("Other") ? data.otherImmediateAction : "",
    });
  }

  const errorTypeComplete =
    data.errorType && (data.errorType !== "Other" || data.otherErrorType.trim());

  const administrationComplete =
    data.medicationAdministered === false ||
    (data.medicationAdministered === true && data.administrationDetails.trim());

  const impactComplete =
    data.healthImpact && (!impactDetailsRequired || data.impactDetails.trim());

  const immediateActionsComplete =
    data.immediateActions.length > 0 &&
    (!data.immediateActions.includes("Other") || data.otherImmediateAction.trim());

  const informedComplete =
    data.peopleInformed.length > 0 &&
    (!data.peopleInformed.includes("Other") || data.otherPersonInformed.trim());

  const adviceComplete =
    data.clinicalAdviceSought === false ||
    (data.clinicalAdviceSought === true &&
      data.clinicalAdviceSource &&
      data.adviceReceived.trim());

  const monitoringComplete =
    data.monitoringRequired === false ||
    (data.monitoringRequired === true && data.monitoringInstructions.trim());

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Medication Error</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Capture the error, immediate safety response and clinical follow-up in a clear sequence.
        </p>
      </div>

      <FormSection title="Error details">
        <FormChoiceGroup
          label="Error type"
          value={data.errorType}
          options={errorTypeOptions}
          onChange={(value) =>
            update({
              errorType: value,
              otherErrorType: value === "Other" ? data.otherErrorType : "",
            })
          }
          columns={2}
          required
        />

        {data.errorType === "Other" && (
          <FormField label="Describe the error type" required>
            <FormInput
              value={data.otherErrorType}
              onChange={(event) => update({ otherErrorType: event.target.value })}
              placeholder="Describe the medication error"
            />
          </FormField>
        )}

        {errorTypeComplete && (
          <FormField label="Medication" required>
            <FormInput
              value={data.medicationName}
              onChange={(event) => update({ medicationName: event.target.value })}
              placeholder="Medication name"
            />
          </FormField>
        )}
      </FormSection>

      {data.medicationName.trim() && (
        <FormSection
          title="Prescription context"
          description="These details are useful when known, but they are not required to record the incident."
          collapsible
          defaultOpen={false}
          summary={
            data.prescribedDose || data.doseAffected || data.scheduledTime
              ? "Medication context added"
              : "Optional"
          }
        >
          <FormField label="Prescribed dose">
            <FormInput
              value={data.prescribedDose}
              onChange={(event) => update({ prescribedDose: event.target.value })}
              placeholder="For example, 10mg"
            />
          </FormField>
          <FormField label="Dose affected">
            <FormInput
              value={data.doseAffected}
              onChange={(event) => update({ doseAffected: event.target.value })}
              placeholder="For example, one tablet or 5ml"
            />
          </FormField>
          <FormField label="Scheduled time">
            <FormInput
              type="time"
              value={data.scheduledTime}
              onChange={(event) => update({ scheduledTime: event.target.value })}
            />
          </FormField>
        </FormSection>
      )}

      {data.medicationName.trim() && (
        <FormSection title="What happened?">
          <FormYesNo
            label="Was the medication administered?"
            value={data.medicationAdministered}
            onChange={(value) =>
              update({
                medicationAdministered: value,
                administrationDetails: value ? data.administrationDetails : "",
              })
            }
            required
          />

          {data.medicationAdministered === true && (
            <FormField label="Administration details" required>
              <FormTextarea
                value={data.administrationDetails}
                onChange={(event) => update({ administrationDetails: event.target.value })}
                placeholder="What was administered, when and how?"
                rows={3}
              />
            </FormField>
          )}

          {data.medicationAdministered !== null && administrationComplete && (
            <FormField
              label="What happened?"
              description="Record the factual sequence. Avoid assumptions or blame."
              required
            >
              <FormTextarea
                value={data.description}
                onChange={(event) => update({ description: event.target.value })}
                placeholder="Record the factual sequence of events..."
                rows={5}
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.description.trim() && (
        <FormSection title="Immediate health impact">
          <FormChoiceGroup
            label="Health impact"
            value={data.healthImpact}
            options={healthImpactOptions}
            onChange={(value) =>
              update({
                healthImpact: value,
                impactDetails: value === "No Apparent Harm" ? "" : data.impactDetails,
              })
            }
            required
            columns={2}
          />

          {impactDetailsRequired && (
            <FormField label="Health impact details" required>
              <FormTextarea
                value={data.impactDetails}
                onChange={(event) => update({ impactDetails: event.target.value })}
                placeholder="Symptoms, concerns or observed changes..."
                rows={4}
              />
            </FormField>
          )}
        </FormSection>
      )}

      {impactComplete && (
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

          {immediateActionsComplete && (
            <FormMultiSelect
              label="People informed"
              value={data.peopleInformed}
              options={peopleInformedOptions}
              onChange={(next) =>
                update({
                  peopleInformed: next,
                  otherPersonInformed: next.includes("Other") ? data.otherPersonInformed : "",
                })
              }
              required
              columns={2}
            />
          )}

          {data.peopleInformed.includes("Other") && (
            <FormField label="Other person or service informed" required>
              <FormInput
                value={data.otherPersonInformed}
                onChange={(event) => update({ otherPersonInformed: event.target.value })}
                placeholder="Who else was informed?"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {informedComplete && (
        <FormSection title="Clinical advice and monitoring">
          <FormYesNo
            label="Was clinical advice sought?"
            value={data.clinicalAdviceSought}
            onChange={(value) =>
              update({
                clinicalAdviceSought: value,
                clinicalAdviceSource: value ? data.clinicalAdviceSource : "",
                adviceReceived: value ? data.adviceReceived : "",
              })
            }
            required
          />

          {data.clinicalAdviceSought === true && (
            <>
              <FormChoiceGroup
                label="Advice sought from"
                value={data.clinicalAdviceSource}
                options={clinicalAdviceSourceOptions}
                onChange={(value) => update({ clinicalAdviceSource: value })}
                required
                columns={2}
              />
              {data.clinicalAdviceSource && (
                <FormField label="Advice received" required>
                  <FormTextarea
                    value={data.adviceReceived}
                    onChange={(event) => update({ adviceReceived: event.target.value })}
                    placeholder="Record the advice and instructions provided..."
                    rows={4}
                  />
                </FormField>
              )}
            </>
          )}

          {data.clinicalAdviceSought !== null && adviceComplete && (
            <FormYesNo
              label="Is monitoring required?"
              value={data.monitoringRequired}
              onChange={(value) =>
                update({
                  monitoringRequired: value,
                  monitoringInstructions: value ? data.monitoringInstructions : "",
                })
              }
              required
            />
          )}

          {data.monitoringRequired === true && (
            <FormField label="Monitoring instructions" required>
              <FormTextarea
                value={data.monitoringInstructions}
                onChange={(event) => update({ monitoringInstructions: event.target.value })}
                placeholder="What should be monitored, how often and for how long?"
                rows={4}
              />
            </FormField>
          )}
        </FormSection>
      )}

      {monitoringComplete && data.monitoringRequired !== null && (
        <FormSection title="Outcome">
          <FormChoiceGroup
            label="Immediate outcome"
            value={data.outcome}
            options={outcomeOptions}
            onChange={(value) =>
              update({
                outcome: value,
                otherOutcome: value === "Other" ? data.otherOutcome : "",
              })
            }
            required
            columns={2}
          />

          {data.outcome === "Other" && (
            <FormField label="Describe the outcome" required>
              <FormInput
                value={data.otherOutcome}
                onChange={(event) => update({ otherOutcome: event.target.value })}
                placeholder="Describe the immediate outcome"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.outcome && (data.outcome !== "Other" || data.otherOutcome.trim()) && (
        <FormSection
          title="Follow-up actions"
          description="Add only the follow-up that is actually needed."
          collapsible
          defaultOpen={false}
          summary={data.followUpActions.length ? `${data.followUpActions.length} selected` : "Optional"}
        >
          <FormMultiSelect
            label="Follow-up actions"
            value={data.followUpActions}
            options={followUpOptions}
            onChange={(next) => update({ followUpActions: next })}
            columns={2}
          />
        </FormSection>
      )}

      {data.outcome && (data.outcome !== "Other" || data.otherOutcome.trim()) &&
        (notesRecommended ? (
          <FormSection title="Additional incident detail">
            <FormAlert variant="warning" title="Additional detail recommended">
              Add relevant detail for serious concerns, emergency action, hospital transfer or safeguarding consideration.
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

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
  preventionDetails: string;
  peopleAtRisk: string[];
  otherPersonAtRisk: string;
  hazardStatus: "removed" | "controlled" | "remains" | "";
  riskLevel: string;
  controlMeasures: string;
  immediateActions: string[];
  otherImmediateAction: string;
  peopleInformed: string[];
  otherPersonInformed: string;
  externalReportRequired: boolean | null;
  externalReportDetails: string;
  externalReference: string;
  followUpActions: string[];
  notes: string;
};

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

const nearMissTypeOptions = toOptions([
  "Fall Prevented",
  "Medication Error Prevented",
  "Choking Prevented",
  "Equipment Failure",
  "Environmental Hazard",
  "Fire Safety",
  "Vehicle / Transport",
  "Security Concern",
  "Infection Control",
  "Communication Breakdown",
  "Other",
]);

const peopleAtRiskOptions = toOptions([
  "Service User",
  "Another Service User",
  "Staff Member",
  "Visitor",
  "Member of the Public",
  "Other",
]);

const hazardStatusOptions = [
  { value: "removed", label: "Hazard removed" },
  { value: "controlled", label: "Hazard controlled" },
  { value: "remains", label: "Hazard remains" },
];

const riskLevelOptions = toOptions(["Low", "Medium", "High", "Immediate"]);

const immediateActionOptions = toOptions([
  "Hazard Removed",
  "Area Made Safe",
  "Equipment Taken Out of Use",
  "Medication Secured",
  "Staff Intervention",
  "Person Reassured",
  "Manager Informed",
  "Maintenance Informed",
  "Monitoring Commenced",
  "No Immediate Action Required",
  "Other",
]);

const peopleInformedOptions = toOptions([
  "Manager",
  "On-call Manager",
  "Maintenance",
  "Health Professional",
  "Family / Representative",
  "Other",
]);

const followUpOptions = toOptions([
  "Manager Review Required",
  "Risk Assessment Review",
  "Care Plan Review",
  "Equipment Check",
  "Maintenance Follow-up",
  "Medication Audit",
  "Staff Discussion",
  "Staff Competency Review",
  "Incident Investigation Required",
  "Safeguarding Considered",
]);

const initialData: NearMissData = {
  nearMissType: "",
  otherNearMissType: "",
  location: "",
  description: "",
  preventionDetails: "",
  peopleAtRisk: [],
  otherPersonAtRisk: "",
  hazardStatus: "",
  riskLevel: "",
  controlMeasures: "",
  immediateActions: [],
  otherImmediateAction: "",
  peopleInformed: [],
  otherPersonInformed: "",
  externalReportRequired: null,
  externalReportDetails: "",
  externalReference: "",
  followUpActions: [],
  notes: "",
};

export default function NearMissForm({ onChange }: Props) {
  const [data, setData] = useState<NearMissData>(initialData);

  const notesRecommended = useMemo(
    () =>
      data.hazardStatus === "remains" ||
      data.riskLevel === "High" ||
      data.riskLevel === "Immediate" ||
      data.externalReportRequired === true ||
      data.followUpActions.includes("Safeguarding Considered"),
    [data],
  );

  function update(changes: Partial<NearMissData>) {
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

  function selectHazardStatus(value: NearMissData["hazardStatus"]) {
    update(
      value === "remains"
        ? { hazardStatus: value }
        : { hazardStatus: value, riskLevel: "", controlMeasures: "" },
    );
  }

  const typeComplete = Boolean(
    data.nearMissType &&
      (data.nearMissType !== "Other" || data.otherNearMissType.trim()),
  );

  const peopleAtRiskComplete = Boolean(
    data.peopleAtRisk.length > 0 &&
      (!data.peopleAtRisk.includes("Other") || data.otherPersonAtRisk.trim()),
  );

  const hazardComplete = Boolean(
    data.hazardStatus &&
      (data.hazardStatus !== "remains" ||
        (data.riskLevel && data.controlMeasures.trim())),
  );

  const actionsComplete = Boolean(
    data.immediateActions.length > 0 &&
      (!data.immediateActions.includes("Other") || data.otherImmediateAction.trim()),
  );

  const informedComplete = Boolean(
    data.peopleInformed.length > 0 &&
      (!data.peopleInformed.includes("Other") || data.otherPersonInformed.trim()),
  );

  const reportingComplete = Boolean(
    data.externalReportRequired === false ||
      (data.externalReportRequired === true && data.externalReportDetails.trim()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Near Miss</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record what nearly happened, what prevented harm and whether any risk remains.
        </p>
      </div>

      <FormSection title="What nearly happened?">
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
          <FormField label="What nearly happened?" required>
            <FormTextarea
              value={data.description}
              onChange={(event) => update({ description: event.target.value })}
              placeholder="Describe the factual sequence..."
              rows={4}
            />
          </FormField>
        )}

        {data.description.trim() && (
          <FormField label="What prevented harm?" required>
            <FormTextarea
              value={data.preventionDetails}
              onChange={(event) => update({ preventionDetails: event.target.value })}
              placeholder="Describe the intervention, circumstance or control that prevented harm..."
              rows={4}
            />
          </FormField>
        )}
      </FormSection>

      {data.preventionDetails.trim() && (
        <FormSection title="Who was at risk?">
          <FormMultiSelect
            label="People at risk"
            value={data.peopleAtRisk}
            options={peopleAtRiskOptions}
            onChange={(next) =>
              update({
                peopleAtRisk: next,
                otherPersonAtRisk: next.includes("Other") ? data.otherPersonAtRisk : "",
              })
            }
            required
            columns={2}
          />

          {data.peopleAtRisk.includes("Other") && (
            <FormField label="Other person at risk" required>
              <FormInput
                value={data.otherPersonAtRisk}
                onChange={(event) => update({ otherPersonAtRisk: event.target.value })}
                placeholder="Describe who else was at risk"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {peopleAtRiskComplete && (
        <FormSection title="Current hazard status">
          <FormChoiceGroup
            label="What is the current status of the hazard?"
            value={data.hazardStatus}
            options={hazardStatusOptions}
            onChange={(value) => selectHazardStatus(value as NearMissData["hazardStatus"])}
            required
            columns={3}
          />

          {data.hazardStatus === "remains" && (
            <>
              <FormChoiceGroup
                label="Current risk level"
                value={data.riskLevel}
                options={riskLevelOptions}
                onChange={(value) => update({ riskLevel: value })}
                required
                columns={2}
              />
              {data.riskLevel && (
                <FormField label="Control measures" required>
                  <FormTextarea
                    value={data.controlMeasures}
                    onChange={(event) => update({ controlMeasures: event.target.value })}
                    placeholder="What is in place to reduce the remaining risk?"
                    rows={4}
                  />
                </FormField>
              )}
            </>
          )}
        </FormSection>
      )}

      {hazardComplete && (
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

      {actionsComplete && (
        <FormSection title="Reporting">
          <FormMultiSelect
            label="Who was informed?"
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

          {data.peopleInformed.includes("Other") && (
            <FormField label="Other person or service informed" required>
              <FormInput
                value={data.otherPersonInformed}
                onChange={(event) => update({ otherPersonInformed: event.target.value })}
                placeholder="Who else was informed?"
              />
            </FormField>
          )}

          {informedComplete && (
            <FormYesNo
              label="Is external reporting required?"
              value={data.externalReportRequired}
              onChange={(value) =>
                update({
                  externalReportRequired: value,
                  externalReportDetails: value ? data.externalReportDetails : "",
                  externalReference: value ? data.externalReference : "",
                })
              }
              required
            />
          )}

          {data.externalReportRequired === true && (
            <>
              <FormField label="External reporting details" required>
                <FormTextarea
                  value={data.externalReportDetails}
                  onChange={(event) => update({ externalReportDetails: event.target.value })}
                  placeholder="Who must be notified and what action is required?"
                  rows={4}
                />
              </FormField>
              <FormField label="Reference number">
                <FormInput
                  value={data.externalReference}
                  onChange={(event) => update({ externalReference: event.target.value })}
                  placeholder="Optional external reference"
                />
              </FormField>
            </>
          )}
        </FormSection>
      )}

      {reportingComplete && (
        <FormSection
          title="Follow-up actions"
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

      {reportingComplete &&
        (notesRecommended ? (
          <FormSection title="Additional detail">
            <FormAlert variant="warning" title="Additional detail recommended">
              Add relevant information where risk remains high, external reporting is required or safeguarding was considered.
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

"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormSection,
  FormTextarea,
  FormYesNo,
} from "@/components/care/timelines/forms/shared";

export type EnvironmentCheckData = {
  temperature: string;
  cleanliness: string;
  hazardStatus: "no_hazard" | "hazard_identified" | "";
  hazardType: string;
  otherHazardType: string;
  riskLevel: string;
  actionTaken: string;
  reportedTo: string;
  otherReportedTo: string;
  notes: string;
};

type Props = {
  environmentCheckData?: EnvironmentCheckData;
  setEnvironmentCheckData?: (data: EnvironmentCheckData) => void;
  onChange?: (data: EnvironmentCheckData) => void;
};

const cleanlinessOptions = [
  { value: "Very Clean", label: "Very Clean" },
  { value: "Clean", label: "Clean" },
  { value: "Acceptable", label: "Acceptable" },
  { value: "Requires Cleaning", label: "Requires Cleaning" },
  { value: "Unsanitary", label: "Unsanitary" },
];

const hazardTypeOptions = [
  { value: "Trip Hazard", label: "Trip Hazard" },
  { value: "Slip Hazard", label: "Slip Hazard" },
  { value: "Fire Safety", label: "Fire Safety" },
  { value: "Electrical", label: "Electrical" },
  { value: "Broken Furniture", label: "Broken Furniture" },
  { value: "Infection Control", label: "Infection Control" },
  { value: "Medication Storage", label: "Medication Storage" },
  { value: "Security", label: "Security" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Other", label: "Other" },
];

const riskLevelOptions = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
  { value: "Immediate", label: "Immediate" },
];

const reportedToOptions = [
  { value: "Manager", label: "Manager" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Manager and Maintenance", label: "Manager and Maintenance" },
  { value: "Other", label: "Other" },
];

export const initialEnvironmentCheckData: EnvironmentCheckData = {
  temperature: "",
  cleanliness: "",
  hazardStatus: "",
  hazardType: "",
  otherHazardType: "",
  riskLevel: "",
  actionTaken: "",
  reportedTo: "",
  otherReportedTo: "",
  notes: "",
};

export default function EnvironmentCheckForm({
  environmentCheckData,
  setEnvironmentCheckData,
  onChange,
}: Props) {
  const [localData, setLocalData] = useState<EnvironmentCheckData>(
    environmentCheckData ?? initialEnvironmentCheckData,
  );

  const data = environmentCheckData ?? localData;

  useEffect(() => {
    if (environmentCheckData) setLocalData(environmentCheckData);
  }, [environmentCheckData]);

  const cleanlinessConcern = useMemo(
    () => data.cleanliness === "Requires Cleaning" || data.cleanliness === "Unsanitary",
    [data.cleanliness],
  );

  const hasTemperature = data.temperature.trim() !== "";
  const hasCleanliness = data.cleanliness.trim() !== "";
  const hasHazardStatus = data.hazardStatus !== "";
  const hazardIdentified = data.hazardStatus === "hazard_identified";
  const hasHazardType = data.hazardType.trim() !== "";
  const hazardTypeComplete =
    hasHazardType && (data.hazardType !== "Other" || data.otherHazardType.trim() !== "");
  const hasRiskLevel = data.riskLevel.trim() !== "";
  const hasActionTaken = data.actionTaken.trim() !== "";
  const hasReportedTo = data.reportedTo.trim() !== "";
  const reportedToComplete =
    hasReportedTo && (data.reportedTo !== "Other" || data.otherReportedTo.trim() !== "");

  function update(changes: Partial<EnvironmentCheckData>) {
    const next: EnvironmentCheckData = { ...data, ...changes };
    setLocalData(next);
    setEnvironmentCheckData?.(next);
    onChange?.(next);
  }

  function selectHazardStatus(value: boolean) {
    if (!value) {
      update({
        hazardStatus: "no_hazard",
        hazardType: "",
        otherHazardType: "",
        riskLevel: "",
        actionTaken: "",
        reportedTo: "",
        otherReportedTo: "",
      });
      return;
    }

    update({ hazardStatus: "hazard_identified" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Environment Check</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record the routine check first. Extra detail only appears when something needs action.
        </p>
      </div>

      <FormSection title="Temperature">
        <FormField label="Current temperature" required>
          <div className="flex items-center gap-3">
            <FormInput
              type="number"
              step="any"
              value={data.temperature}
              onChange={(event) => update({ temperature: event.target.value })}
              placeholder="For example, 21"
            />
            <span className="shrink-0 text-sm font-medium text-teal-700">°C</span>
          </div>
        </FormField>
      </FormSection>

      {hasTemperature && (
        <FormSection title="Cleanliness">
          <FormChoiceGroup
            label="How clean is the environment?"
            value={data.cleanliness}
            options={cleanlinessOptions}
            onChange={(value) => update({ cleanliness: value })}
            required
          />
          {cleanlinessConcern && (
            <FormAlert variant="warning" title="Cleaning action required">
              Record the cleaning action or relevant details before saving.
            </FormAlert>
          )}
        </FormSection>
      )}

      {hasCleanliness && (
        <FormSection title="Safety">
          <FormYesNo
            label="Were any hazards identified?"
            value={data.hazardStatus === "" ? null : hazardIdentified}
            yesLabel="Hazard identified"
            noLabel="No hazards identified"
            onChange={selectHazardStatus}
          />
        </FormSection>
      )}

      {hazardIdentified && (
        <FormSection
          title="Hazard details"
          description="Because a hazard was identified, record the minimum information needed for safe follow-up."
          className="border-amber-200 bg-amber-50/50"
        >
          <FormChoiceGroup
            label="Hazard type"
            value={data.hazardType}
            options={hazardTypeOptions}
            onChange={(value) =>
              update({
                hazardType: value,
                otherHazardType: value === "Other" ? data.otherHazardType : "",
                riskLevel: "",
                actionTaken: "",
                reportedTo: "",
                otherReportedTo: "",
              })
            }
            required
          />

          {data.hazardType === "Other" && (
            <FormField label="Describe the hazard" required>
              <FormInput
                value={data.otherHazardType}
                onChange={(event) =>
                  update({
                    otherHazardType: event.target.value,
                    riskLevel: "",
                    actionTaken: "",
                    reportedTo: "",
                    otherReportedTo: "",
                  })
                }
                placeholder="Describe the hazard identified"
              />
            </FormField>
          )}

          {hazardTypeComplete && (
            <FormChoiceGroup
              label="Risk level"
              value={data.riskLevel}
              options={riskLevelOptions}
              onChange={(value) =>
                update({
                  riskLevel: value,
                  actionTaken: "",
                  reportedTo: "",
                  otherReportedTo: "",
                })
              }
              required
            />
          )}

          {hasRiskLevel && (
            <FormField
              label="Action taken"
              description="Describe what was done to remove or reduce the risk."
              required
            >
              <FormTextarea
                rows={4}
                value={data.actionTaken}
                onChange={(event) =>
                  update({
                    actionTaken: event.target.value,
                    reportedTo: "",
                    otherReportedTo: "",
                  })
                }
                placeholder="Describe the action taken..."
              />
            </FormField>
          )}

          {hasActionTaken && (
            <FormChoiceGroup
              label="Reported to"
              value={data.reportedTo}
              options={reportedToOptions}
              onChange={(value) =>
                update({
                  reportedTo: value,
                  otherReportedTo: value === "Other" ? data.otherReportedTo : "",
                })
              }
              required
            />
          )}

          {data.reportedTo === "Other" && (
            <FormField label="Who was it reported to?" required>
              <FormInput
                value={data.otherReportedTo}
                onChange={(event) => update({ otherReportedTo: event.target.value })}
                placeholder="Enter the person or service informed"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {hasHazardStatus && (!hazardIdentified || reportedToComplete) && (
        <FormSection
          title={cleanlinessConcern ? "Cleaning action and notes" : "Additional notes"}
          description={
            cleanlinessConcern
              ? "A cleanliness concern was recorded, so add the action taken."
              : "Routine checks do not need extra narrative unless there is something useful to add."
          }
          collapsible={!cleanlinessConcern}
          defaultOpen={cleanlinessConcern}
          summary={data.notes.trim() ? "Notes added" : "Optional"}
        >
          <FormField
            label={cleanlinessConcern ? "Action taken" : "Notes"}
            required={cleanlinessConcern}
          >
            <FormTextarea
              rows={4}
              value={data.notes}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder={
                cleanlinessConcern
                  ? "Record the cleaning action taken and any additional details..."
                  : "Optional additional information..."
              }
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

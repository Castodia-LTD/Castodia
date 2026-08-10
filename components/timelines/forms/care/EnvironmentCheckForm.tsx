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
} from "@/components/timelines/forms/shared";

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
  setEnvironmentCheckData?: (
    data: EnvironmentCheckData,
  ) => void;
  onChange?: (
    data: EnvironmentCheckData,
  ) => void;
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
  {
    value: "Manager and Maintenance",
    label: "Manager and Maintenance",
  },
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
  const [localData, setLocalData] =
    useState<EnvironmentCheckData>(
      environmentCheckData ??
        initialEnvironmentCheckData,
    );

  const data =
    environmentCheckData ?? localData;

  useEffect(() => {
    if (environmentCheckData) {
      setLocalData(environmentCheckData);
    }
  }, [environmentCheckData]);

  const cleanlinessConcern = useMemo(
    () =>
      data.cleanliness === "Requires Cleaning" ||
      data.cleanliness === "Unsanitary",
    [data.cleanliness],
  );

  const hasTemperature =
    data.temperature.trim() !== "";

  const hasCleanliness =
    data.cleanliness.trim() !== "";

  const hasHazardStatus =
    data.hazardStatus !== "";

  const hazardIdentified =
    data.hazardStatus === "hazard_identified";

  const hasHazardType =
    data.hazardType.trim() !== "";

  const hazardTypeComplete =
    hasHazardType &&
    (data.hazardType !== "Other" ||
      data.otherHazardType.trim() !== "");

  const hasRiskLevel =
    data.riskLevel.trim() !== "";

  const hasActionTaken =
    data.actionTaken.trim() !== "";

  const hasReportedTo =
    data.reportedTo.trim() !== "";

  const reportedToComplete =
    hasReportedTo &&
    (data.reportedTo !== "Other" ||
      data.otherReportedTo.trim() !== "");

  function update(
    changes: Partial<EnvironmentCheckData>,
  ) {
    const next: EnvironmentCheckData = {
      ...data,
      ...changes,
    };

    setLocalData(next);
    setEnvironmentCheckData?.(next);
    onChange?.(next);
  }

  function selectHazardStatus(
    value: boolean,
  ) {
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

    update({
      hazardStatus: "hazard_identified",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">
          Environment Check
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record the condition and safety of the environment.
        </p>
      </div>

      <FormSection
        title="Temperature"
        description="Record the current environmental temperature."
      >
        <FormField label="Current temperature">
          <div className="flex items-center gap-3">
            <FormInput
              type="number"
              step="any"
              value={data.temperature}
              onChange={(event) =>
                update({
                  temperature: event.target.value,
                })
              }
              placeholder="For example, 21"
            />

            <span className="shrink-0 text-sm font-medium text-teal-700">
              °C
            </span>
          </div>
        </FormField>
      </FormSection>

      {hasTemperature && (
        <FormSection
          title="Cleanliness"
          description="Record the current condition of the environment."
        >
          <FormChoiceGroup
            label="How clean is the environment?"
            value={data.cleanliness}
            options={cleanlinessOptions}
            onChange={(value) =>
              update({
                cleanliness: value,
              })
            }
          />

          {cleanlinessConcern && (
            <FormAlert
              variant="warning"
              title="Cleaning action required"
            >
              Record the cleaning action or relevant details before saving.
            </FormAlert>
          )}
        </FormSection>
      )}

      {hasCleanliness && (
        <FormSection
          title="Hazards"
          description="Record whether any environmental hazards were identified."
        >
          <FormYesNo
            label="Were any hazards identified?"
            value={
              data.hazardStatus === ""
                ? null
                : hazardIdentified
            }
            yesLabel="Hazard identified"
            noLabel="No hazards identified"
            onChange={selectHazardStatus}
          />
        </FormSection>
      )}

      {hazardIdentified && (
        <FormSection
          title="Hazard details"
          description="Record the hazard, current risk and action taken."
          className="border-amber-200 bg-amber-50/50"
        >
          <FormChoiceGroup
            label="Hazard type"
            value={data.hazardType}
            options={hazardTypeOptions}
            onChange={(value) =>
              update({
                hazardType: value,
                otherHazardType:
                  value === "Other"
                    ? data.otherHazardType
                    : "",
                riskLevel: "",
                actionTaken: "",
                reportedTo: "",
                otherReportedTo: "",
              })
            }
          />

          {data.hazardType === "Other" && (
            <FormField label="Describe the hazard">
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
            />
          )}

          {hasRiskLevel && (
            <FormField
              label="Action taken"
              description="Describe what was done to remove or reduce the risk."
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
                  otherReportedTo:
                    value === "Other"
                      ? data.otherReportedTo
                      : "",
                })
              }
            />
          )}

          {data.reportedTo === "Other" && (
            <FormField label="Who was it reported to?">
              <FormInput
                value={data.otherReportedTo}
                onChange={(event) =>
                  update({
                    otherReportedTo: event.target.value,
                  })
                }
                placeholder="Enter the person or service informed"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {hasHazardStatus &&
        (!hazardIdentified ||
          reportedToComplete) && (
          <FormSection
            title="Additional notes"
            description={
              cleanlinessConcern
                ? "Record cleaning action and any further relevant information."
                : "Add any further information that may be useful."
            }
          >
            <FormField
              label={
                cleanlinessConcern
                  ? "Cleaning action and notes"
                  : "Notes"
              }
            >
              <FormTextarea
                rows={4}
                value={data.notes}
                onChange={(event) =>
                  update({
                    notes: event.target.value,
                  })
                }
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
"use client";

import { useEffect, useMemo, useState } from "react";

export type EnvironmentCheckData = {
  temperature: string;
  cleanliness: string;
  hazardStatus:
    | "no_hazard"
    | "hazard_identified"
    | "";
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
  "Very Clean",
  "Clean",
  "Acceptable",
  "Requires Cleaning",
  "Unsanitary",
];

const hazardTypeOptions = [
  "Trip Hazard",
  "Slip Hazard",
  "Fire Safety",
  "Electrical",
  "Broken Furniture",
  "Infection Control",
  "Medication Storage",
  "Security",
  "Maintenance",
  "Other",
];

const riskLevelOptions = [
  "Low",
  "Medium",
  "High",
  "Immediate",
];

const reportedToOptions = [
  "Manager",
  "Maintenance",
  "Manager and Maintenance",
  "Other",
];

export const initialEnvironmentCheckData: EnvironmentCheckData =
  {
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

  const cleanlinessConcern = useMemo(() => {
    return (
      data.cleanliness ===
        "Requires Cleaning" ||
      data.cleanliness === "Unsanitary"
    );
  }, [data.cleanliness]);

  const hasTemperature =
    data.temperature.trim() !== "";

  const hasCleanliness =
    data.cleanliness.trim() !== "";

  const hasHazardStatus =
    data.hazardStatus !== "";

  const hazardIdentified =
    data.hazardStatus ===
    "hazard_identified";

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
    value: EnvironmentCheckData["hazardStatus"],
  ) {
    if (value === "no_hazard") {
      update({
        hazardStatus: value,
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
      hazardStatus: value,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Environment Check
        </h3>

        <p className="text-sm text-slate-500">
          Record the condition and safety of the
          environment.
        </p>
      </div>

      <SectionCard
        number="1"
        title="Temperature"
      >
        <NumberInput
          label="Current Temperature"
          suffix="°C"
          value={data.temperature}
          onChange={(value) =>
            update({
              temperature: value,
            })
          }
          placeholder="For example, 21"
        />
      </SectionCard>

      {hasTemperature && (
        <SectionCard
          number="2"
          title="Cleanliness"
        >
          <SelectBlock
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
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Cleaning action or relevant details
              should be recorded before saving.
            </div>
          )}
        </SectionCard>
      )}

      {hasCleanliness && (
        <SectionCard
          number="3"
          title="Hazards"
        >
          <FieldLabel>
            Were any hazards identified?
          </FieldLabel>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OptionButton
              label="No Hazards Identified"
              selected={
                data.hazardStatus ===
                "no_hazard"
              }
              onClick={() =>
                selectHazardStatus(
                  "no_hazard",
                )
              }
            />

            <OptionButton
              label="Hazard Identified"
              selected={
                data.hazardStatus ===
                "hazard_identified"
              }
              onClick={() =>
                selectHazardStatus(
                  "hazard_identified",
                )
              }
            />
          </div>
        </SectionCard>
      )}

      {hazardIdentified && (
        <SectionCard
          number="4"
          title="Hazard Details"
          warning
        >
          <SelectBlock
            label="Hazard Type"
            value={data.hazardType}
            options={hazardTypeOptions}
            onChange={(value) =>
              update({
                hazardType: value,
                otherHazardType:
                  value === "Other"
                    ? data.otherHazardType
                    : "",
              })
            }
          />

          {data.hazardType === "Other" && (
            <TextInput
              label="Describe the Hazard"
              value={data.otherHazardType}
              onChange={(value) =>
                update({
                  otherHazardType: value,
                })
              }
              placeholder="Describe the hazard identified"
            />
          )}

          {hazardTypeComplete && (
            <SelectBlock
              label="Risk Level"
              value={data.riskLevel}
              options={riskLevelOptions}
              onChange={(value) =>
                update({
                  riskLevel: value,
                })
              }
            />
          )}

          {hasRiskLevel && (
            <TextArea
              label="Action Taken"
              value={data.actionTaken}
              onChange={(value) =>
                update({
                  actionTaken: value,
                })
              }
              placeholder="Describe what was done to remove or reduce the risk..."
              rows={4}
            />
          )}

          {hasActionTaken && (
            <SelectBlock
              label="Reported To"
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
            <TextInput
              label="Who Was It Reported To?"
              value={data.otherReportedTo}
              onChange={(value) =>
                update({
                  otherReportedTo: value,
                })
              }
              placeholder="Enter the person or service informed"
            />
          )}
        </SectionCard>
      )}

      {hasHazardStatus &&
        (!hazardIdentified ||
          reportedToComplete) && (
          <SectionCard
            number={
              hazardIdentified ? "5" : "4"
            }
            title="Additional Notes"
          >
            <TextArea
              label={
                cleanlinessConcern
                  ? "Cleaning Action and Notes"
                  : "Notes"
              }
              value={data.notes}
              onChange={(value) =>
                update({
                  notes: value,
                })
              }
              placeholder={
                cleanlinessConcern
                  ? "Record the cleaning action taken and any additional details..."
                  : "Optional additional information..."
              }
              rows={4}
            />
          </SectionCard>
        )}
    </div>
  );
}

function FieldLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function SectionCard({
  number,
  title,
  children,
  warning = false,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div
      className={`space-y-4 rounded-2xl border p-4 ${
        warning
          ? "border-amber-200 bg-amber-50/70"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
            warning
              ? "bg-amber-100 text-amber-800"
              : "bg-cyan-100 text-cyan-700"
          }`}
        >
          {number}
        </span>

        <h4 className="font-semibold text-slate-900">
          {title}
        </h4>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
        selected
          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

function NumberInput({
  label,
  suffix,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  suffix: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div className="flex items-center gap-2">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
        />

        <span className="text-sm text-slate-500">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-cyan-500"
      />
    </div>
  );
}

function SelectBlock({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() =>
              onChange(option)
            }
            className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
              value === option
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";

type Props = {
  onChange: (data: EnvironmentCheckData) => void;
};

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

const initialData: EnvironmentCheckData = {
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
  onChange,
}: Props) {
  const [data, setData] =
    useState<EnvironmentCheckData>(initialData);

  const cleanlinessConcern = useMemo(() => {
    return (
      data.cleanliness === "Requires Cleaning" ||
      data.cleanliness === "Unsanitary"
    );
  }, [data.cleanliness]);

  function update(
    changes: Partial<EnvironmentCheckData>
  ) {
    const next = {
      ...data,
      ...changes,
    };

    setData(next);
    onChange(next);
  }

  function selectHazardStatus(
    value: EnvironmentCheckData["hazardStatus"]
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
          Record the temperature, cleanliness and any
          environmental hazards identified.
        </p>
      </div>

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
          Record any cleaning action or relevant detail in
          the notes section.
        </div>
      )}

      <div>
        <FieldLabel>
          Were any hazards identified?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No Hazards Identified"
            selected={
              data.hazardStatus === "no_hazard"
            }
            onClick={() =>
              selectHazardStatus("no_hazard")
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
                "hazard_identified"
              )
            }
          />
        </div>
      </div>

      {data.hazardStatus === "hazard_identified" && (
        <SectionCard title="⚠️ Hazard Details">
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

          <TextArea
            label="Action Taken"
            value={data.actionTaken}
            onChange={(value) =>
              update({
                actionTaken: value,
              })
            }
            placeholder="Describe what was done to reduce or remove the risk..."
            rows={4}
          />

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

      <TextArea
        label="Notes"
        value={data.notes}
        onChange={(value) =>
          update({
            notes: value,
          })
        }
        placeholder={
          cleanlinessConcern
            ? "Record cleaning action or any additional details..."
            : "Optional additional information..."
        }
        rows={4}
      />
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
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="font-semibold text-slate-900">
        {title}
      </h4>

      <div className="space-y-4">{children}</div>
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
      className={`rounded-xl border px-4 py-3 text-left text-sm ${
        selected
          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
          : "border-slate-200 bg-white text-slate-700"
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
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
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

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-xl border px-3 py-3 text-left text-sm ${
              value === option
                ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
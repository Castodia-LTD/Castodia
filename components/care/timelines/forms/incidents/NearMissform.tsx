"use client";

import { useMemo, useState } from "react";

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

const nearMissTypeOptions = [
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
];

const peopleAtRiskOptions = [
  "Service User",
  "Another Service User",
  "Staff Member",
  "Visitor",
  "Member of the Public",
  "Other",
];

const hazardStatusOptions = [
  {
    value: "removed",
    label: "Hazard Removed",
  },
  {
    value: "controlled",
    label: "Hazard Controlled",
  },
  {
    value: "remains",
    label: "Hazard Remains",
  },
];

const riskLevelOptions = [
  "Low",
  "Medium",
  "High",
  "Immediate",
];

const immediateActionOptions = [
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
];

const peopleInformedOptions = [
  "Manager",
  "On-call Manager",
  "Maintenance",
  "Health Professional",
  "Family / Representative",
  "Other",
];

const followUpOptions = [
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
];

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

export default function NearMissForm({
  onChange,
}: Props) {
  const [data, setData] =
    useState<NearMissData>(initialData);

  const notesRecommended = useMemo(() => {
    return (
      data.hazardStatus === "remains" ||
      data.riskLevel === "High" ||
      data.riskLevel === "Immediate" ||
      data.externalReportRequired === true ||
      data.followUpActions.includes("Safeguarding Considered")
    );
  }, [
    data.hazardStatus,
    data.riskLevel,
    data.externalReportRequired,
    data.followUpActions,
  ]);

  function update(
    changes: Partial<NearMissData>
  ) {
    const next = {
      ...data,
      ...changes,
    };

    setData(next);
    onChange(next);
  }

  function togglePersonAtRisk(value: string) {
    const next = data.peopleAtRisk.includes(value)
      ? data.peopleAtRisk.filter(
          (item) => item !== value
        )
      : [...data.peopleAtRisk, value];

    update({
      peopleAtRisk: next,
      otherPersonAtRisk: next.includes("Other")
        ? data.otherPersonAtRisk
        : "",
    });
  }

  function toggleImmediateAction(value: string) {
    let next: string[];

    if (value === "No Immediate Action Required") {
      next = ["No Immediate Action Required"];
    } else {
      const withoutNone =
        data.immediateActions.filter(
          (item) =>
            item !== "No Immediate Action Required"
        );

      next = withoutNone.includes(value)
        ? withoutNone.filter(
            (item) => item !== value
          )
        : [...withoutNone, value];
    }

    update({
      immediateActions: next,
      otherImmediateAction: next.includes("Other")
        ? data.otherImmediateAction
        : "",
    });
  }

  function togglePersonInformed(value: string) {
    const next = data.peopleInformed.includes(value)
      ? data.peopleInformed.filter(
          (item) => item !== value
        )
      : [...data.peopleInformed, value];

    update({
      peopleInformed: next,
      otherPersonInformed: next.includes("Other")
        ? data.otherPersonInformed
        : "",
    });
  }

  function toggleFollowUp(value: string) {
    const next = data.followUpActions.includes(value)
      ? data.followUpActions.filter(
          (item) => item !== value
        )
      : [...data.followUpActions, value];

    update({
      followUpActions: next,
    });
  }

  function selectHazardStatus(
    value: NearMissData["hazardStatus"]
  ) {
    if (value !== "remains") {
      update({
        hazardStatus: value,
        riskLevel: "",
        controlMeasures: "",
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
          Near Miss
        </h3>

        <p className="text-sm text-slate-500">
          Record an event where harm was avoided and the
          action taken to prevent recurrence.
        </p>
      </div>

      <SelectBlock
        label="Near Miss Type"
        value={data.nearMissType}
        options={nearMissTypeOptions}
        onChange={(value) =>
          update({
            nearMissType: value,
            otherNearMissType:
              value === "Other"
                ? data.otherNearMissType
                : "",
          })
        }
      />

      {data.nearMissType === "Other" && (
        <TextInput
          label="Describe the Near Miss Type"
          value={data.otherNearMissType}
          onChange={(value) =>
            update({
              otherNearMissType: value,
            })
          }
          placeholder="Describe the type of near miss"
        />
      )}

      <TextInput
        label="Location"
        value={data.location}
        onChange={(value) =>
          update({
            location: value,
          })
        }
        placeholder="For example, kitchen, bedroom, community or vehicle"
      />

      <TextArea
        label="What Nearly Happened?"
        value={data.description}
        onChange={(value) =>
          update({
            description: value,
          })
        }
        placeholder="Record the factual sequence of events..."
        rows={5}
      />

      <TextArea
        label="What Prevented Harm?"
        value={data.preventionDetails}
        onChange={(value) =>
          update({
            preventionDetails: value,
          })
        }
        placeholder="Describe what stopped the incident from causing harm..."
        rows={4}
      />

      <CheckboxGroup
        label="Who Was at Risk?"
        values={data.peopleAtRisk}
        options={peopleAtRiskOptions}
        onToggle={togglePersonAtRisk}
      />

      {data.peopleAtRisk.includes("Other") && (
        <TextInput
          label="Other Person at Risk"
          value={data.otherPersonAtRisk}
          onChange={(value) =>
            update({
              otherPersonAtRisk: value,
            })
          }
          placeholder="Describe who else was at risk"
        />
      )}

      <div>
        <FieldLabel>
          What is the current hazard status?
        </FieldLabel>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {hazardStatusOptions.map((option) => (
            <OptionButton
              key={option.value}
              label={option.label}
              selected={
                data.hazardStatus === option.value
              }
              onClick={() =>
                selectHazardStatus(
                  option.value as NearMissData["hazardStatus"]
                )
              }
            />
          ))}
        </div>
      </div>

      {data.hazardStatus === "remains" && (
        <SectionCard title="⚠️ Ongoing Hazard">
          <SelectBlock
            label="Current Risk Level"
            value={data.riskLevel}
            options={riskLevelOptions}
            onChange={(value) =>
              update({
                riskLevel: value,
              })
            }
          />

          <TextArea
            label="Control Measures"
            value={data.controlMeasures}
            onChange={(value) =>
              update({
                controlMeasures: value,
              })
            }
            placeholder="Record how the risk is being controlled until it is resolved..."
            rows={4}
          />
        </SectionCard>
      )}

      <CheckboxGroup
        label="Immediate Actions"
        values={data.immediateActions}
        options={immediateActionOptions}
        onToggle={toggleImmediateAction}
      />

      {data.immediateActions.includes("Other") && (
        <TextArea
          label="Describe the Other Immediate Action"
          value={data.otherImmediateAction}
          onChange={(value) =>
            update({
              otherImmediateAction: value,
            })
          }
          placeholder="Describe the action taken"
          rows={3}
        />
      )}

      <CheckboxGroup
        label="People Informed"
        values={data.peopleInformed}
        options={peopleInformedOptions}
        onToggle={togglePersonInformed}
      />

      {data.peopleInformed.includes("Other") && (
        <TextInput
          label="Other Person or Service Informed"
          value={data.otherPersonInformed}
          onChange={(value) =>
            update({
              otherPersonInformed: value,
            })
          }
          placeholder="Enter who was informed"
        />
      )}

      <div>
        <FieldLabel>
          Is external reporting required?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No"
            selected={
              data.externalReportRequired === false
            }
            onClick={() =>
              update({
                externalReportRequired: false,
                externalReportDetails: "",
                externalReference: "",
              })
            }
          />

          <OptionButton
            label="Yes"
            selected={
              data.externalReportRequired === true
            }
            onClick={() =>
              update({
                externalReportRequired: true,
              })
            }
          />
        </div>
      </div>

      {data.externalReportRequired === true && (
        <SectionCard title="📤 External Reporting">
          <TextArea
            label="Reporting Details"
            value={data.externalReportDetails}
            onChange={(value) =>
              update({
                externalReportDetails: value,
              })
            }
            placeholder="Record who the near miss must be reported to and why..."
            rows={4}
          />

          <TextInput
            label="Reference Number (optional)"
            value={data.externalReference}
            onChange={(value) =>
              update({
                externalReference: value,
              })
            }
            placeholder="Enter any reference number"
          />
        </SectionCard>
      )}

      <CheckboxGroup
        label="Follow-up Actions"
        values={data.followUpActions}
        options={followUpOptions}
        onToggle={toggleFollowUp}
      />

      {notesRecommended && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Add any relevant detail where a hazard remains,
          the risk is high, external reporting is required
          or safeguarding has been considered.
        </div>
      )}

      <TextArea
        label="Notes"
        value={data.notes}
        onChange={(value) =>
          update({
            notes: value,
          })
        }
        placeholder="Optional additional information..."
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

function CheckboxGroup({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  options: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>

      <div className="space-y-2">
        {options.map((option) => {
          const selected = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                selected
                  ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span>{option}</span>
              <span>{selected ? "✓" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
"use client";

import { useMemo, useState } from "react";

type Props = {
  onChange: (data: AccidentFallInjuryData) => void;
};

export type AccidentFallInjuryData = {
  incidentType: string;
  otherIncidentType: string;
  location: string;

  witnessedStatus: "yes" | "partially" | "no" | "";
  discoveryDetails: string;

  description: string;

  injurySustained: boolean | null;
  injuryTypes: string[];
  otherInjuryType: string;
  injurySeverity: string;

  createLinkedBodyMap: boolean;

  involvedAnotherPerson: boolean;
  otherPersonDetails: string;

  immediateActions: string[];
  otherImmediateAction: string;

  outcome: string;
  otherOutcome: string;

  followUpActions: string[];

  notes: string;
};

const incidentTypeOptions = [
  { value: "Fall", label: "Fall", icon: "🧍" },
  { value: "Accident", label: "Accident", icon: "⚠️" },
  {
    value: "Injury Without Known Cause",
    label: "Injury Without Known Cause",
    icon: "❓",
  },
  { value: "Choking", label: "Choking", icon: "🫁" },
  { value: "Burn / Scald", label: "Burn / Scald", icon: "🔥" },
  {
    value: "Cut / Laceration",
    label: "Cut / Laceration",
    icon: "🩹",
  },
  { value: "Head Injury", label: "Head Injury", icon: "🧠" },
  { value: "Collision", label: "Collision", icon: "💥" },
  { value: "Other", label: "Other", icon: "➕" },
];

const injuryTypeOptions = [
  "Bruising",
  "Grazing",
  "Cut / Laceration",
  "Swelling",
  "Bleeding",
  "Suspected Fracture",
  "Head Injury",
  "Pain",
  "Reduced Mobility",
  "Burn",
  "Other",
];

const injurySeverityOptions = [
  "Minor",
  "Moderate",
  "Serious",
];

const immediateActionOptions = [
  "First Aid",
  "Observations Commenced",
  "GP Contacted",
  "NHS 111",
  "999",
  "Hospital",
  "Family Informed",
  "Manager Informed",
  "No Treatment Required",
  "Other",
];

const outcomeOptions = [
  "Continued Normal Activities",
  "Resting",
  "Monitoring",
  "Hospital Assessment",
  "Admitted to Hospital",
  "Other",
];

const followUpOptions = [
  "Body Map Completed",
  "Incident Review Required",
  "Risk Assessment Review",
  "Care Plan Review",
  "Falls Assessment",
  "Safeguarding Considered",
];

const initialData: AccidentFallInjuryData = {
  incidentType: "",
  otherIncidentType: "",
  location: "",

  witnessedStatus: "",
  discoveryDetails: "",

  description: "",

  injurySustained: null,
  injuryTypes: [],
  otherInjuryType: "",
  injurySeverity: "",

  createLinkedBodyMap: false,

  involvedAnotherPerson: false,
  otherPersonDetails: "",

  immediateActions: [],
  otherImmediateAction: "",

  outcome: "",
  otherOutcome: "",

  followUpActions: [],

  notes: "",
};

export default function AccidentFallInjuryForm({
  onChange,
}: Props) {
  const [data, setData] =
    useState<AccidentFallInjuryData>(initialData);

  const notesRecommended = useMemo(() => {
    return (
      data.injurySeverity === "Serious" ||
      data.immediateActions.includes("999") ||
      data.outcome === "Hospital Assessment" ||
      data.outcome === "Admitted to Hospital" ||
      data.followUpActions.includes("Safeguarding Considered")
    );
  }, [data]);

  function update(
    changes: Partial<AccidentFallInjuryData>
  ) {
    const next = {
      ...data,
      ...changes,
    };

    setData(next);
    onChange(next);
  }

  function toggleInjuryType(value: string) {
    const next = data.injuryTypes.includes(value)
      ? data.injuryTypes.filter((item) => item !== value)
      : [...data.injuryTypes, value];

    update({
      injuryTypes: next,
      otherInjuryType: next.includes("Other")
        ? data.otherInjuryType
        : "",
    });
  }

  function toggleImmediateAction(value: string) {
    let next: string[];

    if (value === "No Treatment Required") {
      next = ["No Treatment Required"];
    } else {
      const withoutNone = data.immediateActions.filter(
        (item) => item !== "No Treatment Required"
      );

      next = withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : [...withoutNone, value];

      if (next.length === 0) {
        next = [];
      }
    }

    update({
      immediateActions: next,
      otherImmediateAction: next.includes("Other")
        ? data.otherImmediateAction
        : "",
    });
  }

  function toggleFollowUp(value: string) {
    const next = data.followUpActions.includes(value)
      ? data.followUpActions.filter((item) => item !== value)
      : [...data.followUpActions, value];

    update({
      followUpActions: next,
    });
  }

  function selectInjurySustained(value: boolean) {
    if (!value) {
      update({
        injurySustained: false,
        injuryTypes: [],
        otherInjuryType: "",
        injurySeverity: "",
        createLinkedBodyMap: false,
      });

      return;
    }

    update({
      injurySustained: true,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Accident / Fall / Injury
        </h3>

        <p className="text-sm text-slate-500">
          Record the immediate factual details, any injury,
          actions taken and the outcome.
        </p>
      </div>

      <div>
        <FieldLabel>What type of incident occurred?</FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          {incidentTypeOptions.map((option) => (
            <SelectionCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={data.incidentType === option.value}
              onClick={() =>
                update({
                  incidentType: option.value,
                  otherIncidentType:
                    option.value === "Other"
                      ? data.otherIncidentType
                      : "",
                })
              }
            />
          ))}
        </div>
      </div>

      {data.incidentType === "Other" && (
        <TextInput
          label="Describe the Incident Type"
          value={data.otherIncidentType}
          onChange={(value) =>
            update({
              otherIncidentType: value,
            })
          }
          placeholder="Describe the incident type"
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

      <div>
        <FieldLabel>Was the incident witnessed?</FieldLabel>

        <div className="grid grid-cols-3 gap-3">
          <OptionButton
            label="Yes"
            selected={data.witnessedStatus === "yes"}
            onClick={() =>
              update({
                witnessedStatus: "yes",
                discoveryDetails: "",
              })
            }
          />

          <OptionButton
            label="Partially"
            selected={data.witnessedStatus === "partially"}
            onClick={() =>
              update({
                witnessedStatus: "partially",
              })
            }
          />

          <OptionButton
            label="No"
            selected={data.witnessedStatus === "no"}
            onClick={() =>
              update({
                witnessedStatus: "no",
              })
            }
          />
        </div>
      </div>

      {(data.witnessedStatus === "no" ||
        data.witnessedStatus === "partially") && (
        <TextArea
          label="How Was the Incident Discovered?"
          value={data.discoveryDetails}
          onChange={(value) =>
            update({
              discoveryDetails: value,
            })
          }
          placeholder="For example, found on the floor or reported by the person..."
          rows={3}
        />
      )}

      <TextArea
        label="What Happened?"
        value={data.description}
        onChange={(value) =>
          update({
            description: value,
          })
        }
        placeholder="Record the facts of what happened. Avoid assumptions or blame..."
        rows={5}
      />

      <div>
        <FieldLabel>Was an injury sustained?</FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No Injury"
            selected={data.injurySustained === false}
            onClick={() => selectInjurySustained(false)}
          />

          <OptionButton
            label="Injury Sustained"
            selected={data.injurySustained === true}
            onClick={() => selectInjurySustained(true)}
          />
        </div>
      </div>

      {data.injurySustained === true && (
        <SectionCard title="🩹 Injury Details">
          <CheckboxGroup
            label="Injury Type"
            values={data.injuryTypes}
            options={injuryTypeOptions}
            onToggle={toggleInjuryType}
          />

          {data.injuryTypes.includes("Other") && (
            <TextInput
              label="Describe the Injury"
              value={data.otherInjuryType}
              onChange={(value) =>
                update({
                  otherInjuryType: value,
                })
              }
              placeholder="Describe the injury"
            />
          )}

          <SelectBlock
            label="Injury Severity"
            value={data.injurySeverity}
            options={injurySeverityOptions}
            onChange={(value) =>
              update({
                injurySeverity: value,
              })
            }
          />

          <ToggleRow
            label="Create a linked Body Map after saving"
            checked={data.createLinkedBodyMap}
            onChange={() =>
              update({
                createLinkedBodyMap:
                  !data.createLinkedBodyMap,
              })
            }
          />
        </SectionCard>
      )}

      <ToggleRow
        label="This incident involved another person"
        checked={data.involvedAnotherPerson}
        onChange={() =>
          update({
            involvedAnotherPerson:
              !data.involvedAnotherPerson,
            otherPersonDetails:
              data.involvedAnotherPerson
                ? ""
                : data.otherPersonDetails,
          })
        }
      />

      {data.involvedAnotherPerson && (
        <TextInput
          label="Other Person Involved"
          value={data.otherPersonDetails}
          onChange={(value) =>
            update({
              otherPersonDetails: value,
            })
          }
          placeholder="Record their name and relationship or role"
        />
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
          placeholder="Describe the immediate action taken"
          rows={3}
        />
      )}

      <SelectBlock
        label="Immediate Outcome"
        value={data.outcome}
        options={outcomeOptions}
        onChange={(value) =>
          update({
            outcome: value,
            otherOutcome:
              value === "Other"
                ? data.otherOutcome
                : "",
          })
        }
      />

      {data.outcome === "Other" && (
        <TextInput
          label="Describe the Outcome"
          value={data.otherOutcome}
          onChange={(value) =>
            update({
              otherOutcome: value,
            })
          }
          placeholder="Describe the immediate outcome"
        />
      )}

      <CheckboxGroup
        label="Follow-up Actions"
        values={data.followUpActions}
        options={followUpOptions}
        onToggle={toggleFollowUp}
      />

      {notesRecommended && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Add any relevant detail about serious injury,
          emergency action, hospital care or safeguarding
          consideration.
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

function SelectionCard({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-cyan-500 bg-cyan-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="text-2xl">{icon}</div>

      <div className="mt-2 text-sm font-semibold text-slate-900">
        {label}
      </div>
    </button>
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

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${
        checked
          ? "border-cyan-500 bg-cyan-50 text-cyan-700"
          : "border-slate-200 bg-white text-slate-700"
      }`}
    >
      <span>{label}</span>
      <span>{checked ? "✓" : ""}</span>
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
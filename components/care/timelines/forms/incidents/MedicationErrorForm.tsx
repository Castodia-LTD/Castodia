"use client";

import { useMemo, useState } from "react";

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

const errorTypeOptions = [
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
];

const healthImpactOptions = [
  "No Apparent Harm",
  "Minor Concern",
  "Moderate Concern",
  "Serious Concern",
  "Unknown",
];

const immediateActionOptions = [
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
];

const peopleInformedOptions = [
  "Manager",
  "On-call Manager",
  "GP",
  "Pharmacist",
  "NHS 111",
  "Emergency Services",
  "Family / Representative",
  "Prescriber",
  "Other",
];

const clinicalAdviceSourceOptions = [
  "GP",
  "Pharmacist",
  "NHS 111",
  "Prescriber",
  "Hospital",
  "Other",
];

const outcomeOptions = [
  "No Harm Identified",
  "Monitoring Continues",
  "Medication Administered Correctly",
  "Medication Withheld Following Advice",
  "Medication Replaced",
  "Medical Assessment Completed",
  "Transferred to Hospital",
  "Other",
];

const followUpOptions = [
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
];

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

export default function MedicationErrorForm({
  onChange,
}: Props) {
  const [data, setData] =
    useState<MedicationErrorData>(initialData);

  const impactDetailsRequired = useMemo(() => {
    return (
      data.healthImpact === "Minor Concern" ||
      data.healthImpact === "Moderate Concern" ||
      data.healthImpact === "Serious Concern" ||
      data.healthImpact === "Unknown"
    );
  }, [data.healthImpact]);

  const notesRecommended = useMemo(() => {
    return (
      data.healthImpact === "Serious Concern" ||
      data.immediateActions.includes("999 Contacted") ||
      data.outcome === "Transferred to Hospital" ||
      data.followUpActions.includes("Safeguarding Considered")
    );
  }, [
    data.healthImpact,
    data.immediateActions,
    data.outcome,
    data.followUpActions,
  ]);

  function update(
    changes: Partial<MedicationErrorData>
  ) {
    const next = {
      ...data,
      ...changes,
    };

    setData(next);
    onChange(next);
  }

  function toggleImmediateAction(value: string) {
    let next: string[];

    if (value === "No Immediate Action Required") {
      next = ["No Immediate Action Required"];
    } else {
      const withoutNone = data.immediateActions.filter(
        (item) => item !== "No Immediate Action Required"
      );

      next = withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
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
      ? data.peopleInformed.filter((item) => item !== value)
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
      ? data.followUpActions.filter((item) => item !== value)
      : [...data.followUpActions, value];

    update({
      followUpActions: next,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Medication Error
        </h3>

        <p className="text-sm text-slate-500">
          Record what happened, any immediate health impact,
          actions taken and the advice received.
        </p>
      </div>

      <SelectBlock
        label="Error Type"
        value={data.errorType}
        options={errorTypeOptions}
        onChange={(value) =>
          update({
            errorType: value,
            otherErrorType:
              value === "Other"
                ? data.otherErrorType
                : "",
          })
        }
      />

      {data.errorType === "Other" && (
        <TextInput
          label="Describe the Error Type"
          value={data.otherErrorType}
          onChange={(value) =>
            update({
              otherErrorType: value,
            })
          }
          placeholder="Describe the medication error"
        />
      )}

      <SectionCard title="💊 Medication Details">
        <TextInput
          label="Medication"
          value={data.medicationName}
          onChange={(value) =>
            update({
              medicationName: value,
            })
          }
          placeholder="Medication name"
        />

        <TextInput
          label="Prescribed Dose"
          value={data.prescribedDose}
          onChange={(value) =>
            update({
              prescribedDose: value,
            })
          }
          placeholder="For example, 10mg"
        />

        <TextInput
          label="Dose Affected"
          value={data.doseAffected}
          onChange={(value) =>
            update({
              doseAffected: value,
            })
          }
          placeholder="For example, one tablet or 5ml"
        />

        <div>
          <FieldLabel>Scheduled Time</FieldLabel>

          <input
            type="time"
            value={data.scheduledTime}
            onChange={(event) =>
              update({
                scheduledTime: event.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </div>
      </SectionCard>

      <div>
        <FieldLabel>
          Was the medication administered?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No"
            selected={
              data.medicationAdministered === false
            }
            onClick={() =>
              update({
                medicationAdministered: false,
                administrationDetails: "",
              })
            }
          />

          <OptionButton
            label="Yes"
            selected={
              data.medicationAdministered === true
            }
            onClick={() =>
              update({
                medicationAdministered: true,
              })
            }
          />
        </div>
      </div>

      {data.medicationAdministered === true && (
        <TextArea
          label="Administration Details"
          value={data.administrationDetails}
          onChange={(value) =>
            update({
              administrationDetails: value,
            })
          }
          placeholder="Record what was administered, when and how..."
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
        placeholder="Record the factual sequence of events. Avoid assumptions or blame..."
        rows={5}
      />

      <SelectBlock
        label="Immediate Health Impact"
        value={data.healthImpact}
        options={healthImpactOptions}
        onChange={(value) =>
          update({
            healthImpact: value,
            impactDetails:
              value === "No Apparent Harm"
                ? ""
                : data.impactDetails,
          })
        }
      />

      {impactDetailsRequired && (
        <TextArea
          label="Health Impact Details"
          value={data.impactDetails}
          onChange={(value) =>
            update({
              impactDetails: value,
            })
          }
          placeholder="Describe any symptoms, concerns or observed changes..."
          rows={4}
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
          Was clinical advice sought?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No"
            selected={
              data.clinicalAdviceSought === false
            }
            onClick={() =>
              update({
                clinicalAdviceSought: false,
                clinicalAdviceSource: "",
                adviceReceived: "",
              })
            }
          />

          <OptionButton
            label="Yes"
            selected={
              data.clinicalAdviceSought === true
            }
            onClick={() =>
              update({
                clinicalAdviceSought: true,
              })
            }
          />
        </div>
      </div>

      {data.clinicalAdviceSought === true && (
        <SectionCard title="🩺 Clinical Advice">
          <SelectBlock
            label="Advice Sought From"
            value={data.clinicalAdviceSource}
            options={clinicalAdviceSourceOptions}
            onChange={(value) =>
              update({
                clinicalAdviceSource: value,
              })
            }
          />

          <TextArea
            label="Advice Received"
            value={data.adviceReceived}
            onChange={(value) =>
              update({
                adviceReceived: value,
              })
            }
            placeholder="Record the advice provided and any instructions..."
            rows={4}
          />
        </SectionCard>
      )}

      <div>
        <FieldLabel>
          Is monitoring required?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No"
            selected={
              data.monitoringRequired === false
            }
            onClick={() =>
              update({
                monitoringRequired: false,
                monitoringInstructions: "",
              })
            }
          />

          <OptionButton
            label="Yes"
            selected={
              data.monitoringRequired === true
            }
            onClick={() =>
              update({
                monitoringRequired: true,
              })
            }
          />
        </div>
      </div>

      {data.monitoringRequired === true && (
        <TextArea
          label="Monitoring Instructions"
          value={data.monitoringInstructions}
          onChange={(value) =>
            update({
              monitoringInstructions: value,
            })
          }
          placeholder="Record what should be monitored, how often and for how long..."
          rows={4}
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
          Add relevant detail for serious concerns, emergency
          action, hospital transfer or safeguarding consideration.
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
"use client";

import { useMemo, useState } from "react";

type Props = {
  onChange: (data: HealthProfessionalData) => void;
};

export type HealthProfessionalData = {
  contactUrgency: string;
  professionalType: string;
  otherProfessionalType: string;
  professionalName: string;
  contactMethod: string;
  otherContactMethod: string;
  reason: string;
  outcome: string;
  actionsRequired: string[];
  otherAction: string;
  followUpRequired: boolean | null;
  followUpDate: string;
  documentsReceived: string[];
  otherDocument: string;
  notes: string;
};

const contactUrgencyOptions = [
  {
    value: "Planned Appointment",
    label: "Planned Appointment",
    icon: "📅",
  },
  {
    value: "Routine Contact",
    label: "Routine Contact",
    icon: "📞",
  },
  {
    value: "Urgent Contact",
    label: "Urgent Contact",
    icon: "⚠️",
  },
  {
    value: "Emergency Attendance",
    label: "Emergency Attendance",
    icon: "🚑",
  },
];

const professionalOptions = [
  { value: "GP", label: "GP", icon: "🩺" },
  {
    value: "Hospital Doctor",
    label: "Hospital Doctor",
    icon: "🏥",
  },
  {
    value: "District Nurse",
    label: "District Nurse",
    icon: "👩‍⚕️",
  },
  {
    value: "Pharmacist",
    label: "Pharmacist",
    icon: "💊",
  },
  {
    value: "Mental Health Team",
    label: "Mental Health Team",
    icon: "🧠",
  },
  {
    value: "Speech & Language Therapist",
    label: "Speech & Language Therapist",
    icon: "🗣",
  },
  {
    value: "Physiotherapist",
    label: "Physiotherapist",
    icon: "🦴",
  },
  {
    value: "Occupational Therapist",
    label: "Occupational Therapist",
    icon: "🏡",
  },
  {
    value: "Dentist",
    label: "Dentist",
    icon: "🦷",
  },
  {
    value: "Optician",
    label: "Optician",
    icon: "👁",
  },
  {
    value: "Paramedic",
    label: "Paramedic",
    icon: "🚑",
  },
  {
    value: "Other",
    label: "Other",
    icon: "➕",
  },
];

const contactMethodOptions = [
  "Telephone",
  "Home Visit",
  "Clinic Appointment",
  "Hospital Appointment",
  "Video Consultation",
  "Email",
  "Other",
];

const actionOptions = [
  "No Further Action",
  "Continue Monitoring",
  "Follow Care Plan",
  "Medication Changed",
  "GP Follow-up",
  "Hospital Follow-up",
  "Family Informed",
  "Manager Informed",
  "Staff Updated",
  "Care Plan Updated",
  "Risk Assessment Updated",
  "Other",
];

const documentOptions = [
  "None",
  "Prescription",
  "Clinic Letter",
  "Discharge Summary",
  "Care Plan",
  "Assessment Report",
  "Other",
];

const initialData: HealthProfessionalData = {
  contactUrgency: "",
  professionalType: "",
  otherProfessionalType: "",
  professionalName: "",
  contactMethod: "",
  otherContactMethod: "",
  reason: "",
  outcome: "",
  actionsRequired: ["No Further Action"],
  otherAction: "",
  followUpRequired: null,
  followUpDate: "",
  documentsReceived: ["None"],
  otherDocument: "",
  notes: "",
};

export default function HealthProfessionalForm({ onChange }: Props) {
  const [data, setData] =
    useState<HealthProfessionalData>(initialData);

  const notesRecommended = useMemo(() => {
    return (
      data.followUpRequired === true ||
      data.documentsReceived.some(
        (document) => document !== "None"
      ) ||
      data.actionsRequired.includes("Other") ||
      data.professionalType === "Other" ||
      data.contactMethod === "Other"
    );

  }, [data]);

  function update(changes: Partial<HealthProfessionalData>) {
  const next = {
    ...data,
    ...changes,
  };

  setData(next);
  onChange(next);
}

  function toggleAction(value: string) {
    let next: string[];

    if (value === "No Further Action") {
      next = ["No Further Action"];
    } else {
      const withoutNoAction =
        data.actionsRequired.filter(
          (action) => action !== "No Further Action"
        );

      next = withoutNoAction.includes(value)
        ? withoutNoAction.filter(
            (action) => action !== value
          )
        : [...withoutNoAction, value];

      if (next.length === 0) {
        next = ["No Further Action"];
      }
    }

    update({
      actionsRequired: next,
      otherAction: next.includes("Other")
        ? data.otherAction
        : "",
    });
  }

  function toggleDocument(value: string) {
    let next: string[];

    if (value === "None") {
      next = ["None"];
    } else {
      const withoutNone =
        data.documentsReceived.filter(
          (document) => document !== "None"
        );

      next = withoutNone.includes(value)
        ? withoutNone.filter(
            (document) => document !== value
          )
        : [...withoutNone, value];

      if (next.length === 0) {
        next = ["None"];
      }
    }

    update({
      documentsReceived: next,
      otherDocument: next.includes("Other")
        ? data.otherDocument
        : "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Health Professional
        </h3>

        <p className="text-sm text-slate-500">
          Record contact with a healthcare professional
          and any advice, treatment or actions resulting
          from the interaction.
        </p>
      </div>

      <div>
        <FieldLabel>
          What type of contact was this?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          {contactUrgencyOptions.map((option) => (
            <SelectionCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={
                data.contactUrgency === option.value
              }
              onClick={() =>
                update({
                  contactUrgency: option.value,
                })
              }
            />
          ))}
        </div>
      </div>

      <div>
        <FieldLabel>
          Which professional was involved?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          {professionalOptions.map((option) => (
            <SelectionCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={
                data.professionalType === option.value
              }
              onClick={() =>
                update({
                  professionalType: option.value,
                  otherProfessionalType:
                    option.value === "Other"
                      ? data.otherProfessionalType
                      : "",
                })
              }
            />
          ))}
        </div>
      </div>

      {data.professionalType === "Other" && (
        <SectionCard title="➕ Other Professional">
          <TextInput
            label="Professional Type"
            value={data.otherProfessionalType}
            onChange={(value) =>
              update({
                otherProfessionalType: value,
              })
            }
            placeholder="For example, podiatrist"
          />
        </SectionCard>
      )}

      {data.professionalType && (
        <TextInput
          label="Professional Name (optional)"
          value={data.professionalName}
          onChange={(value) =>
            update({ professionalName: value })
          }
          placeholder="For example, Dr Patel"
        />
      )}

      <SelectBlock
        label="How did the contact take place?"
        value={data.contactMethod}
        options={contactMethodOptions}
        onChange={(value) =>
          update({
            contactMethod: value,
            otherContactMethod:
              value === "Other"
                ? data.otherContactMethod
                : "",
          })
        }
      />

      {data.contactMethod === "Other" && (
        <TextInput
          label="Describe the Contact Method"
          value={data.otherContactMethod}
          onChange={(value) =>
            update({
              otherContactMethod: value,
            })
          }
          placeholder="Describe how the contact took place"
        />
      )}

      <TextArea
        label="Reason for Contact or Appointment"
        value={data.reason}
        onChange={(value) =>
          update({ reason: value })
        }
        placeholder="For example, medication review, annual health check or assessment following a fall..."
        rows={4}
      />

      <TextArea
        label="Advice, Assessment or Outcome"
        value={data.outcome}
        onChange={(value) =>
          update({ outcome: value })
        }
        placeholder="Record the advice given, assessment completed, treatment provided or outcome of the contact..."
        rows={5}
      />

      <CheckboxGroup
        label="Actions Required"
        values={data.actionsRequired}
        options={actionOptions}
        onToggle={toggleAction}
      />

      {data.actionsRequired.includes("Other") && (
        <TextArea
          label="Describe the Other Action"
          value={data.otherAction}
          onChange={(value) =>
            update({ otherAction: value })
          }
          placeholder="Describe the action required..."
          rows={3}
        />
      )}

      <div>
        <FieldLabel>
          Is follow-up required?
        </FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          <OptionButton
            label="No"
            selected={
              data.followUpRequired === false
            }
            onClick={() =>
              update({
                followUpRequired: false,
                followUpDate: "",
              })
            }
          />

          <OptionButton
            label="Yes"
            selected={
              data.followUpRequired === true
            }
            onClick={() =>
              update({
                followUpRequired: true,
              })
            }
          />
        </div>
      </div>

      {data.followUpRequired === true && (
        <div>
          <FieldLabel>Follow-up Date</FieldLabel>

          <input
            type="date"
            value={data.followUpDate}
            onChange={(event) =>
              update({
                followUpDate: event.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
          />
        </div>
      )}

      <CheckboxGroup
        label="Documents Received"
        values={data.documentsReceived}
        options={documentOptions}
        onToggle={toggleDocument}
      />

      {data.documentsReceived.includes("Other") && (
        <TextInput
          label="Describe the Document"
          value={data.otherDocument}
          onChange={(value) =>
            update({ otherDocument: value })
          }
          placeholder="Enter the document type"
        />
      )}

      {notesRecommended && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Add any relevant details needed to explain
          follow-up, documents or additional actions.
        </div>
      )}

      <TextArea
        label="Notes"
        value={data.notes}
        onChange={(value) =>
          update({ notes: value })
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
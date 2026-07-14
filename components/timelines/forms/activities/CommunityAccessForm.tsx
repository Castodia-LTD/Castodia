"use client";

import { useMemo, useState } from "react";

type Props = {
  onChange: (data: CommunityAccessData) => void;
};

export type CommunityAccessData = {
  communityType: string;
  otherCommunityType: string;
  placeOrGroupName: string;
  purpose: string[];
  otherPurpose: string;
  attendanceStatus: string;
  participationLevel: string;
  supportProvided: string[];
  otherSupport: string;
  outcome: string[];
  otherOutcome: string;
  notes: string;
};

const communityTypeOptions = [
  { value: "Education", label: "Education", icon: "📚" },
  {
    value: "Employment / Volunteering",
    label: "Employment / Volunteering",
    icon: "💼",
  },
  {
    value: "Club or Group",
    label: "Club or Group",
    icon: "🎨",
  },
  {
    value: "Sports / Leisure",
    label: "Sports / Leisure",
    icon: "⚽",
  },
  {
    value: "Faith / Religious",
    label: "Faith / Religious",
    icon: "⛪",
  },
  {
    value: "Community Event",
    label: "Community Event",
    icon: "🎭",
  },
  {
    value: "Day Service",
    label: "Day Service",
    icon: "🏛",
  },
  {
    value: "Public Community Space",
    label: "Public Community Space",
    icon: "🌳",
  },
  {
    value: "Other",
    label: "Other",
    icon: "➕",
  },
];

const purposeOptions = [
  "Learning",
  "Social Inclusion",
  "Exercise",
  "Independence",
  "Employment Skills",
  "Volunteering",
  "Recreation",
  "Faith / Worship",
  "Other",
];

const attendanceOptions = [
  "Attended as Planned",
  "Attended Late",
  "Left Early",
  "Cancelled",
  "Declined",
  "Unable to Attend",
];

const participationOptions = [
  "Fully Participated",
  "Participated with Prompting",
  "Participated with Support",
  "Observed Only",
  "Declined to Participate",
  "Unable to Participate",
];

const supportOptions = [
  "No Support Required",
  "Verbal Prompting",
  "Physical Support",
  "Emotional Reassurance",
  "Communication Support",
  "Transport Support",
  "Personal Care Support",
  "Financial Support",
  "Other",
];

const outcomeOptions = [
  "Enjoyed the Session",
  "Achieved Planned Outcome",
  "Developed Skills",
  "Socialised with Others",
  "Increased Independence",
  "Became Anxious",
  "Became Distressed",
  "Left Early",
  "No Clear Outcome",
  "Other",
];

const initialData: CommunityAccessData = {
  communityType: "",
  otherCommunityType: "",
  placeOrGroupName: "",
  purpose: [],
  otherPurpose: "",
  attendanceStatus: "",
  participationLevel: "",
  supportProvided: ["No Support Required"],
  otherSupport: "",
  outcome: [],
  otherOutcome: "",
  notes: "",
};

export default function CommunityAccessForm({ onChange }: Props) {
  const [data, setData] = useState<CommunityAccessData>(initialData);

  const notesRecommended = useMemo(() => {
    return (
      data.attendanceStatus === "Left Early" ||
      data.attendanceStatus === "Cancelled" ||
      data.attendanceStatus === "Declined" ||
      data.attendanceStatus === "Unable to Attend" ||
      data.participationLevel === "Declined to Participate" ||
      data.participationLevel === "Unable to Participate" ||
      data.outcome.includes("Became Anxious") ||
      data.outcome.includes("Became Distressed") ||
      data.communityType === "Other" ||
      data.purpose.includes("Other") ||
      data.supportProvided.includes("Other") ||
      data.outcome.includes("Other")
    );
  }, [data]);

  function update(changes: Partial<CommunityAccessData>) {
    const next = {
      ...data,
      ...changes,
    };

    setData(next);
    onChange(next);
  }

  function togglePurpose(value: string) {
    const next = data.purpose.includes(value)
      ? data.purpose.filter((item) => item !== value)
      : [...data.purpose, value];

    update({
      purpose: next,
      otherPurpose: next.includes("Other") ? data.otherPurpose : "",
    });
  }

  function toggleSupport(value: string) {
    let next: string[];

    if (value === "No Support Required") {
      next = ["No Support Required"];
    } else {
      const withoutNone = data.supportProvided.filter(
        (item) => item !== "No Support Required"
      );

      next = withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : [...withoutNone, value];

      if (next.length === 0) {
        next = ["No Support Required"];
      }
    }

    update({
      supportProvided: next,
      otherSupport: next.includes("Other") ? data.otherSupport : "",
    });
  }

  function toggleOutcome(value: string) {
    const next = data.outcome.includes(value)
      ? data.outcome.filter((item) => item !== value)
      : [...data.outcome, value];

    update({
      outcome: next,
      otherOutcome: next.includes("Other") ? data.otherOutcome : "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Community Access
        </h3>

        <p className="text-sm text-slate-500">
          Record participation in education, employment, clubs, groups and
          wider community life.
        </p>
      </div>

      <div>
        <FieldLabel>What type of community access was this?</FieldLabel>

        <div className="grid grid-cols-2 gap-3">
          {communityTypeOptions.map((option) => (
            <SelectionCard
              key={option.value}
              label={option.label}
              icon={option.icon}
              selected={data.communityType === option.value}
              onClick={() =>
                update({
                  communityType: option.value,
                  otherCommunityType:
                    option.value === "Other"
                      ? data.otherCommunityType
                      : "",
                })
              }
            />
          ))}
        </div>
      </div>

      {data.communityType === "Other" && (
        <TextInput
          label="Community Type"
          value={data.otherCommunityType}
          onChange={(value) =>
            update({
              otherCommunityType: value,
            })
          }
          placeholder="Describe the type of community access"
        />
      )}

      <TextInput
        label="Place, Service or Group Name"
        value={data.placeOrGroupName}
        onChange={(value) =>
          update({
            placeOrGroupName: value,
          })
        }
        placeholder="For example, college, football club or local library"
      />

      <CheckboxGroup
        label="Purpose"
        values={data.purpose}
        options={purposeOptions}
        onToggle={togglePurpose}
      />

      {data.purpose.includes("Other") && (
        <TextInput
          label="Describe the Purpose"
          value={data.otherPurpose}
          onChange={(value) =>
            update({
              otherPurpose: value,
            })
          }
          placeholder="Describe the purpose"
        />
      )}

      <SelectBlock
        label="Attendance"
        value={data.attendanceStatus}
        options={attendanceOptions}
        onChange={(value) =>
          update({
            attendanceStatus: value,
          })
        }
      />

      <SelectBlock
        label="Participation Level"
        value={data.participationLevel}
        options={participationOptions}
        onChange={(value) =>
          update({
            participationLevel: value,
          })
        }
      />

      <CheckboxGroup
        label="Support Provided"
        values={data.supportProvided}
        options={supportOptions}
        onToggle={toggleSupport}
      />

      {data.supportProvided.includes("Other") && (
        <TextInput
          label="Describe the Support"
          value={data.otherSupport}
          onChange={(value) =>
            update({
              otherSupport: value,
            })
          }
          placeholder="Describe the support provided"
        />
      )}

      <CheckboxGroup
        label="Outcome"
        values={data.outcome}
        options={outcomeOptions}
        onToggle={toggleOutcome}
      />

      {data.outcome.includes("Other") && (
        <TextInput
          label="Describe the Outcome"
          value={data.otherOutcome}
          onChange={(value) =>
            update({
              otherOutcome: value,
            })
          }
          placeholder="Describe the outcome"
        />
      )}

      {notesRecommended && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Add relevant detail when attendance, participation or outcomes did
          not go as planned.
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
        onChange={(event) => onChange(event.target.value)}
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
        onChange={(event) => onChange(event.target.value)}
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
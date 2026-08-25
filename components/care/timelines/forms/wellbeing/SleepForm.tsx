"use client";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

type Props = {
  serviceUserName?: string;

  sleepStatus: string;
  setSleepStatus: (value: string) => void;

  sleepNotes: string;
  setSleepNotes: (value: string) => void;
};

const sleepStatusOptions = [
  {
    value: "Asleep",
    label: "Asleep",
    description: "The person was observed sleeping.",
  },
  {
    value: "Awake",
    label: "Awake",
    description: "The person was awake at the time of observation.",
  },
];

export default function SleepForm({
  serviceUserName = "",
  sleepStatus,
  setSleepStatus,
  sleepNotes,
  setSleepNotes,
}: Props) {
  const initials = getInitials(serviceUserName);

  const observationSummary =
    sleepStatus === "Asleep"
      ? `${initials} appeared asleep.`
      : sleepStatus === "Awake"
        ? `${initials} appeared awake.`
        : "";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-600">
          Daily observation
        </p>

        <h3 className="mt-1 text-xl font-semibold text-slate-950">
          Sleep
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Record whether the person appeared asleep or awake and add any
          relevant observations.
        </p>
      </div>

      <FormSection
        title="Sleep status"
        description="Choose the person's observed sleep state."
      >
        <FormChoiceGroup
          label="Current status"
          value={sleepStatus}
          options={sleepStatusOptions}
          onChange={setSleepStatus}
          columns={2}
          required
        />

        {sleepStatus && (
          <FormAlert
            variant="success"
            title="Observation recorded"
          >
            {observationSummary}
          </FormAlert>
        )}
      </FormSection>

      {sleepStatus && (
        <FormSection
          title="Observation"
          description={
            sleepStatus === "Asleep"
              ? "Add any useful information about the person's sleep."
              : "Add any useful information about the person's wakefulness."
          }
        >
          <FormField
            label="Notes"
            description={
              sleepStatus === "Asleep"
                ? "For example: settled, restless, disturbed, repositioned or checks completed."
                : "For example: settled in bed, watching television, walking around or requesting support."
            }
            htmlFor="sleep-notes"
          >
            <FormTextarea
              id="sleep-notes"
              value={sleepNotes}
              onChange={(event) =>
                setSleepNotes(event.target.value)
              }
              rows={4}
              placeholder={
                sleepStatus === "Asleep"
                  ? "Add any relevant sleep observations..."
                  : "Add any relevant observations while awake..."
              }
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "Client";
}
"use client";

import { useMemo, useState } from "react";

import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormMultiSelect,
  FormSection,
  FormTextarea,
} from "@/components/care/timelines/forms/shared";

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
  "Education",
  "Employment / Volunteering",
  "Club or Group",
  "Sports / Leisure",
  "Faith / Religious",
  "Community Event",
  "Day Service",
  "Public Community Space",
  "Other",
].map((value) => ({ value, label: value }));

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
].map((value) => ({ value, label: value }));

const attendanceOptions = [
  "Attended as Planned",
  "Attended Late",
  "Left Early",
  "Cancelled",
  "Declined",
  "Unable to Attend",
].map((value) => ({ value, label: value }));

const participationOptions = [
  "Fully Participated",
  "Participated with Prompting",
  "Participated with Support",
  "Observed Only",
  "Declined to Participate",
  "Unable to Participate",
].map((value) => ({ value, label: value }));

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
].map((value) => ({ value, label: value }));

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
].map((value) => ({ value, label: value }));

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

  const attendanceNeedsContext = [
    "Left Early",
    "Cancelled",
    "Declined",
    "Unable to Attend",
  ].includes(data.attendanceStatus);

  const participationNeedsContext = [
    "Declined to Participate",
    "Unable to Participate",
  ].includes(data.participationLevel);

  const outcomeNeedsContext =
    data.outcome.includes("Became Anxious") ||
    data.outcome.includes("Became Distressed") ||
    data.outcome.includes("Other");

  const notesRecommended = useMemo(
    () => attendanceNeedsContext || participationNeedsContext || outcomeNeedsContext,
    [attendanceNeedsContext, participationNeedsContext, outcomeNeedsContext],
  );

  function update(changes: Partial<CommunityAccessData>) {
    const next = { ...data, ...changes };
    setData(next);
    onChange(next);
  }

  function updateSupport(next: string[]) {
    let normalized = next;

    if (normalized.includes("No Support Required") && normalized.length > 1) {
      normalized = normalized.filter((item) => item !== "No Support Required");
    }

    if (normalized.length === 0) normalized = ["No Support Required"];

    update({
      supportProvided: normalized,
      otherSupport: normalized.includes("Other") ? data.otherSupport : "",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-950">Community Access</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Record participation in education, work, groups and wider community life.
        </p>
      </div>

      <FormSection
        title="Where and why"
        description="Start with the type of community activity and its purpose."
      >
        <FormChoiceGroup
          label="Type of community access"
          value={data.communityType}
          options={communityTypeOptions}
          onChange={(value) =>
            update({
              communityType: value,
              otherCommunityType: value === "Other" ? data.otherCommunityType : "",
            })
          }
          columns={2}
          required
        />

        {data.communityType === "Other" && (
          <FormField label="Describe the community activity" required>
            <FormInput
              value={data.otherCommunityType}
              onChange={(event) => update({ otherCommunityType: event.target.value })}
              placeholder="Describe the type of community access"
            />
          </FormField>
        )}

        {data.communityType && (
          <FormField label="Place, service or group" required>
            <FormInput
              value={data.placeOrGroupName}
              onChange={(event) => update({ placeOrGroupName: event.target.value })}
              placeholder="For example, college, football club or local library"
            />
          </FormField>
        )}

        {data.placeOrGroupName.trim() && (
          <FormMultiSelect
            label="Purpose"
            description="Select the reasons that best describe this activity."
            value={data.purpose}
            options={purposeOptions}
            onChange={(next) =>
              update({
                purpose: next,
                otherPurpose: next.includes("Other") ? data.otherPurpose : "",
              })
            }
            columns={2}
            required
          />
        )}

        {data.purpose.includes("Other") && (
          <FormField label="Other purpose" required>
            <FormInput
              value={data.otherPurpose}
              onChange={(event) => update({ otherPurpose: event.target.value })}
              placeholder="Describe the purpose"
            />
          </FormField>
        )}
      </FormSection>

      {data.purpose.length > 0 && (
        <FormSection
          title="Attendance and participation"
          description="Record what actually happened, not just what was planned."
        >
          <FormChoiceGroup
            label="Attendance"
            value={data.attendanceStatus}
            options={attendanceOptions}
            onChange={(value) => update({ attendanceStatus: value })}
            columns={2}
            required
          />

          {data.attendanceStatus &&
            !["Cancelled", "Unable to Attend"].includes(data.attendanceStatus) && (
              <FormChoiceGroup
                label="Participation level"
                value={data.participationLevel}
                options={participationOptions}
                onChange={(value) => update({ participationLevel: value })}
                columns={2}
                required
              />
            )}

          {["Cancelled", "Unable to Attend"].includes(data.attendanceStatus) &&
            !data.participationLevel && (
              <FormAlert variant="info" title="Participation not applicable">
                Because the activity did not take place, participation does not need to be scored.
              </FormAlert>
            )}
        </FormSection>
      )}

      {data.attendanceStatus && (
        <FormSection
          title="Support and outcome"
          description="Capture the support used and the meaningful outcome."
        >
          <FormMultiSelect
            label="Support provided"
            value={data.supportProvided}
            options={supportOptions}
            onChange={updateSupport}
            columns={2}
          />

          {data.supportProvided.includes("Other") && (
            <FormField label="Describe the support" required>
              <FormInput
                value={data.otherSupport}
                onChange={(event) => update({ otherSupport: event.target.value })}
                placeholder="Describe the support provided"
              />
            </FormField>
          )}

          <FormMultiSelect
            label="Outcome"
            value={data.outcome}
            options={outcomeOptions}
            onChange={(next) =>
              update({
                outcome: next,
                otherOutcome: next.includes("Other") ? data.otherOutcome : "",
              })
            }
            columns={2}
            required
          />

          {data.outcome.includes("Other") && (
            <FormField label="Describe the outcome" required>
              <FormInput
                value={data.otherOutcome}
                onChange={(event) => update({ otherOutcome: event.target.value })}
                placeholder="Describe the outcome"
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.outcome.length > 0 && (
        <FormSection
          title="Additional context"
          description="Only add narrative when it adds useful context."
          collapsible={!notesRecommended}
          defaultOpen={notesRecommended}
          summary={data.notes.trim() || "No additional context added"}
        >
          {notesRecommended && (
            <FormAlert variant="warning" title="Context recommended">
              Add relevant detail where attendance, participation or outcomes did not go as planned.
            </FormAlert>
          )}

          <FormField label={notesRecommended ? "Tell us more" : "Notes"}>
            <FormTextarea
              value={data.notes}
              onChange={(event) => update({ notes: event.target.value })}
              rows={4}
              placeholder="Optional additional information..."
            />
          </FormField>
        </FormSection>
      )}
    </div>
  );
}

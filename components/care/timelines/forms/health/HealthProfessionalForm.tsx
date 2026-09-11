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
  FormYesNo,
} from "@/components/care/timelines/forms/shared";

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

type Props = {
  onChange: (data: HealthProfessionalData) => void;
};

const contactUrgencyOptions = [
  "Planned Appointment",
  "Routine Contact",
  "Urgent Contact",
  "Emergency Attendance",
].map((value) => ({ value, label: value }));

const professionalOptions = [
  "GP",
  "Hospital Doctor",
  "District Nurse",
  "Pharmacist",
  "Mental Health Team",
  "Speech & Language Therapist",
  "Physiotherapist",
  "Occupational Therapist",
  "Dentist",
  "Optician",
  "Paramedic",
  "Other",
].map((value) => ({ value, label: value }));

const contactMethodOptions = [
  "Telephone",
  "Home Visit",
  "Clinic Appointment",
  "Hospital Appointment",
  "Video Consultation",
  "Email",
  "Other",
].map((value) => ({ value, label: value }));

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
].map((value) => ({ value, label: value }));

const documentOptions = [
  "None",
  "Prescription",
  "Clinic Letter",
  "Discharge Summary",
  "Care Plan",
  "Assessment Report",
  "Other",
].map((value) => ({ value, label: value }));

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
  const [data, setData] = useState<HealthProfessionalData>(initialData);

  const notesRecommended = useMemo(
    () =>
      data.followUpRequired === true ||
      data.documentsReceived.some((document) => document !== "None") ||
      data.actionsRequired.includes("Other") ||
      data.professionalType === "Other" ||
      data.contactMethod === "Other",
    [data],
  );

  function update(changes: Partial<HealthProfessionalData>) {
    const next = { ...data, ...changes };
    setData(next);
    onChange(next);
  }

  function setActions(next: string[]) {
    let normalized = next;

    if (normalized.includes("No Further Action") && normalized.length > 1) {
      normalized = normalized.filter((item) => item !== "No Further Action");
    }

    if (normalized.length === 0) normalized = ["No Further Action"];

    update({
      actionsRequired: normalized,
      otherAction: normalized.includes("Other") ? data.otherAction : "",
    });
  }

  function setDocuments(next: string[]) {
    let normalized = next;

    if (normalized.includes("None") && normalized.length > 1) {
      normalized = normalized.filter((item) => item !== "None");
    }

    if (normalized.length === 0) normalized = ["None"];

    update({
      documentsReceived: normalized,
      otherDocument: normalized.includes("Other") ? data.otherDocument : "",
    });
  }

  return (
    <div className="space-y-5">
      <FormSection
        title="Contact details"
        description="Record the type of contact and the healthcare professional involved."
      >
        <FormChoiceGroup
          label="Contact type"
          value={data.contactUrgency}
          options={contactUrgencyOptions}
          onChange={(value) => update({ contactUrgency: value })}
          required
        />

        {data.contactUrgency && (
          <FormChoiceGroup
            label="Professional"
            value={data.professionalType}
            options={professionalOptions}
            onChange={(value) =>
              update({
                professionalType: value,
                otherProfessionalType:
                  value === "Other" ? data.otherProfessionalType : "",
              })
            }
            required
          />
        )}

        {data.professionalType === "Other" && (
          <FormField label="Professional type" required>
            <FormInput
              value={data.otherProfessionalType}
              onChange={(event) => update({ otherProfessionalType: event.target.value })}
              placeholder="For example, podiatrist"
            />
          </FormField>
        )}

        {data.professionalType && (
          <FormField label="Professional name" description="Optional if not known.">
            <FormInput
              value={data.professionalName}
              onChange={(event) => update({ professionalName: event.target.value })}
              placeholder="For example, Dr Patel"
            />
          </FormField>
        )}

        {data.professionalType && (
          <FormChoiceGroup
            label="Contact method"
            value={data.contactMethod}
            options={contactMethodOptions}
            onChange={(value) =>
              update({
                contactMethod: value,
                otherContactMethod:
                  value === "Other" ? data.otherContactMethod : "",
              })
            }
            required
          />
        )}

        {data.contactMethod === "Other" && (
          <FormField label="Describe the contact method" required>
            <FormInput
              value={data.otherContactMethod}
              onChange={(event) => update({ otherContactMethod: event.target.value })}
              placeholder="Describe how the contact took place"
            />
          </FormField>
        )}
      </FormSection>

      {data.contactMethod && (
        <FormSection
          title="Reason and outcome"
          description="Record why contact took place and what was advised, assessed or decided."
        >
          <FormField label="Reason for contact or appointment" required>
            <FormTextarea
              value={data.reason}
              onChange={(event) => update({ reason: event.target.value })}
              rows={4}
              placeholder="For example, medication review or assessment following a fall..."
            />
          </FormField>

          {data.reason.trim() && (
            <FormField label="Advice, assessment or outcome" required>
              <FormTextarea
                value={data.outcome}
                onChange={(event) => update({ outcome: event.target.value })}
                rows={5}
                placeholder="Record the advice, treatment, assessment or outcome..."
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.outcome.trim() && (
        <FormSection
          title="Actions and follow-up"
          description="Record any actions required and whether follow-up is needed."
        >
          <FormMultiSelect
            label="Actions required"
            value={data.actionsRequired}
            options={actionOptions}
            onChange={setActions}
            columns={2}
            required
          />

          {data.actionsRequired.includes("Other") && (
            <FormField label="Other action" required>
              <FormTextarea
                value={data.otherAction}
                onChange={(event) => update({ otherAction: event.target.value })}
                rows={3}
                placeholder="Describe the action required..."
              />
            </FormField>
          )}

          <FormYesNo
            label="Is follow-up required?"
            value={data.followUpRequired}
            onChange={(value) =>
              update({
                followUpRequired: value,
                followUpDate: value ? data.followUpDate : "",
              })
            }
            required
          />

          {data.followUpRequired === true && (
            <FormField label="Follow-up date" required>
              <FormInput
                type="date"
                value={data.followUpDate}
                onChange={(event) => update({ followUpDate: event.target.value })}
              />
            </FormField>
          )}
        </FormSection>
      )}

      {data.followUpRequired !== null && (
        <FormSection
          title="Documents and notes"
          description="Record any documents received and add optional context where useful."
          collapsible={!notesRecommended}
          defaultOpen={notesRecommended}
          summary={
            !notesRecommended && data.documentsReceived.includes("None")
              ? "No documents received"
              : undefined
          }
        >
          <FormMultiSelect
            label="Documents received"
            value={data.documentsReceived}
            options={documentOptions}
            onChange={setDocuments}
            columns={2}
            required
          />

          {data.documentsReceived.includes("Other") && (
            <FormField label="Describe the document" required>
              <FormInput
                value={data.otherDocument}
                onChange={(event) => update({ otherDocument: event.target.value })}
                placeholder="Enter the document type"
              />
            </FormField>
          )}

          {notesRecommended && (
            <FormAlert variant="info" title="Useful context">
              Add any information needed to explain follow-up, documents or additional actions.
            </FormAlert>
          )}

          <FormField label="Notes">
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

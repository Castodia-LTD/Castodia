"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { CastodiaButton } from "@/components/castodia";
import {
  FormAlert,
  FormChoiceGroup,
  FormField,
  FormInput,
  FormSection,
  FormTextarea,
  FormYesNo,
} from "@/components/care/timelines/forms/shared";
import { createMentalCapacityAssessment } from "@/lib/care/mental-capacity/api";
import {
  createEmptyMentalCapacityAssessment,
  type CapacityAbility,
  type CapacityOutcome,
  type MentalCapacityAssessmentInput,
} from "@/lib/care/mental-capacity/types";

type Props = {
  serviceUserId: string;
};

const abilityOptions = [
  { value: "demonstrated", label: "Demonstrated" },
  { value: "not_demonstrated", label: "Not demonstrated" },
  { value: "unclear", label: "Unclear" },
] satisfies { value: CapacityAbility; label: string }[];

const outcomeOptions = [
  {
    value: "has_capacity",
    label: "Has capacity",
    description: "The person can make this specific decision at this time.",
  },
  {
    value: "lacks_capacity",
    label: "Lacks capacity",
    description: "The statutory test supports this human conclusion.",
  },
  {
    value: "inconclusive",
    label: "Inconclusive",
    description: "More information, support or assessment is needed.",
  },
] satisfies { value: CapacityOutcome; label: string; description: string }[];

type EvidenceKey = "understand" | "retain" | "useOrWeigh" | "communicate";

type EvidenceFieldProps = {
  field: EvidenceKey;
  title: string;
  description: string;
  evidence: MentalCapacityAssessmentInput["data"][EvidenceKey];
  onChange: (
    field: EvidenceKey,
    evidenceField: "result" | "evidence",
    value: string,
  ) => void;
};

function EvidenceField({
  field,
  title,
  description,
  evidence,
  onChange,
}: EvidenceFieldProps) {
  const evidenceId = `${field}-evidence`;

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <FormChoiceGroup<CapacityAbility>
        label={title}
        description={description}
        value={evidence.result}
        options={abilityOptions}
        columns={3}
        required
        onChange={(value) => onChange(field, "result", value)}
      />
      <FormField label="Evidence and examples" htmlFor={evidenceId} required>
        <FormTextarea
          id={evidenceId}
          value={evidence.evidence}
          required
          onChange={(event) => onChange(field, "evidence", event.target.value)}
          placeholder="Record what the person said or did, the questions used, and any relevant observations."
        />
      </FormField>
    </div>
  );
}

export function MentalCapacityForm({ serviceUserId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(() =>
    createEmptyMentalCapacityAssessment(serviceUserId),
  );
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function setTopLevel<K extends keyof MentalCapacityAssessmentInput>(
    key: K,
    value: MentalCapacityAssessmentInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setData<K extends keyof MentalCapacityAssessmentInput["data"]>(
    key: K,
    value: MentalCapacityAssessmentInput["data"][K],
  ) {
    setForm((current) => ({
      ...current,
      data: { ...current.data, [key]: value },
    }));
  }

  function setEvidence(
    key: EvidenceKey,
    field: "result" | "evidence",
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      data: {
        ...current.data,
        [key]: { ...current.data[key], [field]: value },
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const assessment = await createMentalCapacityAssessment(form);
      router.push(
        `/care/manager/service-users/${serviceUserId}/mental-capacity/${assessment.id}`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The capacity assessment could not be completed.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">New mental capacity assessment</h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          Complete this for one specific decision. The assessor—not Castodia—must reach and evidence the conclusion.
        </p>
      </div>

      <FormAlert variant="warning" title="Completed records are permanent">
        Check the assessment carefully before completing it. A later review creates a new record rather than changing this evidence.
      </FormAlert>

      {errorMessage ? <FormAlert variant="error">{errorMessage}</FormAlert> : null}

      <FormSection
        title="1. Assessment details"
        description="Give the record an organisation-friendly title, then state the exact decision being assessed."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Assessment title" htmlFor="mca-title" required description="For example: Medication assessment">
            <FormInput
              id="mca-title"
              value={form.title}
              required
              onChange={(event) => setTopLevel("title", event.target.value)}
              placeholder="Medication assessment"
            />
          </FormField>
          <FormField label="Assessment date" htmlFor="mca-assessment-date" required>
            <FormInput
              id="mca-assessment-date"
              type="date"
              value={form.assessmentDate}
              required
              onChange={(event) => setTopLevel("assessmentDate", event.target.value)}
            />
          </FormField>
        </div>
        <FormField
          label="Exact decision to be made"
          htmlFor="mca-decision"
          required
          description="Avoid broad labels such as ‘capacity for medication’. State the actual decision and its current circumstances."
        >
          <FormTextarea
            id="mca-decision"
            value={form.decision}
            required
            onChange={(event) => setTopLevel("decision", event.target.value)}
            placeholder="Can the person decide whether to take the prescribed medicine offered each morning?"
          />
        </FormField>
        <FormField label="Reason for this assessment" htmlFor="mca-reason" required>
          <FormTextarea
            id="mca-reason"
            value={form.data.reasonForAssessment}
            required
            onChange={(event) => setData("reasonForAssessment", event.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="2. Support and involvement"
        description="Capacity must not be treated as absent until all practicable support has been tried without success."
      >
        <FormField
          label="Practicable support provided"
          htmlFor="mca-practicable-support"
          required
          description="Include accessible information, communication support, timing, location, people involved and repeated attempts where relevant."
        >
          <FormTextarea
            id="mca-practicable-support"
            value={form.data.practicableSupport}
            required
            onChange={(event) => setData("practicableSupport", event.target.value)}
          />
        </FormField>
        <FormField label="Person's views, wishes and participation" htmlFor="mca-person-views">
          <FormTextarea
            id="mca-person-views"
            value={form.data.personViews}
            onChange={(event) => setData("personViews", event.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="3. Impairment or disturbance">
        <FormField
          label="Evidence of an impairment of, or disturbance in, the functioning of the mind or brain"
          htmlFor="mca-impairment-details"
          required
        >
          <FormTextarea
            id="mca-impairment-details"
            value={form.data.impairmentDetails}
            required
            onChange={(event) => setData("impairmentDetails", event.target.value)}
          />
        </FormField>
        <FormChoiceGroup
          label="Nature of the impairment or disturbance"
          value={form.data.impairmentNature}
          required
          columns={4}
          options={[
            { value: "temporary", label: "Temporary" },
            { value: "permanent", label: "Permanent" },
            { value: "fluctuating", label: "Fluctuating" },
            { value: "unknown", label: "Not yet known" },
          ]}
          onChange={(value) => setData("impairmentNature", value)}
        />
      </FormSection>

      <FormSection title="4. Relevant information">
        <FormField
          label="Information relevant to this decision"
          htmlFor="mca-relevant-information"
          required
          description="Record the nature, reasonably foreseeable consequences, alternatives and consequences of deciding either way."
        >
          <FormTextarea
            id="mca-relevant-information"
            value={form.data.relevantInformation}
            required
            onChange={(event) => setData("relevantInformation", event.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection
        title="5. Functional assessment"
        description="Record the person's functional ability after the practicable support above was provided."
      >
        <div className="space-y-4">
          <EvidenceField field="understand" evidence={form.data.understand} onChange={setEvidence} title="Understand" description="Can the person understand the information relevant to this decision?" />
          <EvidenceField field="retain" evidence={form.data.retain} onChange={setEvidence} title="Retain" description="Can the person retain that information long enough to make the decision?" />
          <EvidenceField field="useOrWeigh" evidence={form.data.useOrWeigh} onChange={setEvidence} title="Use or weigh" description="Can the person use or weigh that information as part of deciding?" />
          <EvidenceField field="communicate" evidence={form.data.communicate} onChange={setEvidence} title="Communicate" description="Can the person communicate the decision by any means?" />
        </div>
      </FormSection>

      <FormSection title="6. Causal link">
        <FormField
          label="How does the impairment or disturbance cause the identified inability?"
          htmlFor="mca-causal-link"
          required
          description="A person lacks capacity only if the inability to decide is because of the impairment or disturbance."
        >
          <FormTextarea
            id="mca-causal-link"
            value={form.data.causalLink}
            required
            onChange={(event) => setData("causalLink", event.target.value)}
          />
        </FormField>
      </FormSection>

      <FormSection title="7. Assessor's conclusion and review">
        <FormChoiceGroup<CapacityOutcome>
          label="Conclusion for this specific decision at this time"
          value={form.outcome}
          required
          columns={3}
          options={outcomeOptions}
          onChange={(value) => setTopLevel("outcome", value)}
        />
        <FormField label="Reasoning for the conclusion" htmlFor="mca-conclusion-reasoning" required>
          <FormTextarea
            id="mca-conclusion-reasoning"
            value={form.data.conclusionReasoning}
            required
            onChange={(event) => setData("conclusionReasoning", event.target.value)}
          />
        </FormField>
        <FormYesNo
          label="May the person's capacity for this decision fluctuate?"
          value={form.data.capacityMayFluctuate}
          required
          onChange={(value) => setData("capacityMayFluctuate", value)}
        />
        <FormField
          label="Review date"
          htmlFor="mca-review-date"
          description="Set a proportionate date where the decision, circumstances or capacity may change."
        >
          <FormInput
            id="mca-review-date"
            type="date"
            min={form.assessmentDate}
            value={form.reviewDate}
            onChange={(event) => setTopLevel("reviewDate", event.target.value)}
          />
        </FormField>

        {form.outcome === "lacks_capacity" ? (
          <FormAlert variant="warning" title="A capacity assessment is not a best-interests decision">
            Record any subsequent best-interests process separately, including consultation, options considered and the decision-maker.
          </FormAlert>
        ) : null}
      </FormSection>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <CastodiaButton
          type="button"
          variant="secondary"
          disabled={saving}
          onClick={() => router.push(`/care/manager/service-users/${serviceUserId}/mental-capacity`)}
        >
          Cancel
        </CastodiaButton>
        <CastodiaButton type="submit" disabled={saving}>
          {saving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Completing assessment…
            </span>
          ) : (
            "Complete assessment"
          )}
        </CastodiaButton>
      </div>
    </form>
  );
}

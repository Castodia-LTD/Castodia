import Link from "next/link";

import { CastodiaBadge, CastodiaCard } from "@/components/castodia";
import type {
  CapacityAbility,
  MentalCapacityAssessmentRecord,
} from "@/lib/care/mental-capacity/types";

type Props = {
  assessment: MentalCapacityAssessmentRecord;
  serviceUserId: string;
  portal: "manager" | "support";
};

const outcomeLabels = {
  has_capacity: "Has capacity",
  lacks_capacity: "Lacks capacity",
  inconclusive: "Inconclusive",
} as const;

const abilityLabels: Record<CapacityAbility, string> = {
  demonstrated: "Demonstrated",
  not_demonstrated: "Not demonstrated",
  unclear: "Unclear",
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

function EvidenceRow({
  title,
  result,
  evidence,
}: {
  title: string;
  result: CapacityAbility;
  evidence: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold text-slate-950">{title}</h4>
        <CastodiaBadge variant={result === "demonstrated" ? "success" : result === "unclear" ? "neutral" : "warning"}>
          {abilityLabels[result]}
        </CastodiaBadge>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{evidence}</p>
    </div>
  );
}

function ReadSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0">
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <div className="mt-3 text-sm leading-6 text-slate-700">{children}</div>
    </section>
  );
}

export function MentalCapacityReadView({ assessment, serviceUserId, portal }: Props) {
  const { assessment_data: data } = assessment;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/care/${portal}/service-users/${serviceUserId}/mental-capacity`}
            className="text-sm font-semibold text-teal-700 hover:text-teal-900"
          >
            ← All mental capacity assessments
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-teal-700">
            {assessment.title}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">{assessment.decision}</h2>
        </div>
        <CastodiaBadge
          variant={assessment.outcome === "has_capacity" ? "success" : assessment.outcome === "lacks_capacity" ? "warning" : "neutral"}
          className="self-start"
        >
          {outcomeLabels[assessment.outcome]}
        </CastodiaBadge>
      </div>

      {portal === "support" ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
          Read-only completed record. Contact a manager if this assessment needs review.
        </div>
      ) : null}

      <CastodiaCard>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assessment date</dt>
            <dd className="mt-1 font-semibold text-slate-950">{formatDate(assessment.assessment_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Review date</dt>
            <dd className="mt-1 font-semibold text-slate-950">{formatDate(assessment.review_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assessor</dt>
            <dd className="mt-1 font-semibold text-slate-950">{assessment.assessor_name}</dd>
          </div>
        </dl>
      </CastodiaCard>

      <CastodiaCard className="space-y-6">
        <ReadSection title="Reason and the person’s involvement">
          <p className="whitespace-pre-wrap">{data.reasonForAssessment}</p>
          <h4 className="mt-4 font-semibold text-slate-950">Practicable support provided</h4>
          <p className="mt-1 whitespace-pre-wrap">{data.practicableSupport}</p>
          {data.personViews ? (
            <>
              <h4 className="mt-4 font-semibold text-slate-950">Person’s views</h4>
              <p className="mt-1 whitespace-pre-wrap">{data.personViews}</p>
            </>
          ) : null}
        </ReadSection>

        <ReadSection title="Impairment or disturbance">
          <p className="whitespace-pre-wrap">{data.impairmentDetails}</p>
          <p className="mt-2"><span className="font-semibold">Nature:</span> {data.impairmentNature}</p>
        </ReadSection>

        <ReadSection title="Information relevant to the decision">
          <p className="whitespace-pre-wrap">{data.relevantInformation}</p>
        </ReadSection>

        <ReadSection title="Functional assessment evidence">
          <div className="grid gap-3">
            <EvidenceRow title="Understand the relevant information" {...data.understand} />
            <EvidenceRow title="Retain the relevant information" {...data.retain} />
            <EvidenceRow title="Use or weigh the relevant information" {...data.useOrWeigh} />
            <EvidenceRow title="Communicate the decision" {...data.communicate} />
          </div>
        </ReadSection>

        <ReadSection title="Causal link">
          <p className="whitespace-pre-wrap">{data.causalLink}</p>
        </ReadSection>

        <ReadSection title="Assessor's conclusion">
          <p className="whitespace-pre-wrap">{data.conclusionReasoning}</p>
          <p className="mt-2"><span className="font-semibold">Capacity may fluctuate:</span> {data.capacityMayFluctuate ? "Yes" : "No"}</p>
        </ReadSection>
      </CastodiaCard>
    </div>
  );
}

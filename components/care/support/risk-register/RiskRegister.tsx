import { RiskAssessmentReadCard } from "@/components/care/shared/risk-register/RiskAssessmentReadCard";

import type { RiskAssessmentWithOwner } from "@/lib/care/service-user-hub/risk-register/types";

type RiskRegisterProps = {
  assessments: RiskAssessmentWithOwner[];
};

export function RiskRegister({
  assessments,
}: RiskRegisterProps) {
  if (assessments.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-teal-200 bg-gradient-to-br from-cyan-50/60 via-white/75 to-teal-50/60 px-6 py-12 text-center shadow-sm backdrop-blur-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          No active risk assessments
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          There are currently no active risk assessments recorded
          for this service user.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="support-risk-register-heading"
      className="space-y-4"
    >
      <div>
        <h1
          id="support-risk-register-heading"
          className="text-2xl font-bold tracking-tight text-slate-950"
        >
          Risk Register
        </h1>

        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
          Read the current risk assessments and follow the recorded
          control measures and actions.
        </p>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => (
          <RiskAssessmentReadCard
            key={assessment.id}
            assessment={assessment}
          />
        ))}
      </div>
    </section>
  );
}
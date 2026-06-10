import type { StaffCompetency } from "@/lib/admin/competencies/types";
import { CastodiaBadge, CastodiaCard } from "@/components/castodia";

type Props = {
  competency: StaffCompetency;
  staffName: string;
};

function getOutcomeVariant(outcome: string) {
  if (outcome === "Competent") return "success";
  if (outcome === "Competent With Actions") return "warning";
  return "danger";
}

export default function CompetencyCard({ competency, staffName }: Props) {
  return (
    <CastodiaCard padding="md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {competency.competency_type}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {staffName}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Assessed{" "}
            {new Date(competency.assessment_date).toLocaleDateString("en-GB")}
          </p>

          {competency.review_date && (
            <p className="text-sm text-slate-500">
              Review due{" "}
              {new Date(competency.review_date).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>

        <CastodiaBadge variant={getOutcomeVariant(competency.outcome)}>
          {competency.outcome}
        </CastodiaBadge>
      </div>

      {competency.actions?.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-950">
            Outstanding Actions
          </p>

          <div className="mt-3 space-y-2">
            {competency.actions.map((action, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <p className="text-sm font-medium text-slate-900">
                  {action.action}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {action.responsible_person}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </CastodiaCard>
  );
}
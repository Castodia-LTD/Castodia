import type { StaffCompetency } from "@/lib/admin/competencies/types";

type Props = {
  competency: StaffCompetency;
  staffName: string;
};

export default function CompetencyCard({
  competency,
  staffName,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-300">
            {competency.competency_type}
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {staffName}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Assessed{" "}
            {new Date(
              competency.assessment_date
            ).toLocaleDateString("en-GB")}
          </p>

          {competency.review_date && (
            <p className="text-sm text-slate-400">
              Review Due{" "}
              {new Date(
                competency.review_date
              ).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            competency.outcome === "Competent"
              ? "bg-green-500/20 text-green-200"
              : competency.outcome === "Competent With Actions"
              ? "bg-amber-500/20 text-amber-200"
              : "bg-red-500/20 text-red-200"
          }`}
        >
          {competency.outcome}
        </span>
      </div>

      {competency.actions?.length > 0 && (
        <div className="mt-4 rounded-2xl bg-slate-950/40 p-4">
          <p className="font-semibold">
            Outstanding Actions
          </p>

          <div className="mt-3 space-y-2">
            {competency.actions.map((action, index) => (
              <div
                key={index}
                className="rounded-xl bg-white/5 p-3"
              >
                <p>{action.action}</p>

                <p className="text-sm text-slate-400">
                  {action.responsible_person}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
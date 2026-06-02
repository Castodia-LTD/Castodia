import type { StaffSupervision } from "@/lib/admin/supervisions/types";

type Props = {
  supervision: StaffSupervision;
};

export default function SupervisionCard({ supervision }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-cyan-300">
            {supervision.supervision_type}
          </p>

          <h2 className="mt-1 text-xl font-bold">
            {new Date(supervision.supervision_date).toLocaleDateString(
              "en-GB"
            )}
          </h2>

          {supervision.next_supervision_date && (
            <p className="mt-2 text-sm text-slate-400">
              Next due:{" "}
              {new Date(
                supervision.next_supervision_date
              ).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>

        <div className="text-right text-xs">
          {supervision.signed_by_supervisor ? (
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-green-200">
              Supervisor signed
            </span>
          ) : (
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-200">
              Awaiting sign-off
            </span>
          )}
        </div>
      </div>

      {supervision.manager_summary && (
        <p className="mt-4 whitespace-pre-line text-sm text-slate-300">
          {supervision.manager_summary}
        </p>
      )}

      {supervision.actions?.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
          <p className="font-semibold">Actions</p>

          <div className="mt-3 space-y-2">
            {supervision.actions.map((action, index) => (
              <div
                key={`${action.action}-${index}`}
                className="rounded-xl bg-white/5 p-3 text-sm"
              >
                <p className="font-semibold">{action.action}</p>

                <p className="mt-1 text-slate-400">
                  Responsible: {action.responsible_person || "Not specified"}
                </p>

                {action.due_date && (
                  <p className="text-slate-400">
                    Due:{" "}
                    {new Date(action.due_date).toLocaleDateString("en-GB")}
                  </p>
                )}

                <p className="mt-1 text-slate-400">
                  Status: {action.completed ? "Completed" : "Outstanding"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
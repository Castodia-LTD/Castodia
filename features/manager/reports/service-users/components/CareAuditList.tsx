import CareAuditCard from "@/components/admin/reports/CareAuditCard";
import type { CareAudit } from "@/lib/admin/reports/service-user/types";

type Props = {
  careAudits: CareAudit[];
};

export default function CareAuditList({ careAudits }: Props) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">Care Audit</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {careAudits.length === 0 && (
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 text-slate-400">
            No care audit records found.
          </div>
        )}

        {careAudits.map((audit) => (
          <CareAuditCard key={audit.id} audit={audit} />
        ))}
      </div>
    </section>
  );
}
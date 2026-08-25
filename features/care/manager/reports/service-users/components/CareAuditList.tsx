import CareAuditCard from "@/components/care/admin/reports/CareAuditCard";
import type { CareAudit } from "@/lib/care/admin/reports/service-user/types";

import {
  CastodiaCard,
  CastodiaSection,
} from "@/components/castodia";

type Props = {
  careAudits: CareAudit[];
};

export default function CareAuditList({ careAudits }: Props) {
  return (
    <CastodiaSection
      title="Care Audit"
      description={`${careAudits.length} care audit record${
        careAudits.length === 1 ? "" : "s"
      } found`}
    >
      {careAudits.length === 0 ? (
        <CastodiaCard>
          <p className="text-sm text-slate-500">
            No care audit records found.
          </p>
        </CastodiaCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {careAudits.map((audit) => (
            <CareAuditCard key={audit.id} audit={audit} />
          ))}
        </div>
      )}
    </CastodiaSection>
  );
}
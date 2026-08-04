import type { ReactNode } from "react";

import { CastodiaCard } from "@/components/castodia";

type EmploymentComplianceCardProps = {
  title: string;
  status: string;
  description?: string;
  icon?: ReactNode;
};

export default function EmploymentComplianceCard({
  title,
  status,
  description,
  icon,
}: EmploymentComplianceCardProps) {
  return (
    <CastodiaCard className="h-full">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-950">
            {status}
          </p>

          {description ? (
            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          ) : null}
        </div>

        {icon ? (
          <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700">
            {icon}
          </div>
        ) : null}
      </div>
    </CastodiaCard>
  );
}
import type { CareAudit } from "@/lib/care/admin/reports/service-user/types";

type Props = {
  audit: CareAudit;
};

export default function CareAuditCard({ audit }: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
      <h3 className="font-semibold text-white">{audit.name}</h3>

      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <p>
          Last washed:{" "}
          <span className="font-semibold text-white">
            {audit.lastWashed}
          </span>
        </p>

        <p>
          Last clothing change:{" "}
          <span className="font-semibold text-white">
            {audit.lastClothingChange}
          </span>
        </p>
      </div>
    </div>
  );
}
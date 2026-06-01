import Link from "next/link";
import type { Incident } from "@/lib/admin/incidents/types";

type Props = {
  incident: Incident;
};

export default function IncidentAuditCard({ incident }: Props) {
  return (
    <Link
      href={`/incidents/${incident.id}`}
      className="block rounded-2xl bg-slate-900 p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            {new Date(incident.created_at).toLocaleString("en-GB")}
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {incident.service_user_name}
          </h2>

          <p className="text-slate-400">{incident.house_name}</p>
        </div>

        {incident.reviewed && (
          <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-semibold">
            Reviewed
          </span>
        )}
      </div>

      <p className="mt-4 text-slate-300">Tap to view incident details</p>

      <p className="mt-4 text-sm text-slate-500">
        Entered by {incident.staff_name}
      </p>
    </Link>
  );
}
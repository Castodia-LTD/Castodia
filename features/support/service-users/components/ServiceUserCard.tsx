import Link from "next/link";
import type { ServiceUser } from "../types";

type ServiceUserCardProps = {
  serviceUser: ServiceUser;
};

export default function ServiceUserCard({
  serviceUser,
}: ServiceUserCardProps) {
  return (
    <Link
      href={`/support/service-users/${serviceUser.id}/profile`}
      className="group rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:bg-white/15"
    >
      <div className="flex items-center gap-4">
        {serviceUser.photo_url ? (
          <img
            src={serviceUser.photo_url}
            alt={serviceUser.full_name}
            className="h-16 w-16 rounded-2xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950/60 text-2xl font-bold text-cyan-300">
            {serviceUser.full_name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold text-white">
            {serviceUser.full_name}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {serviceUser.house_name || "No house assigned"}
          </p>
        </div>
      </div>

      {serviceUser.allergies && (
        <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
            Allergies
          </p>

          <p className="mt-1 line-clamp-2 text-sm text-slate-100">
            {serviceUser.allergies}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-slate-400">Open profile</span>

        <span className="text-cyan-300 transition group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
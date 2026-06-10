import Link from "next/link";
import { CastodiaCard, CastodiaBadge } from "@/components/castodia";
import type { ServiceUser } from "../types";

type ServiceUserCardProps = {
  serviceUser: ServiceUser;
};

export default function ServiceUserCard({
  serviceUser,
}: ServiceUserCardProps) {
  return (
    <Link href={`/support/service-users/${serviceUser.id}/profile`}>
      <CastodiaCard
        interactive
        className="h-full transition-all duration-200"
      >
        <div className="flex items-center gap-4">
          {serviceUser.photo_url ? (
            <img
              src={serviceUser.photo_url}
              alt={serviceUser.full_name}
              className="h-16 w-16 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-2xl font-bold text-cyan-700">
              {serviceUser.full_name.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-950">
              {serviceUser.full_name}
            </h2>

            <p className="text-sm text-slate-500">
              {serviceUser.house_name || "No house assigned"}
            </p>
          </div>
        </div>

        {serviceUser.allergies && (
          <div className="mt-5">
            <CastodiaBadge variant="danger">
              Allergies
            </CastodiaBadge>

            <p className="mt-2 line-clamp-2 text-sm text-slate-700">
              {serviceUser.allergies}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-sm text-slate-500">
            Open profile
          </span>

          <span className="font-semibold text-cyan-600">
            →
          </span>
        </div>
      </CastodiaCard>
    </Link>
  );
}
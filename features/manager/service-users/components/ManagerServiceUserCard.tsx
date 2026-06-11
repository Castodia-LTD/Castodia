import Link from "next/link";

import { CastodiaCard } from "@/components/castodia";

import type { ServiceUser } from "../types";

type Props = {
  serviceUser: ServiceUser;
};

export default function ManagerServiceUserCard({
  serviceUser,
}: Props) {
  return (
    <Link href={`/manager/service-users/${serviceUser.id}`}>
      <CastodiaCard interactive className="h-full">
        <div className="flex flex-col items-center text-center">
          {serviceUser.photo_url ? (
            <img
              src={serviceUser.photo_url}
              alt={serviceUser.full_name}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-700">
              {`${serviceUser.first_name?.[0] ?? ""}${serviceUser.surname?.[0] ?? ""}`.toUpperCase()}
            </div>
          )}

          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            {serviceUser.full_name}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {serviceUser.house_name || "No house assigned"}
          </p>
        </div>
      </CastodiaCard>
    </Link>
  );
}
import Link from "next/link";
import type { ServiceUser } from "../types";

type Props = {
  serviceUser: ServiceUser;
};

export default function ManagerServiceUserCard({
  serviceUser,
}: Props) {
  return (
    <Link
      href={`/manager/service-users/${serviceUser.id}`}
      className="group rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:bg-white/15"
    >
      <div className="flex flex-col items-center text-center">
        {serviceUser.photo_url ? (
          <img
            src={serviceUser.photo_url}
            alt={serviceUser.full_name}
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-950 text-3xl font-bold text-cyan-300">
            {serviceUser.full_name.charAt(0)}
          </div>
        )}

        <h2 className="mt-4 text-lg font-bold text-white">
          {serviceUser.full_name}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {serviceUser.house_name || "No house assigned"}
        </p>
      </div>
    </Link>
  );
}
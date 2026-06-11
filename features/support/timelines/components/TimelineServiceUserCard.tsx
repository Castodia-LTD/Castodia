import Link from "next/link";
import type { ServiceUser } from "../types";

type TimelineServiceUserCardProps = {
  serviceUser: ServiceUser;
};

export default function TimelineServiceUserCard({
  serviceUser,
}: TimelineServiceUserCardProps) {
  return (
    <Link
      href={`/support/timelines/${serviceUser.id}`}
      className="group rounded-3xl border border-white/10 bg-white/10 p-6 shadow-xl backdrop-blur transition hover:bg-white/15"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950/60 text-xl font-bold text-white">
          {`${serviceUser.first_name?.[0] ?? ""}${serviceUser.surname?.[0] ?? ""}`.toUpperCase()}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-xl font-bold text-white">
            {serviceUser.full_name}
          </h3>
          <p className="text-sm text-slate-400">{serviceUser.house_name}</p>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-400 group-hover:text-slate-300">
        Open timeline →
      </p>
    </Link>
  );
}
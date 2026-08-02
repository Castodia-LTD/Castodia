import Image from "next/image";
import {
  BriefcaseBusiness,
  Building2,
  CircleCheck,
  Mail,
} from "lucide-react";

import StaffHubNavigation from "./StaffHubNavigation";

export type StaffHeroStaff = {
  id: string;
  full_name: string;
  photo_url?: string | null;
  job_title?: string | null;
  house_name?: string | null;
  email?: string | null;
  employment_status?: string | null;
  active?: boolean | null;
};

type StaffHeroProps = {
  staff: StaffHeroStaff;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function StaffHero({
  staff,
}: StaffHeroProps) {
  const initials = getInitials(staff.full_name);
  const isActive = staff.active !== false;

  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
      <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-cyan-700 shadow-sm ring-4 ring-white">
            {staff.photo_url ? (
              <Image
                src={staff.photo_url}
                alt={staff.full_name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {staff.full_name}
              </h1>

              <span
                className={[
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                  isActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-200 text-slate-600",
                ].join(" ")}
              >
                <CircleCheck className="h-3.5 w-3.5" />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              {staff.job_title && (
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-cyan-700" />
                  {staff.job_title}
                </span>
              )}

              {staff.house_name && (
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-cyan-700" />
                  {staff.house_name}
                </span>
              )}

              {staff.email && (
                <span className="inline-flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-cyan-700" />
                  <span className="truncate">{staff.email}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Employment
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {staff.employment_status || "Not recorded"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Workspace
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Staff record
            </p>
          </div>
        </div>
      </div>

      <StaffHubNavigation staffId={staff.id} />
    </section>
  );
}
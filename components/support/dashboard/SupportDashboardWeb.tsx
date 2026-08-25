"use client";

import Image from "next/image";
import {
  CircleCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { ContentWidth } from "@/components/layout";

type SupportDashboardWebProps = {
  name: string;
  photoUrl: string | null;
  role: string | null;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase(),
    )
    .join("");
}

function getRoleLabel(
  role: string | null,
) {
  switch (role) {
    case "manager":
      return "Manager";

    case "support":
      return "Support Worker";

    case "castodia_admin":
      return "Castodia Admin";

    case "castodia_owner":
      return "Castodia Owner";

    default:
      return "Support User";
  }
}

export default function SupportDashboardWeb({
  name,
  photoUrl,
  role,
}: SupportDashboardWebProps) {
  const initials = getInitials(
    name || "Support User",
  );

  const roleLabel =
    getRoleLabel(role);

  return (
    <ContentWidth>
      <div className="py-6">
        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
          <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-cyan-700 shadow-sm ring-4 ring-white">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt={
                      name
                        ? `${name}'s profile photo`
                        : "Profile photo"
                    }
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
                <p className="text-sm font-semibold text-cyan-700">
                  Support Portal
                </p>

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    {name
                      ? `Welcome, ${name}`
                      : "Welcome"}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CircleCheck className="h-3.5 w-3.5" />
                    Signed in
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-cyan-700" />
                    {roleLabel}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-700" />
                    Secure access
                  </span>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                  Use the navigation menu to access service users,
                  timelines, handovers and safeguarding.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Portal
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  Support
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </ContentWidth>
  );
}
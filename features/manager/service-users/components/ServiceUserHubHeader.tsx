"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CastodiaCard } from "@/components/castodia";

type ServiceUserOption = {
  id: string;
  full_name: string;
};

type Props = {
  id: string;
  fullName: string;
  houseName: string | null;
  dob: string | null;
  photoUrl: string | null;
  serviceUsers?: ServiceUserOption[];
  onServiceUserChange?: (id: string) => void;
};

const tabs = [
  { label: "Timeline", path: "timeline" },
  { label: "Medication", path: "medication" },
  { label: "Care Plans", path: "care-plans" },
  { label: "Risk Assessments", path: "risk-assessments" },
  { label: "Body Maps", path: "body-maps" },
  { label: "Documents", path: "documents" },
  { label: "Reviews", path: "reviews" },
];

export default function ServiceUserHubHeader({
  id,
  fullName,
  houseName,
  dob,
  photoUrl,
  serviceUsers = [],
  onServiceUserChange,
}: Props) {
  const pathname = usePathname();

  const initials = fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full">
      <CastodiaCard>
        <div className="space-y-8">
          <div className="max-w-sm">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Service User
            </label>

            <select
              value={id}
              onChange={(event) => onServiceUserChange?.(event.target.value)}
              className="w-full rounded-xl border border-cyan-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              {serviceUsers.map((serviceUser) => (
                <option key={serviceUser.id} value={serviceUser.id}>
                  {serviceUser.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-3xl bg-gradient-to-r from-cyan-50 via-white to-teal-50 px-8 py-12">
            <div className="flex flex-col items-center text-center">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={fullName}
                  className="h-40 w-40 rounded-full object-cover ring-8 ring-white shadow-lg"
                />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-6xl font-bold text-white shadow-lg ring-8 ring-white">
                  {initials}
                </div>
              )}

              <h1 className="mt-6 text-6xl font-bold tracking-tight text-slate-950">
                {fullName}
              </h1>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                  {houseName || "No house assigned"}
                </span>

                {dob && (
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-100">
                    DOB: {new Date(dob).toLocaleDateString("en-GB")}
                  </span>
                )}

                <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200">
                  Active
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-3">
            {tabs.map((tab) => {
              const href = `/manager/service-users/${id}/${tab.path}`;
              const isActive =
                pathname === href ||
                pathname.startsWith(`${href}/`) ||
                (pathname === "/manager/service-users" &&
                  tab.path === "timeline");

              return (
                <Link
                  key={tab.path}
                  href={href}
                  className={
                    isActive
                      ? "rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
                      : "rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-cyan-700"
                  }
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </CastodiaCard>
    </div>
  );
}
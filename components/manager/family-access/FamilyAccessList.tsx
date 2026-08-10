"use client";

import {
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

type FamilyUser = {
  id: string;
  full_name: string;
  email: string;
  relationship: string | null;
  is_active: boolean;
};

type Props = {
  familyUsers: FamilyUser[];
};

export default function FamilyAccessList({
  familyUsers,
}: Props) {
  if (familyUsers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
        <UserRound
          className="mx-auto h-8 w-8 text-slate-400"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-medium text-slate-700">
          No Family access yet
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Add an approved family member above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {familyUsers.map((person) => (
        <article
          key={person.id}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <UserRound
                size={20}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {person.full_name}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {person.relationship ??
                      "Family contact"}
                  </p>
                </div>

                <span
                  className={[
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                    person.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  {person.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Mail
                  size={15}
                  aria-hidden="true"
                />

                <span className="truncate">
                  {person.email}
                </span>
              </div>

              {person.is_active ? (
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-teal-700">
                  <ShieldCheck
                    size={14}
                    aria-hidden="true"
                  />

                  Family access enabled
                </div>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  History,
  Loader2,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
import { supabase } from "@/lib/supabase";

export type StaffMember = {
  id: string;
  full_name: string;
  role: string;
  photo_url: string | null;
};

type StaffHubPageProps = {
  staffId: string;
  staffMembers?: StaffMember[];
  onStaffChange?: (staffId: string) => void;
};

type StaffProfile = {
  id: string;
  full_name: string;
  role: string;
  photo_url: string | null;
  organisation_id: string | null;
};

const hubSections = [
  {
    label: "Overview",
    href: (id: string) => `/manager/staff/${id}`,
    icon: UserRound,
  },
  {
    label: "Employment",
    href: (id: string) => `/manager/staff/${id}/employment`,
    icon: BriefcaseBusiness,
  },
  {
    label: "Training",
    href: (id: string) => `/manager/staff/training`,
    icon: GraduationCap,
  },
  {
    label: "Competencies",
    href: () => "/manager/staff/competencies",
    icon: ClipboardCheck,
  },
  {
    label: "Supervisions",
    href: (id: string) => `/manager/staff/supervisions`,
    icon: MessageSquareText,
  },
  {
    label: "Documents",
    href: (id: string) => `/manager/staff/${id}/documents`,
    icon: FileText,
  },
 {
  label: "Access & Permissions",
  href: () => "/manager/admin/access",
  icon: ShieldCheck,
},
];

const overviewCards = [
  {
    title: "Training",
    value: "Not configured",
    description: "Training records will appear here.",
    icon: GraduationCap,
  },
  {
    title: "Competencies",
    value: "Not configured",
    description: "Competency records will appear here.",
    icon: ClipboardCheck,
  },
  {
    title: "Supervisions",
    value: "Not configured",
    description: "Supervision records will appear here.",
    icon: MessageSquareText,
  },
  {
    title: "Documents",
    value: "Not configured",
    description: "Employment documents will appear here.",
    icon: FileCheck2,
  },
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getRoleLabel(role: string) {
  if (role === "manager") {
    return "Manager";
  }

  if (role === "staff") {
    return "Support Worker";
  }

  return role || "Role not recorded";
}

export default function StaffHubPage({
  staffId,
  staffMembers = [],
  onStaffChange,
}: StaffHubPageProps) {
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!staff?.full_name) {
      return "";
    }

    return getInitials(staff.full_name);
  }, [staff]);

  useEffect(() => {
    let active = true;

    async function loadStaffMember() {
      setLoading(true);
      setLoadError(null);

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
              id,
              full_name,
              role,
              photo_url,
              organisation_id
            `
          )
          .eq("id", staffId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (!data) {
          throw new Error("Staff member not found.");
        }

        if (active) {
          setStaff(data as StaffProfile);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load the staff member."
          );

          setStaff(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStaffMember();

    return () => {
      active = false;
    };
  }, [staffId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <CastodiaCard>
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Loader2
              className="h-5 w-5 animate-spin"
              aria-hidden="true"
            />

            Loading staff workspace...
          </div>
        </CastodiaCard>
      </div>
    );
  }

  if (loadError || !staff) {
    return (
      <CastodiaCard>
        <div className="px-6 py-12 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-700">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-950">
            Staff member could not be loaded
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Castodia could not retrieve this staff record.
          </p>

          <div className="mx-auto mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError ?? "The staff member could not be found."}
          </div>

          <Link
            href="/manager/staff"
            className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
          >
            Return to staff
          </Link>
        </div>
      </CastodiaCard>
    );
  }

  const baseHref = `/manager/staff/${staff.id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <label
            htmlFor="staff-selector"
            className="text-sm font-semibold text-slate-700"
          >
            Staff member
          </label>

          <select
            id="staff-selector"
            value={staff.id}
            onChange={(event) => {
              const nextStaffId = event.target.value;

              if (nextStaffId && nextStaffId !== staff.id) {
                onStaffChange?.(nextStaffId);
              }
            }}
            disabled={!onStaffChange || staffMembers.length === 0}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {staffMembers.length > 0 ? (
              staffMembers.map((staffMember) => (
                <option
                  key={staffMember.id}
                  value={staffMember.id}
                >
                  {staffMember.full_name}
                </option>
              ))
            ) : (
              <option value={staff.id}>
                {staff.full_name}
              </option>
            )}
          </select>
        </div>

        <Link href="/manager/admin/staff">
          <CastodiaButton>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Staff Member
          </CastodiaButton>
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
        <div className="flex flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-sm ring-4 ring-white">
              {staff.photo_url ? (
                <Image
                  src={staff.photo_url}
                  alt={`${staff.full_name}'s profile`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : initials ? (
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              ) : (
                <UserRound
                  className="h-10 w-10 text-white"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  {staff.full_name}
                </h1>

                <CastodiaBadge variant="success">
                  Active
                </CastodiaBadge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <BriefcaseBusiness
                    className="h-4 w-4 text-cyan-700"
                    aria-hidden="true"
                  />

                  {getRoleLabel(staff.role)}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Building2
                    className="h-4 w-4 text-cyan-700"
                    aria-hidden="true"
                  />

                  House not assigned
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`${baseHref}/employment`}>
              <CastodiaButton variant="secondary">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit details
              </CastodiaButton>
            </Link>

            <button
              type="button"
              aria-label="More staff actions"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <MoreHorizontal
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="grid gap-3 border-t border-cyan-100/80 px-5 py-5 sm:grid-cols-2 sm:px-7 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Employment
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Not recorded
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Role
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {getRoleLabel(staff.role)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm sm:col-span-2 lg:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              House
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Not assigned
            </p>
          </div>
        </div>

        <nav
          aria-label="Staff workspace"
          className="border-t border-cyan-100/80 px-4 py-4 sm:px-6"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {hubSections.map((section) => {
              const Icon = section.icon;

const href = section.href(staff.id);

const isOverview = href === baseHref;
              return (
                <Link
                  key={section.label}
                  href={href}
                  aria-current={isOverview ? "page" : undefined}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                    isOverview
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/70"
                      : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-4 w-4",
                      isOverview
                        ? "text-cyan-700"
                        : "text-slate-400",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  {section.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-950">
          Staff overview
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Employment, training and workforce information at a glance.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => {
            const Icon = card.icon;

            return (
              <CastodiaCard
                key={card.title}
                className="h-full"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {card.value}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      {card.description}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-cyan-50 p-3 text-cyan-700">
                    <Icon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </CastodiaCard>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <CastodiaCard>
          <h2 className="text-lg font-semibold text-slate-950">
            Recent activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Important changes to this staff member&apos;s record will appear
            here.
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
            <History
              className="mx-auto h-6 w-6 text-slate-400"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No recent activity
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Training, document and supervision events will appear here.
            </p>
          </div>
        </CastodiaCard>

        <CastodiaCard>
          <h2 className="text-lg font-semibold text-slate-950">
            Outstanding actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Records requiring manager attention.
          </p>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center">
            <ClipboardCheck
              className="mx-auto h-6 w-6 text-slate-400"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              No outstanding actions
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Expiring or overdue records will appear here.
            </p>
          </div>
        </CastodiaCard>
      </div>
    </div>
  );
}
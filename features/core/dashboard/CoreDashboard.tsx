"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CircleAlert,
  Loader2,
  Plus,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  CastodiaBadge,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

import { supabase } from "@/lib/supabase";

type Organisation = {
  id: string;
  name: string;
  created_at?: string | null;
};

type CoreUser = {
  id: string;
  full_name: string;
  role: "castodia_owner" | "castodia_admin";
  created_at?: string | null;
};

type DashboardStats = {
  organisations: number;
  organisationUsers: number;
  coreUsers: number;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function coreRoleLabel(role: CoreUser["role"]) {
  return role === "castodia_owner"
    ? "Castodia Owner"
    : "CastodiaCore Administrator";
}

export default function CoreDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    organisations: 0,
    organisationUsers: 0,
    coreUsers: 0,
  });

  const [recentOrganisations, setRecentOrganisations] =
    useState<Organisation[]>([]);

  const [recentCoreUsers, setRecentCoreUsers] =
    useState<CoreUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(
    null
  );

  async function loadDashboard() {
    setLoading(true);
    setLoadError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be signed in.");
      }

      const {
        data: currentProfile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      const isCoreUser =
        currentProfile?.role === "castodia_owner" ||
        currentProfile?.role === "castodia_admin";

      if (!isCoreUser) {
        throw new Error(
          "You do not have access to the CastodiaCore Dashboard."
        );
      }

      const [
        organisationCountResult,
        organisationUsersCountResult,
        coreUsersCountResult,
        recentOrganisationsResult,
        recentCoreUsersResult,
      ] = await Promise.all([
        supabase
          .from("organisations")
          .select("id", {
            count: "exact",
            head: true,
          }),

        supabase
          .from("profiles")
          .select("id", {
            count: "exact",
            head: true,
          })
          .in("role", ["manager", "support"]),

        supabase
          .from("profiles")
          .select("id", {
            count: "exact",
            head: true,
          })
          .in("role", [
            "castodia_owner",
            "castodia_admin",
          ]),

        supabase
          .from("organisations")
          .select("id, name, created_at")
          .order("created_at", {
            ascending: false,
          })
          .limit(5),

        supabase
          .from("profiles")
          .select("id, full_name, role, created_at")
          .in("role", [
            "castodia_owner",
            "castodia_admin",
          ])
          .order("created_at", {
            ascending: false,
          })
          .limit(5),
      ]);

      const firstError =
        organisationCountResult.error ??
        organisationUsersCountResult.error ??
        coreUsersCountResult.error ??
        recentOrganisationsResult.error ??
        recentCoreUsersResult.error;

      if (firstError) {
        throw new Error(firstError.message);
      }

      setStats({
        organisations:
          organisationCountResult.count ?? 0,
        organisationUsers:
          organisationUsersCountResult.count ?? 0,
        coreUsers:
          coreUsersCountResult.count ?? 0,
      });

      setRecentOrganisations(
        (recentOrganisationsResult.data ??
          []) as Organisation[]
      );

      setRecentCoreUsers(
        (recentCoreUsersResult.data ??
          []) as CoreUser[]
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load the CastodiaCore Dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <CastodiaPageShell
      title="CastodiaCore Dashboard"
      description="Monitor Castodia organisations, users and CastodiaCore activity."
      maxWidth="wide"
    >
      {loadError ? (
        <CastodiaCard>
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-100 p-2 text-red-700">
              <CircleAlert
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                Dashboard unavailable
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {loadError}
              </p>

              <button
                type="button"
                onClick={loadDashboard}
                className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Try again
              </button>
            </div>
          </div>
        </CastodiaCard>
      ) : null}

      <CastodiaSection
        title="CastodiaCore Overview"
        description="Current totals across CastodiaCore."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric
            label="Organisations"
            value={stats.organisations}
            loading={loading}
            icon={Building2}
            description="Registered care providers"
          />

          <DashboardMetric
            label="Organisation Users"
            value={stats.organisationUsers}
            loading={loading}
            icon={Users}
            description="Managers and support workers"
          />

          <DashboardMetric
            label="CastodiaCore Users"
            value={stats.coreUsers}
            loading={loading}
            icon={UserCog}
            description="Owners and administrators"
          />

          <CastodiaCard padding="md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  CastodiaCore Status
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  ) : loadError ? (
                    <>
                      <span className="h-3 w-3 rounded-full bg-red-500" />

                      <span className="text-2xl font-bold text-slate-950">
                        Attention
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />

                      <span className="text-2xl font-bold text-slate-950">
                        Connected
                      </span>
                    </>
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Supabase data connection
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Activity
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>
            </div>
          </CastodiaCard>
        </div>
      </CastodiaSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <CastodiaSection
          title="Recent Organisations"
          description="The latest organisations added to Castodia."
        >
          <CastodiaCard padding="none">
            {loading ? (
              <LoadingRow label="Loading organisations..." />
            ) : recentOrganisations.length === 0 ? (
              <EmptyRow label="No organisations found." />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrganisations.map(
                  (organisation) => (
                    <Link
                      key={organisation.id}
                      href={`/core/organisations/${organisation.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                        <Building2
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-slate-950">
                          {organisation.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Added{" "}
                          {formatDate(
                            organisation.created_at
                          )}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  )
                )}
              </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4">
              <Link
                href="/core/organisations"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                View all organisations

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CastodiaCard>
        </CastodiaSection>

        <CastodiaSection
          title="Administrator Users"
          description="Recent CastodiaCore accounts."
        >
          <CastodiaCard padding="none">
            {loading ? (
              <LoadingRow label="Loading administrators..." />
            ) : recentCoreUsers.length === 0 ? (
              <EmptyRow label="No administrator users found." />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCoreUsers.map((coreUser) => (
                  <div
                    key={coreUser.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-sm font-bold text-white">
                      {coreUser.full_name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) =>
                          part
                            .charAt(0)
                            .toUpperCase()
                        )
                        .join("") || "?"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950">
                        {coreUser.full_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Added{" "}
                        {formatDate(
                          coreUser.created_at
                        )}
                      </p>
                    </div>

                    <CastodiaBadge
                      variant={
                        coreUser.role ===
                        "castodia_owner"
                          ? "info"
                          : "neutral"
                      }
                    >
                      {coreRoleLabel(
                        coreUser.role
                      )}
                    </CastodiaBadge>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 px-5 py-4">
              <Link
                href="/core/users"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Manage administrators

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CastodiaCard>
        </CastodiaSection>
      </div>

      <CastodiaSection
        title="Quick Actions"
        description="Common CastodiaCore administration tasks."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            href="/core/organisations"
            icon={Building2}
            title="Manage Organisations"
            description="View and update provider organisations."
          />

          <QuickAction
            href="/core/organisations/new"
            icon={Plus}
            title="Add Organisation"
            description="Register a new care provider."
          />

          <QuickAction
            href="/core/users"
            icon={ShieldCheck}
            title="Admin Users"
            description="Create or manage Castodia administrators."
          />

          <QuickAction
            href="/core/issues"
            icon={CircleAlert}
            title="CastodiaCore Issues"
            description="Review reported problems and requests."
          />
        </div>
      </CastodiaSection>
    </CastodiaPageShell>
  );
}

type MetricProps = {
  label: string;
  value: number;
  loading: boolean;
  description: string;
  icon: typeof Building2;
};

function DashboardMetric({
  label,
  value,
  loading,
  description,
  icon: Icon,
}: MetricProps) {
  return (
    <CastodiaCard padding="md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <div className="mt-3">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
            ) : (
              <p className="text-3xl font-bold text-slate-950">
                {value}
              </p>
            )}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
          <Icon
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>
      </div>
    </CastodiaCard>
  );
}

type QuickActionProps = {
  href: string;
  title: string;
  description: string;
  icon: typeof Building2;
};

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}: QuickActionProps) {
  return (
    <Link href={href} className="group block">
      <CastodiaCard padding="md">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 transition group-hover:bg-blue-100 group-hover:text-blue-700">
            <Icon
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-950">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
              Open

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </CastodiaCard>
    </Link>
  );
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-8 text-sm text-slate-500">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="px-5 py-8 text-sm text-slate-500">
      {label}
    </div>
  );
}
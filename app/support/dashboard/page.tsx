"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import Link from "next/link";

import { ContentWidth } from "@/components/layout";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string | null;
};

type HandoverLink = {
  handover_id: string;
  service_user_id: string;
};

type Handover = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  active: boolean;

  staff_name: string;
  read: boolean;

  service_users: ServiceUser[];
};

export default function SupportDashboardPage() {
  const [name, setName] = useState("");

  const [serviceUsers, setServiceUsers] = useState<
    ServiceUser[]
  >([]);

  const [handovers, setHandovers] = useState<
    Handover[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const unreadCount = useMemo(
    () =>
      handovers.filter(
        (handover) => !handover.read,
      ).length,
    [handovers],
  );

  const readCount = useMemo(
    () =>
      handovers.filter(
        (handover) => handover.read,
      ).length,
    [handovers],
  );

  async function loadSupportDashboard(
    showFullLoader = true,
  ) {
    if (showFullLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setErrorMessage(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message,
        );
      }

      if (!user) {
        throw new Error(
          "You must be signed in to view the dashboard.",
        );
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
          full_name,
          role
        `)
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(
          profileError.message,
        );
      }

      setName(
        profile?.full_name || "",
      );

      let visibleServiceUsers:
        ServiceUser[] = [];

      if (
        profile?.role === "manager"
      ) {
        const {
          data,
          error,
        } = await supabase
          .from("service_users")
          .select(`
            id,
            full_name,
            house_name
          `)
          .eq("is_active", true)
          .order("full_name");

        if (error) {
          throw new Error(
            error.message,
          );
        }

        visibleServiceUsers =
          data ?? [];
      } else {
        const {
          data: accessRows,
          error,
        } = await supabase
          .from(
            "staff_service_user_access",
          )
          .select(`
            service_users (
              id,
              full_name,
              house_name
            )
          `)
          .eq("staff_id", user.id);

        if (error) {
          throw new Error(
            error.message,
          );
        }

        visibleServiceUsers =
          accessRows
            ?.map(
              (row: any) =>
                row.service_users,
            )
            .filter(Boolean) ?? [];
      }

      setServiceUsers(
        visibleServiceUsers,
      );

      const visibleIds =
        visibleServiceUsers.map(
          (serviceUser) =>
            serviceUser.id,
        );

      if (
        visibleIds.length === 0
      ) {
        setHandovers([]);
        return;
      }

      const since = new Date();

      since.setHours(
        since.getHours() - 48,
      );

      const {
        data: handoverLinks,
        error: linksError,
      } = await supabase
        .from(
          "handover_service_users",
        )
        .select(`
          handover_id,
          service_user_id
        `)
        .in(
          "service_user_id",
          visibleIds,
        );

      if (linksError) {
        throw new Error(
          linksError.message,
        );
      }

      const handoverIds = [
        ...new Set(
          handoverLinks?.map(
            (link) =>
              link.handover_id,
          ) ?? [],
        ),
      ];

      if (
        handoverIds.length === 0
      ) {
        setHandovers([]);
        return;
      }

      const [
        handoverResult,
        profileResult,
        readsResult,
      ] = await Promise.all([
        supabase
          .from("handovers")
          .select("*")
          .eq("active", true)
          .gte(
            "created_at",
            since.toISOString(),
          )
          .in("id", handoverIds)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("profiles")
          .select(`
            id,
            full_name
          `),

        supabase
          .from("handover_reads")
          .select("handover_id")
          .eq(
            "staff_id",
            user.id,
          ),
      ]);

      if (handoverResult.error) {
        throw new Error(
          handoverResult.error.message,
        );
      }

      if (profileResult.error) {
        throw new Error(
          profileResult.error.message,
        );
      }

      if (readsResult.error) {
        throw new Error(
          readsResult.error.message,
        );
      }

      const handoverData =
        handoverResult.data ?? [];

      const profiles =
        profileResult.data ?? [];

      const reads =
        readsResult.data ?? [];

      const enrichedHandovers =
        handoverData.map(
          (handover) => {
            const staff =
              profiles.find(
                (profile) =>
                  profile.id ===
                  handover.created_by,
              );

            const linkedServiceUsers =
              handoverLinks
                ?.filter(
                  (
                    link: HandoverLink,
                  ) =>
                    link.handover_id ===
                    handover.id,
                )
                .map(
                  (
                    link: HandoverLink,
                  ) =>
                    visibleServiceUsers.find(
                      (
                        serviceUser,
                      ) =>
                        serviceUser.id ===
                        link.service_user_id,
                    ),
                )
                .filter(Boolean) ?? [];

            return {
              ...handover,

              staff_name:
                staff?.full_name ||
                "Unknown",

              read:
                reads.some(
                  (read) =>
                    read.handover_id ===
                    handover.id,
                ),

              service_users:
                linkedServiceUsers,
            };
          },
        );

      setHandovers(
        enrichedHandovers,
      );
    } catch (error) {
      setHandovers([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "The dashboard could not be loaded.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadSupportDashboard();
  }, []);

  return (
    <ContentWidth>
      <div className="space-y-6 py-6">
        {/* HERO */}

        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
          <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-sm">
                <ClipboardList className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm font-semibold text-cyan-700">
                  Support Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  {name
                    ? `Welcome, ${name}`
                    : "Welcome"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Recent updates and handovers for the
                  people you support.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadSupportDashboard(
                  false,
                )
              }
              disabled={refreshing}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={[
                  "h-4 w-4",
                  refreshing
                    ? "animate-spin"
                    : "",
                ].join(" ")}
              />

              Refresh
            </button>
          </div>

          <div className="grid border-t border-cyan-100/80 sm:grid-cols-3">
            <DashboardMetric
              icon={Users}
              label="People supported"
              value={
                serviceUsers.length
              }
            />

            <DashboardMetric
              icon={Clock3}
              label="Recent handovers"
              value={
                handovers.length
              }
            />

            <DashboardMetric
              icon={CheckCircle2}
              label="Unread"
              value={
                unreadCount
              }
              detail={
                unreadCount === 0
                  ? "You're up to date"
                  : `${readCount} already read`
              }
            />
          </div>
        </section>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {/* RECENT HANDOVERS */}

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-950">
                Recent Handovers
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Active handovers from the last 48 hours
                for your assigned service users.
              </p>
            </div>

            <Link
              href="/support/handovers"
              className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 transition hover:text-cyan-800"
            >
              View all handovers

              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/85 to-teal-50/70 text-sm font-medium text-slate-500 shadow-sm backdrop-blur-md">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />

              Loading handovers...
            </div>
          ) : handovers.length === 0 ? (
            <section className="rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/90 to-teal-50/70 px-8 py-10 text-center shadow-sm backdrop-blur-md">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-teal-100">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No recent handovers
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                There are no active handovers from the
                last 48 hours for the people currently
                assigned to you.
              </p>
            </section>
          ) : (
            <div className="space-y-4">
              {handovers
                .slice(0, 4)
                .map(
                  (handover) => (
                    <DashboardHandoverCard
                      key={
                        handover.id
                      }
                      handover={
                        handover
                      }
                    />
                  ),
                )}
            </div>
          )}

          {!loading &&
          handovers.length > 4 ? (
            <div className="flex justify-center pt-1">
              <Link
                href="/support/handovers"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-sm font-bold text-cyan-700 shadow-sm transition hover:bg-cyan-50"
              >
                View all{" "}
                {handovers.length}{" "}
                handovers

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </ContentWidth>
  );
}

type DashboardMetricProps = {
  icon: React.ElementType;
  label: string;
  value: number;
  detail?: string;
};

function DashboardMetric({
  icon: Icon,
  label,
  value,
  detail,
}: DashboardMetricProps) {
  return (
    <div className="border-b border-cyan-100/70 px-6 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4 text-cyan-600" />

        {label}
      </div>

      <p className="mt-2 text-2xl font-bold text-slate-950">
        {value}
      </p>

      {detail ? (
        <p className="mt-1 text-xs text-slate-500">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

type DashboardHandoverCardProps = {
  handover: Handover;
};

function DashboardHandoverCard({
  handover,
}: DashboardHandoverCardProps) {
  const preview =
    handover.content
      .replace(/\s+/g, " ")
      .trim();

  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md",
        handover.read
          ? "border-slate-200"
          : "border-cyan-200",
      ].join(" ")}
    >
      <div className="flex">
        <div
          className={[
            "w-2 shrink-0",
            handover.read
              ? "bg-slate-200"
              : "bg-gradient-to-b from-cyan-500 to-teal-500",
          ].join(" ")}
        />

        <div className="min-w-0 flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-400">
                {new Date(
                  handover.created_at,
                ).toLocaleString(
                  "en-GB",
                  {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>

              <h3 className="mt-1 text-lg font-bold text-slate-950">
                {handover.title}
              </h3>
            </div>

            <span
              className={[
                "shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold",
                handover.read
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700",
              ].join(" ")}
            >
              {handover.read
                ? "Read"
                : "Unread"}
            </span>
          </div>

          {handover
            .service_users
            .length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {handover.service_users.map(
                (serviceUser) => (
                  <span
                    key={
                      serviceUser.id
                    }
                    className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700"
                  >
                    {
                      serviceUser.full_name
                    }
                  </span>
                ),
              )}
            </div>
          ) : null}

          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {preview}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400">
              Created by{" "}
              {handover.staff_name}
            </p>

            <Link
              href="/support/handovers"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 transition hover:text-cyan-800"
            >
              Open

              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
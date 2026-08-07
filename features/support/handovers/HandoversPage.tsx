"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Loader2,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

import { ContentWidth } from "@/components/layout";

import { CastodiaCard } from "@/components/castodia";

import { supabase } from "@/lib/supabase";

import { generateHandoverSummary } from "@/lib/handovers/generateSummary";

import HandoverCard from "./components/HandoverCard";
import HandoverForm from "./components/HandoverForm";

import type {
  Handover,
  ServiceUser,
} from "./types";

type HandoverLink = {
  handover_id: string;
  service_user_id: string;
};

export default function HandoversPage() {
  const [handovers, setHandovers] = useState<
    Handover[]
  >([]);

  const [serviceUsers, setServiceUsers] = useState<
    ServiceUser[]
  >([]);

  const [userId, setUserId] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [
    selectedServiceUsers,
    setSelectedServiceUsers,
  ] = useState<string[]>([]);

  const [generating, setGenerating] =
    useState(false);

  const [handoverPeriod, setHandoverPeriod] =
    useState("24");

  const [formOpen, setFormOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function loadData(
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
          "You must be signed in to view handovers.",
        );
      }

      setUserId(user.id);

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        throw new Error(
          profileError.message,
        );
      }

      let visibleServiceUsers: ServiceUser[] =
        [];

      if (
        profile?.role === "manager"
      ) {
        const {
          data,
          error,
        } = await supabase
          .from("service_users")
          .select(
            "id, full_name, house_name",
          )
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

      const visibleServiceUserIds =
        visibleServiceUsers.map(
          (serviceUser) =>
            serviceUser.id,
        );

      if (
        visibleServiceUserIds.length === 0
      ) {
        setHandovers([]);
        return;
      }

      const {
        data: handoverLinks,
        error: linkError,
      } = await supabase
        .from(
          "handover_service_users",
        )
        .select(
          "handover_id, service_user_id",
        )
        .in(
          "service_user_id",
          visibleServiceUserIds,
        );

      if (linkError) {
        throw new Error(
          linkError.message,
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
        profilesResult,
        readsResult,
      ] = await Promise.all([
        supabase
          .from("handovers")
          .select("*")
          .eq("active", true)
          .in("id", handoverIds)
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("profiles")
          .select(
            "id, full_name",
          ),

        supabase
          .from("handover_reads")
          .select(
            "handover_id, staff_id",
          ),
      ]);

      if (handoverResult.error) {
        throw new Error(
          handoverResult.error.message,
        );
      }

      if (profilesResult.error) {
        throw new Error(
          profilesResult.error.message,
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
        profilesResult.data ?? [];

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

            const hasRead =
              reads.some(
                (read) =>
                  read.handover_id ===
                    handover.id &&
                  read.staff_id ===
                    user.id,
              );

            const readNames =
              reads
                .filter(
                  (read) =>
                    read.handover_id ===
                    handover.id,
                )
                .map((read) => {
                  const profile =
                    profiles.find(
                      (person) =>
                        person.id ===
                        read.staff_id,
                    );

                  return profile?.full_name;
                })
                .filter(Boolean);

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

              read: hasRead,

              read_by:
                readNames as string[],

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
          : "Handovers could not be loaded.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function toggleServiceUser(
    id: string,
  ) {
    setSelectedServiceUsers(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id,
            )
          : [...current, id],
    );
  }

  async function generateAutomaticSummary() {
    if (
      selectedServiceUsers.length ===
      0
    ) {
      alert(
        "Select at least one service user.",
      );

      return;
    }

    setGenerating(true);

    try {
      const summary =
        await generateHandoverSummary({
          serviceUsers:
            serviceUsers.map(
              (serviceUser) => ({
                id: serviceUser.id,
                full_name:
                  serviceUser.full_name,
              }),
            ),

          serviceUserIds:
            selectedServiceUsers,

          hoursBack:
            Number(
              handoverPeriod,
            ),
        });

      setContent(summary);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "The automatic handover summary could not be generated.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function createHandover() {
    if (
      !title.trim() ||
      !content.trim()
    ) {
      alert(
        "Please enter a title and handover details.",
      );

      return;
    }

    if (
      selectedServiceUsers.length ===
      0
    ) {
      alert(
        "Please select at least one service user.",
      );

      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "You must be logged in.",
      );

      return;
    }

    const {
      data: handover,
      error,
    } = await supabase
      .from("handovers")
      .insert({
        title: title.trim(),
        content:
          content.trim(),
        created_by: user.id,
        active: true,
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const links =
      selectedServiceUsers.map(
        (serviceUserId) => ({
          handover_id:
            handover.id,

          service_user_id:
            serviceUserId,
        }),
      );

    const {
      error: linkError,
    } = await supabase
      .from(
        "handover_service_users",
      )
      .insert(links);

    if (linkError) {
      alert(
        linkError.message,
      );

      return;
    }

    setTitle("");
    setContent("");
    setSelectedServiceUsers([]);
    setFormOpen(false);

    await loadData(false);
  }

  async function markAsRead(
    handoverId: string,
  ) {
    if (!userId) {
      return;
    }

    const { error } =
      await supabase
        .from("handover_reads")
        .insert({
          handover_id:
            handoverId,
          staff_id: userId,
        });

    if (
      error &&
      !error.message.includes(
        "duplicate",
      )
    ) {
      alert(error.message);
      return;
    }

    await loadData(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const unreadCount =
    handovers.filter(
      (handover) =>
        !handover.read,
    ).length;

  return (
        <ContentWidth>
        <div className="space-y-6 py-6">
          {/* Page introduction */}
          <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 shadow-sm">
            <div className="flex flex-col gap-6 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-sm">
                  <ClipboardList className="h-6 w-6" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    Handovers
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Share important updates between shifts
                    and keep everyone supporting the person
                    informed.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    void loadData(false)
                  }
                  disabled={refreshing}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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

                <button
                  type="button"
                  onClick={() =>
                    setFormOpen(
                      (current) =>
                        !current,
                    )
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
                >
                  <Plus className="h-4 w-4" />

                  New Handover
                </button>
              </div>
            </div>

            <div className="grid border-t border-cyan-100/80 sm:grid-cols-3">
              <SummaryMetric
                label="Active"
                value={
                  handovers.length
                }
              />

              <SummaryMetric
                label="Unread"
                value={
                  unreadCount
                }
              />

              <SummaryMetric
                label="Service users"
                value={
                  serviceUsers.length
                }
              />
            </div>
          </section>

          {/* Progressive disclosure form */}
          {formOpen ? (
            <section className="rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/90 to-teal-50/70 p-1 shadow-sm backdrop-blur-md">
              <HandoverForm
                title={title}
                content={content}
                handoverPeriod={
                  handoverPeriod
                }
                serviceUsers={
                  serviceUsers
                }
                selectedServiceUsers={
                  selectedServiceUsers
                }
                generating={
                  generating
                }
                onTitleChange={
                  setTitle
                }
                onContentChange={
                  setContent
                }
                onHandoverPeriodChange={
                  setHandoverPeriod
                }
                onToggleServiceUser={
                  toggleServiceUser
                }
                onGenerateSummary={() =>
                  void generateAutomaticSummary()
                }
                onCreateHandover={() =>
                  void createHandover()
                }
                onClose={() =>
                  setFormOpen(false)
                }
              />
            </section>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {/* Handovers */}
          {loading ? (
            <CastodiaCard>
              <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-medium text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin text-teal-600" />

                Loading handovers...
              </div>
            </CastodiaCard>
          ) : handovers.length ===
            0 ? (
            <EmptyState
              onCreate={() =>
                setFormOpen(true)
              }
            />
          ) : (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Current handovers
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Most recent first
                  </p>
                </div>

                {unreadCount > 0 ? (
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700">
                    {unreadCount} unread
                  </span>
                ) : null}
              </div>

              <div className="space-y-4">
                {handovers.map(
                  (handover) => (
                    <HandoverCard
                      key={
                        handover.id
                      }
                      handover={
                        handover
                      }
                      onMarkAsRead={
                        markAsRead
                      }
                    />
                  ),
                )}
              </div>
            </section>
          )}
        </div>
      </ContentWidth>
  );
}

type SummaryMetricProps = {
  label: string;
  value: number;
};

function SummaryMetric({
  label,
  value,
}: SummaryMetricProps) {
  return (
    <div className="border-b border-cyan-100/70 px-6 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

type EmptyStateProps = {
  onCreate: () => void;
};

function EmptyState({
  onCreate,
}: EmptyStateProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/90 to-teal-50/70 px-8 py-12 text-center shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm ring-1 ring-teal-100">
        <Users className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        No active handovers
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
        Handovers help staff share important information
        between shifts so that support remains safe,
        consistent and informed.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
      >
        Create a Handover

        <ArrowRight className="h-4 w-4" />
      </button>
    </section>
  );
}
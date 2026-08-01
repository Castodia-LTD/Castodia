"use client";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Filter,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";

import {
  CastodiaBadge,
  CastodiaButton,
  CastodiaCard,
  CastodiaPageShell,
  CastodiaSection,
} from "@/components/castodia";

type TicketStatus =
  | "submitted"
  | "triaged"
  | "in_progress"
  | "waiting_for_customer"
  | "resolved"
  | "closed";

type TicketPriority =
  | "low"
  | "medium"
  | "high"
  | "critical";

type TicketCategory =
  | "technical"
  | "bug"
  | "access"
  | "account"
  | "feature_request"
  | "billing"
  | "security"
  | "other";

type RelatedProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type RelatedOrganisation = {
  id: string;
  name: string;
};

type PlatformTicket = {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  affected_area: string | null;
  reporter_urgency: string | null;
  public_response: string | null;
  internal_notes: string | null;
  resolution_notes: string | null;
  organisation_id: string | null;
  reported_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;

  organisation?: RelatedOrganisation | null;
  reporter?: RelatedProfile | null;
  assignee?: RelatedProfile | null;
};

type Administrator = {
  id: string;
  full_name: string;
  role: "castodia_owner" | "castodia_admin";
};

const statusOptions: Array<{
  value: TicketStatus;
  label: string;
}> = [
  { value: "submitted", label: "Submitted" },
  { value: "triaged", label: "Triaged" },
  { value: "in_progress", label: "In progress" },
  {
    value: "waiting_for_customer",
    label: "Waiting for customer",
  },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions: Array<{
  value: TicketPriority;
  label: string;
}> = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const categoryOptions: Array<{
  value: TicketCategory;
  label: string;
}> = [
  { value: "technical", label: "Technical" },
  { value: "bug", label: "Bug" },
  { value: "access", label: "Access" },
  { value: "account", label: "Account" },
  {
    value: "feature_request",
    label: "Feature request",
  },
  { value: "billing", label: "Billing" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

function statusLabel(status: TicketStatus) {
  return (
    statusOptions.find((option) => option.value === status)
      ?.label ?? status
  );
}

function priorityLabel(priority: TicketPriority) {
  return (
    priorityOptions.find(
      (option) => option.value === priority
    )?.label ?? priority
  );
}

function categoryLabel(category: TicketCategory) {
  return (
    categoryOptions.find(
      (option) => option.value === category
    )?.label ?? category
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function statusBadgeVariant(
  status: TicketStatus
): "neutral" | "info" | "success" | "warning" {
  switch (status) {
    case "submitted":
      return "neutral";
    case "triaged":
    case "in_progress":
      return "info";
    case "waiting_for_customer":
      return "warning";
    case "resolved":
    case "closed":
      return "success";
  }
}

function priorityClasses(priority: TicketPriority) {
  switch (priority) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-700";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "low":
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export default function PlatformIssuesPage() {
  const [tickets, setTickets] = useState<PlatformTicket[]>(
    []
  );
  const [administrators, setAdministrators] = useState<
    Administrator[]
  >([]);

  const [selectedTicket, setSelectedTicket] =
    useState<PlatformTicket | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    TicketStatus | "all"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    TicketPriority | "all"
  >("all");
  const [categoryFilter, setCategoryFilter] = useState<
    TicketCategory | "all"
  >("all");

  const [editStatus, setEditStatus] =
    useState<TicketStatus>("submitted");
  const [editPriority, setEditPriority] =
    useState<TicketPriority>("medium");
  const [editCategory, setEditCategory] =
    useState<TicketCategory>("technical");
  const [editAssignedTo, setEditAssignedTo] =
    useState<string>("");
  const [editPublicResponse, setEditPublicResponse] =
    useState("");
  const [editInternalNotes, setEditInternalNotes] =
    useState("");
  const [editResolutionNotes, setEditResolutionNotes] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(
    null
  );

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be signed in.");
      }

      const { data: currentProfile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        throw new Error(profileError.message);
      }

      if (
        currentProfile?.role !== "castodia_owner" &&
        currentProfile?.role !== "castodia_admin"
      ) {
        throw new Error(
          "You do not have access to Platform Issues."
        );
      }

      const [ticketsResult, administratorsResult] =
        await Promise.all([
          supabase
            .from("platform_issues")
            .select(`
              id,
              ticket_number,
              title,
              description,
              category,
              status,
              priority,
              affected_area,
              reporter_urgency,
              public_response,
              internal_notes,
              resolution_notes,
              organisation_id,
              reported_by,
              assigned_to,
              created_at,
              updated_at,
              resolved_at,
              closed_at,
              organisation:organisations (
                id,
                name
              ),
              reporter:profiles!platform_issues_reported_by_fkey (
                id,
                full_name,
                email
              ),
              assignee:profiles!platform_issues_assigned_to_fkey (
                id,
                full_name,
                email
              )
            `)
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("profiles")
            .select("id, full_name, role")
            .in("role", [
              "castodia_owner",
              "castodia_admin",
            ])
            .eq("is_active", true)
            .order("full_name"),
        ]);

      if (ticketsResult.error) {
        throw new Error(ticketsResult.error.message);
      }

      if (administratorsResult.error) {
        throw new Error(
          administratorsResult.error.message
        );
      }

      setTickets(
        (ticketsResult.data ?? []) as unknown as PlatformTicket[]
      );

      setAdministrators(
        (administratorsResult.data ??
          []) as Administrator[]
      );
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load platform tickets."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const normalisedSearch = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      if (
        statusFilter !== "all" &&
        ticket.status !== statusFilter
      ) {
        return false;
      }

      if (
        priorityFilter !== "all" &&
        ticket.priority !== priorityFilter
      ) {
        return false;
      }

      if (
        categoryFilter !== "all" &&
        ticket.category !== categoryFilter
      ) {
        return false;
      }

      if (!normalisedSearch) {
        return true;
      }

      const searchableText = [
        ticket.ticket_number.toString(),
        ticket.title,
        ticket.description,
        ticket.organisation?.name ?? "",
        ticket.reporter?.full_name ?? "",
        ticket.assignee?.full_name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalisedSearch);
    });
  }, [
    tickets,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
  ]);

  const ticketCounts = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((ticket) =>
        [
          "submitted",
          "triaged",
          "in_progress",
          "waiting_for_customer",
        ].includes(ticket.status)
      ).length,
      critical: tickets.filter(
        (ticket) =>
          ticket.priority === "critical" &&
          !["resolved", "closed"].includes(ticket.status)
      ).length,
      resolved: tickets.filter((ticket) =>
        ["resolved", "closed"].includes(ticket.status)
      ).length,
    };
  }, [tickets]);

  function openTicket(ticket: PlatformTicket) {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditPriority(ticket.priority);
    setEditCategory(ticket.category);
    setEditAssignedTo(ticket.assigned_to ?? "");
    setEditPublicResponse(ticket.public_response ?? "");
    setEditInternalNotes(ticket.internal_notes ?? "");
    setEditResolutionNotes(ticket.resolution_notes ?? "");
  }

  function closeTicket() {
    if (saving) {
      return;
    }

    setSelectedTicket(null);
  }

  async function saveTicket() {
    if (!selectedTicket) {
      return;
    }

    if (
      ["resolved", "closed"].includes(editStatus) &&
      !editResolutionNotes.trim()
    ) {
      alert(
        "Add resolution notes before resolving or closing the ticket."
      );
      return;
    }

    setSaving(true);

    try {
      const now = new Date().toISOString();

      const updates: Record<string, unknown> = {
        status: editStatus,
        priority: editPriority,
        category: editCategory,
        assigned_to: editAssignedTo || null,
        public_response:
          editPublicResponse.trim() || null,
        internal_notes:
          editInternalNotes.trim() || null,
        resolution_notes:
          editResolutionNotes.trim() || null,
        updated_at: now,
      };

      if (
        editStatus === "resolved" &&
        selectedTicket.status !== "resolved"
      ) {
        updates.resolved_at = now;
      }

      if (editStatus !== "resolved") {
        updates.resolved_at = null;
      }

      if (
        editStatus === "closed" &&
        selectedTicket.status !== "closed"
      ) {
        updates.closed_at = now;
      }

      if (editStatus !== "closed") {
        updates.closed_at = null;
      }

      const { data, error } = await supabase
        .from("platform_issues")
        .update(updates)
        .eq("id", selectedTicket.id)
        .select(`
          id,
          ticket_number,
          title,
          description,
          category,
          status,
          priority,
          affected_area,
          reporter_urgency,
          public_response,
          internal_notes,
          resolution_notes,
          organisation_id,
          reported_by,
          assigned_to,
          created_at,
          updated_at,
          resolved_at,
          closed_at,
          organisation:organisations (
            id,
            name
          ),
          reporter:profiles!platform_issues_reported_by_fkey (
            id,
            full_name,
            email
          ),
          assignee:profiles!platform_issues_assigned_to_fkey (
            id,
            full_name,
            email
          )
        `)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const updatedTicket =
        data as unknown as PlatformTicket;

      setTickets((current) =>
        current.map((ticket) =>
          ticket.id === updatedTicket.id
            ? updatedTicket
            : ticket
        )
      );

      setSelectedTicket(updatedTicket);

      alert(
        `Ticket #${updatedTicket.ticket_number} updated successfully.`
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to update the ticket."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <CastodiaPageShell
      title="Platform Issues"
      description="Investigate, assign and resolve support tickets reported across Castodia."
      maxWidth="wide"
    >
      <CastodiaSection title="Ticket Overview">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Total Tickets"
            value={ticketCounts.total}
            icon={MessageSquareText}
            loading={loading}
          />

          <SummaryCard
            label="Open Tickets"
            value={ticketCounts.open}
            icon={Clock3}
            loading={loading}
          />

          <SummaryCard
            label="Critical"
            value={ticketCounts.critical}
            icon={ShieldAlert}
            loading={loading}
          />

          <SummaryCard
            label="Resolved"
            value={ticketCounts.resolved}
            icon={CheckCircle2}
            loading={loading}
          />
        </div>
      </CastodiaSection>

      <CastodiaSection
        title="Tickets"
        description={`${filteredTickets.length} ticket${
          filteredTickets.length === 1 ? "" : "s"
        } displayed`}
      >
        <CastodiaCard>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px_190px_auto]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tickets, organisations or users"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as TicketStatus | "all"
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All statuses</option>

              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as
                    | TicketPriority
                    | "all"
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All priorities</option>

              {priorityOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value as
                    | TicketCategory
                    | "all"
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              <option value="all">All categories</option>

              {categoryOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadTickets}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />

              Refresh
            </button>
          </div>
        </CastodiaCard>

        {loadError ? (
          <CastodiaCard>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-red-100 p-2 text-red-700">
                <CircleAlert className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Tickets could not be loaded
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  {loadError}
                </p>
              </div>
            </div>
          </CastodiaCard>
        ) : loading ? (
          <CastodiaCard>
            <div className="flex items-center gap-3 py-4 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading platform tickets...
            </div>
          </CastodiaCard>
        ) : filteredTickets.length === 0 ? (
          <CastodiaCard>
            <div className="py-8 text-center">
              <Filter className="mx-auto h-8 w-8 text-slate-400" />

              <h2 className="mt-3 font-semibold text-slate-950">
                No tickets found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                No tickets match the current filters.
              </p>
            </div>
          </CastodiaCard>
        ) : (
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                type="button"
                onClick={() => openTicket(ticket)}
                className="w-full text-left"
              >
                <CastodiaCard padding="md">
                  <div className="flex items-start gap-4">
                    <div
                      className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                        priorityClasses(ticket.priority),
                      ].join(" ")}
                    >
                      {ticket.priority === "critical" ||
                      ticket.priority === "high" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <MessageSquareText className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">
                          Ticket #{ticket.ticket_number}
                        </span>

                        <CastodiaBadge
                          variant={statusBadgeVariant(
                            ticket.status
                          )}
                        >
                          {statusLabel(ticket.status)}
                        </CastodiaBadge>

                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
                            priorityClasses(ticket.priority),
                          ].join(" ")}
                        >
                          {priorityLabel(ticket.priority)}
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-semibold text-slate-950">
                        {ticket.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {ticket.description}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {ticket.organisation?.name ??
                            "Internal Castodia ticket"}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <UserRound className="h-3.5 w-3.5" />
                          Reported by{" "}
                          {ticket.reporter?.full_name ??
                            "Unknown user"}
                        </span>

                        <span>
                          {categoryLabel(ticket.category)}
                        </span>

                        <span>
                          Created {formatDate(ticket.created_at)}
                        </span>

                        <span>
                          Assigned to{" "}
                          {ticket.assignee?.full_name ??
                            "Unassigned"}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" />
                  </div>
                </CastodiaCard>
              </button>
            ))}
          </div>
        )}
      </CastodiaSection>

      {selectedTicket ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ticket-dialog-title"
        >
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-sm font-bold text-slate-500">
                  Ticket #{selectedTicket.ticket_number}
                </p>

                <h2
                  id="ticket-dialog-title"
                  className="mt-1 text-xl font-semibold text-slate-950"
                >
                  {selectedTicket.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeTicket}
                disabled={saving}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close ticket"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-6">
                <TicketDetailBlock
                  title="Issue description"
                  content={selectedTicket.description}
                />

                <TicketDetailBlock
                  title="Affected area"
                  content={
                    selectedTicket.affected_area ||
                    "Not specified"
                  }
                />

                <div>
                  <label
                    htmlFor="public-response"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Reporter-visible response
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    This update may be shown to the manager or
                    support user who submitted the ticket.
                  </p>

                  <textarea
                    id="public-response"
                    value={editPublicResponse}
                    onChange={(event) =>
                      setEditPublicResponse(
                        event.target.value
                      )
                    }
                    rows={5}
                    disabled={saving}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="internal-notes"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Internal Castodia notes
                  </label>

                  <p className="mt-1 text-xs text-slate-500">
                    These notes should not be visible to the
                    reporting organisation.
                  </p>

                  <textarea
                    id="internal-notes"
                    value={editInternalNotes}
                    onChange={(event) =>
                      setEditInternalNotes(
                        event.target.value
                      )
                    }
                    rows={6}
                    disabled={saving}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label
                    htmlFor="resolution-notes"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Resolution notes
                  </label>

                  <textarea
                    id="resolution-notes"
                    value={editResolutionNotes}
                    onChange={(event) =>
                      setEditResolutionNotes(
                        event.target.value
                      )
                    }
                    rows={5}
                    disabled={saving}
                    placeholder="Explain what was changed or how the issue was resolved."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <aside className="space-y-5">
                <CastodiaCard padding="md">
                  <div className="grid gap-4">
                    <SelectField
                      id="ticket-status"
                      label="Status"
                      value={editStatus}
                      onChange={(value) =>
                        setEditStatus(value as TicketStatus)
                      }
                      disabled={saving}
                      options={statusOptions}
                    />

                    <SelectField
                      id="ticket-priority"
                      label="Priority"
                      value={editPriority}
                      onChange={(value) =>
                        setEditPriority(
                          value as TicketPriority
                        )
                      }
                      disabled={saving}
                      options={priorityOptions}
                    />

                    <SelectField
                      id="ticket-category"
                      label="Category"
                      value={editCategory}
                      onChange={(value) =>
                        setEditCategory(
                          value as TicketCategory
                        )
                      }
                      disabled={saving}
                      options={categoryOptions}
                    />

                    <div>
                      <label
                        htmlFor="ticket-assignee"
                        className="text-sm font-medium text-slate-700"
                      >
                        Assigned administrator
                      </label>

                      <select
                        id="ticket-assignee"
                        value={editAssignedTo}
                        onChange={(event) =>
                          setEditAssignedTo(
                            event.target.value
                          )
                        }
                        disabled={saving}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                      >
                        <option value="">Unassigned</option>

                        {administrators.map(
                          (administrator) => (
                            <option
                              key={administrator.id}
                              value={administrator.id}
                            >
                              {administrator.full_name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </CastodiaCard>

                <CastodiaCard padding="md">
                  <h3 className="font-semibold text-slate-950">
                    Ticket information
                  </h3>

                  <dl className="mt-4 grid gap-4 text-sm">
                    <TicketMetadata
                      term="Organisation"
                      detail={
                        selectedTicket.organisation?.name ??
                        "Internal Castodia ticket"
                      }
                    />

                    <TicketMetadata
                      term="Reported by"
                      detail={
                        selectedTicket.reporter?.full_name ??
                        "Unknown user"
                      }
                    />

                    <TicketMetadata
                      term="Reporter email"
                      detail={
                        selectedTicket.reporter?.email ??
                        "Unavailable"
                      }
                    />

                    <TicketMetadata
                      term="Reporter urgency"
                      detail={
                        selectedTicket.reporter_urgency ??
                        "Not specified"
                      }
                    />

                    <TicketMetadata
                      term="Created"
                      detail={formatDate(
                        selectedTicket.created_at
                      )}
                    />

                    <TicketMetadata
                      term="Last updated"
                      detail={formatDate(
                        selectedTicket.updated_at
                      )}
                    />

                    <TicketMetadata
                      term="Resolved"
                      detail={formatDate(
                        selectedTicket.resolved_at
                      )}
                    />
                  </dl>
                </CastodiaCard>
              </aside>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-5">
              <button
                type="button"
                onClick={closeTicket}
                disabled={saving}
                className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                Cancel
              </button>

              <CastodiaButton
                onClick={saveTicket}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving ticket...
                  </>
                ) : (
                  "Save Ticket"
                )}
              </CastodiaButton>
            </div>
          </div>
        </div>
      ) : null}
    </CastodiaPageShell>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  loading: boolean;
  icon: typeof MessageSquareText;
};

function SummaryCard({
  label,
  value,
  loading,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <CastodiaCard padding="md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          {loading ? (
            <Loader2 className="mt-3 h-7 w-7 animate-spin text-slate-400" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {value}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CastodiaCard>
  );
}

function TicketDetailBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>

      <div className="mt-2 whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
        {content}
      </div>
    </div>
  );
}

function TicketMetadata({
  term,
  detail,
}: {
  term: string;
  detail: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {term}
      </dt>

      <dd className="mt-1 break-words text-slate-700">
        {detail}
      </dd>
    </div>
  );
}

type SelectOption = {
  value: string;
  label: string;
};

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  disabled: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
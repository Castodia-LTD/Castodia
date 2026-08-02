"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  Link2,
  LockKeyhole,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Phone,
  Plus,
  ShieldAlert,
  UserRound,
} from "lucide-react";

type SafeguardingTab =
  | "overview"
  | "chronology"
  | "actions"
  | "documents"
  | "closure";

type ChronologyEntryType =
  | "concern-submitted"
  | "protective-action"
  | "timeline-link"
  | "professional-contact"
  | "referral"
  | "risk-change";

interface ChronologyEntry {
  id: string;
  type: ChronologyEntryType;
  title: string;
  occurredAt: string;
  description: string;
  recordedBy: string;
  recordedAt: string;
  organisation?: string;
  reference?: string;
  attachmentCount?: number;
  linkedEntryType?: string;
}

const tabs: Array<{
  id: SafeguardingTab;
  label: string;
  count?: number;
}> = [
  { id: "overview", label: "Overview" },
  { id: "chronology", label: "Case chronology" },
  { id: "actions", label: "Actions", count: 2 },
  { id: "documents", label: "Documents", count: 3 },
  { id: "closure", label: "Closure" },
];

const chronologyEntries: ChronologyEntry[] = [
  {
    id: "event-1",
    type: "concern-submitted",
    title: "Safeguarding concern submitted",
    occurredAt: "2 August 2026 at 09:10",
    description:
      "A staff member submitted a confidential safeguarding concern after bruising was observed during morning support.",
    recordedBy: "Sarah Collins",
    recordedAt: "2 August 2026 at 09:10",
  },
  {
    id: "event-2",
    type: "protective-action",
    title: "Immediate protective action recorded",
    occurredAt: "2 August 2026 at 09:35",
    description:
      "The service user was supported away from the alleged source of harm. The on-call manager was informed and staffing arrangements were reviewed.",
    recordedBy: "Sarah Collins",
    recordedAt: "2 August 2026 at 09:38",
  },
  {
    id: "event-3",
    type: "risk-change",
    title: "Provider risk level assessed as High",
    occurredAt: "2 August 2026 at 10:05",
    description:
      "The alleged source of harm may retain access to the person. Enhanced safeguards will remain in place pending management review.",
    recordedBy: "James Lunt",
    recordedAt: "2 August 2026 at 10:05",
  },
  {
    id: "event-4",
    type: "timeline-link",
    title: "Timeline entry linked",
    occurredAt: "2 August 2026 at 10:20",
    description:
      "Linked because the injury record contains factual observations relevant to this safeguarding concern.",
    recordedBy: "James Lunt",
    recordedAt: "2 August 2026 at 10:20",
    linkedEntryType: "Accident / Injury",
    attachmentCount: 1,
  },
  {
    id: "event-5",
    type: "professional-contact",
    title: "Professional contact",
    occurredAt: "2 August 2026 at 11:05",
    description:
      "The concern and immediate protective measures were discussed. Advice was received to submit a formal safeguarding referral and preserve the original records.",
    organisation: "Local Authority Safeguarding Team",
    reference: "LA-2026-1842",
    recordedBy: "James Lunt",
    recordedAt: "2 August 2026 at 11:14",
  },
  {
    id: "event-6",
    type: "referral",
    title: "External referral submitted",
    occurredAt: "2 August 2026 at 14:40",
    description:
      "A formal adult safeguarding referral was submitted to the local authority. Confirmation of receipt is attached.",
    organisation: "Local Authority Safeguarding Team",
    reference: "LA-2026-1842",
    attachmentCount: 1,
    recordedBy: "James Lunt",
    recordedAt: "2 August 2026 at 14:46",
  },
];

const iconStyles: Record<
  ChronologyEntryType,
  {
    icon: typeof ShieldAlert;
    background: string;
    colour: string;
  }
> = {
  "concern-submitted": {
    icon: ShieldAlert,
    background: "bg-rose-50",
    colour: "text-rose-600",
  },
  "protective-action": {
    icon: Check,
    background: "bg-emerald-50",
    colour: "text-emerald-600",
  },
  "timeline-link": {
    icon: Link2,
    background: "bg-sky-50",
    colour: "text-sky-600",
  },
  "professional-contact": {
    icon: Phone,
    background: "bg-violet-50",
    colour: "text-violet-600",
  },
  referral: {
    icon: FileText,
    background: "bg-cyan-50",
    colour: "text-cyan-700",
  },
  "risk-change": {
    icon: ShieldAlert,
    background: "bg-amber-50",
    colour: "text-amber-600",
  },
};

export default function SafeguardingPage() {
  const [activeTab, setActiveTab] =
    useState<SafeguardingTab>("chronology");
  const [showAddMenu, setShowAddMenu] = useState(false);

  const orderedEntries = useMemo(
    () =>
      [...chronologyEntries].sort(
        (first, second) =>
          new Date(second.recordedAt).getTime() -
          new Date(first.recordedAt).getTime(),
      ),
    [],
  );

  return (
    <div className="min-h-full bg-[#f4f8fb] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1500px]">
        <button
          type="button"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to safeguarding
        </button>

        <header className="rounded-[24px] border border-white/80 bg-white px-5 py-5 shadow-[0_10px_35px_rgba(15,49,71,0.06)] sm:px-7">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0bb8ae] to-[#087f91] text-white shadow-sm">
                <ShieldAlert className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold tracking-wide text-[#079b9a]">
                    SG-2026-0042
                  </span>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                    Under review
                  </span>

                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                    High risk
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-[#16364a] sm:text-[28px]">
                  Safeguarding concern
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-4 w-4" />
                    Alex Morgan
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Opened 2 August 2026
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4" />
                    Assigned to James Lunt
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <MoreHorizontal className="h-4 w-4" />
                Case options
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAddMenu((current) => !current)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0ab8ae] to-[#078c9b] px-4 text-sm font-bold text-white shadow-sm transition hover:brightness-95"
                >
                  <Plus className="h-4 w-4" />
                  Add chronology entry
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showAddMenu && (
                  <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <AddMenuButton
                      icon={Phone}
                      label="Professional contact"
                    />
                    <AddMenuButton
                      icon={FileText}
                      label="External referral"
                    />
                    <AddMenuButton
                      icon={MessageSquareText}
                      label="Internal discussion"
                    />
                    <AddMenuButton
                      icon={Check}
                      label="Action or decision"
                    />

                    <div className="my-2 border-t border-slate-100" />

                    <AddMenuButton
                      icon={Link2}
                      label="Link timeline entry"
                    />
                    <AddMenuButton
                      icon={Plus}
                      label="Custom chronology entry"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100">
            <nav
              aria-label="Safeguarding case sections"
              className="-mb-px flex gap-1 overflow-x-auto pt-3"
            >
              {tabs.map((tab) => {
                const selected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      "relative flex shrink-0 items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-semibold transition",
                      selected
                        ? "text-[#078f94]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                    ].join(" ")}
                  >
                    {tab.label}

                    {tab.count !== undefined && (
                      <span
                        className={[
                          "min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-bold",
                          selected
                            ? "bg-teal-50 text-teal-700"
                            : "bg-slate-100 text-slate-600",
                        ].join(" ")}
                      >
                        {tab.count}
                      </span>
                    )}

                    {selected && (
                      <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#09a9a2]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3.5 text-sm text-cyan-950">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />

          <div>
            <p className="font-bold">Restricted safeguarding record</p>
            <p className="mt-0.5 leading-6 text-cyan-900/75">
              This case and its chronology are visible only to authorised
              managers. Linked care records remain unchanged and do not show
              that they are connected to a safeguarding case.
            </p>
          </div>
        </div>

        <main className="mt-5">
          {activeTab === "chronology" && (
            <ChronologyPanel entries={orderedEntries} />
          )}

          {activeTab === "overview" && (
            <PlaceholderPanel
              title="Case overview"
              description="The original concern, people involved, immediate safety information and current management assessment will appear here."
            />
          )}

          {activeTab === "actions" && (
            <PlaceholderPanel
              title="Safeguarding actions"
              description="Assigned actions, owners, due dates, completion details and outcomes will appear here."
            />
          )}

          {activeTab === "documents" && (
            <PlaceholderPanel
              title="Case documents"
              description="Evidence, referral documents, correspondence and outcome letters will appear here."
            />
          )}

          {activeTab === "closure" && (
            <PlaceholderPanel
              title="Case closure"
              description="The outcome, remaining risks, lessons learned and required care-plan or risk-assessment reviews will be recorded here."
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ChronologyPanel({
  entries,
}: {
  entries: ChronologyEntry[];
}) {
  return (
    <section className="rounded-[24px] border border-white/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,49,71,0.06)] sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold text-[#16364a]">
            Case chronology
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            A complete record of how this safeguarding concern has been
            reviewed and managed.
          </p>
        </div>

        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <CalendarDays className="h-4 w-4" />
          Filter entries
        </button>
      </div>

      <div className="mt-7">
        {entries.map((entry, index) => (
          <ChronologyItem
            key={entry.id}
            entry={entry}
            isLast={index === entries.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function ChronologyItem({
  entry,
  isLast,
}: {
  entry: ChronologyEntry;
  isLast: boolean;
}) {
  const style = iconStyles[entry.type];
  const Icon = style.icon;

  return (
    <article className="relative flex gap-4 sm:gap-5">
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute left-[19px] top-10 h-[calc(100%-8px)] w-px bg-slate-200"
        />
      )}

      <div
        className={[
          "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          style.background,
          style.colour,
        ].join(" ")}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>

      <div
        className={[
          "min-w-0 flex-1",
          isLast ? "pb-1" : "border-b border-slate-100 pb-7 mb-7",
        ].join(" ")}
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
          <div>
            <h3 className="font-bold text-[#18394d]">{entry.title}</h3>

            <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />
              {entry.occurredAt}
            </p>
          </div>

          <button
            type="button"
            aria-label={`Options for ${entry.title}`}
            className="self-start rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>

        {entry.linkedEntryType && (
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
                <Link2 className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                  Linked care record
                </p>
                <p className="truncate text-sm font-bold text-slate-700">
                  {entry.linkedEntryType} · 2 August 2026 at 09:42
                </p>
              </div>
            </div>

            <span className="shrink-0 text-xs font-bold text-sky-700">
              View entry
            </span>
          </button>
        )}

        <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-600">
          {entry.description}
        </p>

        {(entry.organisation ||
          entry.reference ||
          entry.attachmentCount) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {entry.organisation && (
              <DetailChip
                icon={UserRound}
                label={entry.organisation}
              />
            )}

            {entry.reference && (
              <DetailChip
                icon={FileText}
                label={`Reference: ${entry.reference}`}
              />
            )}

            {!!entry.attachmentCount && (
              <DetailChip
                icon={Paperclip}
                label={`${entry.attachmentCount} attachment${
                  entry.attachmentCount === 1 ? "" : "s"
                }`}
              />
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Recorded by{" "}
          <span className="font-semibold text-slate-500">
            {entry.recordedBy}
          </span>{" "}
          · {entry.recordedAt}
        </p>
      </div>
    </article>
  );
}

function AddMenuButton({
  icon: Icon,
  label,
}: {
  icon: typeof Plus;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      <Icon className="h-4 w-4 text-[#079b9a]" />
      {label}
    </button>
  );
}

function DetailChip({
  icon: Icon,
  label,
}: {
  icon: typeof FileText;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function PlaceholderPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[24px] border border-white/80 bg-white p-7 shadow-[0_10px_35px_rgba(15,49,71,0.06)]">
      <h2 className="text-xl font-bold text-[#16364a]">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </section>
  );
}
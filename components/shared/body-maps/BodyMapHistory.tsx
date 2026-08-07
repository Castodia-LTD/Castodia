"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  Search,
} from "lucide-react";

import TimelineEntryCard from "@/components/timelines/TimelineEntryCard";

import {
  getBodyMapQuickDateRange,
  getBodyMapTimelineEntries,
  getDefaultBodyMapDateRange,
  type BodyMapDateRange,
} from "@/lib/service-user-hub/body-maps/api";

import type { TimelineEntry } from "@/lib/timelines/types";

type QuickRange =
  | "7-days"
  | "30-days"
  | "3-months"
  | "6-months"
  | "12-months";

type BodyMapHistoryProps = {
  serviceUserId: string;
  serviceUserGender?: string | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The body-map records could not be loaded.";
}

function formatRangeDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function BodyMapHistory({
  serviceUserId,
  serviceUserGender,
}: BodyMapHistoryProps) {
  const defaultRange = useMemo(
    () => getDefaultBodyMapDateRange(),
    [],
  );

  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  const [appliedRange, setAppliedRange] =
    useState<BodyMapDateRange>(defaultRange);

  const [draftRange, setDraftRange] =
    useState<BodyMapDateRange>(defaultRange);

  const [appliedSearchText, setAppliedSearchText] = useState("");
  const [draftSearchText, setDraftSearchText] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  async function loadEntries(
    range: BodyMapDateRange,
    searchText: string,
  ) {
    setLoading(true);
    setErrorMessage(null);

    try {
      const records = await getBodyMapTimelineEntries(
        serviceUserId,
        range,
        searchText,
      );

      setEntries(records);
    } catch (error) {
      setEntries([]);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setAppliedRange(defaultRange);
    setDraftRange(defaultRange);
    setAppliedSearchText("");
    setDraftSearchText("");

    void loadEntries(defaultRange, "");
  }, [serviceUserId, defaultRange]);

  function handleApplyFilters() {
    setAppliedRange(draftRange);
    setAppliedSearchText(draftSearchText.trim());

    void loadEntries(
      draftRange,
      draftSearchText.trim(),
    );
  }

  function handleQuickRange(range: QuickRange) {
    const nextRange = getBodyMapQuickDateRange(range);

    setDraftRange(nextRange);
    setAppliedRange(nextRange);

    setDraftSearchText("");
    setAppliedSearchText("");

    void loadEntries(nextRange, "");
  }

  function handleReset() {
    const nextRange = getDefaultBodyMapDateRange();

    setDraftRange(nextRange);
    setAppliedRange(nextRange);

    setDraftSearchText("");
    setAppliedSearchText("");

    void loadEntries(nextRange, "");
  }

  const rangeDescription =
    appliedRange.fromDate === defaultRange.fromDate &&
    appliedRange.toDate === defaultRange.toDate &&
    !appliedSearchText
      ? "Showing body maps recorded during the last 30 days."
      : `Showing body maps from ${formatRangeDate(
          appliedRange.fromDate,
        )} to ${formatRangeDate(appliedRange.toDate)}${
          appliedSearchText
            ? ` matching “${appliedSearchText}”.`
            : "."
        }`;

  return (
    <section
      aria-labelledby="body-map-history-heading"
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id="body-map-history-heading"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Body Maps
          </h1>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            {rangeDescription}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() =>
            setFiltersOpen((current) => !current)
          }
          className={[
            "inline-flex min-h-10 shrink-0 items-center justify-center gap-2",
            "rounded-xl border border-cyan-200 bg-white px-4 py-2.5",
            "text-sm font-bold text-cyan-700 shadow-sm transition",
            "hover:border-cyan-300 hover:bg-cyan-50",
          ].join(" ")}
        >
          <Search
            aria-hidden="true"
            className="h-4 w-4"
          />

          Search and date range

          {filtersOpen ? (
            <ChevronUp
              aria-hidden="true"
              className="h-4 w-4"
            />
          ) : (
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4"
            />
          )}
        </button>
      </div>

      {filtersOpen ? (
        <section className="rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/75 via-white/85 to-teal-50/75 p-5 shadow-sm backdrop-blur-md">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Search body maps
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              Choose a common period or enter a custom date range.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <QuickRangeButton
              label="Last 7 days"
              onClick={() => handleQuickRange("7-days")}
            />

            <QuickRangeButton
              label="Last 30 days"
              onClick={() => handleQuickRange("30-days")}
            />

            <QuickRangeButton
              label="Last 3 months"
              onClick={() => handleQuickRange("3-months")}
            />

            <QuickRangeButton
              label="Last 6 months"
              onClick={() => handleQuickRange("6-months")}
            />

            <QuickRangeButton
              label="Last 12 months"
              onClick={() => handleQuickRange("12-months")}
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DateField
              id="body-map-from-date"
              label="From date"
              value={draftRange.fromDate}
              onChange={(value) =>
                setDraftRange((current) => ({
                  ...current,
                  fromDate: value,
                }))
              }
            />

            <DateField
              id="body-map-to-date"
              label="To date"
              value={draftRange.toDate}
              onChange={(value) =>
                setDraftRange((current) => ({
                  ...current,
                  toDate: value,
                }))
              }
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="body-map-search-text"
              className="block text-sm font-semibold text-slate-800"
            >
              Search recorded details
            </label>

            <div className="relative mt-2">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />

              <input
                id="body-map-search-text"
                type="search"
                value={draftSearchText}
                placeholder="e.g. bruise, left arm or action taken"
                onChange={(event) =>
                  setDraftSearchText(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                className="w-full rounded-xl border border-cyan-100 bg-white/90 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
            >
              <RotateCcw
                aria-hidden="true"
                className="h-4 w-4"
              />

              Reset to last 30 days
            </button>

            <button
              type="button"
              onClick={handleApplyFilters}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
            >
              <Search
                aria-hidden="true"
                className="h-4 w-4"
              />

              Apply filters
            </button>
          </div>
        </section>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {errorMessage}
        </div>
      ) : null}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/80 to-teal-50/70 text-slate-600 shadow-sm backdrop-blur-md">
          <Loader2
            aria-hidden="true"
            className="h-5 w-5 animate-spin text-teal-700"
          />

          <span>Loading body maps...</span>
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <TimelineEntryCard
              key={entry.id}
              entry={entry}
              serviceUserGender={serviceUserGender}
            />
          ))}
        </div>
      ) : (
        <BodyMapEmptyState
          isDefaultRange={
            appliedRange.fromDate === defaultRange.fromDate &&
            appliedRange.toDate === defaultRange.toDate &&
            !appliedSearchText
          }
          onSearchWider={() => setFiltersOpen(true)}
        />
      )}
    </section>
  );
}

type QuickRangeButtonProps = {
  label: string;
  onClick: () => void;
};

function QuickRangeButton({
  label,
  onClick,
}: QuickRangeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-teal-200 bg-white/80 px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
    >
      {label}
    </button>
  );
}

type DateFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

function DateField({
  id,
  label,
  value,
  onChange,
}: DateFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}
      </label>

      <div className="mt-2 flex w-full min-w-0 items-center gap-2 rounded-xl border border-cyan-100 bg-white/90 px-3 py-3 shadow-sm focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-100">
        <CalendarDays
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-slate-400"
        />

        <input
          id={id}
          type="date"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="block w-full min-w-0 border-0 bg-transparent p-0 text-sm text-slate-900 outline-none"
        />
      </div>
    </div>
  );
}

type BodyMapEmptyStateProps = {
  isDefaultRange: boolean;
  onSearchWider: () => void;
};

function BodyMapEmptyState({
  isDefaultRange,
  onSearchWider,
}: BodyMapEmptyStateProps) {
  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/70 via-white/85 to-teal-50/70 px-8 py-10 text-center shadow-sm backdrop-blur-md">
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        Body Maps
      </h2>

      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-700">
        A body map provides a visual record of injuries, marks and
        physical observations.
      </p>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
        It supports accurate documentation, continuity of care and
        appropriate safeguarding follow-up.
      </p>

      <p className="mx-auto mt-5 max-w-xl text-sm font-semibold text-slate-700">
        {isDefaultRange
          ? "No body maps have been recorded for this person during the last 30 days."
          : "No body maps were found within the selected search criteria."}
      </p>

      <button
        type="button"
        onClick={onSearchWider}
        className="mt-7 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-5 py-2.5 text-sm font-bold text-cyan-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
      >
        <Search
          aria-hidden="true"
          className="h-4 w-4"
        />

        Search a wider date range
      </button>
    </section>
  );
}
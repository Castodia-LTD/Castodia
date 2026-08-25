"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

import BodyMapViewerModal from "@/components/care/body-maps/BodyMapViewerModal";
import { formatAuditDate, formatEventTime } from "@/lib/shared/date";
import { getEntryStyle } from "@/lib/care/timelines/entryStyles";
import { getTimelineSummary } from "@/lib/care/timelines/getTimelineSummary";
import type { TimelineEntry } from "@/lib/care/timelines/types";

type Props = {
  entry: TimelineEntry;
  serviceUserGender?: string | null;
};

export default function TimelineEntryCard({
  entry,
  serviceUserGender,
}: Props) {
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const style = getEntryStyle(entry.entry_type);
  const Icon = style.icon;
  const isSleep = entry.entry_type === "Sleep";

  const bodyMapEligibleTypes = [
    "Body Map",
    "Accident / Injury",
    "Fall",
    "Behaviour Incident",
    "Safeguarding Concern",
    "Medication Error",
    "Near Miss",
  ];

  const hasBodyMap = bodyMapEligibleTypes.includes(entry.entry_type);

  const summary = isSleep
    ? entry.content
    : getTimelineSummary(entry.entry_type, entry.content);

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setExpanded((current) => !current);
          }
        }}
        className={[
          "group relative cursor-pointer overflow-hidden rounded-[20px]",
          "border transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60",
          expanded
            ? "border-teal-100 bg-gradient-to-br from-white via-[#fbffff] to-[#f1fbfa] shadow-[0_14px_34px_rgba(13,148,136,0.10)]"
            : "border-slate-200/80 bg-white/95 shadow-[0_5px_18px_rgba(15,23,42,0.045)] hover:-translate-y-[1px] hover:border-teal-100 hover:shadow-[0_10px_28px_rgba(13,148,136,0.08)]",
        ].join(" ")}
      >
        <div
          aria-hidden="true"
          className={[
            "absolute inset-y-0 left-0 w-1 transition-opacity duration-200",
            `bg-gradient-to-b ${style.accent}`,
            expanded ? "opacity-70" : "opacity-35",
          ].join(" ")}
        />

        <div
          aria-hidden="true"
          className={[
            "pointer-events-none absolute -left-14 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-200",
            `bg-gradient-to-br ${style.accent}`,
            expanded ? "opacity-[0.10]" : "opacity-[0.05]",
          ].join(" ")}
        />

        <div className="relative flex items-start gap-3.5 px-4 py-3.5 sm:px-5 sm:py-4">
          <div
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              `bg-gradient-to-br ${style.accent}`,
              "text-white shadow-[0_6px_16px_rgba(15,23,42,0.12)]",
              "ring-4 ring-white/80",
            ].join(" ")}
          >
            <Icon size={19} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {!isSleep && (
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-[15px]">
                    {entry.entry_type}
                  </h3>
                )}

                <p
                  className={
                    isSleep
                      ? "text-xs font-medium text-slate-500"
                      : "mt-0.5 text-xs font-medium text-slate-500"
                  }
                >
                  <span className="sm:hidden">
                    {formatEventTime(entry.event_time)}
                    {entry.staff_name && " • "}
                  </span>
                  {entry.staff_name ?? "Unknown staff member"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {hasBodyMap && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowBodyMap(true);
                    }}
                    className="rounded-lg border border-teal-100 bg-teal-50/70 px-2.5 py-1.5 text-xs font-semibold text-teal-700 transition hover:border-teal-200 hover:bg-teal-100"
                  >
                    Body Map
                  </button>
                )}

                {entry.entry_type === "Incident" && !entry.reviewed && (
                  <Link
                    href={`/incidents/${entry.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Review
                  </Link>
                )}

                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-xl transition",
                    expanded
                      ? "bg-teal-100/70 text-teal-700"
                      : "bg-[#f6fbfb] text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600",
                  ].join(" ")}
                >
                  {expanded ? (
                    <ChevronUp size={16} aria-hidden="true" />
                  ) : (
                    <ChevronDown size={16} aria-hidden="true" />
                  )}
                </span>
              </div>
            </div>

            <div className="mt-2">
              {expanded ? (
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                  {entry.content}
                </p>
              ) : (
                <p
                  className={
                    isSleep
                      ? "line-clamp-2 text-sm font-medium leading-5 text-slate-800"
                      : "line-clamp-2 text-sm leading-5 text-slate-600"
                  }
                >
                  {summary}
                </p>
              )}
            </div>

            {expanded && (
              <div className="mt-3 border-t border-teal-100/70 pt-2.5">
                <p className="text-xs text-slate-400">
                  Recorded {formatAuditDate(entry.created_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>

      {showBodyMap && (
        <BodyMapViewerModal
          timelineEntryId={entry.id}
          serviceUserGender={serviceUserGender}
          onClose={() => setShowBodyMap(false)}
        />
      )}
    </>
  );
}
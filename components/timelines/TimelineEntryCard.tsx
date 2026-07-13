"use client";

import { useState } from "react";
import Link from "next/link";
import type { TimelineEntry } from "@/lib/timelines/types";
import { getEntryStyle } from "@/lib/timelines/entryStyles";
import { getTimelineSummary } from "@/lib/timelines/getTimelineSummary";
import { formatAuditDate, formatEventTime } from "@/lib/shared/date";
import BodyMapViewerModal from "@/components/body-maps/BodyMapViewerModal";
import { ChevronDown, ChevronUp } from "lucide-react";

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

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            setExpanded((current) => !current);
          }
        }}
        className="relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div className={`absolute inset-y-0 left-0 w-3 ${style.rail}`} />

        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl bg-gradient-to-br ${style.accent} p-2.5 text-white shadow-sm`}
          >
            <Icon size={35} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">
                  {entry.entry_type}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {formatEventTime(entry.event_time)}
                  {entry.staff_name && ` • ${entry.staff_name}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasBodyMap && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setShowBodyMap(true);
                    }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Body Map
                  </button>
                )}

                {entry.entry_type === "Incident" && !entry.reviewed && (
                  <Link
                    href={`/incidents/${entry.id}`}
                    onClick={(event) => event.stopPropagation()}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    Review
                  </Link>
                )}

                <span className="text-slate-400">
                  {expanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </span>
              </div>
            </div>

            <div className="mt-4">
              {expanded ? (
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                  {entry.content}
                </p>
              ) : (
                <p className="line-clamp-2 text-sm leading-6 text-slate-600">
                  {getTimelineSummary(entry.entry_type, entry.content)}
                </p>
              )}
            </div>

            {expanded && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400">
                  Recorded {formatAuditDate(entry.created_at)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
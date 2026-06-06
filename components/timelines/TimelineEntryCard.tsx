"use client";

import { useState } from "react";
import Link from "next/link";
import type { TimelineEntry } from "@/lib/timelines/types";
import { getEntryStyle } from "@/lib/timelines/entryStyles";
import { formatAuditDate, formatEventTime } from "@/lib/shared/date";
import BodyMapViewerModal from "@/components/body-maps/BodyMapViewerModal";

type Props = {
  entry: TimelineEntry;
  serviceUserGender?: string | null;
};

export default function TimelineEntryCard({ entry, serviceUserGender }: Props) {
  const [showBodyMap, setShowBodyMap] = useState(false);

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
        className={`rounded-3xl border ${style.border} bg-white/10 p-4 shadow-xl backdrop-blur`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-2xl bg-gradient-to-br ${style.accent} p-3 text-white`}
          >
            <Icon size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`font-bold ${style.text}`}>{entry.entry_type}</p>

                <p className="text-xs text-slate-400">
                  {formatEventTime(entry.event_time)} · {entry.staff_name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {hasBodyMap && (
                  <button
                    type="button"
                    onClick={() => setShowBodyMap(true)}
                    className="rounded-xl bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-200"
                  >
                    View Body Map
                  </button>
                )}

                {entry.entry_type === "Incident" && !entry.reviewed && (
                  <Link
                    href={`/incidents/${entry.id}`}
                    className="rounded-xl bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200"
                  >
                    Review
                  </Link>
                )}
              </div>
            </div>

            <p className="mt-3 whitespace-pre-line text-slate-100">
              {entry.content}
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Recorded: {formatAuditDate(entry.created_at)}
            </p>
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
import { ClipboardList } from "lucide-react";

import TimelineEntryCard from "@/components/care/timelines/TimelineEntryCard";
import type { TimelineEntry } from "@/lib/care/timelines/types";

type Props = {
  entries: TimelineEntry[];
  serviceUserGender?: string | null;
};

export default function TimelineEntryList({
  entries,
  serviceUserGender,
}: Props) {
  if (entries.length === 0) {
    return (
      <div className="rounded-[24px] border border-teal-100/80 bg-gradient-to-br from-white via-[#fbffff] to-[#f3fbfa] py-14 text-center shadow-[0_8px_24px_rgba(13,148,136,0.06)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-600 shadow-sm">
          <ClipboardList size={21} aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900">
          No entries recorded
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          There are no timeline entries for this day and filter.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="absolute bottom-6 left-[86px] top-6 hidden w-px bg-gradient-to-b from-cyan-200 via-teal-200 to-cyan-100 sm:block"
      />

      <div className="space-y-0.5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="relative grid sm:grid-cols-[72px_28px_minmax(0,1fr)]"
          >
            <div className="hidden pt-[22px] text-right sm:block">
              <span className="text-xs font-semibold tabular-nums text-slate-500">
                {new Date(entry.event_time).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="relative hidden sm:block">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[22px] h-3 w-3 -translate-x-1/2 rounded-full border-[3px] border-white bg-gradient-to-br from-teal-400 to-cyan-400 shadow-[0_0_0_4px_rgba(20,184,166,0.11),0_0_14px_rgba(34,211,238,0.18)]"
              />

              <div
                aria-hidden="true"
                className="absolute left-1/2 top-[27px] h-px w-[18px] bg-gradient-to-r from-teal-200 to-cyan-100"
              />
            </div>

            <div className="pb-3 sm:pl-2">
              <TimelineEntryCard
                entry={entry}
                serviceUserGender={serviceUserGender}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
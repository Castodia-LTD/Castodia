import TimelineEntryCard from "@/components/timelines/TimelineEntryCard";
import type { TimelineEntry } from "@/lib/timelines/types";

type Props = {
  entries: TimelineEntry[];
  serviceUserGender?: string | null;
};

export default function TimelineEntryList({ entries, serviceUserGender }: Props) {
  return (
    <div className="relative px-4 pb-4 pt-0">
      <div className="absolute bottom-0 left-8 top-0 w-px bg-white/10" />

      <div className="space-y-5">
        {entries.length === 0 && (
          <div className="ml-10 rounded-3xl border border-white/10 bg-white/10 p-6 text-center text-slate-300 backdrop-blur">
            No entries for this filter/day.
          </div>
        )}

        {entries.map((entry) => (
          <TimelineEntryCard
            key={entry.id}
            entry={entry}
            serviceUserGender={serviceUserGender}
          />
        ))}
      </div>
    </div>
  );
}
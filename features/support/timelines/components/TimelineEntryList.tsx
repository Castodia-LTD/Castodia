import { CastodiaBadge, CastodiaCard } from "@/components/castodia";
import type { TimelineEntry } from "../hooks/useTimelineEntries";

type Props = {
  entries: TimelineEntry[];
};

export default function TimelineEntryList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <CastodiaCard>
        <p className="text-sm text-slate-500">
          No timeline entries recorded yet.
        </p>
      </CastodiaCard>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <CastodiaCard key={entry.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CastodiaBadge variant="neutral">
                {entry.entry_type}
              </CastodiaBadge>

              <p className="mt-3 text-sm text-slate-500">
                {new Date(entry.event_time).toLocaleString("en-GB")}
              </p>
            </div>

            {entry.reviewed && (
              <CastodiaBadge variant="success">
                Reviewed
              </CastodiaBadge>
            )}
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">
            {entry.content}
          </p>
        </CastodiaCard>
      ))}
    </div>
  );
}
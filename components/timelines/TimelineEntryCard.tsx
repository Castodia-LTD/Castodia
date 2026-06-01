import Link from "next/link";
import type { TimelineEntry } from "@/lib/timelines/types";
import { getEntryStyle } from "@/lib/timelines/entryStyles";
import { formatAuditDate, formatEventTime } from "@/lib/shared/date";

type Props = {
  entry: TimelineEntry;
};

export default function TimelineEntryCard({ entry }: Props) {
  const style = getEntryStyle(entry.entry_type);
  const Icon = style.icon;

  return (
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

            {entry.entry_type === "Incident" && !entry.reviewed && (
              <Link
                href={`/incidents/${entry.id}`}
                className="rounded-xl bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200"
              >
                Review
              </Link>
            )}
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
  );
}
import { SectionCard } from "@/components/layouts";
import type { Handover } from "../types";

type HandoverCardProps = {
  handover: Handover;
  onMarkAsRead: (handoverId: string) => void;
};

export default function HandoverCard({
  handover,
  onMarkAsRead,
}: HandoverCardProps) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-400">
            {new Date(handover.created_at).toLocaleString("en-GB")}
          </p>

          <h2 className="mt-2 break-words text-xl font-bold text-white">
            {handover.title}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
            handover.read ? "bg-green-600" : "bg-amber-500"
          }`}
        >
          {handover.read ? "Read" : "Unread"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {handover.service_users?.map((serviceUser) => (
          <span
            key={serviceUser.id}
            className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300"
          >
            {serviceUser.full_name}
          </span>
        ))}
      </div>

      <p className="mt-4 whitespace-pre-line break-words text-slate-200">
        {handover.content}
      </p>

      <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-400">
        Created by {handover.staff_name}
      </p>

      {handover.read_by && handover.read_by.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Read by
          </p>

          <div className="flex flex-wrap gap-2">
            {handover.read_by.map((person) => (
              <span
                key={person}
                className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300"
              >
                {person}
              </span>
            ))}
          </div>
        </div>
      )}

      {!handover.read && (
        <button
          onClick={() => onMarkAsRead(handover.id)}
          className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-500 to-teal-400 p-4 font-semibold text-white"
        >
          Mark as Read
        </button>
      )}
    </SectionCard>
  );
}
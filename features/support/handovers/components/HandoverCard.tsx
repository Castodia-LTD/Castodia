import { CastodiaBadge, CastodiaButton, CastodiaCard } from "@/components/castodia";
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
    <CastodiaCard>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">
            {new Date(handover.created_at).toLocaleString("en-GB")}
          </p>

          <h2 className="mt-2 break-words text-xl font-semibold text-slate-950">
            {handover.title}
          </h2>
        </div>

        <CastodiaBadge variant={handover.read ? "success" : "warning"}>
          {handover.read ? "Read" : "Unread"}
        </CastodiaBadge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {handover.service_users?.map((serviceUser) => (
          <CastodiaBadge key={serviceUser.id} variant="neutral">
            {serviceUser.full_name}
          </CastodiaBadge>
        ))}
      </div>

      <p className="mt-4 whitespace-pre-line break-words text-slate-700">
        {handover.content}
      </p>

      <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500">
        Created by {handover.staff_name}
      </p>

      {handover.read_by && handover.read_by.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Read by
          </p>

          <div className="flex flex-wrap gap-2">
            {handover.read_by.map((person) => (
              <CastodiaBadge key={person} variant="success">
                {person}
              </CastodiaBadge>
            ))}
          </div>
        </div>
      )}

      {!handover.read && (
        <CastodiaButton
          onClick={() => onMarkAsRead(handover.id)}
          className="mt-5 w-full"
        >
          Mark as Read
        </CastodiaButton>
      )}
    </CastodiaCard>
  );
}
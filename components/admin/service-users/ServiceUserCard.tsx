import type { ServiceUser } from "@/lib/admin/service-users/types";

type Props = {
  serviceUser: ServiceUser;
  onEdit: () => void;
  onDeactivate: () => void;
};

export default function ServiceUserCard({
  serviceUser,
  onEdit,
  onDeactivate,
}: Props) {
  const name = `${serviceUser.first_name ?? ""} ${
    serviceUser.surname ?? ""
  }`.trim();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-5 shadow-xl backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">{name}</h2>

          {serviceUser.house_name && (
            <p className="mt-1 text-slate-400">{serviceUser.house_name}</p>
          )}

          {serviceUser.key_notes && (
            <p className="mt-3 text-sm text-slate-300">
              {serviceUser.key_notes}
            </p>
          )}
        </div>

        {!serviceUser.is_active && (
          <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs text-red-200">
            Inactive
          </span>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onEdit}
          className="rounded-2xl bg-white/10 px-4 py-2 text-sm"
        >
          Edit
        </button>

        {serviceUser.is_active && (
          <button
            onClick={onDeactivate}
            className="rounded-2xl bg-red-500/20 px-4 py-2 text-sm text-red-200"
          >
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
}
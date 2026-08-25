import type { CarePlanStatus } from "@/lib/care/service-user-hub/care-plans/types";

type CarePlanHeaderProps = {
  status: CarePlanStatus;
  planOwnerName?: string | null;
  createdAt?: string | null;
  lastReviewedAt?: string | null;
  nextReviewAt?: string | null;
  updatedAt?: string | null;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  canEdit?: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not recorded";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusLabel(status: CarePlanStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "published":
      return "Published";
    case "archived":
      return "Archived";
  }
}

function getStatusClasses(status: CarePlanStatus) {
  switch (status) {
    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

export function CarePlanHeader({
  status,
  planOwnerName,
  createdAt,
  lastReviewedAt,
  nextReviewAt,
  updatedAt,
  isSaving = false,
  hasUnsavedChanges = false,
  canEdit = false,
}: CarePlanHeaderProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            Care Plan
          </h1>

          <span
            className={[
              "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
              getStatusClasses(status),
            ].join(" ")}
          >
            {getStatusLabel(status)}
          </span>
        </div>

        {canEdit ? (
          <p className="text-sm text-slate-500">
            {isSaving
              ? "Saving changes..."
              : hasUnsavedChanges
                ? "Unsaved changes"
                : "All changes saved"}
          </p>
        ) : null}
      </div>

      <dl className="grid grid-cols-1 border-t border-slate-200 sm:grid-cols-2 xl:grid-cols-5">
        <MetadataItem
          label="Plan owner"
          value={planOwnerName || "Not assigned"}
        />

        <MetadataItem
          label="Created"
          value={formatDate(createdAt)}
        />

        <MetadataItem
          label="Last reviewed"
          value={formatDate(lastReviewedAt)}
        />

        <MetadataItem
          label="Next review"
          value={formatDate(nextReviewAt)}
        />

        <MetadataItem
          label="Last updated"
          value={formatDate(updatedAt)}
        />
      </dl>
    </section>
  );
}

type MetadataItemProps = {
  label: string;
  value: string;
};

function MetadataItem({ label, value }: MetadataItemProps) {
  return (
    <div className="border-t border-slate-200 px-4 py-3 first:border-t-0 sm:border-l sm:first:border-l-0 xl:border-t-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-0.5 text-sm font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}
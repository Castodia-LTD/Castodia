"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import CoreOrganisationHubPage from "./CoreOrganisationHubPage";
import { availableTimelineCategories } from "@/lib/care/timelines/availableTimelineCategories";

export default function CoreOrganisationTimelinePage({
  organisationId,
}: {
  organisationId: string;
}) {
  return (
    <CoreOrganisationHubPage organisationId={organisationId}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">
          Timeline Configuration
        </h2>

        <p className="mt-2 text-slate-600">
          Configure the categories and entry types available when staff record
          timeline entries.
        </p>

        <div className="mt-6 grid gap-4">
          {availableTimelineCategories.map((category) => (
            <Link
              key={category.key}
              href={`/core/organisations/${organisationId}/timeline/${category.key}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${category.colour}`}
                  >
                    {category.title}
                  </span>

                  <span className="text-sm font-semibold text-slate-500">
                    {category.options.length} entry types
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-600">
                  Configure which {category.title.toLowerCase()} entries are
                  available for this organisation.
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-cyan-700">
                Configure
                <ChevronRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CoreOrganisationHubPage>
  );
}
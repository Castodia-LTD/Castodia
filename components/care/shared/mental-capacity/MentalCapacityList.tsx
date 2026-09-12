"use client";

import Link from "next/link";
import { CalendarClock, FileCheck2, FileUp, Plus } from "lucide-react";

import {
  CastodiaBadge,
  CastodiaCard,
} from "@/components/castodia";
import type {
  MentalCapacityAssessmentRecord,
  MentalCapacityDocumentRecord,
} from "@/lib/care/mental-capacity/types";

type Props = {
  assessments: MentalCapacityAssessmentRecord[];
  documents: MentalCapacityDocumentRecord[];
  serviceUserId: string;
  portal: "manager" | "support";
};

const outcomeLabels = {
  has_capacity: "Has capacity",
  lacks_capacity: "Lacks capacity",
  inconclusive: "Inconclusive",
} as const;

function outcomeVariant(outcome: MentalCapacityAssessmentRecord["outcome"]) {
  if (outcome === "has_capacity") return "success" as const;
  if (outcome === "lacks_capacity") return "warning" as const;
  return "neutral" as const;
}

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");
}

function reviewLabel(reviewDate: string | null) {
  if (!reviewDate) return "No review date";
  const today = new Date().toISOString().slice(0, 10);
  return reviewDate < today
    ? `Review overdue: ${formatDate(reviewDate)}`
    : `Review due: ${formatDate(reviewDate)}`;
}

export function MentalCapacityList({
  assessments,
  documents,
  serviceUserId,
  portal,
}: Props) {
  const basePath = `/care/${portal}/service-users/${serviceUserId}/mental-capacity`;

  return (
    <section aria-labelledby="mental-capacity-heading" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="mental-capacity-heading" className="text-2xl font-bold text-slate-950">
            Mental capacity assessments
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Decision-specific capacity records, including their outcome and review date.
          </p>
        </div>

        {portal === "manager" ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`${basePath}/upload`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-2 text-sm font-bold text-teal-800 shadow-sm transition hover:bg-teal-50"
            >
              <FileUp aria-hidden="true" className="h-4 w-4" />
              Upload completed MCA
            </Link>
            <Link
              href={`${basePath}/new`}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:from-cyan-700 hover:to-teal-700"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              New assessment
            </Link>
          </div>
        ) : null}
      </div>

      {portal === "support" ? (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-950">
          This page is read only. Managers complete and maintain capacity assessments.
        </div>
      ) : null}

      {assessments.length === 0 && documents.length === 0 ? (
        <CastodiaCard className="py-12 text-center">
          <h3 className="text-lg font-bold text-slate-950">
            No capacity assessments recorded
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
            {portal === "manager"
              ? "Create a decision-specific assessment when one is required."
              : "There are no completed assessments available to view."}
          </p>
        </CastodiaCard>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`${basePath}/${assessment.id}`}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <CastodiaCard interactive className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                      {assessment.title}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {assessment.decision}
                    </h3>
                  </div>
                  <CastodiaBadge variant={outcomeVariant(assessment.outcome)}>
                    {outcomeLabels[assessment.outcome]}
                  </CastodiaBadge>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <FileCheck2 aria-hidden="true" className="h-4 w-4 text-teal-700" />
                    Assessed {formatDate(assessment.assessment_date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarClock aria-hidden="true" className="h-4 w-4 text-teal-700" />
                    {reviewLabel(assessment.review_date)}
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Completed by {assessment.assessor_name}
                </p>
              </CastodiaCard>
            </Link>
          ))}
          {documents.map((document) => (
            <Link
              key={document.id}
              href={`${basePath}/uploaded/${document.id}`}
              className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              <CastodiaCard interactive className="h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                      {document.title}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-950">
                      {document.decision}
                    </h3>
                  </div>
                  <CastodiaBadge variant="info">Uploaded document</CastodiaBadge>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                  <span className="flex items-center gap-2">
                    <FileCheck2 aria-hidden="true" className="h-4 w-4 text-teal-700" />
                    Assessed {formatDate(document.assessment_date)}
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarClock aria-hidden="true" className="h-4 w-4 text-teal-700" />
                    {reviewLabel(document.review_date)}
                  </span>
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Completed by {document.completed_by} · {document.file_name}
                </p>
              </CastodiaCard>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import type {
  RiskAssessmentWithOwner,
} from "@/lib/care/service-user-hub/risk-register/types";

type Props = {
  assessment: RiskAssessmentWithOwner;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function riskColour(level: string) {
  switch (level) {
    case "high":
      return "text-red-600";

    case "medium":
      return "text-orange-600";

    case "low":
      return "text-amber-600";

    default:
      return "text-slate-600";
  }
}

export function RiskAssessmentReadCard({
  assessment,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/75 via-white/70 to-teal-50/75 shadow-sm backdrop-blur-md">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {assessment.title}
          </h2>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
            <span>
              Risk level{" "}
              <strong
                className={riskColour(
                  assessment.overall_risk,
                )}
              >
                {assessment.overall_risk}
              </strong>
            </span>

            <span>
              Last reviewed{" "}
              <strong>
                {formatDate(
                  assessment.reviewed_at,
                )}
              </strong>
            </span>
          </div>
        </div>

        <ChevronDown
          className={`transition ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-6 border-t border-white/70 bg-white/40 px-6 py-6 backdrop-blur-sm">
          <Section
            title="What is the risk?"
            content={assessment.risk_description}
          />

          <Section
            title="Why is this person at risk?"
            content={
              assessment.personal_risk_factors
            }
          />

          <Section
            title="Control measures"
            content={assessment.control_measures}
          />

          {assessment.early_warning_signs && (
            <Section
              title="Early warning signs"
              content={
                assessment.early_warning_signs
              }
            />
          )}

          <Section
            title="Actions if the risk occurs"
            content={assessment.actions_if_occurs}
          />

          <div className="grid gap-4 rounded-xl border border-white/70 bg-white/60 p-5 sm:grid-cols-3">
            <Metadata
              label="Plan owner"
              value={
                assessment.planOwnerName ??
                "Not assigned"
              }
            />

            <Metadata
              label="Next review"
              value={formatDate(
                assessment.next_review_date,
              )}
            />

            <Metadata
              label="Review frequency"
              value={
                assessment.review_frequency ??
                "Not recorded"
              }
            />
          </div>
        </div>
      )}
    </article>
  );
}

function Section({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section>
      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
        {content}
      </p>
    </section>
  );
}

function Metadata({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>

      <div className="mt-1 font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}
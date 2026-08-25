"use client";

import { ChevronDown } from "lucide-react";

import type { CarePlanSectionKey } from "@/lib/care/service-user-hub/care-plans/sections";

type CarePlanSectionEditorProps = {
  sectionKey: CarePlanSectionKey;
  title: string;
  placeholder: string;
  content: string;
  isExpanded: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onChange: (content: string) => void;
};

export function CarePlanSectionEditor({
  sectionKey,
  title,
  placeholder,
  content,
  isExpanded,
  disabled = false,
  onToggle,
  onChange,
}: CarePlanSectionEditorProps) {
  const hasInformation = content.trim().length > 0;
  const panelId = `care-plan-section-${sectionKey}`;

  const sectionClasses = hasInformation
  ? isExpanded
    ? "border-cyan-300 bg-gradient-to-r from-cyan-50 via-white to-teal-50 shadow-md"
    : "border-teal-400 bg-gradient-to-r from-cyan-200 via-teal-100 to-emerald-100 shadow-md hover:border-teal-500 hover:shadow-lg"
  : isExpanded
    ? "border-cyan-300 bg-gradient-to-r from-cyan-50 via-white to-teal-50 shadow-md"
    : "border-slate-200 bg-white shadow-sm hover:border-cyan-200 hover:shadow-md";

const titleClasses = hasInformation
  ? "font-semibold text-teal-950"
  : isExpanded
    ? "font-semibold text-cyan-950"
    : "font-semibold text-slate-900";

const chevronClasses = hasInformation
  ? isExpanded
    ? "rotate-180 text-teal-700"
    : "text-teal-700"
  : isExpanded
    ? "rotate-180 text-cyan-700"
    : "text-slate-500";

  return (
    <section
      className={[
        "overflow-hidden rounded-xl border transition-all duration-200",
        sectionClasses,
      ].join(" ")}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        disabled={disabled}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
      >
        <h2
          className={[
            "text-sm font-semibold transition-colors sm:text-base",
            titleClasses,
          ].join(" ")}
        >
          {title}
        </h2>

        <ChevronDown
          aria-hidden="true"
          className={[
            "h-5 w-5 shrink-0 transition-all duration-200",
            chevronClasses,
          ].join(" ")}
        />
      </button>

      {isExpanded ? (
        <div
          id={panelId}
          className="border-t border-cyan-200/80 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-5"
        >
          <label
            htmlFor={`${panelId}-content`}
            className="sr-only"
          >
            {title}
          </label>

          <textarea
            id={`${panelId}-content`}
            value={content}
            disabled={disabled}
            placeholder={placeholder}
            rows={6}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-36 w-full resize-y rounded-xl border border-cyan-200 bg-white/95 px-4 py-3 text-sm leading-6 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50"
          />

          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Placeholder guidance is not saved in the care plan.
            </p>

            {hasInformation ? (
              <p className="shrink-0 text-xs font-medium text-cyan-700">
                {content.trim().length.toLocaleString("en-GB")} characters
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
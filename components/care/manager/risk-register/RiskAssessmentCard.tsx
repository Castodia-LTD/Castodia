"use client";
import type { ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Archive,
  ChevronDown,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";

import {
  createRiskAssessment,
  updateRiskAssessment,
} from "@/lib/care/service-user-hub/risk-register/api";

import {
  createEmptyRiskAssessmentValues,
  mapRiskAssessmentToEditorValues,
  type RiskAssessmentEditorValues,
  type RiskAssessmentWithOwner,
  type RiskLevel,
} from "@/lib/care/service-user-hub/risk-register/types";

type RiskAssessmentCardProps = {
  serviceUserId: string;
  assessment?: RiskAssessmentWithOwner | null;
  defaultPlanOwnerId?: string | null;
  initiallyExpanded?: boolean;
  onCreated?: (
    assessment: RiskAssessmentWithOwner,
  ) => void | Promise<void>;
  onUpdated?: (
    assessment: RiskAssessmentWithOwner,
  ) => void | Promise<void>;
  onRemoveEmpty?: () => void;
  onArchive?: (assessmentId: string) => void;
};

function createSnapshot(values: RiskAssessmentEditorValues) {
  return JSON.stringify({
    ...values,
    title: values.title.trim(),
    riskDescription: values.riskDescription.trim(),
    personalRiskFactors: values.personalRiskFactors.trim(),
    controlMeasures: values.controlMeasures.trim(),
    earlyWarningSigns: values.earlyWarningSigns.trim(),
    actionsIfOccurs: values.actionsIfOccurs.trim(),
    reviewFrequency: values.reviewFrequency.trim(),
    nextReviewDate: values.nextReviewDate.trim(),
  });
}

function getRiskLabel(level: RiskLevel | "") {
  switch (level) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Not rated";
  }
}

function getRiskLevelClasses(level: RiskLevel | "") {
  switch (level) {
    case "low":
      return "text-amber-700";
    case "medium":
      return "text-orange-600";
    case "high":
      return "text-red-600";
    default:
      return "text-slate-500";
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not yet reviewed";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not yet reviewed";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The risk assessment could not be saved.";
}

export function RiskAssessmentCard({
  serviceUserId,
  assessment = null,
  defaultPlanOwnerId = null,
  initiallyExpanded = false,
  onCreated,
  onUpdated,
  onRemoveEmpty,
  onArchive,
}: RiskAssessmentCardProps) {
  const isNew = !assessment;

  const initialValues = useMemo(
    () =>
      assessment
        ? mapRiskAssessmentToEditorValues(assessment)
        : createEmptyRiskAssessmentValues(defaultPlanOwnerId),
    [assessment, defaultPlanOwnerId],
  );

  const [values, setValues] =
    useState<RiskAssessmentEditorValues>(initialValues);

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createSnapshot(initialValues),
  );

  const [isExpanded, setIsExpanded] =
    useState(initiallyExpanded);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setSavedSnapshot(createSnapshot(initialValues));
  }, [initialValues]);

  useEffect(() => {
    if (isExpanded && isNew) {
      window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [isExpanded, isNew]);

  const currentSnapshot = useMemo(
    () => createSnapshot(values),
    [values],
  );

  const hasUnsavedChanges =
    currentSnapshot !== savedSnapshot;

  const hasAnyInformation = useMemo(
    () =>
      Boolean(
        values.title.trim() ||
          values.riskDescription.trim() ||
          values.personalRiskFactors.trim() ||
          values.controlMeasures.trim() ||
          values.earlyWarningSigns.trim() ||
          values.actionsIfOccurs.trim() ||
          values.reviewFrequency.trim() ||
          values.nextReviewDate.trim() ||
          values.overallRisk,
      ),
    [values],
  );

  const cardClasses = isExpanded
    ? "border-cyan-200/90 bg-gradient-to-br from-cyan-50/90 via-white/80 to-teal-50/90 shadow-md backdrop-blur-md"
    : assessment
      ? "border-white/70 bg-gradient-to-br from-cyan-50/75 via-white/70 to-teal-50/75 shadow-sm backdrop-blur-md hover:border-teal-200 hover:shadow-md"
      : "border-slate-200 bg-white shadow-sm hover:border-cyan-200 hover:shadow-md";

  function updateValue<K extends keyof RiskAssessmentEditorValues>(
    key: K,
    value: RiskAssessmentEditorValues[K],
  ) {
    setValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));

    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleSave() {
    if (isSaving || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isNew) {
        const created = await createRiskAssessment({
          serviceUserId,
          title: values.title,
          riskDescription: values.riskDescription,
          personalRiskFactors: values.personalRiskFactors,
          controlMeasures: values.controlMeasures,
          earlyWarningSigns:
            values.earlyWarningSigns.trim() || null,
          actionsIfOccurs: values.actionsIfOccurs,
          planOwnerId: values.planOwnerId,
          reviewFrequency:
            values.reviewFrequency.trim() || null,
          nextReviewDate:
            values.nextReviewDate.trim() || null,
          overallRisk: values.overallRisk as RiskLevel,
        });

        setSavedSnapshot(createSnapshot(values));
        setSuccessMessage("Risk assessment saved.");

        await onCreated?.(created);
        return;
      }

      const updated = await updateRiskAssessment(
        assessment.id,
        {
          title: values.title,
          riskDescription: values.riskDescription,
          personalRiskFactors: values.personalRiskFactors,
          controlMeasures: values.controlMeasures,
          earlyWarningSigns:
            values.earlyWarningSigns.trim() || null,
          actionsIfOccurs: values.actionsIfOccurs,
          planOwnerId: values.planOwnerId,
          reviewFrequency:
            values.reviewFrequency.trim() || null,
          nextReviewDate:
            values.nextReviewDate.trim() || null,
          overallRisk: values.overallRisk as RiskLevel,
        },
      );

      setSavedSnapshot(createSnapshot(values));
      setSuccessMessage("Risk assessment updated.");

      await onUpdated?.(updated);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function handleRemoveEmpty() {
    if (!isNew) {
      return;
    }

    if (
      hasAnyInformation &&
      !window.confirm(
        "Remove this unsaved risk assessment? Any information entered will be lost.",
      )
    ) {
      return;
    }

    onRemoveEmpty?.();
  }

  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border transition-all duration-200",
        cardClasses,
      ].join(" ")}
    >
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left sm:px-6"
      >
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-slate-950 sm:text-lg">
            {values.title.trim() || "New Risk Assessment"}
          </h2>

          {!isNew ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
              <span>
                <span className="text-slate-500">
                  Risk level:{" "}
                </span>

                <strong
                  className={[
                    "font-bold",
                    getRiskLevelClasses(values.overallRisk),
                  ].join(" ")}
                >
                  {getRiskLabel(values.overallRisk)}
                </strong>
              </span>

              <span className="text-slate-500">
                Last reviewed:{" "}
                <strong className="font-semibold text-slate-700">
                  {formatDate(assessment.reviewed_at)}
                </strong>
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              Add details about an identified risk.
            </p>
          )}
        </div>

        <ChevronDown
          aria-hidden="true"
          className={[
            "h-5 w-5 shrink-0 text-teal-700 transition-transform duration-200",
            isExpanded ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isExpanded ? (
        <div className="border-t border-white/80 bg-white/45 px-5 py-5 backdrop-blur-sm sm:px-6">
          <div className="space-y-6">
            <FormField
              label="Risk title"
              required
            >
              <input
                ref={titleInputRef}
                type="text"
                value={values.title}
                disabled={isSaving}
                placeholder="e.g. Falls, Choking or Community Access"
                onChange={(event) =>
                  updateValue("title", event.target.value)
                }
                className={inputClasses}
              />
            </FormField>

            <FormField
              label="What is the risk?"
              required
            >
              <textarea
                value={values.riskDescription}
                disabled={isSaving}
                rows={5}
                placeholder="Describe the risk and what could happen if it materialises."
                onChange={(event) =>
                  updateValue(
                    "riskDescription",
                    event.target.value,
                  )
                }
                className={textareaClasses}
              />
            </FormField>

            <FormField
              label="Why is this person at risk?"
              required
            >
              <textarea
                value={values.personalRiskFactors}
                disabled={isSaving}
                rows={5}
                placeholder="Explain why this individual is vulnerable to this particular risk."
                onChange={(event) =>
                  updateValue(
                    "personalRiskFactors",
                    event.target.value,
                  )
                }
                className={textareaClasses}
              />
            </FormField>

            <FormField
              label="Control measures"
              required
            >
              <textarea
                value={values.controlMeasures}
                disabled={isSaving}
                rows={6}
                placeholder="Describe how staff should minimise, manage or reduce this risk."
                onChange={(event) =>
                  updateValue(
                    "controlMeasures",
                    event.target.value,
                  )
                }
                className={textareaClasses}
              />
            </FormField>

            <FormField label="Early warning signs">
              <textarea
                value={values.earlyWarningSigns}
                disabled={isSaving}
                rows={4}
                placeholder="Describe indicators that suggest this risk may be increasing."
                onChange={(event) =>
                  updateValue(
                    "earlyWarningSigns",
                    event.target.value,
                  )
                }
                className={textareaClasses}
              />
            </FormField>

            <FormField
              label="Actions if the risk occurs"
              required
            >
              <textarea
                value={values.actionsIfOccurs}
                disabled={isSaving}
                rows={5}
                placeholder="Describe the immediate actions staff should take if the risk materialises."
                onChange={(event) =>
                  updateValue(
                    "actionsIfOccurs",
                    event.target.value,
                  )
                }
                className={textareaClasses}
              />
            </FormField>

            <section className="rounded-xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-sm sm:p-5">
              <h3 className="text-base font-bold text-slate-950">
                Review
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <FormField label="Review frequency">
                  <input
                    type="text"
                    value={values.reviewFrequency}
                    disabled={isSaving}
                    placeholder="e.g. Every 3 months"
                    onChange={(event) =>
                      updateValue(
                        "reviewFrequency",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                  />
                </FormField>

                <FormField label="Next review date">
                  <input
                    type="date"
                    value={values.nextReviewDate}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateValue(
                        "nextReviewDate",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                  />
                </FormField>
              </div>
            </section>

            <section className="rounded-xl border border-teal-200 bg-gradient-to-br from-cyan-50/90 via-white/90 to-teal-50/90 p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-950">
                Professional assessment
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Having considered the information above, record your
                overall professional judgement.
              </p>

              <div className="mt-5">
                <label
                  htmlFor={`risk-rating-${assessment?.id ?? "new"}`}
                  className="block text-sm font-semibold text-slate-800"
                >
                  Overall risk rating
                  <span className="text-red-600"> *</span>
                </label>

                <select
                  id={`risk-rating-${assessment?.id ?? "new"}`}
                  value={values.overallRisk}
                  disabled={isSaving}
                  onChange={(event) =>
                    updateValue(
                      "overallRisk",
                      event.target.value as RiskLevel | "",
                    )
                  }
                  className={inputClasses}
                >
                  <option value="">
                    Select overall risk rating
                  </option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </section>

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              >
                {successMessage}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-white/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {isNew ? (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleRemoveEmpty}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                    Remove empty card
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => onArchive?.(assessment.id)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white/70 hover:text-red-700 disabled:opacity-50"
                  >
                    <Archive
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                    Archive risk
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={
                  isSaving ||
                  !hasUnsavedChanges ||
                  !values.title.trim() ||
                  !values.riskDescription.trim() ||
                  !values.personalRiskFactors.trim() ||
                  !values.controlMeasures.trim() ||
                  !values.actionsIfOccurs.trim() ||
                  !values.overallRisk
                } 
                onClick={handleSave}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Save
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                )}

                {isSaving
                  ? "Saving..."
                  : isNew
                    ? "Save risk assessment"
                    : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

type FormFieldProps = {
  label: string;
  required?: boolean;
  children: ReactNode;
};

function FormField({
  label,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}

        {required ? (
          <span className="text-red-600"> *</span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

const inputClasses =
  "mt-2 w-full rounded-xl border border-cyan-100 bg-white/90 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const textareaClasses =
  "w-full resize-y rounded-xl border border-cyan-100 bg-white/90 px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50";
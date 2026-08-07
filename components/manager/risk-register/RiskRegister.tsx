"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, Loader2, Plus } from "lucide-react";

import { RiskAssessmentCard } from "@/components/manager/risk-register/RiskAssessmentCard";

import {
  archiveRiskAssessment,
  getRiskRegister,
} from "@/lib/service-user-hub/risk-register/api";

import type { RiskAssessmentWithOwner } from "@/lib/service-user-hub/risk-register/types";

type RiskRegisterProps = {
  serviceUserId: string;
  defaultPlanOwnerId?: string | null;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The risk register could not be updated.";
}

export function RiskRegister({
  serviceUserId,
  defaultPlanOwnerId = null,
}: RiskRegisterProps) {
  const [assessments, setAssessments] = useState<
    RiskAssessmentWithOwner[]
  >([]);

  const [hasEmptyCard, setHasEmptyCard] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );

  const emptyCardAnchorRef = useRef<HTMLDivElement | null>(null);

  const sortedAssessments = useMemo(
    () =>
      [...assessments].sort((left, right) => {
        return (
          new Date(right.updated_at).getTime() -
          new Date(left.updated_at).getTime()
        );
      }),
    [assessments],
  );

  async function loadAssessments() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const records = await getRiskRegister(serviceUserId);

      setAssessments(records);

      /*
       * When no saved assessments exist, show one initial empty
       * card automatically.
       */
      setHasEmptyCard(records.length === 0);
    } catch (error) {
      setAssessments([]);
      setHasEmptyCard(false);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssessments();
  }, [serviceUserId]);

  useEffect(() => {
    if (!hasEmptyCard) {
      return;
    }

    window.setTimeout(() => {
      emptyCardAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  }, [hasEmptyCard]);

  function handleAddRisk() {
    if (hasEmptyCard) {
      emptyCardAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    setErrorMessage(null);
    setHasEmptyCard(true);
  }

  async function handleCreated(
    createdAssessment: RiskAssessmentWithOwner,
  ) {
    setAssessments((current) => [
      createdAssessment,
      ...current.filter(
        (assessment) =>
          assessment.id !== createdAssessment.id,
      ),
    ]);

    setHasEmptyCard(false);
  }

  async function handleUpdated(
    updatedAssessment: RiskAssessmentWithOwner,
  ) {
    setAssessments((current) =>
      current.map((assessment) =>
        assessment.id === updatedAssessment.id
          ? updatedAssessment
          : assessment,
      ),
    );
  }

  async function handleArchive(assessmentId: string) {
    const assessment = assessments.find(
      (item) => item.id === assessmentId,
    );

    if (!assessment || isArchiving) {
      return;
    }

    const confirmed = window.confirm(
      `Archive "${assessment.title}"? Support staff will no longer see this risk assessment.`,
    );

    if (!confirmed) {
      return;
    }

    setIsArchiving(true);
    setErrorMessage(null);

    try {
      await archiveRiskAssessment(assessmentId);

      setAssessments((current) =>
        current.filter(
          (item) => item.id !== assessmentId,
        ),
      );

      /*
       * Preserve the agreed behaviour: if no active assessments
       * remain, show one empty card.
       */
      if (assessments.length === 1) {
        setHasEmptyCard(true);
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsArchiving(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/70 bg-gradient-to-br from-cyan-50/75 via-white/75 to-teal-50/75 px-6 py-14 text-center shadow-sm backdrop-blur-md">
        <Loader2
          aria-hidden="true"
          className="mx-auto h-6 w-6 animate-spin text-teal-700"
        />

        <p className="mt-3 text-sm font-medium text-slate-600">
          Loading risk register...
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="risk-register-heading"
      className="space-y-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1
            id="risk-register-heading"
            className="text-2xl font-bold tracking-tight text-slate-950"
          >
            Risk Register
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Record and maintain identified risks for this person.
            Castodia records the responsible professional’s
            assessment and does not calculate the risk rating.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRisk}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
        >
          <Plus
            aria-hidden="true"
            className="h-4 w-4"
          />
          Add risk
        </button>
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {errorMessage}
        </div>
      ) : null}

      {isArchiving ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-medium text-cyan-800"
        >
          <Archive
            aria-hidden="true"
            className="h-4 w-4"
          />
          Archiving risk assessment...
        </div>
      ) : null}

      <div className="space-y-4">
        {sortedAssessments.map((assessment) => (
          <RiskAssessmentCard
            key={assessment.id}
            serviceUserId={serviceUserId}
            assessment={assessment}
            defaultPlanOwnerId={defaultPlanOwnerId}
            onUpdated={handleUpdated}
            onArchive={handleArchive}
          />
        ))}

        {hasEmptyCard ? (
          <div ref={emptyCardAnchorRef}>
            <RiskAssessmentCard
              serviceUserId={serviceUserId}
              defaultPlanOwnerId={defaultPlanOwnerId}
              initiallyExpanded
              onCreated={handleCreated}
              onRemoveEmpty={() => {
                /*
                 * When no saved assessments exist, retain the one
                 * initial card because that is the agreed empty
                 * register state.
                 */
                if (assessments.length > 0) {
                  setHasEmptyCard(false);
                }
              }}
            />
          </div>
        ) : null}
      </div>

      {!hasEmptyCard ? (
        <button
          type="button"
          onClick={handleAddRisk}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-teal-200 bg-gradient-to-br from-cyan-50/60 via-white/70 to-teal-50/60 px-5 py-5 text-sm font-bold text-teal-700 shadow-sm backdrop-blur-sm transition hover:border-teal-300 hover:shadow-md"
        >
          <Plus
            aria-hidden="true"
            className="h-4 w-4"
          />
          Add another risk
        </button>
      ) : null}
    </section>
  );
}
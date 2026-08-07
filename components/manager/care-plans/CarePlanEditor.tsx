"use client";

import { useEffect, useMemo, useState } from "react";

import { CarePlanSectionEditor } from "@/components/manager/care-plans/CarePlanSectionEditor";
import { CarePlanHeader } from "@/components/shared/care-plans/CarePlanHeader";

import {
  buildCarePlanEditorSections,
  saveCarePlan,
  setCarePlanStatus,
} from "@/lib/service-user-hub/care-plans/api";

import type { CarePlanSectionKey } from "@/lib/service-user-hub/care-plans/sections";
import type {
  CarePlanEditorSection,
  CarePlanRecord,
  CarePlanSectionRecord,
  CarePlanStatus,
} from "@/lib/service-user-hub/care-plans/types";

type CarePlanEditorProps = {
  carePlan: CarePlanRecord;
  storedSections: CarePlanSectionRecord[];
  planOwnerName?: string | null;
  onSaved?: () => void | Promise<void>;
  onPublished?: () => void | Promise<void>;
};

function createSectionSnapshot(sections: CarePlanEditorSection[]) {
  return JSON.stringify(
    sections.map((section) => ({
      key: section.key,
      content: section.content.trim(),
    })),
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function CarePlanEditor({
  carePlan,
  storedSections,
  planOwnerName,
  onSaved,
  onPublished,
}: CarePlanEditorProps) {
  const initialSections = useMemo(
    () => buildCarePlanEditorSections(storedSections),
    [storedSections],
  );

  const [sections, setSections] =
    useState<CarePlanEditorSection[]>(initialSections);

  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    createSectionSnapshot(initialSections),
  );

  const [expandedSectionKey, setExpandedSectionKey] =
    useState<CarePlanSectionKey | null>(null);

  const [status, setStatus] = useState<CarePlanStatus>(
    carePlan.status,
  );

  const [updatedAt, setUpdatedAt] = useState(carePlan.updated_at);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  /*
   * Keep the editor synchronised if the parent reloads the care plan
   * after saving or publishing.
   */
  useEffect(() => {
    const nextSections = buildCarePlanEditorSections(storedSections);

    setSections(nextSections);
    setSavedSnapshot(createSectionSnapshot(nextSections));
    setStatus(carePlan.status);
    setUpdatedAt(carePlan.updated_at);
  }, [
    carePlan.id,
    carePlan.status,
    carePlan.updated_at,
    storedSections,
  ]);

  const currentSnapshot = useMemo(
    () => createSectionSnapshot(sections),
    [sections],
  );

  const hasUnsavedChanges = currentSnapshot !== savedSnapshot;

  const populatedSectionCount = useMemo(
    () =>
      sections.filter(
        (section) => section.content.trim().length > 0,
      ).length,
    [sections],
  );

  function clearMessages() {
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function handleToggleSection(sectionKey: CarePlanSectionKey) {
    setExpandedSectionKey((currentKey) =>
      currentKey === sectionKey ? null : sectionKey,
    );
  }

  function handleSectionChange(
    sectionKey: CarePlanSectionKey,
    content: string,
  ) {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.key === sectionKey
          ? {
              ...section,
              content,
            }
          : section,
      ),
    );

    clearMessages();
  }

  async function persistCarePlan() {
    await saveCarePlan(carePlan.id, {
      title: carePlan.title,
      planOwnerId: carePlan.plan_owner_id,
      lastReviewedAt: carePlan.last_reviewed_at,
      nextReviewAt: carePlan.next_review_at,
      sections: sections.map((section) => ({
        sectionKey: section.key,
        content: section.content,
        displayOrder: section.displayOrder,
      })),
    });

    const savedAt = new Date().toISOString();

    setSavedSnapshot(createSectionSnapshot(sections));
    setUpdatedAt(savedAt);
  }

  async function handleSave() {
    if (isSaving || !hasUnsavedChanges) {
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      await persistCarePlan();

      setSuccessMessage("Care plan saved successfully.");

      await onSaved?.();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "The care plan could not be saved.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (isSaving) {
      return;
    }

    if (populatedSectionCount === 0) {
      setErrorMessage(
        "Add content to at least one care-plan section before publishing.",
      );
      setSuccessMessage(null);
      return;
    }

    setIsSaving(true);
    clearMessages();

    try {
      /*
       * Save any outstanding narrative changes before changing the
       * document status.
       */
      if (hasUnsavedChanges) {
        await persistCarePlan();
      }

      await setCarePlanStatus(carePlan.id, "published");

      const publishedAt = new Date().toISOString();

      setStatus("published");
      setUpdatedAt(publishedAt);
      setSuccessMessage("Care plan published successfully.");

      await onPublished?.();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "The care plan could not be published.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <CarePlanHeader
        status={status}
        planOwnerName={planOwnerName}
        createdAt={carePlan.created_at}
        lastReviewedAt={carePlan.last_reviewed_at}
        nextReviewAt={carePlan.next_review_at}
        updatedAt={updatedAt}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        canEdit
      />

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

      <section
        aria-labelledby="care-plan-sections-heading"
        className="space-y-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="care-plan-sections-heading"
              className="text-xl font-semibold text-slate-950"
            >
              Care plan sections
            </h2>

            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Open a section to add or update its narrative.
              Sections without content remain hidden from the
              read-only care plan.
            </p>
          </div>

        
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <CarePlanSectionEditor
              key={section.key}
              sectionKey={section.key}
              title={section.title}
              placeholder={section.placeholder}
              content={section.content}
              isExpanded={expandedSectionKey === section.key}
              disabled={isSaving}
              onToggle={() => handleToggleSection(section.key)}
              onChange={(content) =>
                handleSectionChange(section.key, content)
              }
            />
          ))}
        </div>
      </section>

      <div className="sticky bottom-4 z-20">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {isSaving
                ? "Saving changes..."
                : hasUnsavedChanges
                  ? "You have unsaved changes"
                  : "All changes saved"}
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Only populated sections appear in the read-only care
              plan.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              disabled={isSaving || !hasUnsavedChanges}
              onClick={handleSave}
              className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {isSaving ? "Saving..." : "Save draft"}
            </button>

            {status !== "published" ? (
              <button
                type="button"
                disabled={
                  isSaving || populatedSectionCount === 0
                }
                onClick={handlePublish}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                Publish
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
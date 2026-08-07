import {
  CARE_PLAN_SECTION_BY_KEY,
  isCarePlanSectionKey,
} from "@/lib/service-user-hub/care-plans/sections";

import type {
  CarePlanRecord,
  CarePlanSectionRecord,
} from "@/lib/service-user-hub/care-plans/types";

import { CarePlanHeader } from "@/components/shared/care-plans/CarePlanHeader";

type CarePlanReadViewProps = {
  carePlan: CarePlanRecord;
  sections: CarePlanSectionRecord[];
  planOwnerName?: string | null;
};

type VisibleCarePlanSection = {
  id: string;
  sectionKey: CarePlanSectionRecord["section_key"];
  title: string;
  content: string;
  displayOrder: number;
};

function getVisibleSections(
  sections: CarePlanSectionRecord[],
): VisibleCarePlanSection[] {
  return sections
    .filter((section) => {
      return (
        isCarePlanSectionKey(section.section_key) &&
        section.content.trim().length > 0
      );
    })
    .map((section) => {
      const definition = CARE_PLAN_SECTION_BY_KEY.get(
        section.section_key,
      );

      if (!definition) {
        return null;
      }

      return {
        id: section.id,
        sectionKey: section.section_key,
        title: definition.title,
        content: section.content.trim(),
        displayOrder: definition.displayOrder,
      };
    })
    .filter(
      (
        section,
      ): section is VisibleCarePlanSection => section !== null,
    )
    .sort(
      (left, right) =>
        left.displayOrder - right.displayOrder,
    );
}

export function CarePlanReadView({
  carePlan,
  sections,
  planOwnerName,
}: CarePlanReadViewProps) {
  const visibleSections = getVisibleSections(sections);

  return (
    <div className="space-y-6">
      <CarePlanHeader
        status={carePlan.status}
        planOwnerName={planOwnerName}
        createdAt={carePlan.created_at}
        lastReviewedAt={carePlan.last_reviewed_at}
        nextReviewAt={carePlan.next_review_at}
        updatedAt={carePlan.updated_at}
      />

      {visibleSections.length > 0 ? (
        <article
          aria-label="Published care-plan content"
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          {visibleSections.map((section, index) => (
            <section
              key={section.id}
              aria-labelledby={`care-plan-read-section-${section.sectionKey}`}
              className={[
                "px-5 py-6 sm:px-7",
                index > 0 ? "border-t border-slate-200" : "",
              ].join(" ")}
            >
              <h2
                id={`care-plan-read-section-${section.sectionKey}`}
                className="text-lg font-semibold tracking-tight text-slate-950"
              >
                {section.title}
              </h2>

              <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {section.content}
              </div>
            </section>
          ))}
        </article>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No care-plan content available
          </h2>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            This care plan does not currently contain any published
            narrative sections.
          </p>
        </section>
      )}
    </div>
  );
}
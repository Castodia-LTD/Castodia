"use client";

import { useEffect, useState } from "react";
import { getOrganisationTimelineConfiguration } from "@/lib/timelines/getOrganisationTimelineConfiguration";
import {
  availableTimelineCategories,
  AvailableTimelineCategory,
} from "@/lib/timelines/availableTimelineCategories";

type Props = {
  organisationId: string;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (value: string | null) => void;
  setEntryType: (value: string) => void;
};

export default function EntryCategoryTiles({
  organisationId,
  selectedCategoryId,
  setSelectedCategoryId,
  setEntryType,
}: Props) {
  const [categories, setCategories] = useState<AvailableTimelineCategory[]>(
    availableTimelineCategories
  );

  useEffect(() => {
    async function loadCategories() {
      const configuredCategories =
        await getOrganisationTimelineConfiguration(organisationId);

      setCategories(configuredCategories);
    }

    if (organisationId) {
      loadCategories();
    }
  }, [organisationId]);

  const selectedCategory = categories.find(
    (category) => category.key === selectedCategoryId
  );

  if (selectedCategory) {
    const validOptions = selectedCategory.options.filter(
      (option) => option?.label && option?.entryType
    );

    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setSelectedCategoryId(null)}
          className="text-sm text-slate-400"
        >
          ← Back to categories
        </button>

        <div>
          <h2 className="text-2xl font-bold text-white">
            {selectedCategory.title}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Choose what you would like to record.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {validOptions.map((option) => (
            <button
              key={`${option.entryType}-${option.label}`}
              type="button"
              onClick={() => setEntryType(option.entryType)}
              className={`min-h-32 rounded-3xl p-5 text-left shadow-xl transition hover:scale-[1.02] ${selectedCategory.colour}`}
            >
              <p className="text-lg font-bold">{option.label}</p>
              <p className="mt-2 text-sm opacity-80">{option.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-white">
          What would you like to record?
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Choose a category to get started.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => {
          const isIncident = category.key === "incident";

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setSelectedCategoryId(category.key)}
              className={`rounded-3xl p-5 text-left shadow-xl transition hover:scale-[1.02] ${
                isIncident ? "col-span-2 min-h-28" : "min-h-36"
              } ${category.colour}`}
            >
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-xl font-bold">{category.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
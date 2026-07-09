"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PlatformOrganisationHubPage from "./PlatformOrganisationHubPage";
import { supabase } from "@/lib/supabase";
import {
  availableTimelineCategories,
  TimelineCategoryKey,
  TimelineOptionKey,
} from "@/lib/timelines/availableTimelineCategories";

type OrganisationTimelineOption = {
  id: string;
  organisation_id: string;
  category_key: TimelineCategoryKey;
  option_key: TimelineOptionKey;
  is_enabled: boolean;
};

export default function PlatformOrganisationTimelineCategoryPage({
  organisationId,
  categoryKey,
}: {
  organisationId: string;
  categoryKey: string;
}) {
  const [options, setOptions] = useState<OrganisationTimelineOption[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const category = availableTimelineCategories.find(
    (category) => category.key === categoryKey
  );

  async function loadOptions() {
    if (!category) return;

    const { data, error } = await supabase
      .from("organisation_timeline_options")
      .select("id, organisation_id, category_key, option_key, is_enabled")
      .eq("organisation_id", organisationId)
      .eq("category_key", category.key);

    if (error) {
      console.error("Timeline option load error:", error);
      setOptions([]);
      return;
    }

    setOptions((data || []) as OrganisationTimelineOption[]);
  }

  useEffect(() => {
    loadOptions();
  }, [organisationId, categoryKey]);

  async function toggleOption(optionKey: TimelineOptionKey, enabled: boolean) {
    if (!category) return;

    setSavingKey(optionKey);

    const existing = options.find((option) => option.option_key === optionKey);

    if (!existing) {
      const { error } = await supabase
        .from("organisation_timeline_options")
        .insert({
          organisation_id: organisationId,
          category_key: category.key,
          option_key: optionKey,
          is_enabled: enabled,
        });

      if (error) console.error("Timeline option insert error:", error);
    } else {
      const { error } = await supabase
        .from("organisation_timeline_options")
        .update({
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) console.error("Timeline option update error:", error);
    }

    await loadOptions();
    setSavingKey(null);
  }

  function isEnabled(optionKey: TimelineOptionKey) {
    return options.some(
      (option) => option.option_key === optionKey && option.is_enabled
    );
  }

  if (!category) {
    return (
      <PlatformOrganisationHubPage organisationId={organisationId}>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          Timeline category not found.
        </div>
      </PlatformOrganisationHubPage>
    );
  }

  return (
    <PlatformOrganisationHubPage organisationId={organisationId}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link
          href={`/platform/organisations/${organisationId}/timeline`}
          className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800"
        >
          <ArrowLeft size={16} />
          Back to Timeline Configuration
        </Link>

        <div className="mt-5">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${category.colour}`}
          >
            {category.title}
          </span>

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            {category.title}
          </h2>

          <p className="mt-2 text-slate-600">
            Configure which {category.title.toLowerCase()} entry types staff can
            record for this organisation.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {category.options.map((option) => {
            const enabled = isEnabled(option.key);
            const saving = savingKey === option.key;

            return (
              <div
                key={option.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <h3 className="font-bold text-slate-950">{option.label}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {option.description}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    Entry type: {option.entryType}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => toggleOption(option.key, !enabled)}
                  className={
                    enabled
                      ? "min-w-20 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                      : "min-w-20 rounded-full bg-slate-300 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-60"
                  }
                >
                  {saving ? "Saving" : enabled ? "On" : "Off"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </PlatformOrganisationHubPage>
  );
}
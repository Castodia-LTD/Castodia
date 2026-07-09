import { supabase } from "@/lib/supabase";
import {
  availableTimelineCategories,
  AvailableTimelineCategory,
  TimelineCategoryKey,
  TimelineOptionKey,
} from "@/lib/timelines/availableTimelineCategories";

type OrganisationTimelineCategoryRow = {
  category_key: TimelineCategoryKey;
  is_enabled: boolean;
};

type OrganisationTimelineOptionRow = {
  category_key: TimelineCategoryKey;
  option_key: TimelineOptionKey;
  is_enabled: boolean;
};

export async function getOrganisationTimelineConfiguration(
  organisationId: string
): Promise<AvailableTimelineCategory[]> {
  const [{ data: categoryRows, error: categoryError }, { data: optionRows, error: optionError }] =
    await Promise.all([
      supabase
        .from("organisation_timeline_categories")
        .select("category_key, is_enabled")
        .eq("organisation_id", organisationId),

      supabase
        .from("organisation_timeline_options")
        .select("category_key, option_key, is_enabled")
        .eq("organisation_id", organisationId),
    ]);

  if (categoryError || optionError) {
    console.error("Timeline configuration load error:", {
      categoryError,
      optionError,
    });

    return availableTimelineCategories;
  }

  const enabledCategories = new Set(
    ((categoryRows || []) as OrganisationTimelineCategoryRow[])
      .filter((row) => row.is_enabled)
      .map((row) => row.category_key)
  );

  const enabledOptions = new Set(
    ((optionRows || []) as OrganisationTimelineOptionRow[])
      .filter((row) => row.is_enabled)
      .map((row) => row.option_key)
  );

  return availableTimelineCategories
    .filter((category) => enabledCategories.has(category.key))
    .map((category) => ({
      ...category,
      options: category.options.filter((option) =>
        enabledOptions.has(option.key)
      ),
    }))
    .filter((category) => category.options.length > 0);
}
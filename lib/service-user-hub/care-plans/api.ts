import { supabase } from "@/lib/supabase";

import {
  CARE_PLAN_SECTIONS,
  isCarePlanSectionKey,
} from "./sections";

import type {
  CarePlanEditorSection,
  CarePlanRecord,
  CarePlanSectionRecord,
  CarePlanStatus,
  CarePlanWithSections,
  SaveCarePlanInput,
} from "./types";

type SupabaseErrorLike = { message: string } | null;

type CurrentCarePlanManager = {
  id: string;
  organisation_id: string;
  full_name: string | null;
  role: string;
};

function throwIfError(error: SupabaseErrorLike) {
  if (error) {
    throw new Error(error.message);
  }
}

function optionalText(value: string | null | undefined) {
  const cleanValue = value?.trim();
  return cleanValue ? cleanValue : null;
}

function requiredText(value: string, fieldName: string) {
  const cleanValue = value.trim();

  if (!cleanValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return cleanValue;
}

function normaliseSectionRecords(
  sections: CarePlanSectionRecord[],
): CarePlanSectionRecord[] {
  return sections
    .filter((section) => isCarePlanSectionKey(section.section_key))
    .sort((left, right) => left.display_order - right.display_order);
}

export async function getCurrentCarePlanManager():
Promise<CurrentCarePlanManager> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  throwIfError(authError);

  if (!user) {
    throw new Error("You must be signed in to manage care plans.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, organisation_id, full_name, role")
    .eq("id", user.id)
    .single();

  throwIfError(error);

  if (!data?.organisation_id || data.role !== "manager") {
    throw new Error(
      "Care-plan editing is restricted to organisation managers.",
    );
  }

  return data as CurrentCarePlanManager;
}

export async function getCurrentCarePlan(
  serviceUserId: string,
): Promise<CarePlanWithSections | null> {
  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  const { data: planData, error: planError } = await supabase
    .from("care_plans")
    .select("*")
    .eq("service_user_id", cleanServiceUserId)
    .in("status", ["draft", "published"])
    .maybeSingle();

  throwIfError(planError);

  if (!planData) {
    return null;
  }

  const { data: sectionData, error: sectionError } = await supabase
    .from("care_plan_sections")
    .select("*")
    .eq("care_plan_id", planData.id)
    .order("display_order", { ascending: true });

  throwIfError(sectionError);

  return {
    ...(planData as CarePlanRecord),
    sections: normaliseSectionRecords(
      (sectionData ?? []) as CarePlanSectionRecord[],
    ),
  };
}

export async function getCarePlanById(
  carePlanId: string,
): Promise<CarePlanWithSections> {
  const cleanCarePlanId = requiredText(carePlanId, "Care plan ID");

  const { data: planData, error: planError } = await supabase
    .from("care_plans")
    .select("*")
    .eq("id", cleanCarePlanId)
    .single();

  throwIfError(planError);

  const { data: sectionData, error: sectionError } = await supabase
    .from("care_plan_sections")
    .select("*")
    .eq("care_plan_id", cleanCarePlanId)
    .order("display_order", { ascending: true });

  throwIfError(sectionError);

  return {
    ...(planData as CarePlanRecord),
    sections: normaliseSectionRecords(
      (sectionData ?? []) as CarePlanSectionRecord[],
    ),
  };
}

export async function createCarePlan(
  serviceUserId: string,
): Promise<string> {
  const manager = await getCurrentCarePlanManager();

  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  const existingPlan = await getCurrentCarePlan(cleanServiceUserId);

  if (existingPlan) {
    return existingPlan.id;
  }

  const { data, error } = await supabase
    .from("care_plans")
    .insert({
      service_user_id: cleanServiceUserId,
      organisation_id: manager.organisation_id,
      title: "Care Plan",
      status: "draft",
      plan_owner_id: manager.id,
      created_by: manager.id,
      updated_by: manager.id,
    })
    .select("id")
    .single();

  throwIfError(error);

  if (!data?.id) {
    throw new Error(
      "The care plan was created but no care-plan ID was returned.",
    );
  }

  return data.id;
}

export async function saveCarePlan(
  carePlanId: string,
  input: SaveCarePlanInput,
): Promise<void> {
  const manager = await getCurrentCarePlanManager();

  const cleanCarePlanId = requiredText(carePlanId, "Care plan ID");
  const cleanTitle = requiredText(input.title, "Care plan title");

  const validSectionKeys = new Set(
    CARE_PLAN_SECTIONS.map((section) => section.key),
  );

  const populatedSections = input.sections
    .map((section) => ({
      section_key: section.sectionKey,
      content: section.content.trim(),
      display_order: section.displayOrder,
    }))
    .filter((section) => {
      return (
        validSectionKeys.has(section.section_key) &&
        section.content.length > 0
      );
    });

  const duplicateKeys = populatedSections.filter(
    (section, index, allSections) =>
      allSections.findIndex(
        (candidate) =>
          candidate.section_key === section.section_key,
      ) !== index,
  );

  if (duplicateKeys.length > 0) {
    throw new Error(
      "The care plan contains duplicate section keys.",
    );
  }

  const { error: planError } = await supabase
    .from("care_plans")
    .update({
      title: cleanTitle,
      plan_owner_id: optionalText(input.planOwnerId),
      last_reviewed_at: optionalText(input.lastReviewedAt),
      next_review_at: optionalText(input.nextReviewAt),
      updated_by: manager.id,
    })
    .eq("id", cleanCarePlanId);

  throwIfError(planError);

  const { data: existingSections, error: existingSectionsError } =
    await supabase
      .from("care_plan_sections")
      .select("id, section_key")
      .eq("care_plan_id", cleanCarePlanId);

  throwIfError(existingSectionsError);

  const populatedKeySet = new Set(
    populatedSections.map((section) => section.section_key),
  );

  const sectionIdsToDelete = (existingSections ?? [])
    .filter(
      (section) =>
        !isCarePlanSectionKey(section.section_key) ||
        !populatedKeySet.has(section.section_key),
    )
    .map((section) => section.id);

  if (sectionIdsToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("care_plan_sections")
      .delete()
      .in("id", sectionIdsToDelete);

    throwIfError(deleteError);
  }

  if (populatedSections.length === 0) {
    return;
  }

  const rowsToUpsert = populatedSections.map((section) => ({
    care_plan_id: cleanCarePlanId,
    section_key: section.section_key,
    content: section.content,
    display_order: section.display_order,
  }));

  const { error: upsertError } = await supabase
    .from("care_plan_sections")
    .upsert(rowsToUpsert, {
      onConflict: "care_plan_id,section_key",
    });

  throwIfError(upsertError);
}

export async function setCarePlanStatus(
  carePlanId: string,
  status: CarePlanStatus,
): Promise<void> {
  const manager = await getCurrentCarePlanManager();

  const cleanCarePlanId = requiredText(carePlanId, "Care plan ID");

  if (
    status !== "draft" &&
    status !== "published" &&
    status !== "archived"
  ) {
    throw new Error("Invalid care-plan status.");
  }

  if (status === "published") {
    const { count, error: countError } = await supabase
      .from("care_plan_sections")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("care_plan_id", cleanCarePlanId);

    throwIfError(countError);

    if (!count) {
      throw new Error(
        "Add at least one care-plan section before publishing.",
      );
    }
  }

  const { error } = await supabase
    .from("care_plans")
    .update({
      status,
      updated_by: manager.id,
    })
    .eq("id", cleanCarePlanId);

  throwIfError(error);
}

export function buildCarePlanEditorSections(
  storedSections: CarePlanSectionRecord[],
): CarePlanEditorSection[] {
  const contentByKey = new Map(
    storedSections
      .filter((section) =>
        isCarePlanSectionKey(section.section_key),
      )
      .map((section) => [
        section.section_key,
        section.content,
      ]),
  );

  return CARE_PLAN_SECTIONS.map((definition) => ({
    key: definition.key,
    title: definition.title,
    placeholder: definition.placeholder,
    displayOrder: definition.displayOrder,
    content: contentByKey.get(definition.key) ?? "",
  }));
}
export async function getPublishedCarePlan(
  serviceUserId: string,
): Promise<CarePlanWithSections | null> {
  const cleanServiceUserId = requiredText(
    serviceUserId,
    "Service user ID",
  );

  const { data: planData, error: planError } = await supabase
    .from("care_plans")
    .select("*")
    .eq("service_user_id", cleanServiceUserId)
    .eq("status", "published")
    .maybeSingle();

  throwIfError(planError);

  if (!planData) {
    return null;
  }

  const { data: sectionData, error: sectionError } = await supabase
    .from("care_plan_sections")
    .select("*")
    .eq("care_plan_id", planData.id)
    .order("display_order", { ascending: true });

  throwIfError(sectionError);

  return {
    ...(planData as CarePlanRecord),
    sections: normaliseSectionRecords(
      (sectionData ?? []) as CarePlanSectionRecord[],
    ),
  };
}
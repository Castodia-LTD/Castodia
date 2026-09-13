import type { SupabaseClient } from "@supabase/supabase-js";

import type { GrowthDomain, GrowthGoalStatus } from "./types";

export type CreateGrowthGoalInput = {
  serviceUserId: string;
  title: string;
  desiredOutcome?: string | null;
  supportApproach?: string | null;
  domain: GrowthDomain;
  status?: Extract<GrowthGoalStatus, "draft" | "active">;
  startDate: string;
  targetDate?: string | null;
};

export type UpdateGrowthGoalInput = Omit<CreateGrowthGoalInput, "serviceUserId" | "status"> & {
  goalId: string;
  status: GrowthGoalStatus;
  familyVisible: boolean;
};

/** Care-staff creation boundary. RLS independently enforces access and safe defaults. */
export async function createGrowthGoal(
  supabase: SupabaseClient,
  input: CreateGrowthGoalInput,
): Promise<string> {
  const { data, error } = await supabase.rpc("create_growth_goal", {
    p_service_user_id: input.serviceUserId,
    p_title: input.title,
    p_desired_outcome: input.desiredOutcome ?? null,
    p_support_approach: input.supportApproach ?? null,
    p_domain: input.domain,
    p_status: input.status ?? "active",
    p_start_date: input.startDate,
    p_target_date: input.targetDate ?? null,
  });

  if (error) throw error;
  if (typeof data !== "string") throw new Error("Goal save did not return an id.");
  return data;
}

/** Manager-only update boundary. Actor identity is resolved inside the RPC. */
export async function updateGrowthGoal(
  supabase: SupabaseClient,
  input: UpdateGrowthGoalInput,
): Promise<void> {
  const { error } = await supabase.rpc("update_growth_goal", {
    p_goal_id: input.goalId,
    p_title: input.title,
    p_desired_outcome: input.desiredOutcome ?? null,
    p_support_approach: input.supportApproach ?? null,
    p_domain: input.domain,
    p_status: input.status,
    p_start_date: input.startDate,
    p_target_date: input.targetDate ?? null,
    p_family_visible: input.familyVisible,
  });

  if (error) throw error;
}

export async function setGrowthEvidenceFamilyVisibility(
  supabase: SupabaseClient,
  evidenceId: string,
  familyVisible: boolean,
): Promise<void> {
  const { error } = await supabase.from("growth_goal_evidence")
    .update({ family_visible: familyVisible }).eq("id", evidenceId);
  if (error) throw error;
}

export async function unlinkGrowthEvidence(
  supabase: SupabaseClient,
  evidenceId: string,
): Promise<void> {
  const { error } = await supabase.from("growth_goal_evidence").delete().eq("id", evidenceId);
  if (error) throw error;
}

export async function linkGrowthEvidence(
  supabase: SupabaseClient,
  input: { organisationId: string; goalId: string; observationId: string },
): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error("You must be signed in.");
  const { error } = await supabase.from("growth_goal_evidence").insert({
    organisation_id: input.organisationId,
    goal_id: input.goalId,
    observation_id: input.observationId,
    family_visible: false,
    linked_by_user_id: user.id,
  });
  if (error) throw error;
}

export async function recordGrowthGoalReview(
  supabase: SupabaseClient,
  goalId: string,
  note: string,
): Promise<void> {
  const { error } = await supabase.rpc("record_growth_goal_review", {
    p_goal_id: goalId,
    p_note: note,
  });
  if (error) throw error;
}

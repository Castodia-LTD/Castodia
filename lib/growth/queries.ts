import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  GrowthDomain,
  GrowthGoal,
  GrowthGoalStatus,
  GrowthObservation,
  GrowthOverview,
  GrowthProgressType,
} from "./types";

type GoalRow = {
  id: string; organisation_id: string; service_user_id: string; title: string;
  desired_outcome: string | null; support_approach: string | null; domain: GrowthDomain;
  status: GrowthGoalStatus; start_date: string; target_date: string | null;
  achieved_at: string | null; family_visible: boolean;
  source_type: "monthly_check_in" | "manager_created";
  source_review_id: string | null; source_external_id: string | null;
};

function mapGoal(row: GoalRow): GrowthGoal {
  return {
    id: row.id, organisationId: row.organisation_id, serviceUserId: row.service_user_id,
    title: row.title, desiredOutcome: row.desired_outcome,
    supportApproach: row.support_approach, domain: row.domain, status: row.status,
    startDate: row.start_date, targetDate: row.target_date, achievedAt: row.achieved_at,
    familyVisible: row.family_visible, sourceType: row.source_type,
    sourceReviewId: row.source_review_id, sourceExternalId: row.source_external_id,
  };
}

export async function loadGrowthOverview(
  supabase: SupabaseClient,
  serviceUserId: string,
): Promise<GrowthOverview> {
  const [personResult, goalsResult, observationsResult, evidenceResult] = await Promise.all([
    supabase.from("service_users")
      .select("id,full_name,house_name,date_of_birth,photo_path")
      .eq("id", serviceUserId).single(),
    supabase.from("growth_goals").select("*")
      .eq("service_user_id", serviceUserId).order("created_at", { ascending: false }),
    supabase.from("growth_observations").select("*")
      .eq("service_user_id", serviceUserId).order("occurred_at", { ascending: false }).limit(60),
    supabase.from("growth_goal_evidence").select("id,goal_id,observation_id,family_visible"),
  ]);

  if (personResult.error || !personResult.data) throw personResult.error ?? new Error("Person not found.");
  if (goalsResult.error) throw goalsResult.error;
  if (observationsResult.error) throw observationsResult.error;
  if (evidenceResult.error) throw evidenceResult.error;

  const links = evidenceResult.data ?? [];
  const observations: GrowthObservation[] = (observationsResult.data ?? []).map((row) => {
    const observationLinks = links.filter((link) => link.observation_id === row.id);
    return {
      id: row.id, timelineEntryId: row.timeline_entry_id,
      domain: row.domain as GrowthDomain, progressType: row.progress_type as GrowthProgressType,
      summary: row.summary, occurredAt: row.occurred_at,
      goalIds: observationLinks.map((link) => link.goal_id),
      familyVisible: observationLinks.some((link) => link.family_visible),
      evidenceLinks: observationLinks.map((link) => ({ id: link.id, goalId: link.goal_id, familyVisible: link.family_visible })),
    };
  });

  return {
    person: {
      id: personResult.data.id, fullName: personResult.data.full_name ?? "Person",
      houseName: personResult.data.house_name, dateOfBirth: personResult.data.date_of_birth,
      photoPath: personResult.data.photo_path,
    },
    goals: ((goalsResult.data ?? []) as GoalRow[]).map(mapGoal),
    observations,
  };
}

export async function loadFamilyGrowthOverview(
  supabase: SupabaseClient,
  serviceUserId: string,
  fullName: string,
): Promise<GrowthOverview> {
  const [goalsResult, observationsResult, evidenceResult] = await Promise.all([
    supabase.from("growth_goals").select("*").eq("service_user_id", serviceUserId)
      .order("created_at", { ascending: false }),
    supabase.from("growth_observations").select("*").eq("service_user_id", serviceUserId)
      .order("occurred_at", { ascending: false }).limit(40),
    supabase.from("growth_goal_evidence").select("id,goal_id,observation_id,family_visible"),
  ]);
  if (goalsResult.error) throw goalsResult.error;
  if (observationsResult.error) throw observationsResult.error;
  if (evidenceResult.error) throw evidenceResult.error;
  const links = evidenceResult.data ?? [];
  return {
    person: { id: serviceUserId, fullName, houseName: null, dateOfBirth: null, photoPath: null },
    goals: ((goalsResult.data ?? []) as GoalRow[]).map(mapGoal),
    observations: (observationsResult.data ?? []).map((row) => ({
      id: row.id, timelineEntryId: row.timeline_entry_id,
      domain: row.domain as GrowthDomain, progressType: row.progress_type as GrowthProgressType,
      summary: row.summary, occurredAt: row.occurred_at,
      goalIds: links.filter((link) => link.observation_id === row.id).map((link) => link.goal_id),
      familyVisible: true,
      evidenceLinks: links.filter((link) => link.observation_id === row.id).map((link) => ({ id: link.id, goalId: link.goal_id, familyVisible: link.family_visible })),
    })),
  };
}

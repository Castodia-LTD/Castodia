import type { SupabaseClient } from "@supabase/supabase-js";

import type { MonthlyReviewGrowthGoal } from "./types";

export type MonthlyReviewWrite = {
  service_user_id: string;
  reviewer_id: string;
  review_month: string;
  meeting_date: string;
  responses: object & {
    agreedGoals: MonthlyReviewGrowthGoal[];
  };
  consent: object;
  actions: unknown[];
  service_user_comments: string | null;
  reviewer_name: string;
  service_user_name: string;
  representative_name: string | null;
  representative_relationship: string | null;
  capacity_status: string | null;
  best_interest_decision_copy: boolean | null;
  completed_at: string;
};

/**
 * Writes the monthly review and synchronises its embedded goal bridge in one
 * database transaction. User identity, organisation and care-staff capability are
 * revalidated by the database function; callers cannot supply trusted audit data.
 */
export async function saveMonthlyReviewWithGrowth(
  supabase: SupabaseClient,
  review: MonthlyReviewWrite,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "save_monthly_review_with_growth",
    { p_review: review },
  );

  if (error) throw error;
  if (typeof data !== "string") {
    throw new Error("Monthly review save did not return a review id.");
  }

  return data;
}

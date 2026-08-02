import { supabase } from "@/lib/supabase";

export type AssignedServiceUser = { id: string; full_name: string; house_name: string | null };

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function listAssignedServiceUsers(): Promise<AssignedServiceUser[]> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  throwIfError(authError);
  if (!user) throw new Error("Please sign in again.");

  const { data, error } = await supabase
    .from("staff_service_user_access")
    .select("service_users(id, full_name, house_name)")
    .eq("staff_id", user.id);
  throwIfError(error);

  return (data ?? []).flatMap((row: any) => row.service_users ? [row.service_users] : []);
}

export async function submitConfidentialSafeguardingReport(input: {
  serviceUserId: string;
  concernSummary: string;
  happenedAt: string;
  immediateDanger?: string;
  location?: string;
  anonymous: boolean;
}) {
  const { error } = await supabase.rpc("submit_support_safeguarding_report", {
    p_service_user_id: input.serviceUserId,
    p_concern_summary: input.concernSummary.trim(),
    p_happened_at: input.happenedAt,
    p_immediate_danger: input.immediateDanger?.trim() || null,
    p_location: input.location?.trim() || null,
    p_is_anonymous: input.anonymous,
  });
  throwIfError(error);
}

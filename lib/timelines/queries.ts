import { supabase } from "@/lib/supabase";
import type { ServiceUser, TimelineEntry } from "@/lib/timelines/types";

export async function getTimelineServiceUser(serviceUserId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organisation_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organisation_id) {
    throw new Error("Organisation not found.");
  }

  const { data, error } = await supabase
    .from("service_users")
    .select(`
      id,
      first_name,
      surname,
      continence_care_enabled,
      track_pad_changes,
      track_bristol_stool_chart
    `)
    .eq("id", serviceUserId)
    .eq("organisation_id", profile.organisation_id)
    .single();

  if (error || !data) {
    throw new Error("Service user not found.");
  }

  return data as ServiceUser & {
    continence_care_enabled: boolean;
    track_pad_changes: boolean;
    track_bristol_stool_chart: boolean;
  };
}

export async function getTimelineEntries(
  serviceUserId: string,
  selectedDate: Date
) {
  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: entriesData, error: entriesError } = await supabase
    .from("timeline_entries")
    .select("*")
    .eq("service_user_id", serviceUserId)
    .gte("event_time", startOfDay.toISOString())
    .lte("event_time", endOfDay.toISOString())
    .order("event_time", { ascending: false });

  if (entriesError) throw entriesError;

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name");

  if (profilesError) throw profilesError;

  const entriesWithNames =
    entriesData?.map((entry) => {
      const profile = profilesData?.find(
        (profile) => profile.id === entry.created_by
      );

      return {
        ...entry,
        staff_name: profile?.full_name || "Unknown staff member",
      };
    }) || [];

  return entriesWithNames as TimelineEntry[];
}

export async function getMedicationProfilesForServiceUser(
  serviceUserId: string
) {
  const { data, error } = await supabase
    .from("medication_profiles")
    .select("*")
    .eq("service_user_id", serviceUserId)
    .eq("active", true)
    .order("round");

  if (error) throw error;

  return data || [];
}
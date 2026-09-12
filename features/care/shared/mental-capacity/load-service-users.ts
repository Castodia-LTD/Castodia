import { supabase } from "@/lib/supabase";

import type { MentalCapacityServiceUser } from "./types";

export async function loadMentalCapacityServiceUsers() {
  const { data, error } = await supabase
    .from("service_users")
    .select("id, full_name, photo_path, house_name")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as MentalCapacityServiceUser[];
}

export function selectMentalCapacityServiceUser(
  serviceUsers: MentalCapacityServiceUser[],
  serviceUserId: string,
) {
  const selected = serviceUsers.find(({ id }) => id === serviceUserId);

  if (!selected) {
    throw new Error(
      "This service user could not be found or is not available to your account.",
    );
  }

  return selected;
}

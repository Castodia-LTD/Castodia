import { createClient } from "@/lib/supabase/server";
import type { ServiceUserAboutMe } from "./types";

export async function getAboutMe(
  serviceUserId: string
): Promise<ServiceUserAboutMe | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("service_user_about_me")
    .select("*")
    .eq("service_user_id", serviceUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load About Me record: ${error.message}`);
  }

  return data as ServiceUserAboutMe | null;
}
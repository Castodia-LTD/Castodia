import { createClient } from "@/lib/supabase/server";
import type {
  AboutMeFormValues,
  ServiceUserAboutMe,
} from "./types";

export async function saveAboutMe(
  serviceUserId: string,
  values: AboutMeFormValues
): Promise<ServiceUserAboutMe> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in to update About Me.");
  }

  const { data, error } = await supabase
    .from("service_user_about_me")
    .upsert(
      {
        service_user_id: serviceUserId,
        ...values,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "service_user_id",
      }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Unable to save About Me record: ${error.message}`);
  }

  return data as ServiceUserAboutMe;
}
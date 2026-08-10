import { supabase } from "@/lib/supabase";

export type CurrentFamilyUser = {
  id: string;
  auth_user_id: string;
  service_user_id: string;
  organisation_id: string;
  full_name: string;
  email: string;
  relationship: string | null;
  is_active: boolean;

  service_user: {
    id: string;
    full_name: string | null;
    first_name: string | null;
    surname: string | null;
    photo_url: string | null;
  };
};

export async function getCurrentFamilyUser(): Promise<CurrentFamilyUser> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data, error } = await supabase
    .from("family_users")
    .select(`
      id,
      auth_user_id,
      service_user_id,
      organisation_id,
      full_name,
      email,
      relationship,
      is_active,
      service_user:service_users (
        id,
        full_name,
        first_name,
        surname,
        photo_url
      )
    `)
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    throw new Error(
      "Your Family access could not be found."
    );
  }

  return data as unknown as CurrentFamilyUser;
}
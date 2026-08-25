import { createClient } from "@/lib/supabase/client";

export type LoginDestination =
  | "/family"
  | "/platform/dashboard"
  | "/manager/dashboard"
  | "/support/dashboard";

export async function authenticateCastodiaUser(
  email: string,
  password: string,
): Promise<LoginDestination> {
  const supabase = createClient();

  const {
    data: signInData,
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (signInError) {
    throw new Error(signInError.message);
  }

  const user = signInData.user;

  if (!user) {
    throw new Error("Unable to load your account.");
  }

  const {
    data: familyRows,
    error: familyError,
  } = await supabase
    .from("family_users")
    .select(`
      id,
      auth_user_id,
      service_user_id,
      is_active
    `)
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .limit(1);

  if (familyError) {
    console.error(
      "Unable to resolve Family access:",
      familyError,
    );

    throw new Error(familyError.message);
  }

  if (familyRows && familyRows.length > 0) {
    return "/family";
  }

  const {
    data: profileRows,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .limit(1);

  if (profileError) {
    console.error(
      "Unable to resolve professional profile:",
      profileError,
    );

    throw new Error(profileError.message);
  }

  const profile = profileRows?.[0] ?? null;

  if (!profile?.role) {
    await supabase.auth.signOut();

    throw new Error(
      "Your account does not have active Castodia access.",
    );
  }

  switch (profile.role) {
    case "castodia_owner":
    case "castodia_admin":
      return "/platform/dashboard";

    case "manager":
      return "/manager/dashboard";

    case "support":
      return "/support/dashboard";

    default:
      await supabase.auth.signOut();

      throw new Error(
        "No valid Castodia portal role was found for this account.",
      );
  }
}
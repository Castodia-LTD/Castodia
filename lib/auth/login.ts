import { CASTODIA_PRODUCTS, type CastodiaProduct } from "@/config/products";
import { createClient } from "@/lib/supabase/client";

export type LoginProduct = CastodiaProduct | "auto";

export type LoginDestination =
  | typeof CASTODIA_PRODUCTS.family.home
  | typeof CASTODIA_PRODUCTS.core.home
  | typeof CASTODIA_PRODUCTS.care.managerHome
  | typeof CASTODIA_PRODUCTS.care.supportHome;

export type CastodiaLoginResult = {
  status: "authenticated";
  destination: LoginDestination;
  userId: string;
};

export async function resolveCastodiaDestination(
  product: LoginProduct = "auto",
): Promise<CastodiaLoginResult> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("Unable to load your account.");

  const userId = user.id;

  if (product === "family" || product === "auto") {
    const { data: familyRows, error: familyError } = await supabase
      .from("family_users")
      .select("id")
      .eq("auth_user_id", userId)
      .eq("is_active", true)
      .limit(1);

    if (familyError) {
      console.error("Unable to resolve CastodiaFamily access:", familyError);
      throw new Error(familyError.message);
    }

    if (familyRows?.length) {
      return {
        status: "authenticated",
        destination: CASTODIA_PRODUCTS.family.home,
        userId,
      };
    }

    if (product === "family") return rejectProductAccess("CastodiaFamily");
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .limit(1);

  if (profileError) {
    console.error("Unable to resolve professional profile:", profileError);
    throw new Error(profileError.message);
  }

  const role = profileRows?.[0]?.role ?? null;
  if (!role) {
    await supabase.auth.signOut();
    throw new Error("Your account does not have active Castodia access.");
  }

  if (product === "care") {
    if (role === "manager") {
      return authenticated(CASTODIA_PRODUCTS.care.managerHome);
    }

    if (role === "support") {
      return authenticated(CASTODIA_PRODUCTS.care.supportHome);
    }

    return rejectProductAccess("CastodiaCare");
  }

  if (product === "core") {
    if (role === "castodia_owner" || role === "castodia_admin") {
      return authenticated(CASTODIA_PRODUCTS.core.home);
    }
    return rejectProductAccess("CastodiaCore");
  }

  switch (role) {
    case "castodia_owner":
    case "castodia_admin":
      return authenticated(CASTODIA_PRODUCTS.core.home);
    case "manager":
      return authenticated(CASTODIA_PRODUCTS.care.managerHome);
    case "support":
      return authenticated(CASTODIA_PRODUCTS.care.supportHome);
    default:
      return rejectProductAccess("Castodia");
  }

  function authenticated(destination: LoginDestination): CastodiaLoginResult {
    return { status: "authenticated", destination, userId };
  }

  async function rejectProductAccess(productName: string): Promise<never> {
    await supabase.auth.signOut();
    throw new Error(`This account does not have access to ${productName}.`);
  }
}

export async function authenticateCastodiaUser(
  email: string,
  password: string,
  product: LoginProduct = "auto",
): Promise<CastodiaLoginResult> {
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (signInError) throw new Error(signInError.message);
  return resolveCastodiaDestination(product);
}

export async function authenticateCastodiaWithPasskey(
  product: LoginProduct = "auto",
): Promise<CastodiaLoginResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPasskey();

  if (error) throw new Error(error.message);
  return resolveCastodiaDestination(product);
}

export async function registerCastodiaPasskey(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.registerPasskey();
  if (error) throw new Error(error.message);
}

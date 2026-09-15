import { CASTODIA_PRODUCTS, type CastodiaProduct } from "@/config/products";
import { createClient } from "@/lib/supabase/client";

export type LoginProduct = CastodiaProduct | "auto";

export type LoginDestination =
  | typeof CASTODIA_PRODUCTS.family.home
  | typeof CASTODIA_PRODUCTS.core.home
  | typeof CASTODIA_PRODUCTS.care.managerHome
  | typeof CASTODIA_PRODUCTS.care.supportHome;

export type CastodiaLoginResult =
  | {
      status: "authenticated";
      destination: LoginDestination;
    }
  | {
      status: "mfa_required";
      destination: LoginDestination;
      enrollmentRequired: boolean;
    };

type ProfessionalRole =
  | "castodia_owner"
  | "castodia_admin"
  | "manager"
  | "support"
  | string;

function requiresMfa(role: ProfessionalRole): boolean {
  return (
    role === "castodia_owner" ||
    role === "castodia_admin" ||
    role === "manager"
  );
}

async function finishProfessionalLogin(
  destination: LoginDestination,
  role: ProfessionalRole,
): Promise<CastodiaLoginResult> {
  if (!requiresMfa(role)) {
    return { status: "authenticated", destination };
  }

  const supabase = createClient();
  const { data: aal, error: aalError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aalError) throw new Error(aalError.message);

  if (aal.currentLevel === "aal2") {
    return { status: "authenticated", destination };
  }

  const { data: factors, error: factorError } =
    await supabase.auth.mfa.listFactors();

  if (factorError) throw new Error(factorError.message);

  const hasVerifiedTotp = factors.totp.some(
    (factor) => factor.status === "verified",
  );

  return {
    status: "mfa_required",
    destination,
    enrollmentRequired: !hasVerifiedTotp,
  };
}

export async function authenticateCastodiaUser(
  email: string,
  password: string,
  product: LoginProduct = "auto",
): Promise<CastodiaLoginResult> {
  const supabase = createClient();
  const {
    data: signInData,
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (signInError) throw new Error(signInError.message);

  const user = signInData.user;
  if (!user) throw new Error("Unable to load your account.");

  if (product === "family" || product === "auto") {
    const { data: familyRows, error: familyError } = await supabase
      .from("family_users")
      .select("id")
      .eq("auth_user_id", user.id)
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
      };
    }

    if (product === "family") return rejectProductAccess("CastodiaFamily");
  }

  const { data: profileRows, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
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
      return finishProfessionalLogin(
        CASTODIA_PRODUCTS.care.managerHome,
        role,
      );
    }

    if (role === "support") {
      return finishProfessionalLogin(
        CASTODIA_PRODUCTS.care.supportHome,
        role,
      );
    }

    return rejectProductAccess("CastodiaCare");
  }

  if (product === "core") {
    if (role === "castodia_owner" || role === "castodia_admin") {
      return finishProfessionalLogin(CASTODIA_PRODUCTS.core.home, role);
    }
    return rejectProductAccess("CastodiaCore");
  }

  switch (role) {
    case "castodia_owner":
    case "castodia_admin":
      return finishProfessionalLogin(CASTODIA_PRODUCTS.core.home, role);
    case "manager":
      return finishProfessionalLogin(
        CASTODIA_PRODUCTS.care.managerHome,
        role,
      );
    case "support":
      return finishProfessionalLogin(
        CASTODIA_PRODUCTS.care.supportHome,
        role,
      );
    default:
      return rejectProductAccess("Castodia");
  }

  async function rejectProductAccess(productName: string): Promise<never> {
    await supabase.auth.signOut();
    throw new Error(`This account does not have access to ${productName}.`);
  }
}

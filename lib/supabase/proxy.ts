import { createServerClient } from "@supabase/ssr";

import { CASTODIA_PRODUCTS } from "@/config/products";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

type UserRole =
  | "castodia_owner"
  | "castodia_admin"
  | "manager"
  | "support";

const roleHome: Record<UserRole, string> = {
  support: CASTODIA_PRODUCTS.care.supportHome,
  manager: CASTODIA_PRODUCTS.care.managerHome,
  castodia_admin: CASTODIA_PRODUCTS.core.home,
  castodia_owner: CASTODIA_PRODUCTS.core.home,
};

function roleRequiresMfa(role: UserRole): boolean {
  return (
    role === "manager" ||
    role === "castodia_admin" ||
    role === "castodia_owner"
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isFamilyRoute =
    pathname === "/family" || pathname.startsWith("/family/");

  const isCareSupportRoute = pathname.startsWith("/care/support");

  const isCareManagerRoute =
    pathname.startsWith("/care/manager") ||
    pathname.startsWith("/api/care/admin");

  const isCoreRoute =
    pathname.startsWith("/core") ||
    pathname.startsWith("/api/core");

  const isProfessionalRoute =
    isCareSupportRoute || isCareManagerRoute || isCoreRoute;

  const isProtectedRoute = isFamilyRoute || isProfessionalRoute;

  if (!user && isProtectedRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (!user) return response;

  if (isFamilyRoute) {
    const { data: familyRows, error: familyError } = await supabase
      .from("family_users")
      .select("id")
      .eq("auth_user_id", user.id)
      .eq("is_active", true)
      .limit(1);

    if (familyError || !familyRows?.length) {
      await supabase.auth.signOut();
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("error", "family_access_not_found");
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  if (!isProfessionalRoute) return response;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "profile_not_found");
    return NextResponse.redirect(loginUrl);
  }

  const role = profile.role as UserRole;
  const isKnownRole =
    role === "support" ||
    role === "manager" ||
    role === "castodia_admin" ||
    role === "castodia_owner";

  if (!isKnownRole) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "invalid_role");
    return NextResponse.redirect(loginUrl);
  }

  if (roleRequiresMfa(role)) {
    const { data: aal, error: aalError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalError || aal.currentLevel !== "aal2") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      loginUrl.searchParams.set("error", "mfa_required");
      return NextResponse.redirect(loginUrl);
    }
  }

  let hasAccess = true;

  if (isCareSupportRoute) {
    hasAccess = role === "support" || role === "manager";
  }

  if (isCareManagerRoute) {
    hasAccess = role === "manager";
  }

  if (isCoreRoute) {
    hasAccess = role === "castodia_admin" || role === "castodia_owner";
  }

  if (!hasAccess) {
    const authorisedHomeUrl = request.nextUrl.clone();
    authorisedHomeUrl.pathname = roleHome[role];
    authorisedHomeUrl.search = "";
    return NextResponse.redirect(authorisedHomeUrl);
  }

  return response;
}
